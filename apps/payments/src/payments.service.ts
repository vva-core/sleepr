import { Injectable } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { PaymentDto } from '@app/common';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  async createPayment(data: PaymentDto & { reservationId: string }) {
    const paymentIntent = await this.stripeService.createPayment(data);

    await this.paymentsRepository.create({
      amount: data.amount,
      reservationId: data.reservationId,
      stripePaymentIntentId: paymentIntent.id,
    });

    return {
      client_secret: paymentIntent.client_secret,
    };
  }

  async confirmPayment(data: {
    paymentIntentId: string;
    paymentMethodId: string;
  }) {
    const { paymentIntentId, paymentMethodId } = data;
    return await this.stripeService.confirmPayment(
      paymentIntentId,
      paymentMethodId,
    );
  }
}
