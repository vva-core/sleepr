import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { JwtGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '@app/common';
import type { User } from '@app/common/prisma/generated/prisma';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtGuard)
  @Get()
  getUser(@CurrentUser() user: User) {
    return user;
  }
}
