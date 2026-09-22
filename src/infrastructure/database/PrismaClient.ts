import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  // DB warnings/errors console me dikhen (query log bahut noisy hota hai, isliye sirf warn/error).
  log: ["warn", "error"],
});
