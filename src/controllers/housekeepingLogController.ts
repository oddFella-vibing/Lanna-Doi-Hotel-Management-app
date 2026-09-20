import { Request, Response } from "express";
import {
  HousekeepingModel,
  HousekeepingLog,
} from "../models/housekeepinglogModel";
import { parsePositiveId, sendError } from "../utils/http";

export const HousekeepingController = {
  async getAllLogs(req: Request, res: Response) {
    try {
      // Optional query filter by room_id (e.g., /api/housekeeping?room_id=1)
      const roomId =
        req.query.room_id === undefined
          ? null
          : parsePositiveId(req.query.room_id);
      if (req.query.room_id !== undefined && roomId === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid room ID" });
      }

      let logs;
      if (roomId !== null) {
        logs = await HousekeepingModel.findByRoomId(roomId);
      } else {
        logs = await HousekeepingModel.findAll();
      }

      res.status(200).json({ status: "success", data: logs });
    } catch (error: unknown) {
      sendError(res, error, "Housekeeping operation failed.");
    }
  },

  async getLogById(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid housekeeping log ID" });
      }

      const log = await HousekeepingModel.findById(id);
      if (!log) {
        return res
          .status(404)
          .json({ status: "error", message: "Housekeeping log not found" });
      }
      res.status(200).json({ status: "success", data: log });
    } catch (error: unknown) {
      sendError(res, error, "Housekeeping operation failed.");
    }
  },

  async createLog(req: Request, res: Response) {
    try {
      const newLogData: HousekeepingLog = req.body;
      if (!newLogData.room_id || !newLogData.employee_id) {
        return res.status(400).json({
          status: "error",
          message: "Missing required fields (room_id, employee_id)",
        });
      }

      const logId = await HousekeepingModel.create(newLogData);
      res.status(201).json({
        status: "success",
        message: "Housekeeping log created successfully",
        data: { housekeeping_log_id: logId, ...newLogData },
      });
    } catch (error: unknown) {
      sendError(res, error, "Housekeeping operation failed.");
    }
  },

  async updateLog(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid housekeeping log ID" });
      }

      const updated = await HousekeepingModel.update(id, req.body);
      if (!updated) {
        return res
          .status(404)
          .json({
            status: "error",
            message: "Housekeeping log not found or no changes made",
          });
      }
      res
        .status(200)
        .json({
          status: "success",
          message: "Housekeeping log updated successfully",
        });
    } catch (error: unknown) {
      sendError(res, error, "Housekeeping operation failed.");
    }
  },

  async deleteLog(req: Request, res: Response) {
    try {
      const id = parsePositiveId(req.params.id);
      if (id === null) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid housekeeping log ID" });
      }

      const deleted = await HousekeepingModel.delete(id);
      if (!deleted) {
        return res
          .status(404)
          .json({ status: "error", message: "Housekeeping log not found" });
      }
      res
        .status(200)
        .json({
          status: "success",
          message: "Housekeeping log deleted successfully",
        });
    } catch (error: unknown) {
      sendError(res, error, "Housekeeping operation failed.");
    }
  },
};
