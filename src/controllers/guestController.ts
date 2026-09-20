import { Request, Response } from "express";
import { GuestModel, Guest } from "../models/guestModel";
import { parsePositiveId, sendError } from "../utils/http";

export const GuestController = {
  async getAllGuests(req: Request, res: Response) {
    try {
      const guests = await GuestModel.findAll();
      res.status(200).json({ status: "success", data: guests });
    } catch (error: unknown) {
      sendError(res, error, "Guest operation failed.");
    }
  },

  async getGuestById(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null)
        return res
          .status(400)
          .json({ status: "error", message: "Invalid guest ID" });
      const guest = await GuestModel.findById(id);
      if (!guest) {
        return res
          .status(404)
          .json({ status: "error", message: "Guest not found" });
      }
      res.status(200).json({ status: "success", data: guest });
    } catch (error: unknown) {
      sendError(res, error, "Guest operation failed.");
    }
  },

  async createGuest(req: Request, res: Response) {
    try {
      const newGuestData: Guest = req.body;
      if (
        !newGuestData.first_name ||
        !newGuestData.last_name ||
        !newGuestData.email ||
        !newGuestData.phone_number
      ) {
        return res
          .status(400)
          .json({
            status: "error",
            message:
              "Missing required fields (first_name, last_name, email, phone_number)",
          });
      }

      const guestId = await GuestModel.create(newGuestData);
      res
        .status(201)
        .json({
          status: "success",
          message: "Guest created successfully",
          data: { guest_id: guestId, ...newGuestData },
        });
    } catch (error: unknown) {
      sendError(res, error, "Guest operation failed.");
    }
  },

  async updateGuest(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null)
        return res
          .status(400)
          .json({ status: "error", message: "Invalid guest ID" });
      const updated = await GuestModel.update(id, req.body);
      if (!updated) {
        return res
          .status(404)
          .json({
            status: "error",
            message: "Guest not found or no changes made",
          });
      }
      res
        .status(200)
        .json({ status: "success", message: "Guest updated successfully" });
    } catch (error: unknown) {
      sendError(res, error, "Guest operation failed.");
    }
  },

  async deleteGuest(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null)
        return res
          .status(400)
          .json({ status: "error", message: "Invalid guest ID" });
      const deleted = await GuestModel.delete(id);
      if (!deleted) {
        return res
          .status(404)
          .json({ status: "error", message: "Guest not found" });
      }
      res
        .status(200)
        .json({ status: "success", message: "Guest deleted successfully" });
    } catch (error: unknown) {
      sendError(res, error, "Guest operation failed.");
    }
  },
};
