import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface HousekeepingLog {
  housekeeping_log_id?: number;
  room_id: number;
  employee_id: number;
  date: string;
  status: "Pending" | "In Progress" | "Completed" | "Inspected";
}

export const HousekeepingModel = {
  async findAll(): Promise<any[]> {
    const query = `
            SELECT hl.*, r.room_number, CONCAT(h.first_name, ' ', h.last_name) AS housekeeper_name
            FROM housekeeping_log hl 
            JOIN room r ON hl.room_id = r.room_id 
            JOIN employee h ON hl.employee_id = h.employee_id
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows;
  },
  async findById(id: number): Promise<any | null> {
    const query = `
            SELECT hl.*, 
                   r.room_number,
                   CONCAT(h.first_name, ' ', h.last_name) AS housekeeper_name
            FROM housekeeping_log hl
            JOIN room r ON hl.room_id = r.room_id
            JOIN employee h ON hl.employee_id = h.employee_id
            WHERE hl.housekeeping_log_id = ?
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  async findByRoomId(roomId: number): Promise<any[]> {
    const query = `
            SELECT hl.*, 
                     CONCAT(h.first_name, ' ', h.last_name) AS housekeeper_name
            FROM housekeeping_log hl
                 JOIN employee h ON hl.employee_id = h.employee_id
            WHERE hl.room_id = ?
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [roomId]);
    return rows;
  },

  async create(logData: HousekeepingLog): Promise<number> {
    const { room_id, employee_id, date, status } = logData;
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO housekeeping_log (room_id, employee_id, date, status) VALUES (?, ?, ?, ?)`,
      [
        room_id,
        employee_id,
        date || new Date().toISOString().slice(0, 10),
        status || "Pending",
      ],
    );
    return result.insertId;
  },

  async update(
    id: number,
    logData: Partial<HousekeepingLog>,
  ): Promise<boolean> {
    const allowedFields = new Set(["room_id", "employee_id", "date", "status"]);
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(logData)) {
      if (allowedFields.has(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      } else if (key !== "housekeeping_log_id") {
        throw new Error(`Unsupported housekeeping field: ${key}`);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE housekeeping_log SET ${fields.join(", ")} WHERE housekeeping_log_id = ?`,
      values,
    );

    return result.affectedRows > 0;
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM housekeeping_log WHERE housekeeping_log_id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },
};
