import {
  ConfirmPaymentRequest,
  CreatePaymentRequest,
  CreatePaymentResponse,
  Payment,
} from '@app/common/types/proto/payments';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  fromStripeStatus,
  toCreatePaymentResponse,
  toProtoPayment,
} from './payments.mapper';
import { PaymentsRepository } from './payments.repository';
import { StripeService } from './stripe/stripe.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  private async createPaymentIntent(data: CreatePaymentRequest) {
    return this.stripeService.createPaymentIntent({
      ...data,
      currency: 'usd',
    });
  }

  async createPayment(
    data: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> {
    try {
      const paymentIntent = await this.createPaymentIntent(data);
      const row = await this.paymentsRepository.create({
        amount: data.amount,
        reservationId: data.reservationId,
        stripePaymentIntentId: paymentIntent.id,
      });

      return toCreatePaymentResponse(row, paymentIntent.client_secret);
    } catch (error) {
      this.logger.error('Failed to create payment', error as Error);
      throw new RpcException('Failed to create payment');
    }
  }

  async confirmPayment(data: ConfirmPaymentRequest): Promise<Payment> {
    const { paymentIntentId, paymentMethodId } = data;
    const intent = await this.stripeService.confirmPayment(
      paymentIntentId,
      paymentMethodId,
    );

    const existing = await this.paymentsRepository.findByStripeIntentId(
      intent.id,
    );

    if (!existing) {
      throw new RpcException(`Payment for intent ${intent.id} not found`);
    }

    const updated = await this.paymentsRepository.update(existing.id, {
      amount: existing.amount,
      status: fromStripeStatus(intent.status),
    });

    return toProtoPayment(updated);
  }
}
