import { PAYMENTS_EVENTS } from '@app/common/consts';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class ReservationsEventsController {
  @EventPattern(PAYMENTS_EVENTS.PAYMENT_CREATED)
  handlePaymentCreated(data: any) {
    console.log(
      'Payment created event received in reservations service:',
      data,
    );
  }
}
