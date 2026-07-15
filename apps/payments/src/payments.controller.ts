import { PAYMENTS_EVENTS } from '@app/common/consts';
import {
  ConfirmPaymentRequest,
  CreatePaymentRequest,
  CreatePaymentResponse,
  Payment,
  PaymentsServiceController,
  PaymentsServiceControllerMethods,
} from '@app/common/types/proto/payments';
import { Controller } from '@nestjs/common';
import { PaymentsPublisher } from './payments.publisher';
import { PaymentsService } from './payments.service';

@Controller()
@PaymentsServiceControllerMethods()
export class PaymentsController implements PaymentsServiceController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsPublisher: PaymentsPublisher,
  ) {}

  async createPayment(
    request: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> {
    const response = await this.paymentsService.createPayment(request);

    this.paymentsPublisher.publish(
      PAYMENTS_EVENTS.PAYMENT_CREATED,
      response.payment,
    );

    return response;
  }

  async confirmPayment(request: ConfirmPaymentRequest): Promise<Payment> {
    return this.paymentsService.confirmPayment(request);
  }
}
