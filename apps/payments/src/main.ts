import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { PAYMENTS_QUEUE } from '@app/common/consts';
import { PaymentsModule } from './payments.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    PaymentsModule,
    { logger: false },
  );
  const configService = appContext.get(ConfigService);
  const rabbitmqUrl = configService.getOrThrow<string>('RABBITMQ_URL');
  await appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    {
      transport: Transport.RMQ,
      options: { urls: [rabbitmqUrl], queue: PAYMENTS_QUEUE },
    },
  );

  app.useLogger(app.get(Logger));
  await app.listen();
}

void bootstrap();
