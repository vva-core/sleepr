import { NOTIFICATIONS_MESSAGES } from '@app/common/consts';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(NOTIFICATIONS_MESSAGES.NOTIFY_EMAIL)
  async notifyEmail(@Payload() data: NotifyEmailDto) {}
}
