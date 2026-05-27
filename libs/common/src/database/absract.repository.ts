import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export abstract class AbstractRepository<T extends AbstractEntity<T>> {
  constructor(private readonly entityRepo: Repository<T>) {}

  async create(payload: Partial<T>): Promise<T> {
    const newEntity = this.entityRepo.create(payload as T);

    return await this.entityRepo.save(newEntity);
  }

  async findOne(
    where: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
    select?: FindOptionsSelect<T>,
  ): Promise<T | null> {
    return await this.entityRepo.findOne({
      where,
      relations,
      select,
    });
  }

  async findAll(): Promise<T[]> {
    return await this.entityRepo.find({
      relations: {},
    });
  }

  update(_id: number, _entity: T): Promise<T | null> {
    console.log(_id, _entity);

    throw new Error('Method not implemented.');
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.entityRepo.delete(id);

    if (result.affected && result.affected > 0) {
      return true;
    }
    return false;
  }
}
