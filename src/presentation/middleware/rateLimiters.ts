import rateLimit from "express-rate-limit";

const tooMany = { success: false, message: "Too many requests. Please try again later." };

/** Forgot-password: 5 requests / 15 min / IP */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooMany,
});

/** Reset-password: 10 attempts / 15 min / IP (slows down token guessing) */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooMany,
});
