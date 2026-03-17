import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  create(createReservationDto: CreateReservationDto) {
    return this.reservationsRepository.create(createReservationDto);
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
