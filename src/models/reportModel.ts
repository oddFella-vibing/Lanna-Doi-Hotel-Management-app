import pool from "../config/database";
import { RowDataPacket } from "mysql2";

export const ReportModel = {
  // ═══════════════════════════════════════════════════════════
  // REPORT 1: Monthly Revenue + Occupancy
  // ═══════════════════════════════════════════════════════════
  async getMonthlyRevenue(year: string, month: string) {
    const paddedMonth = month.padStart(2, "0");

    // Total revenue + payments for the month
    const [revenueRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(amount), 0) AS total_revenue,
         COUNT(*) AS total_payments
       FROM payment
       WHERE YEAR(payment_date) = ?
         AND MONTH(payment_date) = ?`,
      [year, paddedMonth]
    );

    // Total bookings this month
    const [bookingRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total_bookings
       FROM booking
       WHERE YEAR(check_in_date) = ?
         AND MONTH(check_in_date) = ?`,
      [year, paddedMonth]
    );

    // Total rooms in hotel
    const [roomRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total_rooms FROM room`
    );

    // Occupancy today
    const [occupancyRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT br.room_id) AS occupied_rooms
       FROM booking_room br
       JOIN booking b ON b.booking_id = br.booking_id
       WHERE b.booking_status = 'Checked-In'
         AND CURDATE() BETWEEN b.check_in_date AND b.check_out_date`
    );

    // Daily revenue for chart
    const [dailyRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         DATE(payment_date) AS date,
         SUM(amount) AS revenue
       FROM payment
       WHERE YEAR(payment_date) = ?
         AND MONTH(payment_date) = ?
       GROUP BY DATE(payment_date)
       ORDER BY DATE(payment_date) ASC`,
      [year, paddedMonth]
    );

    const totalRooms = roomRows[0]?.total_rooms || 0;
    const occupiedRooms = occupancyRows[0]?.occupied_rooms || 0;
    const occupancyRate =
      totalRooms > 0
        ? ((occupiedRooms / totalRooms) * 100).toFixed(1)
        : "0.0";

    return {
      period: `${year}-${paddedMonth}`,
      total_revenue: revenueRows[0]?.total_revenue || 0,
      total_payments: revenueRows[0]?.total_payments || 0,
      total_bookings: bookingRows[0]?.total_bookings || 0,
      total_rooms: totalRooms,
      occupied_rooms: occupiedRooms,
      occupancy_rate: occupancyRate,
      daily_revenue: dailyRows,
    };
  },

  // ═══════════════════════════════════════════════════════════
  // REPORT 2: Guest Stay & Payment History
  // ═══════════════════════════════════════════════════════════
  async getGuestHistory(search?: string) {
    let query = `
      SELECT 
        g.guest_id,
        CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
        g.phone_number,
        g.email,
        b.booking_id,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        b.booking_status,
        b.payment_status,
        r.room_number,
        (SELECT COALESCE(SUM(amount), 0) 
         FROM payment p 
         WHERE p.booking_id = b.booking_id) AS total_paid
      FROM guest g
      LEFT JOIN booking b ON b.guest_id = g.guest_id
      LEFT JOIN booking_room br ON br.booking_id = b.booking_id
      LEFT JOIN room r ON r.room_id = br.room_id
    `;

    const params: unknown[] = [];
    if (search && search.trim() !== "") {
      query += ` WHERE g.first_name LIKE ? OR g.last_name LIKE ? OR g.phone_number LIKE ?`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ` ORDER BY g.guest_id, b.check_in_date DESC LIMIT 100`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    // Group rows by guest
    const guestsMap: Record<string, any> = {};
    rows.forEach((row: any) => {
      if (!guestsMap[row.guest_id]) {
        guestsMap[row.guest_id] = {
          guest_id: row.guest_id,
          guest_name: row.guest_name,
          phone_number: row.phone_number,
          email: row.email,
          bookings: [],
        };
      }
      if (row.booking_id) {
        guestsMap[row.guest_id].bookings.push({
          booking_id: row.booking_id,
          room_number: row.room_number,
          check_in_date: row.check_in_date,
          check_out_date: row.check_out_date,
          total_amount: row.total_amount,
          total_paid: row.total_paid,
          booking_status: row.booking_status,
          payment_status: row.payment_status,
        });
      }
    });

    return Object.values(guestsMap);
  },

  // ═══════════════════════════════════════════════════════════
  // REPORT 3: Room Type Performance
  // ═══════════════════════════════════════════════════════════
  async getRoomPerformance() {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         r.room_type,
         COUNT(DISTINCT r.room_id) AS total_rooms,
         COUNT(DISTINCT b.booking_id) AS total_bookings,
         COALESCE(SUM(b.total_amount), 0) AS total_revenue,
         COALESCE(AVG(b.total_amount), 0) AS avg_booking_value,
         COALESCE(AVG(DATEDIFF(b.check_out_date, b.check_in_date)), 0) AS avg_nights
       FROM room r
       LEFT JOIN booking_room br ON br.room_id = r.room_id
       LEFT JOIN booking b ON b.booking_id = br.booking_id
         AND b.booking_status IN ('Checked-In', 'Checked-Out', 'Confirmed')
       GROUP BY r.room_type
       ORDER BY total_revenue DESC`
    );

    return rows;
  },
};