import { CurrentUser } from '@app/common';
import {
  AuthServiceControllerMethods,
  type AuthServiceController,
} from '@app/common/types/proto/auth';
import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { type Response } from 'express';
import { JwtGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import type { User } from '@app/common/prisma/generated/prisma';

@Controller('auth')
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
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
  //@ts-expect-error: The @CurrentUser decorator is not expected in authenticate proto method.
  authenticate(@CurrentUser() user: User) {
    return user;
  }
}
