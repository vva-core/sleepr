import { $Enums, Reservation } from './prisma/generated';
import { Test, TestingModule } from '@nestjs/testing';
import { toProto } from './reservation.mapper';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

const reservation: Reservation = {
  id: '1',
  startDate: new Date('2026-07-17T00:00:00.000Z'),
  endDate: new Date('2026-07-24T00:00:00.000Z'),
  userId: 'user-1',
  placeId: 'place-1',
  createdAt: new Date('2026-07-01T00:00:00.000Z'),
  updatedAt: new Date('2026-07-05T00:00:00.000Z'),
  status: $Enums.ReservationStatus.PENDING,
};

describe('ReservationsController', () => {
  let controller: ReservationsController;
  const reservationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: ReservationsService, useValue: reservationsService },
      ],
    }).compile();

    controller = app.get<ReservationsController>(ReservationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  it('returns a created reservation', async () => {
    reservationsService.create.mockResolvedValueOnce(reservation);

    await expect(
      controller.create({
        startDate: reservation.startDate.toISOString(),
        endDate: reservation.endDate.toISOString(),
        placeId: reservation.placeId,
        userId: reservation.userId,
      }),
    ).resolves.toEqual(toProto(reservation));
  });

  it('returns a list of reservations', async () => {
    reservationsService.findAll.mockResolvedValueOnce([reservation]);

    await expect(controller.findAll()).resolves.toEqual({
      reservations: [toProto(reservation)],
    });
  });

  it('returns a reservation by id', async () => {
    reservationsService.findOne.mockResolvedValueOnce(reservation);

    await expect(controller.findOne({ id: '1' })).resolves.toEqual(
      toProto(reservation),
    );
    expect(reservationsService.findOne).toHaveBeenCalledWith('1');
  });

  it('returns an updated reservation', async () => {
    const updateData = { placeId: 'place-2' };
    reservationsService.update.mockResolvedValueOnce({
      ...reservation,
      ...updateData,
    });

    await expect(
      controller.update({ id: '1', placeId: 'place-2' }),
    ).resolves.toEqual(
      toProto({
        ...reservation,
        ...updateData,
      }),
    );
    expect(reservationsService.update).toHaveBeenCalledWith('1', {
      placeId: 'place-2',
    });
  });

  it('returns a removed reservation', async () => {
    reservationsService.remove.mockResolvedValueOnce(reservation);

    await expect(controller.remove({ id: '1' })).resolves.toEqual(
      toProto(reservation),
    );
    expect(reservationsService.remove).toHaveBeenCalledWith('1');
  });
});
