export interface IBaseRepository<T, CreateDto, UpdateDto> {
  create(data: CreateDto): Promise<T>;
  findAll(): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<T>;
}
