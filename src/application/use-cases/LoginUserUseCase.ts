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
      throw new Error("Invalid credentials or account disabled");
    }

    const isPasswordValid = await hasher.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const tokens = tokenService.generateTokens(user.id!, user.role);

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
