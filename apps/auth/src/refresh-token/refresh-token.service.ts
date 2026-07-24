import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RefreshToken } from '@app/common/prisma/generated/prisma';
import { RefreshTokenRepository } from './refresh-token.repository';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async issue(
    jti: string,
    userId: string,
    rawToken: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const tokenHash = await bcrypt.hash(rawToken, 10);

    return await this.refreshTokenRepository.create({
      id: jti,
      userId,
      tokenHash,
      expiresAt,
    });
  }

  async validate(jti: string, rawToken: string): Promise<void> {
    const stored = await this.refreshTokenRepository.findOne(jti);

    if (!stored) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const isValid = await bcrypt.compare(rawToken, stored.tokenHash);
    const isRevoked = !!stored.revokedAt;
    const isExpired = stored.expiresAt < new Date();

    if (isRevoked || isExpired || !isValid) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  async revoke(jti: string): Promise<void> {
    await this.refreshTokenRepository.update(jti, { revokedAt: new Date() });
  }
}
