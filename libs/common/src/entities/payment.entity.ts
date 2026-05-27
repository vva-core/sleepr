import { AbstractEntity } from '../database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Payment extends AbstractEntity<Payment> {
  @Column()
  reservationId: string;

  @Column()
  amount: number;

  @Column()
  stripePaymentIntentId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending',
  })
  status: string;
}
