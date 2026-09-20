import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Booking {
  booking_id?: number;
  check_in_date: string;
  check_out_date: string;
  status?: "Confirmed" | "Checked-In" | "Checked-Out" | "Cancelled";
  total_amount?: number;
  guest_id: number;
  employee_id: number;
  room_ids?: number[]; // Array of room IDs associated with this booking
  services?: { description: string; charged_amount: number }[]; // Optional services included on creation
}

export class BookingError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}

const bookingStatuses = [
  "Confirmed",
  "Checked-In",
  "Checked-Out",
  "Cancelled",
] as const;

function validateDateRange(checkIn: string, checkOut: string): number {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);

  if (
    !datePattern.test(checkIn) ||
    !datePattern.test(checkOut) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== checkIn ||
    end.toISOString().slice(0, 10) !== checkOut
  ) {
    throw new BookingError(400, "Dates must use the YYYY-MM-DD format.");
  }

  if (end <= start) {
    throw new BookingError(400, "Check-out date must be after check-in date.");
  }

  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function validateRoomIds(roomIds: number[] | undefined): number[] {
  if (roomIds === undefined) return [];
  if (
    !Array.isArray(roomIds) ||
    roomIds.some((roomId) => !Number.isInteger(roomId) || roomId <= 0)
  ) {
    throw new BookingError(400, "room_ids must contain positive integer IDs.");
  }

  const uniqueRoomIds = [...new Set(roomIds)];
  if (uniqueRoomIds.length !== roomIds.length) {
    throw new BookingError(400, "room_ids must not contain duplicates.");
  }
  return uniqueRoomIds;
}

function validateServices(
  services: Booking["services"],
): NonNullable<Booking["services"]> {
  if (services === undefined) return [];
  if (
    !Array.isArray(services) ||
    services.some(
      (service) =>
        typeof service.description !== "string" ||
        service.description.trim().length === 0 ||
        !Number.isFinite(Number(service.charged_amount)) ||
        Number(service.charged_amount) < 0,
    )
  ) {
    throw new BookingError(400, "services contains an invalid service.");
  }
  return services;
}

async function rollbackQuietly(
  connection: { rollback: () => Promise<void> },
  transactionStarted: boolean,
): Promise<void> {
  if (!transactionStarted) return;
  try {
    await connection.rollback();
  } catch {}
}

