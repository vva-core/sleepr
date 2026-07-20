import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  RESERVATION_SERVICE_NAME,
  RESERVATIONS_PACKAGE_NAME,
} from '@app/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RESERVATION_SERVICE_NAME,
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.GRPC,
            options: {
              package: RESERVATIONS_PACKAGE_NAME,
              url: configService.getOrThrow('RESERVATIONS_GRPC_URL'),
              protoPath: join(__dirname, '../../../proto/reservation.proto'),
              loader: {
                includeDirs: [join(__dirname, '../../../proto')],
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ReservationsController],
})
export class ReservationsModule {}
