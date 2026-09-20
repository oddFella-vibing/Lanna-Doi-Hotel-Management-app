import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Employee {
  employee_id?: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  house_number?: string;
  street?: string;
  district?: string;
  sub_district?: string;
  province?: string;
  role: "Manager" | "Receptionist" | "Housekeeper";
}

export const EmployeeModel = {
  async findAll(): Promise<any[]> {
    const query = `
            SELECT e.*, 
                   CASE 
                       WHEN m.employee_id IS NOT NULL THEN 'Manager'
                       WHEN r.employee_id IS NOT NULL THEN 'Receptionist'
                       WHEN h.employee_id IS NOT NULL THEN 'Housekeeper'
                       ELSE 'Unknown'
                   END as role
            FROM employee e
            LEFT JOIN manager m ON e.employee_id = m.employee_id
            LEFT JOIN receptionist r ON e.employee_id = r.employee_id
            LEFT JOIN housekeeper h ON e.employee_id = h.employee_id
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows;
  },

  async findById(id: number): Promise<any | null> {
    const query = `
            SELECT e.*, 
                   CASE 
                       WHEN m.employee_id IS NOT NULL THEN 'Manager'
                       WHEN r.employee_id IS NOT NULL THEN 'Receptionist'
                       WHEN h.employee_id IS NOT NULL THEN 'Housekeeper'
                       ELSE 'Unknown'
                   END as role
            FROM employee e
            LEFT JOIN manager m ON e.employee_id = m.employee_id
            LEFT JOIN receptionist r ON e.employee_id = r.employee_id
            LEFT JOIN housekeeper h ON e.employee_id = h.employee_id
            WHERE e.employee_id = ?
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  async create(employeeData: Employee): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        first_name,
        last_name,
        phone_number,
        email,
        house_number,
        street,
        district,
        sub_district,
        province,
        role,
      } = employeeData;

      // 1. Insert into supertype table
      const [empResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO employee (first_name, last_name, phone_number, email, house_number, street, district, sub_district, province, title) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name,
          last_name,
          phone_number,
          email,
          house_number || null,
          street || null,
          district || null,
          sub_district || null,
          province || null,
          role,
        ],
      );

      const employeeId = empResult.insertId;

      // 2. Insert into the correct specialization subtype table
      const subtypeTable = role.toLowerCase(); // 'manager', 'receptionist', or 'housekeeper'
      if (["manager", "receptionist", "housekeeper"].includes(subtypeTable)) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO ?? (employee_id) VALUES (?)`,
          [subtypeTable, employeeId],
        );
      } else {
        throw new Error("Invalid employee role specified.");
      }

      await connection.commit();
      return employeeId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async update(id: number, employeeData: Partial<Employee>): Promise<boolean> {
    const allowedFields = new Set([
      "first_name",
      "last_name",
      "phone_number",
      "email",
      "house_number",
      "street",
      "district",
      "sub_district",
      "province",
    ]);
    const fields: string[] = [];
    const values: unknown[] = [];
    const role = employeeData.role;

    if (
      role !== undefined &&
      !["Manager", "Receptionist", "Housekeeper"].includes(role)
    ) {
      throw new Error("Invalid employee role specified.");
    }

    for (const [key, value] of Object.entries(employeeData)) {
      if (allowedFields.has(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      } else if (key !== "employee_id" && key !== "role") {
        throw new Error(`Unsupported employee field: ${key}`);
      }
    }

    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;

      const [employeeRows] = await connection.query<RowDataPacket[]>(
        "SELECT title FROM employee WHERE employee_id = ? FOR UPDATE",
        [id],
      );
      const employee = employeeRows[0];
      if (!employee) {
        await connection.commit();
        return false;
      }

      const currentRole = String(employee.title);
      if (role !== undefined && role !== currentRole) {
        fields.push("title = ?");
        values.push(role);
      }
      if (fields.length > 0) {
        values.push(id);
        await connection.query<ResultSetHeader>(
          `UPDATE employee SET ${fields.join(", ")} WHERE employee_id = ?`,
          values,
        );
      }

      if (role !== undefined && role !== currentRole) {
        await connection.query("DELETE FROM manager WHERE employee_id = ?", [
          id,
        ]);
        await connection.query(
          "DELETE FROM receptionist WHERE employee_id = ?",
          [id],
        );
        await connection.query(
          "DELETE FROM housekeeper WHERE employee_id = ?",
          [id],
        );
        await connection.query<ResultSetHeader>(
          "INSERT INTO ?? (employee_id) VALUES (?)",
          [role.toLowerCase(), id],
        );
      }

      await connection.commit();
      return fields.length > 0;
    } catch (error) {
      if (transactionStarted) {
        try {
          await connection.rollback();
        } catch {}
      }
      throw error;
    } finally {
      connection.release();
    }
  },

  async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Due to foreign key constraints with ON DELETE CASCADE or manual cleanup of subtypes:
      await connection.query("DELETE FROM manager WHERE employee_id = ?", [id]);
      await connection.query("DELETE FROM receptionist WHERE employee_id = ?", [
        id,
      ]);
      await connection.query("DELETE FROM housekeeper WHERE employee_id = ?", [
        id,
      ]);

      const [result] = await connection.query<ResultSetHeader>(
        "DELETE FROM employee WHERE employee_id = ?",
        [id],
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};
