import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Billing {
  billing_id?: number;
  invoice_date?: string;
  total_amount?: number;
  booking_id: number;
}

export const BillingModel = {
  async findAll(): Promise<any[]> {
    const query = `
            SELECT b.*, 
                   bk.check_in_date, 
                   bk.check_out_date,
                   g.first_name, 
                   g.last_name
            FROM billing b
            JOIN booking bk ON b.booking_id = bk.booking_id
            JOIN guest g ON bk.guest_id = g.guest_id
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows;
  },

  async findById(id: number): Promise<any | null> {
    const query = `
            SELECT b.*, 
                   bk.check_in_date, 
                   bk.check_out_date,
                   g.first_name, 
                   g.last_name,
                   g.email,
                   g.phone_number
            FROM billing b
            JOIN booking bk ON b.booking_id = bk.booking_id
            JOIN guest g ON bk.guest_id = g.guest_id
            WHERE b.billing_id = ?
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  async findByBookingId(bookingId: number): Promise<any | null> {
    const query = `
            SELECT * FROM billing WHERE booking_id = ?
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [bookingId]);
    return rows.length > 0 ? rows[0] : null;
  },

  async create(billingData: Billing): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { invoice_date, booking_id } = billingData;

      // Automatically calculate total amount from the booking's total_amount (which covers rooms + services)
      const [bookingRows]: any = await connection.query<RowDataPacket[]>(
        `SELECT total_amount FROM booking WHERE booking_id = ?`,
        [booking_id],
      );

      if (bookingRows.length === 0) {
        throw new Error("Booking not found for billing creation");
      }

      const calculatedTotalAmount = bookingRows[0].total_amount;

      // Insert into billing table matching the active schema columns (invoice_date, total_amount, booking_id)
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO billing (invoice_date, total_amount, booking_id) VALUES (?, ?, ?)`,
        [
          invoice_date || new Date().toISOString().slice(0, 10),
          calculatedTotalAmount,
          booking_id,
        ],
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};
