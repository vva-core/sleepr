import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

export * from './base.interface';
export * from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  exports: [PrismaModule],
})
export class DatabaseModule {}
