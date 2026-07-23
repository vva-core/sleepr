import { Injectable } from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import {
  CreateReservationRequest,
  UpdateReservationRequest,
} from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

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

  async findOne(id: string) {
    const reservation = await this.reservationsRepository.findOne(id);

    if (!reservation) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Reservation #${id} not found`,
      });
    }

    return reservation;
  }

  update(id: string, data: Omit<UpdateReservationRequest, 'id'>) {
    return this.reservationsRepository.update(id, data);
  }

  remove(id: string) {
    return this.reservationsRepository.delete(id);
  }
}
