import { Reservation, ReservationStatus } from '@app/common';
import { $Enums, Reservation as PrismaReservation } from './prisma/generated';

const PRISMA_TO_PROTO_STATUS_MAP: Record<
  $Enums.ReservationStatus,
  ReservationStatus
> = {
  [$Enums.ReservationStatus.PENDING]: ReservationStatus.PENDING,
  [$Enums.ReservationStatus.CONFIRMED]: ReservationStatus.CONFIRMED,
  [$Enums.ReservationStatus.CANCELLED]: ReservationStatus.CANCELLED,
  [$Enums.ReservationStatus.COMPLETED]: ReservationStatus.COMPLETED,
};

const reservationStatusToProtoMap = (status: $Enums.ReservationStatus) => {
  return (
    PRISMA_TO_PROTO_STATUS_MAP[status] ??
    ReservationStatus.RESERVATION_STATUS_UNSPECIFIED
  );
};

export const toProto = (reservation: PrismaReservation): Reservation => ({
  id: reservation.id,
  placeId: reservation.placeId,
  status: reservationStatusToProtoMap(reservation.status),
  endDate: reservation.endDate.toISOString(),
  createdAt: reservation.createdAt.toISOString(),
  startDate: reservation.startDate.toISOString(),
  updatedAt: reservation.updatedAt.toISOString(),
  userId: reservation.userId,
});
