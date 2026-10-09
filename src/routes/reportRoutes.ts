import express from "express";
import { ReportController } from "../controllers/reportController";

const router = express.Router();

router.get("/revenue", ReportController.getMonthlyRevenue);
router.get("/guest-history", ReportController.getGuestHistory);
router.get("/room-performance", ReportController.getRoomPerformance);

export default router;