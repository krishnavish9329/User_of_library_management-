import { IUserRepository } from "../interfaces/IUserRepository";
import { IPasswordResetTokenRepository } from "../interfaces/IPasswordResetTokenRepository";
import { IResetTokenService } from "../interfaces/IResetTokenService";
import { IEmailService } from "../interfaces/IEmailService";
import { ForgotPasswordDTO } from "../dtos/AuthDTOs";
import { createEmail } from "../../domain/value-objects/Email";

export interface ForgotPasswordConfig {
  /** Frontend page that shows the "choose a new password" form, e.g. https://app.com/reset-password */
  frontendResetUrl: string;
  tokenTtlMinutes: number;
  /** Minimum gap between two reset emails for the same account. */
  resendCooldownSeconds: number;
}

export interface ForgotPasswordUseCase {
  execute(dto: ForgotPasswordDTO): Promise<void>;
}

/**
 * Issues a single-use, time-limited reset link and emails it.
 *
 * Deliberately returns nothing and stays silent for unknown / disabled accounts
 * so the API can never be used to find out which emails are registered.
 */
export const createForgotPasswordUseCase = (
  userRepository: IUserRepository,
  tokenRepository: IPasswordResetTokenRepository,
  tokenService: IResetTokenService,
  emailService: IEmailService,
  config: ForgotPasswordConfig
): ForgotPasswordUseCase => {
  const execute = async (dto: ForgotPasswordDTO): Promise<void> => {
    const email = createEmail(dto.email).getValue();

    const user = await userRepository.findByEmail(email);
    if (!user || !user.id || !user.isActive) return;

    const now = new Date();

    // Cooldown: stops someone from mail-bombing a user through this endpoint.
    const lastIssuedAt = await tokenRepository.findLatestCreatedAt(user.id);
    if (lastIssuedAt && now.getTime() - lastIssuedAt.getTime() < config.resendCooldownSeconds * 1000) {
      return;
    }

    // Only the newest link is ever valid.
    await tokenRepository.invalidateAllForUser(user.id);

    const { token, tokenHash } = tokenService.generate();
    await tokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(now.getTime() + config.tokenTtlMinutes * 60 * 1000),
    });

    const resetLink = `${config.frontendResetUrl}?token=${encodeURIComponent(token)}`;

    await emailService.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetLink,
      expiresInMinutes: config.tokenTtlMinutes,
    });
  };

  return { execute };
};
