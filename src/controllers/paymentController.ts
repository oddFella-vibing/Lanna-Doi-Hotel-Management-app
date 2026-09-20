import { Request, Response } from "express";
import { PaymentModel, Payment } from "../models/paymentModel";
import { parsePositiveId, sendError } from "../utils/http";

export const PaymentController = {
  async getAllPayments(req: Request, res: Response) {
    try {
      // Optional query filter by booking_id (e.g., /api/payments?booking_id=1)
      const bookingId =
        req.query.booking_id === undefined
          ? null
          : parsePositiveId(req.query.booking_id);
      if (req.query.booking_id !== undefined && bookingId === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid booking ID" });
      }

      let payments;
      if (bookingId !== null) {
        payments = await PaymentModel.findByBookingId(bookingId);
      } else {
        payments = await PaymentModel.findAll();
      }

      res.status(200).json({ status: "success", data: payments });
    } catch (error: unknown) {
      sendError(res, error, "Payment operation failed.");
    }
  },

  async getPaymentById(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid payment ID" });
      }

      const payment = await PaymentModel.findById(id);
      if (!payment) {
        return res
          .status(404)
          .json({ status: "error", message: "Payment record not found" });
      }
      res.status(200).json({ status: "success", data: payment });
    } catch (error: unknown) {
      sendError(res, error, "Payment operation failed.");
    }
  },

  async createPayment(req: Request, res: Response) {
    try {
      const newPaymentData: Payment = req.body;
      if (
        newPaymentData.amount === undefined ||
        !Number.isFinite(newPaymentData.amount) ||
        newPaymentData.amount < 0 ||
        !newPaymentData.payment_method ||
        !newPaymentData.booking_id
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Missing required fields (amount, payment_method, booking_id)",
        });
      }

      const paymentId = await PaymentModel.create(newPaymentData);
      res.status(201).json({
        status: "success",
        message: "Payment recorded successfully",
        data: { payment_id: paymentId, ...newPaymentData },
      });
    } catch (error: unknown) {
      sendError(res, error, "Payment operation failed.");
    }
  },
};
