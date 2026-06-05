import { LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PaymentsPublisher } from 'apps/payments/src/payments.publisher';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, PaymentsPublisher],
})
export class NotificationsModule {}
