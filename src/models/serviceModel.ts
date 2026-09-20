import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

async function recalculateBookingTotal(
  connection: any,
  bookingId: number,
): Promise<void> {
  const [roomRows] = await connection.query(
    "SELECT COALESCE(SUM(rate_charged), 0) AS total_rooms FROM booking_room WHERE booking_id = ?",
    [bookingId],
  );
  const [serviceRows] = await connection.query(
    "SELECT COALESCE(SUM(charged_amount), 0) AS total_services FROM service WHERE booking_id = ?",
    [bookingId],
  );
  const total =
    Number(roomRows[0]?.total_rooms || 0) +
    Number(serviceRows[0]?.total_services || 0);
  await connection.query(
    "UPDATE booking SET total_amount = ? WHERE booking_id = ?",
    [total, bookingId],
  );
}

async function rollbackQuietly(
  connection: any,
  transactionStarted: boolean,
): Promise<void> {
  if (!transactionStarted) return;
  try {
    await connection.rollback();
  } catch {}
}

export interface Service {
  service_id?: number;
  description: string;
  charged_amount: number;
  booking_id: number;
}

export const ServiceModel = {
  async findAll(): Promise<Service[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM service");
    return rows as Service[];
  },

  async findById(id: number): Promise<Service | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM service WHERE service_id = ?",
      [id],
    );
    return rows.length > 0 ? (rows[0] as Service) : null;
  },

  async findByBookingId(bookingId: number): Promise<Service[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM service WHERE booking_id = ?",
      [bookingId],
    );
    return rows as Service[];
  },

  async create(serviceData: Service): Promise<number> {
    const { description, charged_amount, booking_id } = serviceData;
    if (
      !description?.trim() ||
      !Number.isFinite(charged_amount) ||
      charged_amount < 0
    ) {
      throw new Error("Invalid service description or charge.");
    }

    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO service (description, charged_amount, booking_id) VALUES (?, ?, ?)`,
        [description.trim(), charged_amount, booking_id],
      );
      await recalculateBookingTotal(connection, booking_id);
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await rollbackQuietly(connection, transactionStarted);
      throw error;
    } finally {
      connection.release();
    }
  },

  async update(id: number, serviceData: Partial<Service>): Promise<boolean> {
    const allowedFields = new Set(["description", "charged_amount"]);
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(serviceData)) {
      if (allowedFields.has(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      } else if (key !== "service_id") {
        throw new Error(`Unsupported service field: ${key}`);
      }
    }

    if (fields.length === 0) return false;

    if ("description" in serviceData && !serviceData.description?.trim()) {
      throw new Error("Service description cannot be empty.");
    }
    if (
      "charged_amount" in serviceData &&
      (!Number.isFinite(serviceData.charged_amount) ||
        serviceData.charged_amount < 0)
    ) {
      throw new Error("Service charge must be a non-negative number.");
    }

    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [serviceRows] = await connection.query<RowDataPacket[]>(
        "SELECT booking_id FROM service WHERE service_id = ? FOR UPDATE",
        [id],
      );
      const service = serviceRows[0];
      if (!service) {
        await connection.commit();
        return false;
      }

      const normalizedValues = values.map((value, index) =>
        fields[index] === "description" && typeof value === "string"
          ? value.trim()
          : value,
      );
      normalizedValues.push(id);
      const [result] = await connection.query<ResultSetHeader>(
        `UPDATE service SET ${fields.join(", ")} WHERE service_id = ?`,
        normalizedValues,
      );
      await recalculateBookingTotal(connection, Number(service.booking_id));
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await rollbackQuietly(connection, transactionStarted);
      throw error;
    } finally {
      connection.release();
    }
  },

  async delete(id: number): Promise<boolean> {
    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;
      const [serviceRows] = await connection.query<RowDataPacket[]>(
        "SELECT booking_id FROM service WHERE service_id = ? FOR UPDATE",
        [id],
      );
      const service = serviceRows[0];
      if (!service) {
        await connection.commit();
        return false;
      }
      const [result] = await connection.query<ResultSetHeader>(
        "DELETE FROM service WHERE service_id = ?",
        [id],
      );
      await recalculateBookingTotal(connection, Number(service.booking_id));
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await rollbackQuietly(connection, transactionStarted);
      throw error;
    } finally {
      connection.release();
    }
  },
};
