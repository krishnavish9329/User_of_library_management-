import jwt from "jsonwebtoken";
import { ITokenService, TokenPayload } from "../../application/interfaces/ITokenService";
import { AuthTokens } from "../../application/dtos/AuthDTOs";
import { UserRole } from "../../domain/entities/User";

/**
 * Factory function replacing the old `JwtTokenService` class.
 * Secrets are captured via closure instead of private class fields.
 */
export const createJwtTokenService = (): ITokenService => {
  const accessSecret = process.env.JWT_ACCESS_SECRET || "default_access_secret";
  const refreshSecret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";

  const generateTokens = (userId: string, role: UserRole): AuthTokens => {
    const accessToken = jwt.sign(
      { sub: userId, role, type: "access" },
      accessSecret,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { sub: userId, role, type: "refresh" },
      refreshSecret,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  };

  const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, accessSecret) as TokenPayload;
  };

  const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, refreshSecret) as TokenPayload;
  };

  return { generateTokens, verifyAccessToken, verifyRefreshToken };
};
