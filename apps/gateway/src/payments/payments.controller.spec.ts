import {
  JwtAuthGuard,
  Payment,
  PAYMENTS_SERVICE_NAME,
  User,
} from '@app/common';
import { RoleGuard } from '@app/common/guards';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { PaymentsController } from './payments.controller';

const user: User = {
  createdAt: '',
  email: 'test@gmail.com',
  id: '1',
  reservations: [],
  roles: [],
  updatedAt: '',
};

describe('Gateway Payments Controller', () => {
  let controller: PaymentsController;
  const paymentsClient = {
    createPayment: jest.fn(),
    confirmPayment: jest.fn(),
  };
  const clientGrpc = {
    getService: jest.fn(() => paymentsClient),
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PAYMENTS_SERVICE_NAME, useValue: clientGrpc }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = app.get<PaymentsController>(PaymentsController);
    controller.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const payment: Payment = {
    amount: 100,
    createdAt: '',
    id: '1',
    reservationId: '1',
    status: 1,
    stripePaymentIntentId: '1',
  };

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  it('should create payment through payments client', async () => {
    paymentsClient.createPayment.mockReturnValueOnce(of(payment));

    await expect(
      controller.createReservationPayment(
        { amount: payment.amount, currency: 'usd' },
        '1',
        user,
      ),
    ).resolves.toEqual(payment);
    expect(paymentsClient.createPayment).toHaveBeenCalled();
  });

  it('should confirm payment through payments client', async () => {
    paymentsClient.confirmPayment.mockReturnValueOnce(of(payment));

    await expect(
      controller.confirmReservationPayment({
        paymentIntentId: '1',
        paymentMethodId: '1',
      }),
    ).resolves.toEqual(payment);
    expect(paymentsClient.confirmPayment).toHaveBeenCalled();
  });
});
