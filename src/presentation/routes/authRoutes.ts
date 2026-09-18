import { Router } from "express";
import { createAuthController } from "../controllers/AuthController";
import { createRegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase";
import { createLoginUserUseCase } from "../../application/use-cases/LoginUserUseCase";
import { createPrismaUserRepository } from "../../infrastructure/database/PrismaUserRepository";
import { createArgon2PasswordHasher } from "../../infrastructure/security/Argon2PasswordHasher";
import { createJwtTokenService } from "../../infrastructure/security/JwtTokenService";

const router = Router();

// Composition Root for Auth Routes
const userRepository = createPrismaUserRepository();
const passwordHasher = createArgon2PasswordHasher();
const tokenService = createJwtTokenService();

const registerUseCase = createRegisterUserUseCase(userRepository, passwordHasher);
const loginUseCase = createLoginUserUseCase(userRepository, passwordHasher, tokenService);

const authController = createAuthController(registerUseCase, loginUseCase);

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
