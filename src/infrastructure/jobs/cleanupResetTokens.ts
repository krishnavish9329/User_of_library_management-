import { prisma } from "../database/PrismaClient";

const SIX_HOURS = 6 * 60 * 60 * 1000;

/** Housekeeping: expired reset tokens are useless, so keep the table small. */
export const startResetTokenCleanup = (): void => {
  const run = () =>
    prisma.passwordResetToken
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .then(({ count }) => console.log(`[cleanup] deleted ${count} expired reset token(s)`))
      .catch((err: unknown) =>
        console.error("[cleanup] reset tokens:", err instanceof Error ? err.stack || err.message : err)
      );

  run();
  setInterval(run, SIX_HOURS).unref(); // unref: never keeps the process alive
};
