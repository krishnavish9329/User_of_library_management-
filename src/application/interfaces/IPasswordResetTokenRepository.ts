export interface CreateResetTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface IPasswordResetTokenRepository {
  create(input: CreateResetTokenInput): Promise<void>;

  /** When the user's most recent reset link was issued (used for the resend cooldown). */
  findLatestCreatedAt(userId: string): Promise<Date | null>;

  /**
   * Atomically marks a token as used, but only if it exists, is unused and is not expired.
   * Returns the owning userId, or null if the token is not usable.
   * Being atomic guarantees a link can never be used twice, even with concurrent requests.
   */
  consume(tokenHash: string, now: Date): Promise<string | null>;

  /** Removes every outstanding reset link of a user. */
  invalidateAllForUser(userId: string): Promise<void>;
}
