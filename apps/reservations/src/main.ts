import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ReservationsModule } from './reservations.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { PAYMENTS_EXCHANGE, RESERVATIONS_QUEUE } from '@app/common/consts';
import { setupRmqTopology } from '@app/common/rmq';
import { RmqOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ReservationsModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const rabbitMqUrl = configService.getOrThrow<string>('RABBITMQ_URL');

  await setupRmqTopology(rabbitMqUrl, {
    exchanges: [
      { name: PAYMENTS_EXCHANGE, type: 'topic', options: { durable: true } },
    ],
    queues: [{ name: RESERVATIONS_QUEUE, options: { durable: true } }],
    bindings: [
      {
        queue: RESERVATIONS_QUEUE,
        exchange: PAYMENTS_EXCHANGE,
        pattern: 'payment.*',
      },
    ],
  });

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: RESERVATIONS_QUEUE,
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useLogger(app.get(Logger));

  await app.startAllMicroservices();
  await app.listen(configService.getOrThrow('PORT'));
}
void bootstrap();
