import { Request, Response } from "express";
import express from "express";
import cors from "cors";
require("dotenv").config();

//operation routes
import guestRoutes from "./routes/guestRoutes";
import roomRoutes from "./routes/roomRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import housekeepinglogRoutes from "./routes/housekeepingLogRoutes";
import billingRoutes from "./routes/billingRoutes";

// Import database connection pool
import db from "./config/database";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the 'public' folder at the root
const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));

// API Routes

app.use("/api/guests", guestRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/housekeepinglogs", housekeepinglogRoutes);
app.use("/api/billings", billingRoutes);

// Basic health check route
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    // Test database connection
    await db.query("SELECT 1");
    res.status(200).json({
      status: "success",
      message: "Database connected and server is running.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
