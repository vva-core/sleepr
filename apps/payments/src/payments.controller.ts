import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { PaymentDto } from '@app/common';
import { PAYMENTS_MESSAGES } from '@app/common/consts';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern(PAYMENTS_MESSAGES.CREATE)
  async createPayment(data: PaymentDto & { reservationId: string }) {
    return this.paymentsService.createPayment(data);
  }

  @MessagePattern(PAYMENTS_MESSAGES.CONFIRM)
  async confirmPayment(data: {
    paymentIntentId: string;
    paymentMethodId: string;
  }) {
    return this.paymentsService.confirmPayment(data);
  }
}
