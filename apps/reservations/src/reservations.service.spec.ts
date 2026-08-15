import { $Enums, Reservation } from './prisma/generated';
import { status } from '@grpc/grpc-js';
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsService } from './reservations.service';

const reservation: Reservation = {
  id: '1',
  startDate: new Date('2026-07-17T00:00:00.000Z'),
  endDate: new Date('2026-07-24T00:00:00.000Z'),
  userId: 'user-1',
  placeId: 'place-1',
  createdAt: new Date('2026-07-01T00:00:00.000Z'),
  updatedAt: new Date('2026-07-01T00:00:00.000Z'),
  status: $Enums.ReservationStatus.PENDING,
};

describe('ReservationsService', () => {
  let service: ReservationsService;
  const reservationsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: ReservationsRepository, useValue: reservationsRepository },
      ],
    }).compile();

    service = app.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the reservation when the repository finds one', async () => {
    reservationsRepository.findOne.mockResolvedValueOnce(reservation);

    await expect(service.findOne('1')).resolves.toBe(reservation);
  });

  it('raises NOT_FOUND when the repository returns null', async () => {
    reservationsRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.findOne('missing')).rejects.toMatchObject({
      error: { code: status.NOT_FOUND },
    });
  });

  it('passes a partial update through untouched', async () => {
    reservationsRepository.update.mockResolvedValueOnce(reservation);

    await service.update('1', { placeId: 'place-2' });

    expect(reservationsRepository.update).toHaveBeenCalledWith('1', {
      placeId: 'place-2',
    });
  });
});
