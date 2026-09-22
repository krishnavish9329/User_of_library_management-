import { z } from "zod";

// Single source of truth for password rules (register + reset use the same one)
const passwordSchema = z.string().min(8).max(100);

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "LIBRARIAN", "FACULTY", "STUDENT"]).optional().default("STUDENT"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(32).max(128),
  newPassword: passwordSchema,
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
