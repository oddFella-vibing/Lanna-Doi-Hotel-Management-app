import { Request, Response } from "express";
import { BillingModel, Billing } from "../models/billingModel";
import { parsePositiveId, sendError } from "../utils/http";

export const BillingController = {
  async getAllBillings(req: Request, res: Response) {
    try {
      // Optional query filter by booking_id (e.g., /api/billings?booking_id=1)
      const bookingId =
        req.query.booking_id === undefined
          ? null
          : parsePositiveId(req.query.booking_id);
      if (req.query.booking_id !== undefined && bookingId === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid booking ID" });
      }

      let billings;
      if (bookingId !== null) {
        billings = await BillingModel.findByBookingId(bookingId);
        billings = billings ? [billings] : [];
      } else {
        billings = await BillingModel.findAll();
      }

      res.status(200).json({ status: "success", data: billings });
    } catch (error: unknown) {
      sendError(res, error, "Billing operation failed.");
    }
  },

  async getBillingById(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid billing ID" });
      }

      const billing = await BillingModel.findById(id);
      if (!billing) {
        return res
          .status(404)
          .json({ status: "error", message: "Billing record not found" });
      }
      res.status(200).json({ status: "success", data: billing });
    } catch (error: unknown) {
      sendError(res, error, "Billing operation failed.");
    }
  },

  async createBilling(req: Request, res: Response) {
    try {
      const newBillingData: Billing = req.body;
      if (
        !Number.isInteger(newBillingData.booking_id) ||
        newBillingData.booking_id <= 0
      ) {
        return res.status(400).json({
          status: "error",
          message: "Missing required fields (booking_id)",
        });
      }

      const billingId = await BillingModel.create(newBillingData);
      res.status(201).json({
        status: "success",
        message: "Invoice generated successfully",
        data: { billing_id: billingId, ...newBillingData },
      });
    } catch (error: unknown) {
      sendError(res, error, "Billing operation failed.");
    }
  },
};
