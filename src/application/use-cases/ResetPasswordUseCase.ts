import { IUserRepository } from "../interfaces/IUserRepository";
import { IPasswordResetTokenRepository } from "../interfaces/IPasswordResetTokenRepository";
import { IResetTokenService } from "../interfaces/IResetTokenService";
import { IEmailService } from "../interfaces/IEmailService";
import { ResetPasswordDTO } from "../dtos/AuthDTOs";
import { PasswordHasher } from "../../infrastructure/security/Argon2PasswordHasher";
import { AppError } from "../../domain/errors/AppError";

export interface ResetPasswordUseCase {
  execute(dto: ResetPasswordDTO): Promise<void>;
}

// One message for every failure reason (unknown / expired / already used)
// so an attacker learns nothing by probing tokens.
const INVALID_LINK = "This password reset link is invalid or has expired";

export const createResetPasswordUseCase = (
  userRepository: IUserRepository,
  tokenRepository: IPasswordResetTokenRepository,
  tokenService: IResetTokenService,
  hasher: PasswordHasher,
  emailService: IEmailService
): ResetPasswordUseCase => {
  const execute = async (dto: ResetPasswordDTO): Promise<void> => {
    // Atomically burn the token: valid + unused + not expired -> mark used.
    const userId = await tokenRepository.consume(tokenService.hash(dto.token), new Date());
    if (!userId) {
      console.warn("[reset-password] token rejected (unknown/expired/already used):", dto.token);
      throw new AppError(INVALID_LINK, 400);
    }

    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      console.warn(`[reset-password] token valid but user missing/inactive: userId=${userId}`);
      throw new AppError(INVALID_LINK, 400);
    }

    const passwordHash = await hasher.hash(dto.newPassword);
    await userRepository.updatePasswordHash(userId, passwordHash);

    // Any other outstanding links for this account are now useless.
    await tokenRepository.invalidateAllForUser(userId);
    console.log("[reset-password] password updated:", { userId, email: user.email });

    // Security notice: "was this you?" - never let a mail failure undo the reset.
    try {
      await emailService.sendPasswordChangedEmail({ to: user.email, firstName: user.firstName });
    } catch (err) {
      console.error("[reset-password] confirmation email failed:", err instanceof Error ? err.message : err);
    }
  };

  return { execute };
};
