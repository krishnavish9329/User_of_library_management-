import { IUserRepository } from "../interfaces/IUserRepository";
import { ITokenService } from "../interfaces/ITokenService";
import { LoginDTO, AuthTokens } from "../dtos/AuthDTOs";
import { createEmail } from "../../domain/value-objects/Email";
import { PasswordHasher } from "../../infrastructure/security/Argon2PasswordHasher";

export interface LoginUserResult {
  tokens: AuthTokens;
  user: { id: string; role: string; email: string };
}

export interface LoginUserUseCase {
  execute(dto: LoginDTO): Promise<LoginUserResult>;
}

/**
 * Factory function replacing the old `LoginUserUseCase` class.
 * Dependencies are passed in as arguments and captured via closure.
 */
export const createLoginUserUseCase = (
  userRepository: IUserRepository,
  hasher: PasswordHasher,
  tokenService: ITokenService
): LoginUserUseCase => {
  const execute = async (dto: LoginDTO): Promise<LoginUserResult> => {
    const validEmail = createEmail(dto.email);

    const user = await userRepository.findByEmail(validEmail.getValue());
    if (!user || !user.isActive) {
      console.warn("[login] no active user for email:", validEmail.getValue());
      throw new Error("Invalid credentials or account disabled");
    }

    const isPasswordValid = await hasher.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      console.warn("[login] wrong password for:", validEmail.getValue());
      throw new Error("Invalid credentials");
    }

    const tokens = tokenService.generateTokens(user.id!, user.role);
    console.log("[login] tokens issued for", { id: user.id, email: user.email, role: user.role });

    return {
      tokens,
      user: {
        id: user.id!,
        role: user.role,
        email: user.email,
      },
    };
  };

  return { execute };
};
