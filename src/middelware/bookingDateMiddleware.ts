import { Request, Response, NextFunction } from 'express';

export const validateBookingDatesMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { check_in_date, check_out_date } = req.body;

    if (!check_in_date || !check_out_date) {
        return res.status(400).json({ status: "error", message: "Both check_in_date and check_out_date are required." });
    }

    const start = new Date(check_in_date);
    const end = new Date(check_out_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ status: "error", message: "Invalid date format. Use YYYY-MM-DD." });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
        return res.status(400).json({ status: "error", message: "Check-in date cannot be in the past." });
    }

    if (end <= start) {
        return res.status(400).json({ status: "error", message: "Check-out date must be strictly after the check-in date." });
    }

    next();
};