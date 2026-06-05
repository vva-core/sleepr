import { NOTIFICATIONS_EVENTS, PAYMENTS_EVENTS } from '@app/common/consts';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(NOTIFICATIONS_EVENTS.NOTIFY_EMAIL)
  notifyEmail(@Payload() data: NotifyEmailDto) {
    console.log('Notify email event received in notifications service:', data);
  }

  @EventPattern(PAYMENTS_EVENTS.PAYMENT_CREATED)
  handlePaymentCreated(@Payload() data: any) {
    console.log(
      'Payment created event received in notifications service:',
      data,
    );
  }
}
