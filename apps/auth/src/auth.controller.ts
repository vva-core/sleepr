import { CurrentUser } from '@app/common';
import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { type Response } from 'express';
import { MessagePattern } from '@nestjs/microservices';
import { JwtGuard } from './guards/jwt-auth.guard';
import type { User } from '@app/common/prisma/generated/prisma';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @UseGuards(JwtGuard)
  @MessagePattern('authenticate')
  authenticate(@CurrentUser() user: User) {
    return user;
  }
}
