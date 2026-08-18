import { Injectable } from '@nestjs/common';
import { IBaseRepository } from '@app/common';
import { AuthPrismaService } from '../database/auth-prisma.service';
import { Prisma, RefreshToken } from '../prisma/generated';

export type CreateRefreshTokenInput = Prisma.RefreshTokenUncheckedCreateInput;
export type UpdateRefreshTokenInput = Prisma.RefreshTokenUncheckedUpdateInput;

@Injectable()
export class RefreshTokenRepository implements IBaseRepository<
  RefreshToken,
  CreateRefreshTokenInput,
  UpdateRefreshTokenInput
> {
  constructor(private readonly prisma: AuthPrismaService) {}

  async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    return await this.prisma.refreshToken.create({ data });
  }

  async findAll(): Promise<RefreshToken[]> {
    return await this.prisma.refreshToken.findMany();
  }

  async findOne(id: string): Promise<RefreshToken | null> {
    return await this.prisma.refreshToken.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: UpdateRefreshTokenInput,
  ): Promise<RefreshToken> {
    return await this.prisma.refreshToken.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<RefreshToken> {
    return await this.prisma.refreshToken.delete({
      where: { id },
    });
  }
}
