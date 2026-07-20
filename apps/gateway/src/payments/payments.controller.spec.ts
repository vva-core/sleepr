import { Payment, PAYMENTS_SERVICE_NAME, User } from '@app/common';
import { Test } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';

const user: User = {
  createdAt: '',
  email: 'test@gmail.com',
  id: '1',
  reservations: [],
  roles: [],
  updatedAt: '',
};

describe('Gateway Reservation Controller', () => {
  let controller: PaymentsController;
  const paymentsClient = {
    createPayment: jest.fn(),
  };
  const clientGrpc = {
    getService: jest.fn(() => paymentsClient),
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PAYMENTS_SERVICE_NAME, useValue: clientGrpc }],
    }).compile();

    controller = app.get<PaymentsController>(PaymentsController);
    controller.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  it('should create payment through reservation client', () => {
    const newPayment: Payment = {
      amount: 100,
      createdAt: '',
      id: '1',
      reservationId: '1',
      status: 1,
      stripePaymentIntentId: '1',
    };
    paymentsClient.createPayment.mockReturnValueOnce(newPayment);

    expect(
      controller.createReservationPayment(
        { amount: newPayment.amount, currency: 'usd' },
        '1',
        user,
      ),
    ).toEqual(newPayment);
  });
});
