import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshSession } from '../refresh-token/interfaces/refresh-session.interface';
import { RefreshTokenPayload } from '../refresh-token/interfaces/refresh-token-payload.interface';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { UserService } from '../user/user.service';
import { RefreshRequest } from '@app/common';

const extractRefreshToken = (request: RefreshRequest): string =>
  request.refreshToken;

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractRefreshToken]),
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    request: RefreshRequest,
    payload: RefreshTokenPayload,
  ): Promise<RefreshSession> {
    const rawToken = extractRefreshToken(request);

    if (!rawToken) {
      throw new UnauthorizedException('Refresh token not found in request');
    }

    await this.refreshTokenService.validate(payload.jti, rawToken);

    return {
      user: await this.userService.getUser(payload.sub),
      jti: payload.jti,
    };
  }
}
