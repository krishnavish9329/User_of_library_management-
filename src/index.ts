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

// The service sits behind the gateway, so the real client IP is in X-Forwarded-For.
// Needed for rate limiting to key on the user, not on the gateway.
app.set("trust proxy", 1);

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
  console.log(`[User Service] running on port ${PORT}`);
  startResetTokenCleanup();
});
