import * as argon2 from "argon2";

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
}

/**
 * Factory function replacing the old `Argon2PasswordHasher` class.
 */
export const createArgon2PasswordHasher = (): PasswordHasher => ({
  hash: async (password: string): Promise<string> => {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
    });
  },

  verify: async (hash: string, plain: string): Promise<boolean> => {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  },
});
