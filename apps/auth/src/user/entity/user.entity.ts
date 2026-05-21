import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '@app/common/database/abstract.entity';

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
}
