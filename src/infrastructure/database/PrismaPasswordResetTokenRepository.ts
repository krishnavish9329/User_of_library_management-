import { IPasswordResetTokenRepository } from "../../application/interfaces/IPasswordResetTokenRepository";
import { prisma } from "./PrismaClient";

export const createPrismaPasswordResetTokenRepository = (): IPasswordResetTokenRepository => {
  const create: IPasswordResetTokenRepository["create"] = async ({ userId, tokenHash, expiresAt }) => {
    await prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  };

  const findLatestCreatedAt = async (userId: string): Promise<Date | null> => {
    const latest = await prisma.passwordResetToken.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    return latest?.createdAt ?? null;
  };

  const consume = async (tokenHash: string, now: Date): Promise<string | null> => {
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!record) return null;

    // The conditions live inside the UPDATE itself, so if two requests race with the
    // same link, the database lets exactly one of them win (count === 1).
    const { count } = await prisma.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });

    return count === 1 ? record.userId : null;
  };

  const invalidateAllForUser = async (userId: string): Promise<void> => {
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
  };

  return { create, findLatestCreatedAt, consume, invalidateAllForUser };
};
