import { DatabaseModule, HealthModule, LoggerModule } from '@app/common';
import {
  AUTH_QUEUE,
  AUTH_SERVICE,
  PAYMENTS_QUEUE,
  PAYMENTS_SERVICE,
} from '@app/common/consts';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReservationsController } from './reservations.controller';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/reservations/.env.local', 'apps/reservations/.env'],
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,

          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: AUTH_QUEUE,
            queueOptions: {},
          },
        }),
        inject: [ConfigService],
      },
      {
        name: PAYMENTS_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: PAYMENTS_QUEUE,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
