export interface PasswordResetEmailParams {
  to: string;
  firstName: string;
  resetLink: string;
  expiresInMinutes: number;
}

export interface PasswordChangedEmailParams {
  to: string;
  firstName: string;
}

export interface IEmailService {
  sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<void>;
  sendPasswordChangedEmail(params: PasswordChangedEmailParams): Promise<void>;
}
