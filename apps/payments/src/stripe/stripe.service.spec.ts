import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';

jest.mock('stripe');

describe('StripeService', () => {
  const create = jest.fn();
  const confirm = jest.fn();
  let service: StripeService;

  beforeEach(() => {
    jest.clearAllMocks();
    (Stripe as unknown as jest.Mock).mockImplementation(() => ({
      paymentIntents: { create, confirm },
    }));

    service = new StripeService({
      getOrThrow: () => 'sk_test_1',
    } as unknown as ConfigService);
  });

  it('passes the idempotency key as a request option, not as an intent param', async () => {
    create.mockResolvedValue({ id: 'pi_1' });

    await service.createPaymentIntent(
      { amount: 100, currency: 'usd' },
      'pay_1',
    );

    const [params, options] = create.mock.calls[0];
    expect(options).toEqual({ idempotencyKey: 'pay_1' });
    expect(params).not.toHaveProperty('idempotencyKey');
  });
});
