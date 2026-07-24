import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { TokenPayload } from './user/interfaces/token-payload.interface';
import { RefreshTokenPayload } from './refresh-token/interfaces/refresh-token-payload.interface';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { LoginResponse, LogoutResponse } from '@app/common/types/proto/auth';
import { PublicUser } from './user/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  login(user: PublicUser): Promise<LoginResponse> {
    return this.issueTokens(user);
  }

  async refresh(user: PublicUser, oldJti: string): Promise<LoginResponse> {
    await this.refreshTokenService.revoke(oldJti);

    return this.issueTokens(user);
  }

  async logout(jti: string): Promise<LogoutResponse> {
    await this.refreshTokenService.revoke(jti);

    return { success: true };
  }

  private async issueTokens(user: PublicUser): Promise<LoginResponse> {
    const payload: TokenPayload = { sub: user.id, email: user.email };

    const token = await this.jwtService.signAsync(payload);

    const jti = randomUUID();
    const refreshOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRY',
      ) as JwtSignOptions['expiresIn'],
      jwtid: jti,
    };
    const refreshToken = await this.jwtService.signAsync(
      payload,
      refreshOptions,
    );

    const { exp } = this.jwtService.decode<
      RefreshTokenPayload & { exp: number }
    >(refreshToken);
    await this.refreshTokenService.issue(
      jti,
      user.id,
      refreshToken,
      new Date(exp * 1000),
    );

    return { token, refreshToken };
  }
}
