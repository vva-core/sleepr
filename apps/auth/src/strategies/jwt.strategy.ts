import { Authentication } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../user/interfaces/token-payload.interface';
import { PublicUser } from '../user/interfaces/user.interface';
import { UserService } from '../user/user.service';

const extractTokenFromRequest = (request: Authentication) => request.token;
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractTokenFromRequest]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload): Promise<PublicUser> {
    return await this.userService.getUser(payload.sub);
  }
}
