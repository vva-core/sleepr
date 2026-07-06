import { HealthModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    HealthModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/gateway/.env.local', 'apps/gateway/.env'],
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        AUTH_GRPC_URL: Joi.string().required(),
      }),
    }),
    AuthModule,
  ],
})
export class GatewayModule {}
