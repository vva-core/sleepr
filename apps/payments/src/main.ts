import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { PAYMENTS_QUEUE } from '@app/common/consts';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
      queue: PAYMENTS_QUEUE,
    },
  });
  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
}

bootstrap();
