  import { randomBytes, createHash } from "crypto";
import { IResetTokenService } from "../../application/interfaces/IResetTokenService";

/**
 * 32 random bytes = 256 bits of entropy, so a fast SHA-256 is enough for storage
 * (slow hashes like argon2 are only needed for low-entropy secrets such as passwords).
 */
export const createResetTokenService = (): IResetTokenService => {
  const hash = (token: string): string => createHash("sha256").update(token).digest("hex");

  const generate = () => {
    const token = randomBytes(32).toString("base64url");
    return { token, tokenHash: hash(token) };
  };

  return { generate, hash };
};
