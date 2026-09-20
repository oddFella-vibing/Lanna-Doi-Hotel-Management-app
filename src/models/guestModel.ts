import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Guest {
  guest_id?: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  preferred_room_type?: string;
  house_number?: string;
  street?: string;
  district?: string;
  sub_district?: string;
  province?: string;
}

export const GuestModel = {
  async findAll(): Promise<Guest[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM guest");
    return rows as Guest[];
  },

  async findById(id: number): Promise<Guest | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM guest WHERE guest_id = ?",
      [id],
    );
    return rows.length > 0 ? (rows[0] as Guest) : null;
  },

  async create(guestData: Guest): Promise<number> {
    const {
      first_name,
      last_name,
      phone_number,
      email,
      preferred_room_type,
      house_number,
      street,
      district,
      sub_district,
      province,
    } = guestData;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO guest (first_name, last_name, phone_number, email, preferred_room_type, house_number, street, district, sub_district, province) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        phone_number,
        email,
        preferred_room_type || null,
        house_number || null,
        street || null,
        district || null,
        sub_district || null,
        province || null,
      ],
    );
    return result.insertId;
  },

  async update(id: number, guestData: Partial<Guest>): Promise<boolean> {
    const allowedFields = new Set([
      "first_name",
      "last_name",
      "phone_number",
      "email",
      "preferred_room_type",
      "house_number",
      "street",
      "district",
      "sub_district",
      "province",
    ]);
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(guestData)) {
      if (allowedFields.has(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      } else if (key !== "guest_id") {
        throw new Error(`Unsupported guest field: ${key}`);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE guest SET ${fields.join(", ")} WHERE guest_id = ?`,
      values,
    );

    return result.affectedRows > 0;
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM guest WHERE guest_id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },
};
