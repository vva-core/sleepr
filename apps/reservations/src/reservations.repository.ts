import { IBaseRepository } from '@app/common';
import { Injectable } from '@nestjs/common';
import { Prisma, Reservation } from './prisma/generated';
import { ReservationsPrismaService } from './database/reservations-prisma.service';

// The checked inputs are usable only while Reservation stays relation-free; adding a
// relation would reintroduce nested connect/create and require the Unchecked variants.
@Injectable()
export class ReservationsRepository implements IBaseRepository<
  Reservation,
  Prisma.ReservationCreateInput,
  Prisma.ReservationUpdateInput
> {
  constructor(private readonly prisma: ReservationsPrismaService) {}

  async create(data: Prisma.ReservationCreateInput): Promise<Reservation> {
    return this.prisma.reservation.create({
      data,
    });
  }

  async findAll(): Promise<Reservation[]> {
    return this.prisma.reservation.findMany();
  }

  async findOne(id: string): Promise<Reservation | null> {
    return this.prisma.reservation.findUnique({ where: { id } });
  }

  async update(
    id: string,
    data: Prisma.ReservationUpdateInput,
  ): Promise<Reservation> {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Reservation> {
    return this.prisma.reservation.delete({ where: { id } });
  }
}
