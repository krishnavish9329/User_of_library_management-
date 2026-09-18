import { IUserRepository } from "../../application/interfaces/IUserRepository";
import { createUser, User } from "../../domain/entities/User";
import { prisma } from "./PrismaClient";

/**
 * Factory function replacing the old `PrismaUserRepository` class.
 */
export const createPrismaUserRepository = (): IUserRepository => {
  const findByEmail = async (email: string): Promise<User | null> => {
    const record = await prisma.user.findUnique({ where: { email } });
    if (!record) return null;
    return createUser(record);
  };

  const findById = async (id: string): Promise<User | null> => {
    const record = await prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return createUser(record);
  };

  const save = async (user: User): Promise<User> => {
    const record = await prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
    return createUser(record);
  };

  return { findByEmail, findById, save };
};
