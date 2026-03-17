import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

export * from './base.interface';

@Module({
  imports: [PrismaModule],
})
export class DatabaseModule {}
