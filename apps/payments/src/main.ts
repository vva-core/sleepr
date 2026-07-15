import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { PAYMENTS_PACKAGE_NAME } from '@app/common/types/proto/payments';
import { PaymentsModule } from './payments.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    PaymentsModule,
    { logger: false },
  );
  const configService = appContext.get(ConfigService);
  const grpcUrl = configService.getOrThrow<string>('PAYMENTS_GRPC_URL');
  await appContext.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    {
      transport: Transport.GRPC,
      options: {
        package: PAYMENTS_PACKAGE_NAME,
        protoPath: join(__dirname, '../../../proto/payments.proto'),
        loader: {
          includeDirs: [join(__dirname, '../../../proto')],
        },
        url: grpcUrl,
      },
    },
  );

  app.useLogger(app.get(Logger));
  await app.listen();
}

void bootstrap();
