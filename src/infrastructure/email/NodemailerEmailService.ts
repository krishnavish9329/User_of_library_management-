import nodemailer from "nodemailer";
import {
  IEmailService,
  PasswordChangedEmailParams,
  PasswordResetEmailParams,
} from "../../application/interfaces/IEmailService";

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const layout = (appName: string, body: string): string => `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
  <h2 style="margin:0 0 16px">${escapeHtml(appName)}</h2>
  ${body}
</div>`;

/**
 * Sends mail over any SMTP server (Gmail, SES, SendGrid, Mailgun, ...).
 * Switching provider only means changing the SMTP_* env vars.
 *
 * Without SMTP credentials:
 *  - in development it prints the email to the console so you can test the flow offline;
 *  - in production it refuses to start (fail fast instead of silently dropping emails).
 */
export const createNodemailerEmailService = (): IEmailService => {
  const appName = process.env.APP_NAME || "Library System";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP_USER and SMTP_PASS must be set in production");
    }
    console.warn("[Email] SMTP not configured - emails will be printed to the console (development only)");
    return {
      sendPasswordResetEmail: async (p) => {
        console.log(`[DEV EMAIL] Password reset for ${p.to} (valid ${p.expiresInMinutes} min):\n${p.resetLink}`);
      },
      sendPasswordChangedEmail: async (p) => {
        console.log(`[DEV EMAIL] Password changed notice for ${p.to}`);
      },
    };
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    connectionTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const from = process.env.MAIL_FROM || `"${appName}" <${user}>`;

  const sendPasswordResetEmail = async ({ to, firstName, resetLink, expiresInMinutes }: PasswordResetEmailParams) => {
    const safeLink = escapeHtml(resetLink);
    await transporter.sendMail({
      from,
      to,
      subject: `Reset your ${appName} password`,
      text:
        `Hi ${firstName},\n\n` +
        `We received a request to reset your password. Open this link to choose a new one ` +
        `(valid for ${expiresInMinutes} minutes, one use only):\n\n${resetLink}\n\n` +
        `If you did not request this, you can ignore this email - your password will not change.`,
      html: layout(
        appName,
        `<p>Hi ${escapeHtml(firstName)},</p>
         <p>We received a request to reset your password. This link is valid for
            <strong>${expiresInMinutes} minutes</strong> and can be used <strong>once</strong>.</p>
         <p style="margin:24px 0">
           <a href="${safeLink}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">Reset password</a>
         </p>
         <p style="font-size:13px;color:#6b7280">Or paste this into your browser:<br>${safeLink}</p>
         <p style="font-size:13px;color:#6b7280">If you did not request this, ignore this email - your password will not change.</p>`
      ),
    });
  };

  const sendPasswordChangedEmail = async ({ to, firstName }: PasswordChangedEmailParams) => {
    await transporter.sendMail({
      from,
      to,
      subject: `Your ${appName} password was changed`,
      text: `Hi ${firstName},\n\nYour password was just changed. If this wasn't you, reset your password again immediately and contact support.`,
      html: layout(
        appName,
        `<p>Hi ${escapeHtml(firstName)},</p>
         <p>Your password was just changed.</p>
         <p>If this wasn't you, reset your password again immediately and contact support.</p>`
      ),
    });
  };

  return { sendPasswordResetEmail, sendPasswordChangedEmail };
};