export const BookingModel = {
  async findAll(): Promise<any[]> {
    const query = `
           SELECT b.*, 
                  CONCAT(g.first_name,' ', g.last_name) AS guest_name, 
                  CONCAT(e.first_name,' ', e.last_name) AS employee_name
            FROM booking b
            JOIN guest g ON b.guest_id = g.guest_id
            LEFT JOIN employee e ON b.employee_id = e.employee_id
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query);

    // Fetch associated rooms and services for each booking
    for (const booking of rows) {
      const roomQuery = `
                SELECT r.* FROM room r
                JOIN booking_room br ON r.room_id = br.room_id
                WHERE br.booking_id = ?
            `;
      const [rooms] = await pool.query<RowDataPacket[]>(roomQuery, [
        booking.booking_id,
      ]);
      booking.rooms = rooms;

      const serviceQuery = `
                SELECT * FROM service WHERE booking_id = ?
            `;
      const [services] = await pool.query<RowDataPacket[]>(serviceQuery, [
        booking.booking_id,
      ]);
      booking.services = services;
    }

    return rows;
  },

  async findById(id: number): Promise<any | null> {
    const query = `
            SELECT b.*, 
                   CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
                   CONCAT(e.first_name, ' ', e.last_name) AS employee_name
            FROM booking b
            JOIN guest g ON b.guest_id = g.guest_id
            LEFT JOIN employee e ON b.employee_id = e.employee_id
            WHERE b.booking_id = ?
        `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;

    const booking: any = rows[0];

    // Fetch associated rooms from the junction table
    const roomQuery = `
            SELECT r.* FROM room r
            JOIN booking_room br ON r.room_id = br.room_id
            WHERE br.booking_id = ?
        `;
    const [rooms] = await pool.query<RowDataPacket[]>(roomQuery, [id]);
    booking.rooms = rooms;

    // Fetch associated services from the one-to-many relationship
    const serviceQuery = `
            SELECT * FROM service WHERE booking_id = ?
        `;
    const [services] = await pool.query<RowDataPacket[]>(serviceQuery, [id]);
    booking.services = services;

    return booking;
  },

  async create(bookingData: Booking): Promise<number> {
    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;

      const {
        check_in_date,
        check_out_date,
        status,
        guest_id,
        employee_id,
        room_ids,
        services,
      } = bookingData;

      const numberOfNights = validateDateRange(check_in_date, check_out_date);
      const roomIds = validateRoomIds(room_ids);
      const validatedServices = validateServices(services);
      const bookingStatus = status || "Confirmed";

      if (
        !Number.isInteger(guest_id) ||
        guest_id <= 0 ||
        !Number.isInteger(employee_id) ||
        employee_id <= 0
      ) {
        throw new BookingError(
          400,
          "Guest and employee IDs must be positive integers.",
        );
      }

      if (!bookingStatuses.includes(bookingStatus)) {
        throw new BookingError(400, "Invalid booking status.");
      }

      let roomTotal = 0;
      let roomsData: RowDataPacket[] = [];
      if (roomIds.length > 0) {
        const [rooms] = await connection.query<RowDataPacket[]>(
          `SELECT room_id, price_per_night FROM room WHERE room_id IN (?) ORDER BY room_id FOR UPDATE`,
          [roomIds],
        );
        if (rooms.length !== roomIds.length) {
          const foundRoomIds = new Set(
            rooms.map((room) => Number(room.room_id)),
          );
          const missingRoomIds = roomIds.filter(
            (roomId) => !foundRoomIds.has(roomId),
          );
          throw new BookingError(
            404,
            `Room ID(s) ${missingRoomIds.join(", ")} not found.`,
          );
        }
        roomsData = rooms;

        const [conflicts] = await connection.query<RowDataPacket[]>(
          `SELECT br.room_id 
                     FROM booking_room br
                     JOIN booking b ON br.booking_id = b.booking_id
                     WHERE br.room_id IN (?)
                       AND b.booking_status != 'Cancelled'
                         AND NOT (b.check_out_date <= ? OR b.check_in_date >= ?)`,
          [roomIds, check_in_date, check_out_date],
        );

        if (conflicts.length > 0) {
          throw new BookingError(
            409,
            `Room ID(s) ${conflicts.map((c) => c.room_id).join(", ")} are already booked for these dates.`,
          );
        }
        roomTotal =
          rooms.reduce((sum, room) => sum + Number(room.price_per_night), 0) *
          numberOfNights;
      }

      const serviceTotal = validatedServices.reduce(
        (sum, service) => sum + Number(service.charged_amount),
        0,
      );

      const calculatedTotalAmount = roomTotal + serviceTotal;

      // 4. Insert the main booking record with the backend-verified total amount
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO booking (check_in_date, check_out_date, booking_status, total_amount, guest_id, employee_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
        [
          check_in_date,
          check_out_date,
          bookingStatus,
          calculatedTotalAmount,
          guest_id,
          employee_id,
        ],
      );

      const bookingId = result.insertId;

      // 5. Link rooms in the junction table (booking_room) providing the required rate_charged
      if (roomIds.length > 0) {
        const roomValues = roomsData.map((room) => [
          Number(room.price_per_night) * numberOfNights, // rate_charged for this specific room
          bookingId,
          room.room_id,
        ]);
        await connection.query(
          `INSERT INTO booking_room (rate_charged, booking_id, room_id) VALUES ?`,
          [roomValues],
        );
      }

      // 6. Insert associated services linked to this booking ID if provided
      if (validatedServices.length > 0) {
        const serviceValues = validatedServices.map((s) => [
          s.description.trim(),
          s.charged_amount,
          bookingId,
        ]);
        await connection.query(
          `INSERT INTO service (description, charged_amount, booking_id) VALUES ?`,
          [serviceValues],
        );
      }

      await connection.commit();
      return bookingId;
    } catch (error) {
      await rollbackQuietly(connection, transactionStarted);
      throw error;
    } finally {
      connection.release();
    }
  },

  async update(id: number, bookingData: Partial<Booking>): Promise<boolean> {
    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;

      const { check_in_date, check_out_date, status, guest_id, employee_id } =
        bookingData;
      const unsupportedKeys = Object.keys(bookingData).filter(
        (key) =>
          ![
            "check_in_date",
            "check_out_date",
            "status",
            "guest_id",
            "employee_id",
          ].includes(key),
      );
      if (unsupportedKeys.length > 0) {
        throw new BookingError(400, "Booking contains unsupported fields.");
      }

      const [currentBookingRows] = await connection.query<RowDataPacket[]>(
        `SELECT check_in_date, check_out_date, booking_status FROM booking WHERE booking_id = ? FOR UPDATE`,
        [id],
      );
      if (currentBookingRows.length === 0) {
        await connection.commit();
        return false;
      }
      const currentBooking = currentBookingRows[0];
      if (!currentBooking) {
        await connection.commit();
        return false;
      }

      if (
        (guest_id !== undefined &&
          (!Number.isInteger(guest_id) || guest_id <= 0)) ||
        (employee_id !== undefined &&
          (!Number.isInteger(employee_id) || employee_id <= 0))
      ) {
        throw new BookingError(
          400,
          "Guest and employee IDs must be positive integers.",
        );
      }

      if (status !== undefined && !bookingStatuses.includes(status)) {
        throw new BookingError(400, "Invalid booking status.");
      }

      const effectiveCheckIn =
        check_in_date || String(currentBooking.check_in_date);
      const effectiveCheckOut =
        check_out_date || String(currentBooking.check_out_date);
      const datesChanged =
        check_in_date !== undefined || check_out_date !== undefined;
      const numberOfNights = datesChanged
        ? validateDateRange(effectiveCheckIn, effectiveCheckOut)
        : 0;

      if (datesChanged) {
        const [linkedRooms] = await connection.query<RowDataPacket[]>(
          `SELECT room_id FROM booking_room WHERE booking_id = ?`,
          [id],
        );

        if (linkedRooms.length > 0) {
          const roomIds = linkedRooms.map((r) => r.room_id);
          await connection.query<RowDataPacket[]>(
            `SELECT room_id FROM room WHERE room_id IN (?) ORDER BY room_id FOR UPDATE`,
            [roomIds],
          );

          const [conflicts] = await connection.query<RowDataPacket[]>(
            `SELECT br.room_id 
                         FROM booking_room br
                         JOIN booking b ON br.booking_id = b.booking_id
                         WHERE br.room_id IN (?)
                           AND b.booking_id != ?
                           AND b.booking_status != 'Cancelled'
                             AND NOT (b.check_out_date <= ? OR b.check_in_date >= ?)`,
            [roomIds, id, effectiveCheckIn, effectiveCheckOut],
          );

          if (conflicts.length > 0) {
            throw new BookingError(
              409,
              `Cannot update dates: Room ID(s) ${conflicts.map((c) => c.room_id).join(", ")} are already booked for these dates.`,
            );
          }
        }
      }

      const fields: string[] = [];
      const values: unknown[] = [];
      if (check_in_date !== undefined) {
        fields.push("check_in_date = ?");
        values.push(check_in_date);
      }
      if (check_out_date !== undefined) {
        fields.push("check_out_date = ?");
        values.push(check_out_date);
      }
      if (status !== undefined) {
        fields.push("booking_status = ?");
        values.push(status);
      }
      if (guest_id !== undefined) {
        fields.push("guest_id = ?");
        values.push(guest_id);
      }
      if (employee_id !== undefined) {
        fields.push("employee_id = ?");
        values.push(employee_id);
      }

      if (fields.length === 0) {
        await connection.commit();
        return false;
      }
      values.push(id);
      await connection.query<ResultSetHeader>(
        `UPDATE booking SET ${fields.join(", ")} WHERE booking_id = ?`,
        values,
      );

      if (datesChanged) {
        const [linkedRooms] = await connection.query<RowDataPacket[]>(
          `SELECT br.room_id, r.price_per_night 
                     FROM booking_room br
                     JOIN room r ON br.room_id = r.room_id
                     WHERE br.booking_id = ?`,
          [id],
        );

        for (const room of linkedRooms) {
          const newRateCharged = Number(room.price_per_night) * numberOfNights;
          await connection.query(
            `UPDATE booking_room SET rate_charged = ? WHERE booking_id = ? AND room_id = ?`,
            [newRateCharged, id, room.room_id],
          );
        }

        // Recalculate full booking total amount
        const [roomSumRows]: any = await connection.query<RowDataPacket[]>(
          `SELECT SUM(rate_charged) AS total_rooms FROM booking_room WHERE booking_id = ?`,
          [id],
        );
        const [serviceSumRows]: any = await connection.query<RowDataPacket[]>(
          `SELECT SUM(charged_amount) AS total_services FROM service WHERE booking_id = ?`,
          [id],
        );

        const newTotal =
          Number(roomSumRows[0].total_rooms || 0) +
          Number(serviceSumRows[0].total_services || 0);

        await connection.query(
          `UPDATE booking SET total_amount = ? WHERE booking_id = ?`,
          [newTotal, id],
        );
      }

      await connection.commit();
      return true;
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

      const [bookingRows] = await connection.query<RowDataPacket[]>(
        "SELECT booking_id FROM booking WHERE booking_id = ? FOR UPDATE",
        [id],
      );
      if (bookingRows.length === 0) {
        await connection.commit();
        return false;
      }

      // Clean up junction and related tables first to respect foreign key constraints
      await connection.query("DELETE FROM booking_room WHERE booking_id = ?", [
        id,
      ]);
      await connection.query("DELETE FROM service WHERE booking_id = ?", [id]);

      const [result] = await connection.query<ResultSetHeader>(
        "DELETE FROM booking WHERE booking_id = ?",
        [id],
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await rollbackQuietly(connection, transactionStarted);
      throw error;
    } finally {
      connection.release();
    }
  },

  async addRoomToBooking(bookingId: number, roomId: number): Promise<boolean> {
    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;

      // 1. Fetch the booking's current dates and status
      const [bookingRows] = await connection.query<RowDataPacket[]>(
        `SELECT check_in_date, check_out_date, booking_status FROM booking WHERE booking_id = ? FOR UPDATE`,
        [bookingId],
      );

      if (bookingRows.length === 0) {
        throw new Error(`Booking ID ${bookingId} not found.`);
      }

      const { check_in_date, check_out_date, booking_status }: any =
        bookingRows[0];
      if (booking_status === "Cancelled" || booking_status === "Checked-Out") {
        throw new BookingError(409, "Rooms cannot be added to this booking.");
      }

      await connection.query<RowDataPacket[]>(
        "SELECT room_id FROM room WHERE room_id = ? FOR UPDATE",
        [roomId],
      );

      // 2. Check if the room is already booked for these overlapping dates
      const [conflicts] = await connection.query<RowDataPacket[]>(
        `SELECT br.room_id 
                 FROM booking_room br
                 JOIN booking b ON br.booking_id = b.booking_id
                 WHERE br.room_id = ?
                   AND b.booking_status != 'Cancelled'
                   AND NOT (b.check_out_date <= ? OR b.check_in_date >= ?)`,
        [roomId, check_in_date, check_out_date],
      );

      if (conflicts.length > 0) {
        throw new BookingError(
          409,
          `Room ID ${roomId} is already booked for these dates.`,
        );
      }

      // 3. Fetch the room's price per night to calculate rate_charged
      const [roomRows]: any = await connection.query<RowDataPacket[]>(
        `SELECT price_per_night FROM room WHERE room_id = ?`,
        [roomId],
      );

      if (roomRows.length === 0) {
        throw new Error(`Room ID ${roomId} not found.`);
      }

      const pricePerNight = Number(roomRows[0].price_per_night);

      // 4. Calculate number of nights
      const numberOfNights = validateDateRange(
        String(check_in_date),
        String(check_out_date),
      );
      const rateCharged = pricePerNight * numberOfNights;

      // 5. Insert into booking_room with calculated rate_charged
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO booking_room (rate_charged, booking_id, room_id) VALUES (?, ?, ?)`,
        [rateCharged, bookingId, roomId],
      );

      // 6. Recalculate and update total_amount on the main booking
      const [roomSumRows]: any = await connection.query<RowDataPacket[]>(
        `SELECT SUM(rate_charged) AS total_rooms FROM booking_room WHERE booking_id = ?`,
        [bookingId],
      );
      const [serviceSumRows]: any = await connection.query<RowDataPacket[]>(
        `SELECT SUM(charged_amount) AS total_services FROM service WHERE booking_id = ?`,
        [bookingId],
      );

      const newTotal =
        Number(roomSumRows[0].total_rooms || 0) +
        Number(serviceSumRows[0].total_services || 0);

      await connection.query(
        `UPDATE booking SET total_amount = ? WHERE booking_id = ?`,
        [newTotal, bookingId],
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await rollbackQuietly(connection, transactionStarted);
      throw error;
    } finally {
      connection.release();
    }
  },
  async removeRoomFromBooking(
    bookingId: number,
    roomId: number,
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
      await connection.beginTransaction();
      transactionStarted = true;

      const [bookingRows] = await connection.query<RowDataPacket[]>(
        "SELECT booking_id FROM booking WHERE booking_id = ? FOR UPDATE",
        [bookingId],
      );
      if (bookingRows.length === 0) {
        await connection.commit();
        return false;
      }

      // 1. Remove the room from the booking_room junction table
      const [result] = await connection.query<ResultSetHeader>(
        `DELETE FROM booking_room WHERE booking_id = ? AND room_id = ?`,
        [bookingId, roomId],
      );

      if (result.affectedRows === 0) {
        await connection.commit();
        return false;
      }

      // 2. Recalculate the new total amount for the booking
      const [roomSumRows]: any = await connection.query<RowDataPacket[]>(
        `SELECT SUM(rate_charged) AS total_rooms FROM booking_room WHERE booking_id = ?`,
        [bookingId],
      );
      const [serviceSumRows]: any = await connection.query<RowDataPacket[]>(
        `SELECT SUM(charged_amount) AS total_services FROM service WHERE booking_id = ?`,
        [bookingId],
      );

      const newTotal =
        Number(roomSumRows[0].total_rooms || 0) +
        Number(serviceSumRows[0].total_services || 0);

      // 3. Update the main booking total amount
      await connection.query(
        `UPDATE booking SET total_amount = ? WHERE booking_id = ?`,
        [newTotal, bookingId],
      );

      await connection.commit();
      return true;
    } catch (error) {
      await rollbackQuietly(connection, transactionStarted);
      throw error;
    } finally {
      connection.release();
    }
  },
};
