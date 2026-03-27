import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from './user/interfaces/token-payload.interface';
import { User } from '@app/common/prisma/generated/prisma';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: User, response: Response) {
    const payload: TokenPayload = { sub: user.id, email: user.email };

    const token = await this.jwtService.signAsync(payload);

    response.cookie('Authentication', token, {
      httpOnly: true,
    });

    return { token };
  }
}
