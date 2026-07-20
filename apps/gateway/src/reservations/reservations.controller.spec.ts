import { RESERVATION_SERVICE_NAME, User } from '@app/common';
import { Test } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';

const payment = {
  clientSecret: '123',
};

const reservation = {
  id: '1',
  startDate: '07-17-2026',
  endDate: '07-24-2026',
  userId: '1',
  placeId: '1',
  createdAt: '',
  updatedAt: '',
  status: 'PENDING',
};

const user: User = {
  createdAt: '',
  email: 'test@gmail.com',
  id: '1',
  reservations: [],
  roles: [],
  updatedAt: '',
};

describe('Gateway Reservation Controller', () => {
  let controller: ReservationsController;
  const reservationClient = {
    create: jest.fn(),
    createReservationPayment: jest.fn(),
  };
  const clientGrpc = {
    getService: jest.fn(() => reservationClient),
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: RESERVATION_SERVICE_NAME, useValue: clientGrpc }],
    }).compile();

    controller = app.get<ReservationsController>(ReservationsController);
    controller.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  it('should create user through reservation client', () => {
    reservationClient.create.mockReturnValueOnce(reservation);

    expect(
      controller.create(
        {
          endDate: reservation.endDate,
          placeId: reservation.placeId,
          startDate: reservation.startDate,
        },
        user,
      ),
    ).toEqual(reservation);
  });

  it('should create reservation payment', () => {
    reservationClient.createReservationPayment.mockReturnValueOnce(payment);
  });
});
