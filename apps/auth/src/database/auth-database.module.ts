import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthPrismaService } from './auth-prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [AuthPrismaService],
  exports: [AuthPrismaService],
})
export class AuthDatabaseModule {}
