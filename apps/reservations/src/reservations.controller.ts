import {
  CreateReservationRequest,
  FindOneReservationRequest,
  RemoveReservationRequest,
  Reservation,
  ReservationServiceController,
  ReservationServiceControllerMethods,
  ReservationsList,
  UpdateReservationRequest,
} from '@app/common';
import { Controller } from '@nestjs/common';
import { toProto } from './reservation.mapper';
import { ReservationsService } from './reservations.service';

@ReservationServiceControllerMethods()
@Controller()
export class ReservationsController implements ReservationServiceController {
  constructor(private readonly reservationsService: ReservationsService) {}

  async create(request: CreateReservationRequest): Promise<Reservation> {
    return toProto(await this.reservationsService.create(request));
  }

  async findAll(): Promise<ReservationsList> {
    const reservations = await this.reservationsService.findAll();
    console.log(
      `ReservationsController.findAll: ${JSON.stringify(reservations)}`,
    );

    return { reservations: reservations.map(toProto) };
  }

  async findOne({ id }: FindOneReservationRequest): Promise<Reservation> {
    return toProto(await this.reservationsService.findOne(id));
  }

  async update({
    id,
    ...data
  }: UpdateReservationRequest): Promise<Reservation> {
    return toProto(await this.reservationsService.update(id, data));
  }

  async remove({ id }: RemoveReservationRequest): Promise<Reservation> {
    return toProto(await this.reservationsService.remove(id));
  }
}
