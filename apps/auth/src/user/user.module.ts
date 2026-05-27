import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from '@app/common';
import { User } from '@app/common';
import { UserRepository } from './user.new.repository';

@Module({
  imports: [DatabaseModule, DatabaseModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
