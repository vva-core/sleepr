import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReservationsPrismaService } from './reservations-prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [ReservationsPrismaService],
  exports: [ReservationsPrismaService],
})
export class ReservationsDatabaseModule {}
