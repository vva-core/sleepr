import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { PaymentStatus } from '@app/common/types/proto/payments';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { StripeService } from './stripe/stripe.service';
import { Payments } from './prisma/generated';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let Repository: {
    create: jest.Mock;
    findByStripeIntentId: jest.Mock;
    update: jest.Mock;
  };
  let Stripe: { createPaymentIntent: jest.Mock; confirmPayment: jest.Mock };

  const row: Payments = {
    id: 'pay_1',
    reservationId: 'res_1',
    amount: 100,
    status: 'PENDING',
    createdAt: new Date('2026-08-06T10:00:00.000Z'),
    stripePaymentIntentId: 'pi_1',
  };

  beforeEach(async () => {
    Repository = {
      create: jest.fn(),
      findByStripeIntentId: jest.fn(),
      update: jest.fn(),
    };
    Stripe = { createPaymentIntent: jest.fn(), confirmPayment: jest.fn() };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: Repository },
        { provide: StripeService, useValue: Stripe },
      ],
    }).compile();

    service = app.get(PaymentsService);
  });

  const createRequest = {
    amount: 100,
    currency: 'usd',
    email: 'guest@example.com',
    reservationId: 'res_1',
  };
  const uncharged = { ...row, stripePaymentIntentId: null };

  it('createPayment persists the payment even when Stripe rejects the charge', async () => {
    Repository.create.mockResolvedValue(uncharged);
    Stripe.createPaymentIntent.mockRejectedValue(new Error('card_declined'));

    await expect(service.createPayment(createRequest)).rejects.toThrow();

    expect(Repository.create).toHaveBeenCalled();
  });

  it('createPayment keys the Stripe intent on the committed row id', async () => {
    Repository.create.mockResolvedValue(uncharged);
    Stripe.createPaymentIntent.mockResolvedValue({
      id: 'pi_1',
      client_secret: 'cs_1',
    });
    Repository.update.mockResolvedValue(row);

    await service.createPayment(createRequest);

    expect(Stripe.createPaymentIntent).toHaveBeenCalledWith(
      expect.anything(),
      'pay_1',
    );
  });

  it('createPayment attaches the Stripe intent id to the persisted row', async () => {
    Repository.create.mockResolvedValue(uncharged);
    Stripe.createPaymentIntent.mockResolvedValue({
      id: 'pi_1',
      client_secret: 'cs_1',
    });
    Repository.update.mockResolvedValue(row);

    await service.createPayment(createRequest);

    expect(Repository.update).toHaveBeenCalledWith('pay_1', {
      stripePaymentIntentId: 'pi_1',
    });
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
      reservationId: 'res_1',
    });

    // Stripe's `succeeded` must land as the Prisma enum, not be passed through.
    expect(Repository.update).toHaveBeenCalledWith('pay_1', {
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
        reservationId: 'res_1',
      }),
    ).rejects.toThrow(RpcException);
    expect(Repository.update).not.toHaveBeenCalled();
  });
});
