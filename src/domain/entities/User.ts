export type UserRole = "SUPER_ADMIN" | "ADMIN" | "LIBRARIAN" | "FACULTY" | "STUDENT";

export interface UserProps {
  id?: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  readonly id?: string;
  readonly email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  readonly createdAt: Date;
  updatedAt: Date;
}

/**
 * Factory function replacing the old `User` class.
 * Produces a plain data object with the same shape/defaults the class used to apply.
 */
export const createUser = (props: UserProps): User => ({
  id: props.id,
  email: props.email,
  passwordHash: props.passwordHash,
  firstName: props.firstName,
  lastName: props.lastName,
  role: props.role,
  isActive: props.isActive ?? true,
  createdAt: props.createdAt ?? new Date(),
  updatedAt: props.updatedAt ?? new Date(),
});
