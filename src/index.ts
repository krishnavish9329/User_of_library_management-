import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./presentation/routes/authRoutes";
import { errorHandler } from "./presentation/middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Production Security Middlewares
app.use(helmet());
app.use(cors({ origin: "http://localhost:4000", credentials: true })); // Only trust Gateway
app.use(express.json());
app.use(cookieParser());

// Base Route Configuration
app.use("/api/auth", authRoutes);

// Centralized Error Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[User Service] running on port ${PORT}`);
});
