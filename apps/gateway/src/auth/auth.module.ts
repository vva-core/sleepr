import { LoggerModule } from '@app/common';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
} from '@app/common/types/proto/auth';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';

@Module({
  imports: [
    LoggerModule,
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
    ]),
  ],
  controllers: [AuthController, UserController],
})
export class AuthModule {}
