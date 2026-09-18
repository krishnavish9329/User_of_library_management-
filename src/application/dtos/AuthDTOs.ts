import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "LIBRARIAN", "FACULTY", "STUDENT"]).optional().default("STUDENT"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
