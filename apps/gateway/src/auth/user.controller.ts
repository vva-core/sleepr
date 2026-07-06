import { CreateUserDto, CurrentUser } from '@app/common';
import { JwtAuthGuard } from '@app/common/auth';
import {
  AUTH_SERVICE_NAME,
  type AuthServiceClient,
  type User,
} from '@app/common/types/proto/auth';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';

@Controller('user')
export class UserController implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authClient =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authClient.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUser(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteUser(@CurrentUser() user: User) {
    return this.authClient.deleteUser({ userId: user.id });
  }
}
