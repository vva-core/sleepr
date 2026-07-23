import { ReservationStatus } from '@app/common';
import { $Enums, Reservation } from '@app/common/prisma/generated/prisma';
import { toProto } from './reservation.mapper';

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

describe('toProto', () => {
  it('converts every date to an ISO string, without swapping fields', () => {
    expect(toProto(reservation)).toEqual({
      id: '1',
      userId: 'user-1',
      placeId: 'place-1',
      startDate: '2026-07-17T00:00:00.000Z',
      endDate: '2026-07-24T00:00:00.000Z',
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-05T00:00:00.000Z',
      status: ReservationStatus.PENDING,
    });
  });

  it.each([
    [$Enums.ReservationStatus.PENDING, ReservationStatus.PENDING],
    [$Enums.ReservationStatus.CONFIRMED, ReservationStatus.CONFIRMED],
    [$Enums.ReservationStatus.CANCELLED, ReservationStatus.CANCELLED],
    [$Enums.ReservationStatus.COMPLETED, ReservationStatus.COMPLETED],
  ])('maps the %s status to its proto enum', (prismaStatus, protoStatus) => {
    expect(toProto({ ...reservation, status: prismaStatus }).status).toBe(
      protoStatus,
    );
  });

  it('falls back to UNSPECIFIED for a status outside the enum', () => {
    const drifted = {
      ...reservation,
      status: 'ARCHIVED' as $Enums.ReservationStatus,
    };

    expect(toProto(drifted).status).toBe(
      ReservationStatus.RESERVATION_STATUS_UNSPECIFIED,
    );
  });
});
