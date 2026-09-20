import { Request, Response } from "express";
import { ServiceModel, Service } from "../models/serviceModel";
import { parsePositiveId, sendError } from "../utils/http";

export const ServiceController = {
  async getAllServices(req: Request, res: Response) {
    try {
      // Optional query filter if looking up services by booking_id (e.g., /api/services?booking_id=1)
      const bookingId =
        req.query.booking_id === undefined
          ? null
          : parsePositiveId(req.query.booking_id);
      if (req.query.booking_id !== undefined && bookingId === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid booking ID" });
      }

      let services;
      if (bookingId !== null) {
        services = await ServiceModel.findByBookingId(bookingId);
      } else {
        services = await ServiceModel.findAll();
      }

      res.status(200).json({ status: "success", data: services });
    } catch (error: unknown) {
      sendError(res, error, "Service operation failed.");
    }
  },

  async getServiceById(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid service ID" });
      }

      const service = await ServiceModel.findById(id);
      if (!service) {
        return res
          .status(404)
          .json({ status: "error", message: "Service charge not found" });
      }
      res.status(200).json({ status: "success", data: service });
    } catch (error: unknown) {
      sendError(res, error, "Service operation failed.");
    }
  },

  async createService(req: Request, res: Response) {
    try {
      const newServiceData: Service = req.body;
      if (
        !newServiceData.description ||
        newServiceData.charged_amount === undefined ||
        !newServiceData.booking_id
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Missing required fields (description, charged_amount, booking_id)",
        });
      }

      const serviceId = await ServiceModel.create(newServiceData);
      res.status(201).json({
        status: "success",
        message: "Service charge added successfully",
        data: { service_id: serviceId, ...newServiceData },
      });
    } catch (error: unknown) {
      sendError(res, error, "Service operation failed.");
    }
  },

  async updateService(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid service ID" });
      }

      const updated = await ServiceModel.update(id, req.body);
      if (!updated) {
        return res
          .status(404)
          .json({
            status: "error",
            message: "Service charge not found or no changes made",
          });
      }
      res
        .status(200)
        .json({
          status: "success",
          message: "Service charge updated successfully",
        });
    } catch (error: unknown) {
      sendError(res, error, "Service operation failed.");
    }
  },

  async deleteService(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid service ID" });
      }

      const deleted = await ServiceModel.delete(id);
      if (!deleted) {
        return res
          .status(404)
          .json({ status: "error", message: "Service charge not found" });
      }
      res
        .status(200)
        .json({
          status: "success",
          message: "Service charge deleted successfully",
        });
    } catch (error: unknown) {
      sendError(res, error, "Service operation failed.");
    }
  },
};
