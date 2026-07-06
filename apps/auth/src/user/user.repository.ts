import { Injectable, NotFoundException } from '@nestjs/common';
import { IBaseRepository, PrismaService } from '@app/common';
import { CreateUserDto } from '@app/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@app/common/prisma/generated/prisma';
import { PublicUser } from './interfaces/user.interface';

@Injectable()
export class UserRepository implements IBaseRepository<
  PublicUser,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<PublicUser> {
    return await this.prisma.user.create({
      data,
      omit: { password: true },
    });
  }

  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto): Promise<PublicUser> {
    return await this.prisma.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async delete(id: string): Promise<PublicUser> {
    return await this.prisma.user.delete({
      where: { id },
      omit: { password: true },
    });
  }
}
