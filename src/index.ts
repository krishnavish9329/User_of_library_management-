// Must be the FIRST import: loads .env before any module reads process.env at import time
// (authRoutes builds the JWT / email services as soon as it is imported).
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./presentation/routes/authRoutes";
import { errorHandler } from "./presentation/middleware/errorHandler";
import { startResetTokenCleanup } from "./infrastructure/jobs/cleanupResetTokens";

const app = express();
const PORT = process.env.PORT || 4001;

// Kuch bhi unexpected ho to console me dikhe, process na mare silently.
process.on("uncaughtException", (err) => console.error("[fatal] uncaughtException:", err));
process.on("unhandledRejection", (reason) => console.error("[fatal] unhandledRejection:", reason));

// The service sits behind the gateway, so the real client IP is in X-Forwarded-For.
// Needed for rate limiting to key on the user, not on the gateway.
app.set("trust proxy", 1);

// Har request/response ka access log — method, path, status, duration, IP.
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(
      `[http] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms) ip=${req.ip}`
    );
  });
  next();
});

// Production Security Middlewares
app.use(helmet());
app.use(cors({ origin: "http://localhost:4000", credentials: true })); // Only trust Gateway
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Base Route Configuration
app.use("/api/auth", authRoutes);

// Centralized Error Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[User Service] running on port ${PORT} (env: ${process.env.NODE_ENV || "development"})`);
  startResetTokenCleanup();
});
