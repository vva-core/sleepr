import { Injectable } from '@nestjs/common';
import { IBaseRepository, PrismaService } from '@app/common';
import { Prisma, RefreshToken } from '@app/common/prisma/generated/prisma';

export type CreateRefreshTokenInput = Prisma.RefreshTokenUncheckedCreateInput;
export type UpdateRefreshTokenInput = Prisma.RefreshTokenUncheckedUpdateInput;

@Injectable()
export class RefreshTokenRepository implements IBaseRepository<
  RefreshToken,
  CreateRefreshTokenInput,
  UpdateRefreshTokenInput
> {
  constructor(private readonly prisma: PrismaService) {}

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
