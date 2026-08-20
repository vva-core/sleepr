import { JwtAuthGuard, RESERVATION_SERVICE_NAME, User } from '@app/common';
import { RoleGuard } from '@app/common/guards';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { ReservationsController } from './reservations.controller';

const reservation = {
  id: '1',
  startDate: '2026-07-17T00:00:00.000Z',
  endDate: '2026-07-24T00:00:00.000Z',
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
  roles: [],
  updatedAt: '',
};

describe('Gateway Reservation Controller', () => {
  let controller: ReservationsController;
  const reservationClient = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const clientGrpc = {
    getService: jest.fn(() => reservationClient),
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: RESERVATION_SERVICE_NAME, useValue: clientGrpc }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = app.get<ReservationsController>(ReservationsController);
    controller.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  it('returns the created reservation', async () => {
    reservationClient.create.mockReturnValueOnce(of(reservation));

    await expect(
      controller.create(
        {
          endDate: reservation.endDate,
          placeId: reservation.placeId,
          startDate: reservation.startDate,
        },
        user,
      ),
    ).resolves.toEqual(reservation);
    expect(reservationClient.create).toHaveBeenCalled();
  });

  it('returns the reservations list', async () => {
    reservationClient.findAll.mockReturnValueOnce(
      of({ reservations: [reservation] }),
    );

    await expect(controller.findAll()).resolves.toEqual({
      reservations: [reservation],
    });
  });

  it('returns a single reservation', async () => {
    reservationClient.findOne.mockReturnValueOnce(of(reservation));

    await expect(controller.findOne('1')).resolves.toEqual(reservation);
    expect(reservationClient.findOne).toHaveBeenCalled();
  });

  it('returns the updated reservation', async () => {
    const dataToUpdate = { placeId: 'place-2' };
    reservationClient.update.mockReturnValueOnce(
      of({ ...reservation, ...dataToUpdate }),
    );

    await expect(
      controller.update('1', { placeId: 'place-2' }),
    ).resolves.toEqual({ ...reservation, ...dataToUpdate });
    expect(reservationClient.update).toHaveBeenCalled();
  });

  it('returns the removed reservation', async () => {
    reservationClient.remove.mockReturnValueOnce(of(reservation));

    await expect(controller.remove('1')).resolves.toEqual(reservation);
    expect(reservationClient.remove).toHaveBeenCalled();
  });
});
