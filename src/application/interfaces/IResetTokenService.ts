export interface GeneratedResetToken {
  /** Sent to the user inside the email link. Never stored. */
  token: string;
  /** Stored in the database. */
  tokenHash: string;
}

export interface IResetTokenService {
  generate(): GeneratedResetToken;
  hash(token: string): string;
}
