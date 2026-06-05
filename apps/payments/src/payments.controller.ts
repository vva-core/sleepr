import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { PaymentDto } from '@app/common';
import { PAYMENTS_EVENTS, PAYMENTS_MESSAGES } from '@app/common/consts';
import { PaymentsPublisher } from './payments.publisher';

@Controller()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsPublisher: PaymentsPublisher,
  ) {}

  @MessagePattern(PAYMENTS_MESSAGES.CREATE)
  async createPayment(data: PaymentDto & { reservationId: string }) {
    const payment = await this.paymentsService.createPayment(data);
    this.paymentsPublisher.publish(PAYMENTS_EVENTS.PAYMENT_CREATED, payment);
    return payment;
  }

  @MessagePattern(PAYMENTS_MESSAGES.CONFIRM)
  async confirmPayment(data: {
    paymentIntentId: string;
    paymentMethodId: string;
  }) {
    return this.paymentsService.confirmPayment(data);
  }
}
