import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsPrismaService } from './payments-prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [PaymentsPrismaService],
  exports: [PaymentsPrismaService],
})
export class PaymentsDatabaseModule {}
