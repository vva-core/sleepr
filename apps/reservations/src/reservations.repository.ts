import { IBaseRepository, PrismaService } from '@app/common';
import { Prisma, Reservation } from '@app/common/prisma/generated/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReservationsRepository implements IBaseRepository<
  Reservation,
  Prisma.ReservationUncheckedCreateInput,
  Prisma.ReservationUncheckedUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.ReservationUncheckedCreateInput,
  ): Promise<Reservation> {
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
    data: Prisma.ReservationUncheckedUpdateInput,
  ): Promise<Reservation> {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Reservation> {
    return this.prisma.reservation.delete({ where: { id } });
  }
}
