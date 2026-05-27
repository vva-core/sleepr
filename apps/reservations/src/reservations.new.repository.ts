import { AbstractRepository } from '@app/common/database/absract.repository';
import { Reservation } from './entity/reservation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class ReservationsRepository extends AbstractRepository<Reservation> {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
  ) {
    super(reservationsRepository);
  }
}
