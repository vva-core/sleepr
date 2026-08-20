import {
  JwtAuthGuard,
  Payment,
  PAYMENTS_SERVICE_NAME,
  RESERVATION_SERVICE_NAME,
  Reservation,
  User,
} from '@app/common';
import { RoleGuard } from '@app/common/guards';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { PaymentsController } from './payments.controller';

const user: User = {
  createdAt: '',
  email: 'test@gmail.com',
  id: '1',
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
  const reservationsClient = { findOne: jest.fn() };
  const reservationsGrpc = {
    getService: jest.fn(() => reservationsClient),
  };

  // Owned by `user` (id '1') — the happy path.
  const reservation: Reservation = {
    id: '1',
    userId: '1',
    placeId: 'place-1',
    startDate: '',
    endDate: '',
    createdAt: '',
    updatedAt: '',
    status: 1,
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PAYMENTS_SERVICE_NAME, useValue: clientGrpc },
        { provide: RESERVATION_SERVICE_NAME, useValue: reservationsGrpc },
      ],
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
    reservationsClient.findOne.mockReturnValueOnce(of(reservation));
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

  it('should reject payment for a reservation that does not exist', async () => {
    reservationsClient.findOne.mockReturnValueOnce(
      throwError(() => ({ code: status.NOT_FOUND })),
    );

    await expect(
      controller.createReservationPayment(
        { amount: payment.amount, currency: 'usd' },
        'does-not-exist',
        user,
      ),
    ).rejects.toThrow(NotFoundException);
    expect(paymentsClient.createPayment).not.toHaveBeenCalled();
  });

  it('should reject payment for another user reservation', async () => {
    reservationsClient.findOne.mockReturnValueOnce(
      of({ ...reservation, userId: 'someone-else' }),
    );

    await expect(
      controller.createReservationPayment(
        { amount: payment.amount, currency: 'usd' },
        '1',
        user,
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(paymentsClient.createPayment).not.toHaveBeenCalled();
  });

  it('should confirm payment through payments client', async () => {
    paymentsClient.confirmPayment.mockReturnValueOnce(of(payment));
    reservationsClient.findOne.mockReturnValueOnce(of(reservation));

    await expect(
      controller.confirmReservationPayment(
        {
          paymentIntentId: '1',
          paymentMethodId: '1',
        },
        '1',
        user,
      ),
    ).resolves.toEqual(payment);
    expect(paymentsClient.confirmPayment).toHaveBeenCalled();
  });
});
