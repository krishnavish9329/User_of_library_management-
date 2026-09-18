import { AuthTokens } from "../dtos/AuthDTOs";
import { UserRole } from "../../domain/entities/User";

export interface TokenPayload {
  sub: string;
  role: UserRole;
  type: "access" | "refresh";
}

export interface ITokenService {
  generateTokens(userId: string, role: UserRole): AuthTokens;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
