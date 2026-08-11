import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { PaymentStatus } from '@app/common/types/proto/payments';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { StripeService } from './stripe/stripe.service';
import { Payments } from './prisma/generated';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let Repository: { findByStripeIntentId: jest.Mock; update: jest.Mock };
  let Stripe: { confirmPayment: jest.Mock };

  const row: Payments = {
    id: 'pay_1',
    reservationId: 'res_1',
    amount: 100,
    status: 'PENDING',
    createdAt: new Date('2026-08-06T10:00:00.000Z'),
    stripePaymentIntentId: 'pi_1',
  };

  beforeEach(async () => {
    Repository = { findByStripeIntentId: jest.fn(), update: jest.fn() };
    Stripe = { confirmPayment: jest.fn() };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: Repository },
        { provide: StripeService, useValue: Stripe },
      ],
    }).compile();

    service = app.get(PaymentsService);
  });

  it('confirmPayment applies the confirmed Stripe status to the stored payment', async () => {
    Stripe.confirmPayment.mockResolvedValue({
      id: 'pi_1',
      status: 'succeeded',
    });
    Repository.findByStripeIntentId.mockResolvedValue(row);
    Repository.update.mockResolvedValue({ ...row, status: 'SUCCEEDED' });

    const result = await service.confirmPayment({
      paymentIntentId: 'pi_1',
      paymentMethodId: 'pm_1',
    });

    // Stripe's `succeeded` must land as the Prisma enum, not be passed through.
    expect(Repository.update).toHaveBeenCalledWith('pay_1', {
      amount: 100,
      status: 'SUCCEEDED',
    });
    expect(result.status).toBe(PaymentStatus.SUCCEEDED);
  });

  it('confirmPayment throws and does not update when no payment matches the intent', async () => {
    Stripe.confirmPayment.mockResolvedValue({
      id: 'pi_missing',
      status: 'succeeded',
    });
    Repository.findByStripeIntentId.mockResolvedValue(null);

    await expect(
      service.confirmPayment({
        paymentIntentId: 'pi_missing',
        paymentMethodId: 'pm_1',
      }),
    ).rejects.toThrow(RpcException);
    expect(Repository.update).not.toHaveBeenCalled();
  });
});
