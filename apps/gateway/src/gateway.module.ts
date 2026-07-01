import { HealthModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HealthModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/gateway/.env.local', 'apps/gateway/.env'],
    }),
  ],
})
export class GatewayModule {}
