import { Injectable, NotFoundException } from '@nestjs/common';
import { IBaseRepository, PrismaService } from '@app/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@app/common/prisma/generated/prisma';

@Injectable()
export class UserRepository implements IBaseRepository<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return await this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return await this.prisma.user.delete({ where: { id } });
  }
}
