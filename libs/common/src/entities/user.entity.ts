import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../database/abstract.entity';
import { Reservation } from './reservation.entity';

@Entity()
export class User extends AbstractEntity<User> {
  @Column({
    unique: true,
  })
  email: string;

  @Column({})
  password: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
