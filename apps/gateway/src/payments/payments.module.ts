import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  JwtAuthModule,
  PAYMENTS_PACKAGE_NAME,
  PAYMENTS_SERVICE_NAME,
} from '@app/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    JwtAuthModule,
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
    ]),
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
