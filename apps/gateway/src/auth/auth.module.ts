import { JwtAuthModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';

@Module({
  imports: [LoggerModule, JwtAuthModule],
  controllers: [AuthController, UserController],
})
export class AuthModule {}
