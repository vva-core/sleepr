import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './user/interfaces/token-payload.interface';
import { User } from '@app/common/prisma/generated/prisma';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: User) {
    const payload: TokenPayload = { sub: user.id, email: user.email };

    const token = await this.jwtService.signAsync(payload);

    return { token };
  }
}
