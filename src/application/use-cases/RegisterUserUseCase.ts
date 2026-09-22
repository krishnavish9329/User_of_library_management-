import { IUserRepository } from "../interfaces/IUserRepository";
import { RegisterDTO } from "../dtos/AuthDTOs";
import { createUser, User } from "../../domain/entities/User";
import { createEmail } from "../../domain/value-objects/Email";
import { PasswordHasher } from "../../infrastructure/security/Argon2PasswordHasher";

export interface RegisterUserUseCase {
  execute(dto: RegisterDTO): Promise<Omit<User, "passwordHash">>;
}

/**
 * Factory function replacing the old `RegisterUserUseCase` class.
 * Dependencies are passed in as arguments and captured via closure.
 */
export const createRegisterUserUseCase = (
  userRepository: IUserRepository,
  hasher: PasswordHasher
): RegisterUserUseCase => {
  const execute = async (dto: RegisterDTO): Promise<Omit<User, "passwordHash">> => {
    const validEmail = createEmail(dto.email);

    const existingUser = await userRepository.findByEmail(validEmail.getValue());
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await hasher.hash(dto.password);

    const user = createUser({
      email: validEmail.getValue(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
    });

    const savedUser = await userRepository.save(user);
    console.log("[register] saved to DB:", {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      role: savedUser.role,
    });
    const { passwordHash: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  };

  return { execute };
};
