import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsRepository } from './reservations.new.repository';
import { User } from '@app/common';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  create(createReservationDto: CreateReservationDto, user: User) {
    return this.reservationsRepository.create({
      ...createReservationDto,
      user,
    });
  }

  findAll() {
    return this.reservationsRepository.findAll();
  }

  findOne(id: string) {
    return this.reservationsRepository.findOne(
      { id: +id },
      { user: true },
      { user: { email: true, id: true } },
    );
  }

  remove(id: string) {
    return this.reservationsRepository.delete(+id);
  }
}
