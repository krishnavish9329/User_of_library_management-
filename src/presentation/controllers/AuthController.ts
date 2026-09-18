import { Request, Response, NextFunction } from "express";
import { RegisterSchema, LoginSchema } from "../../application/dtos/AuthDTOs";
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase";
import { LoginUserUseCase } from "../../application/use-cases/LoginUserUseCase";

export interface AuthController {
  register(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Factory function replacing the old `AuthController` class.
 * Dependencies are passed in as arguments and captured via closure,
 * and each handler is a plain async function (no `this` binding needed).
 */
export const createAuthController = (
  registerUseCase: RegisterUserUseCase,
  loginUseCase: LoginUserUseCase
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

  return { register, login };
};
