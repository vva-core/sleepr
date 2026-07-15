import { DatabaseModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import { StripeModule } from './stripe/stripe.module';
import { PaymentsPublisher } from './payments.publisher';

@Module({
  imports: [
    StripeModule,
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        STRIPE_SECRET_KEY: Joi.string().required(),
        RABBITMQ_URL: Joi.string().required(),
        PAYMENTS_GRPC_URL: Joi.string().required(),
      }),
    }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository, PaymentsPublisher],
})
export class PaymentsModule {}
