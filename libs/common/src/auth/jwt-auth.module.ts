import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { LoggerModule } from '../logger/logger.module';
import { AUTH_PACKAGE_NAME, AUTH_SERVICE_NAME } from '../types/proto/auth';
import { JwtAuthGuard } from './jwt.guard';

const AuthClientModule = ClientsModule.registerAsync([
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
]);

@Module({
  imports: [ConfigModule, LoggerModule, AuthClientModule],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard, AuthClientModule],
})
export class JwtAuthModule {}
