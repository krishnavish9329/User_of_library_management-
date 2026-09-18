export interface Email {
  getValue(): string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email);

/**
 * Factory function replacing the old `Email` class.
 * Validates and normalizes an email address, throwing on invalid input.
 */
export const createEmail = (email: string): Email => {
  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  const value = email.toLowerCase().trim();

  return {
    getValue: () => value,
  };
};
