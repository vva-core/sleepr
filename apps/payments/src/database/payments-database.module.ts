import { Module } from '@nestjs/common';
import { PaymentsPrismaService } from './payments-prisma.service';

@Module({
  providers: [PaymentsPrismaService],
  exports: [PaymentsPrismaService],
})
export class PaymentsDatabaseModule {}
