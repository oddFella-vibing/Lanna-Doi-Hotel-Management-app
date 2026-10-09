import { Request, Response } from "express";
import { ReportModel } from "../models/reportModel";
import { sendError } from "../utils/http";

export const ReportController = {
  // ═══════════════════════════════════════════════════════════
  // GET /api/reports/revenue?year=2026&month=10
  // ═══════════════════════════════════════════════════════════
  async getMonthlyRevenue(req: Request, res: Response) {
    try {
      const year = (req.query.year as string) || String(new Date().getFullYear());
      const month = (req.query.month as string) || String(new Date().getMonth() + 1);
      const data = await ReportModel.getMonthlyRevenue(year, month);
      res.status(200).json({ status: "success", data });
    } catch (error: unknown) {
      sendError(res, error, "Failed to fetch revenue report.");
    }
  },

  // ═══════════════════════════════════════════════════════════
  // GET /api/reports/guest-history?search=Malee
  // ═══════════════════════════════════════════════════════════
  async getGuestHistory(req: Request, res: Response) {
    try {
      const search = (req.query.search as string) || undefined;
      const data = await ReportModel.getGuestHistory(search);
      res.status(200).json({ status: "success", data });
    } catch (error: unknown) {
      sendError(res, error, "Failed to fetch guest history.");
    }
  },

  // ═══════════════════════════════════════════════════════════
  // GET /api/reports/room-performance
  // ═══════════════════════════════════════════════════════════
  async getRoomPerformance(req: Request, res: Response) {
    try {
      const data = await ReportModel.getRoomPerformance();
      res.status(200).json({ status: "success", data });
    } catch (error: unknown) {
      sendError(res, error, "Failed to fetch room performance.");
    }
  },
};