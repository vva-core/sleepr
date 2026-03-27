import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { User } from '@app/common/prisma/generated/prisma';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  create(createReservationDto: CreateReservationDto, user: User) {
    return this.reservationsRepository.create({
      ...createReservationDto,
      userId: user.id,
    });
  }

  findAll() {
    return this.reservationsRepository.findAll();
  }

  findOne(id: string) {
    return this.reservationsRepository.findOne(id);
  }

  update(id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationsRepository.update(id, updateReservationDto);
  }

  remove(id: string) {
    return this.reservationsRepository.delete(id);
  }
}
