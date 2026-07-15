import { DatabaseModule, HealthModule, LoggerModule } from '@app/common';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
} from '@app/common/types/proto/auth';
import {
  PAYMENTS_PACKAGE_NAME,
  PAYMENTS_SERVICE_NAME,
} from '@app/common/types/proto/payments';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ReservationsController } from './reservations.controller';
import { ReservationsEventsController } from './reservations.events.controller';
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
        name: AUTH_SERVICE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,

          options: {
            package: AUTH_PACKAGE_NAME,
            url: configService.getOrThrow<string>('AUTH_GRPC_URL'),
            protoPath: join(__dirname, '../../../proto/auth.proto'),
            loader: {
              includeDirs: [join(__dirname, '../../../proto')],
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: PAYMENTS_SERVICE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: PAYMENTS_PACKAGE_NAME,
            url: configService.getOrThrow<string>('PAYMENTS_GRPC_URL'),
            protoPath: join(__dirname, '../../../proto/payments.proto'),
            loader: {
              includeDirs: [join(__dirname, '../../../proto')],
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ReservationsController, ReservationsEventsController],
  providers: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
