import { CurrentUser } from '@app/common';
import {
  AuthServiceControllerMethods,
  type AuthServiceController,
  type CreateUserRequest,
  type DeleteUserRequest,
} from '@app/common/types/proto/auth';
import { Controller, UseGuards } from '@nestjs/common';
import { JwtGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UserService } from './user/user.service';
import { toProtoUser } from './user/user.mapper';
import type { User } from '@app/common/prisma/generated/prisma';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  @UseGuards(JwtGuard)
  //@ts-expect-error: The @CurrentUser decorator is not expected in authenticate proto method.
  authenticate(@CurrentUser() user: User) {
    return toProtoUser(user);
  }

  async createUser(request: CreateUserRequest) {
    const user = await this.userService.create(request);
    return toProtoUser(user);
  }

  async deleteUser(request: DeleteUserRequest) {
    const user = await this.userService.deleteUser(request.userId);
    return toProtoUser(user);
  }
}
