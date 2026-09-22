import { Router } from "express";
import { createAuthController } from "../controllers/AuthController";

import { forgotPasswordLimiter, resetPasswordLimiter } from "../middleware/rateLimiters";
import { createRegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase";
import { createLoginUserUseCase } from "../../application/use-cases/LoginUserUseCase";

import { createForgotPasswordUseCase } from "../../application/use-cases/ForgotPasswordUseCase";

import { createResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";
import { createPrismaUserRepository } from "../../infrastructure/database/PrismaUserRepository";
import { createPrismaPasswordResetTokenRepository } from "../../infrastructure/database/PrismaPasswordResetTokenRepository";
import { createArgon2PasswordHasher } from "../../infrastructure/security/Argon2PasswordHasher";
import { createResetTokenService } from "../../infrastructure/security/ResetTokenService";
import { createJwtTokenService } from "../../infrastructure/security/JwtTokenService";
import { createNodemailerEmailService } from "../../infrastructure/email/NodemailerEmailService";

const router = Router();

// Composition Root for Auth Routes
const userRepository = createPrismaUserRepository();
const resetTokenRepository = createPrismaPasswordResetTokenRepository();
const passwordHasher = createArgon2PasswordHasher();
const tokenService = createJwtTokenService();
const resetTokenService = createResetTokenService();
const emailService = createNodemailerEmailService();

const registerUseCase = createRegisterUserUseCase(userRepository, passwordHasher);
const loginUseCase = createLoginUserUseCase(userRepository, passwordHasher, tokenService);

const forgotPasswordUseCase = createForgotPasswordUseCase(
  userRepository,
  resetTokenRepository,
  resetTokenService,
  emailService,
  {
    frontendResetUrl: process.env.FRONTEND_RESET_URL || "http://localhost:3000/reset-password",
    tokenTtlMinutes: Number(process.env.PASSWORD_RESET_TTL_MINUTES || 15),
    resendCooldownSeconds: Number(process.env.PASSWORD_RESET_COOLDOWN_SECONDS || 60),
  }
);

const resetPasswordUseCase = createResetPasswordUseCase(
  userRepository,
  resetTokenRepository,
  resetTokenService,
  passwordHasher,
  emailService
);

const authController = createAuthController(
  registerUseCase,
  loginUseCase,
  forgotPasswordUseCase,
  resetPasswordUseCase
);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password", resetPasswordLimiter, authController.resetPassword);

export default router;
