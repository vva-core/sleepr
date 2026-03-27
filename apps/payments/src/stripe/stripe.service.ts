import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(configService: ConfigService) {
    this.stripe = new Stripe(configService.getOrThrow('STRIPE_SECRET_KEY'));
  }

  async createPayment({ amount, currency }: Stripe.PaymentIntentCreateParams) {
    return await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async confirmPayment(
    paymentIntentId: Stripe.PaymentIntent['id'],
    paymentMethodId: Stripe.PaymentMethod['id'],
  ) {
    return this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: '',
    });
  }
}
