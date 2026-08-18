import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { AuthDatabaseModule } from '../database/auth-database.module';

@Module({
  imports: [AuthDatabaseModule],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
