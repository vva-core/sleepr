import { IBaseRepository, PrismaService } from '@app/common';
import { Prisma, Reservation } from '@app/common/prisma/generated/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsRepository implements IBaseRepository<
  Reservation,
  Prisma.ReservationUncheckedCreateInput,
  UpdateReservationDto
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

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation #${id} not found`);
    }

    return reservation;
  }

  async update(id: string, data: UpdateReservationDto): Promise<Reservation> {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Reservation> {
    return this.prisma.reservation.delete({ where: { id } });
  }
}
