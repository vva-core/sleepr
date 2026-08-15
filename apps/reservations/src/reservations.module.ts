import { HealthModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { ReservationsController } from './reservations.controller';
import { ReservationsEventsController } from './reservations.events.controller';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsService } from './reservations.service';
import { ReservationsDatabaseModule } from './database/reservations-database.module';

@Module({
  imports: [
    ReservationsDatabaseModule,
    HealthModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/reservations/.env.local', 'apps/reservations/.env'],
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DATABASE_URL: Joi.string().required(),
        RABBITMQ_URL: Joi.string().required(),
        RESERVATIONS_GRPC_URL: Joi.string().required(),
      }),
    }),
  ],
  controllers: [ReservationsController, ReservationsEventsController],
  providers: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
