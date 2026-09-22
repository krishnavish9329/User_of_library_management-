import { Request, Response, NextFunction } from "express";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../../application/dtos/AuthDTOs";
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase";
import { LoginUserUseCase } from "../../application/use-cases/LoginUserUseCase";
import { ForgotPasswordUseCase } from "../../application/use-cases/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";

export interface AuthController {
  register(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}

// Identical response whether or not the email exists (prevents account enumeration).
const FORGOT_PASSWORD_MESSAGE = "If an account exists for this email, a password reset link has been sent.";

/**
 * Factory function replacing the old `AuthController` class.
 * Dependencies are passed in as arguments and captured via closure,
 * and each handler is a plain async function (no `this` binding needed).
 */
export const createAuthController = (
  registerUseCase: RegisterUserUseCase,
  loginUseCase: LoginUserUseCase,
  forgotPasswordUseCase: ForgotPasswordUseCase,
  resetPasswordUseCase: ResetPasswordUseCase
): AuthController => {
  const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const result = await registerUseCase.execute(validatedData);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const { tokens, user } = await loginUseCase.execute(validatedData);

      // Secure HTTP-Only Cookie for Refresh Token
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        accessToken: tokens.accessToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = ForgotPasswordSchema.parse(req.body);

      // Answer immediately, then do the DB + email work in the background.
      // The response time is therefore the same for existing and unknown emails,
      // and the client never waits for the SMTP server.
      res.status(200).json({ success: true, message: FORGOT_PASSWORD_MESSAGE });

      void forgotPasswordUseCase
        .execute(dto)
        .catch((err) => console.error("[forgot-password] failed:", err instanceof Error ? err.message : err));
    } catch (error) {
      next(error);
    }
  };

  const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = ResetPasswordSchema.parse(req.body);
      await resetPasswordUseCase.execute(dto);
      res.status(200).json({ success: true, message: "Password updated. You can now log in." });
    } catch (error) {
      next(error);
    }
  };

  return { register, login, forgotPassword, resetPassword };
};
