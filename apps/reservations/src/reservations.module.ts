import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationsRepository } from './reservations.repository';
import { DatabaseModule, LoggerModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/reservations/.env.local', 'apps/reservations/.env'],
    }),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
