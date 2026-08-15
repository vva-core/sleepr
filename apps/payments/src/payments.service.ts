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

  private async createPaymentIntent(
    data: CreatePaymentRequest,
    idempotencyKey: string,
  ) {
    return this.stripeService.createPaymentIntent(
      { ...data, currency: 'usd' },
      idempotencyKey,
    );
  }

  async createPayment(
    data: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> {
    const payment = await this.paymentsRepository.create({
      amount: data.amount,
      reservationId: data.reservationId,
    });

    try {
      const paymentIntent = await this.createPaymentIntent(data, payment.id);

      const charged = await this.paymentsRepository.update(payment.id, {
        stripePaymentIntentId: paymentIntent.id,
      });

      return toCreatePaymentResponse(charged, paymentIntent.client_secret);
    } catch (error) {
      this.logger.error('Failed to create payment intent', error as Error);
      throw new RpcException('Failed to create payment intent');
    }
  }

  async confirmPayment(data: ConfirmPaymentRequest): Promise<Payment> {
    const { paymentIntentId, paymentMethodId, reservationId } = data;

    const existing =
      await this.paymentsRepository.findByStripeIntentId(paymentIntentId);

    if (!existing) {
      throw new RpcException(`Payment for intent ${paymentIntentId} not found`);
    }

    if (existing.reservationId !== reservationId) {
      throw new RpcException(
        `Payment for intent ${paymentIntentId} does not belong to reservation ${reservationId}`,
      );
    }

    const intent = await this.stripeService.confirmPayment(
      paymentIntentId,
      paymentMethodId,
    );

    const updated = await this.paymentsRepository.update(existing.id, {
      status: fromStripeStatus(intent.status),
    });

    return toProtoPayment(updated);
  }
}
