import rateLimit from "express-rate-limit";

const tooMany = { success: false, message: "Too many requests. Please try again later." };

// Blocked requests bhi console me dikhen (IP + route ke saath).
const logBlocked = (label: string) => (request: { method: string; originalUrl: string; ip?: string }) => {
  console.warn(`[rate-limit] ${label} blocked: ${request.method} ${request.originalUrl} ip=${request.ip}`);
};

/** Forgot-password: 5 requests / 15 min / IP */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooMany,
  handler: (req, res) => {
    logBlocked("forgot-password")(req);
    res.status(429).json(tooMany);
  },
});

/** Reset-password: 10 attempts / 15 min / IP (slows down token guessing) */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: tooMany,
  handler: (req, res) => {
    logBlocked("reset-password")(req);
    res.status(429).json(tooMany);
  },
});
