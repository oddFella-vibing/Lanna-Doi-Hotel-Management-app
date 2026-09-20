import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Payment {
  payment_id?: number;
  amount: number;
  payment_date: string;
  payment_method: "Credit Card" | "Cash" | "Bank Transfer" | "PromptPay";
  booking_id: number;
}

export const PaymentModel = {
  async findAll(): Promise<Payment[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM payment");
    return rows as Payment[];
  },

  async findById(id: number): Promise<Payment | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM payment WHERE payment_id = ?",
      [id],
    );
    return rows.length > 0 ? (rows[0] as Payment) : null;
  },

  async findByBookingId(bookingId: number): Promise<Payment[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM payment WHERE booking_id = ?",
      [bookingId],
    );
    return rows as Payment[];
  },

  async create(paymentData: Payment): Promise<number> {
    const { amount, payment_date, payment_method, booking_id } = paymentData;
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO payment (amount, payment_date, payment_method, booking_id) VALUES (?, ?, ?, ?)`,
      [amount, payment_date || new Date(), payment_method, booking_id],
    );
    return result.insertId;
  },
};
