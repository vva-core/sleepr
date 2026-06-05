import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './notifications.module';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { NOTIFICATIONS_QUEUE, PAYMENTS_EXCHANGE } from '@app/common/consts';
import { setupRmqTopology } from '@app/common/rmq';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  const configService = app.get(ConfigService);

  const rabbitMqUrl = configService.getOrThrow<string>('RABBITMQ_URL');

  await setupRmqTopology(rabbitMqUrl, {
    exchanges: [{ name: PAYMENTS_EXCHANGE, type: 'topic' }],
    queues: [{ name: NOTIFICATIONS_QUEUE, options: { durable: true } }],
    bindings: [
      {
        queue: NOTIFICATIONS_QUEUE,
        exchange: PAYMENTS_EXCHANGE,
        pattern: 'payment.*',
      },
    ],
  });

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: NOTIFICATIONS_QUEUE,
      queueOptions: { durable: true },
    },
  });
  app.useLogger(app.get(Logger));
  await app.startAllMicroservices();
}

void bootstrap();
