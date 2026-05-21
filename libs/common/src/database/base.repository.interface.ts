import { FindOneOptions } from 'typeorm';

export interface IBaseRepository<T> {
  create(entity: T): Promise<T>;
  findOne(where: FindOneOptions<T>): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: number, entity: T): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}
