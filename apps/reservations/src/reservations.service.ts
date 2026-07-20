import { Injectable } from '@nestjs/common';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationRequest } from '@app/common';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async create(data: CreateReservationRequest) {
    return await this.reservationsRepository.create(data);
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
