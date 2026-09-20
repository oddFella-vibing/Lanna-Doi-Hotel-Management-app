import { Request, Response } from "express";
import { BookingModel, Booking, BookingError } from "../models/bookingModel";

function parseId(value: string | string[] | undefined): number | null {
  if (Array.isArray(value)) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function sendBookingError(res: Response, error: unknown): void {
  if (error instanceof BookingError) {
    res
      .status(error.statusCode)
      .json({ status: "error", message: error.message });
    return;
  }

  const databaseError = error as { code?: string };
  if (databaseError.code === "ER_DUP_ENTRY") {
    res
      .status(409)
      .json({
        status: "error",
        message: "The booking conflicts with an existing record.",
      });
    return;
  }
  if (databaseError.code === "ER_NO_REFERENCED_ROW_2") {
    res
      .status(400)
      .json({
        status: "error",
        message: "A referenced guest, employee, or room does not exist.",
      });
    return;
  }

  res
    .status(500)
    .json({ status: "error", message: "Booking operation failed." });
}

export const BookingController = {
  async getAllBookings(req: Request, res: Response) {
    try {
      const bookings = await BookingModel.findAll();
      res.status(200).json({ status: "success", data: bookings });
    } catch (error: unknown) {
      sendBookingError(res, error);
    }
  },

  async getBookingById(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid booking ID" });
      }

      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res
          .status(404)
          .json({ status: "error", message: "Booking not found" });
      }
      res.status(200).json({ status: "success", data: booking });
    } catch (error: unknown) {
      sendBookingError(res, error);
    }
  },

  async createBooking(req: Request, res: Response) {
    try {
      const newBookingData: Booking = req.body;
      if (
        !newBookingData.check_in_date ||
        !newBookingData.check_out_date ||
        !Number.isInteger(newBookingData.guest_id) ||
        !Number.isInteger(newBookingData.employee_id)
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Missing required fields (check_in_date, check_out_date, guest_id, employee_id)",
        });
      }

      const bookingId = await BookingModel.create(newBookingData);
      res.status(201).json({
        status: "success",
        message: "Booking created successfully",
        data: { booking_id: bookingId, ...newBookingData },
      });
    } catch (error: unknown) {
      sendBookingError(res, error);
    }
  },

  async updateBooking(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid booking ID" });
      }

      const updated = await BookingModel.update(id, req.body);
      if (!updated) {
        return res
          .status(404)
          .json({
            status: "error",
            message: "Booking not found or no changes made",
          });
      }
      res
        .status(200)
        .json({ status: "success", message: "Booking updated successfully" });
    } catch (error: unknown) {
      sendBookingError(res, error);
    }
  },

  async deleteBooking(req: Request, res: Response) {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid booking ID" });
      }

      const deleted = await BookingModel.delete(id);
      if (!deleted) {
        return res
          .status(404)
          .json({ status: "error", message: "Booking not found" });
      }
      res
        .status(200)
        .json({ status: "success", message: "Booking deleted successfully" });
    } catch (error: unknown) {
      sendBookingError(res, error);
    }
  },
  // update room after booking
  async addRoomToBooking(req: Request, res: Response) {
    try {
      const bookingId = parseId(req.params.id);
      const roomId = parseId(req.body.room_id);

      if (bookingId === null || roomId === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid booking ID or room ID" });
      }

      const added = await BookingModel.addRoomToBooking(bookingId, roomId);
      if (!added) {
        return res
          .status(400)
          .json({
            status: "error",
            message:
              "Could not add room (it may already be assigned to this booking)",
          });
      }

      res
        .status(200)
        .json({
          status: "success",
          message: "Room added to booking successfully",
        });
    } catch (error: unknown) {
      sendBookingError(res, error);
    }
  },

  async removeRoomFromBooking(req: Request, res: Response) {
    try {
      const bookingId = parseId(req.params.id);
      const roomId = parseId(req.params.roomId);

      if (bookingId === null || roomId === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid booking ID or room ID" });
      }

      const removed = await BookingModel.removeRoomFromBooking(
        bookingId,
        roomId,
      );
      if (!removed) {
        return res
          .status(404)
          .json({
            status: "error",
            message: "Room assignment not found for this booking",
          });
      }

      res
        .status(200)
        .json({
          status: "success",
          message: "Room removed from booking successfully",
        });
    } catch (error: unknown) {
      sendBookingError(res, error);
    }
  },
};
