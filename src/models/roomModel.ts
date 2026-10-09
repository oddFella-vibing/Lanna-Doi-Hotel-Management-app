import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Room {
  room_id?: number;
  room_number: string;
  price_per_night: number;
  room_type: string;
  room_status: "Available" | "Occupied" | "Maintenance" | "Cleaning";
    guest_name?: string | null;
  check_out_time?: string | null;

}

export const RoomModel = {
  
  async findAll(): Promise<Room[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        r.room_id,
        r.room_number,
        r.room_type,
        r.room_status,
        r.price_per_night,
        (
          SELECT CONCAT(g.first_name, ' ', g.last_name)
          FROM booking_room br
          JOIN booking b ON b.booking_id = br.booking_id
          JOIN guest g ON g.guest_id = b.guest_id
          WHERE br.room_id = r.room_id
            AND b.booking_status = 'Checked-In'
          ORDER BY b.check_in_date DESC
          LIMIT 1
        ) AS guest_name,
        (
          SELECT b.check_out_date
          FROM booking_room br
          JOIN booking b ON b.booking_id = br.booking_id
          WHERE br.room_id = r.room_id
            AND b.booking_status = 'Checked-In'
          ORDER BY b.check_in_date DESC
          LIMIT 1
        ) AS check_out_time
      FROM room r
      ORDER BY r.room_number ASC
    `);
    return rows as Room[];
  },


  async findById(id: number): Promise<Room | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM room WHERE room_id = ?",
      [id],
    );
    return rows.length > 0 ? (rows[0] as Room) : null;
  },

  async create(roomData: Room): Promise<number> {
    const { room_number, price_per_night, room_type, room_status } = roomData;
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO room (room_number, price_per_night, room_type, room_status) VALUES (?, ?, ?, ?)`,
      [room_number, price_per_night, room_type, room_status || "Available"],
    );
    return result.insertId;
  },

  async update(id: number, roomData: Partial<Room>): Promise<boolean> {
    const allowedFields = new Set([
      "room_number",
      "price_per_night",
      "room_type",
      "room_status",
    ]);
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(roomData)) {
      if (allowedFields.has(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      } else if (key !== "room_id") {
        throw new Error(`Unsupported room field: ${key}`);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE room SET ${fields.join(", ")} WHERE room_id = ?`,
      values,
    );

    return result.affectedRows > 0;
  },

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM room WHERE room_id = ?",
      [id],
    );
    return result.affectedRows > 0;
  },
};
