import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  JwtAuthModule,
  LoggerModule,
  PAYMENTS_PACKAGE_NAME,
  PAYMENTS_SERVICE_NAME,
  RESERVATION_SERVICE_NAME,
  RESERVATIONS_PACKAGE_NAME,
} from '@app/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    JwtAuthModule,
    LoggerModule,
    ClientsModule.registerAsync([
      {
        name: PAYMENTS_SERVICE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: PAYMENTS_PACKAGE_NAME,
            url: configService.getOrThrow('PAYMENTS_GRPC_URL'),
            protoPath: join(__dirname, '../../../proto/payments.proto'),
            loader: {
              includeDirs: [join(__dirname, '../../../proto')],
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: RESERVATION_SERVICE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: RESERVATIONS_PACKAGE_NAME,
            url: configService.getOrThrow('RESERVATIONS_GRPC_URL'),
            protoPath: join(__dirname, '../../../proto/reservation.proto'),
            loader: {
              includeDirs: [join(__dirname, '../../../proto')],
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
