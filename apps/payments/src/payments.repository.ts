import { Injectable, NotFoundException } from '@nestjs/common';
import { IBaseRepository, PrismaService } from '@app/common';
import { Payments, PaymentStatus } from '@app/common/prisma/generated/prisma';

export interface CreatePaymentDto {
  reservationId: string;
  amount: number;
}

export interface UpdatePaymentDto {
  status: PaymentStatus;
  amount: number;
}

@Injectable()
export class PaymentsRepository implements IBaseRepository<
  Payments,
  CreatePaymentDto,
  UpdatePaymentDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreatePaymentDto & { stripePaymentIntentId: string },
  ): Promise<Payments> {
    return await this.prisma.payments.create({
      data,
    });
  }

  async findAll(): Promise<Payments[]> {
    return await this.prisma.payments.findMany();
  }

  async findOne(id: string): Promise<Payments> {
    const payment = await this.prisma.payments.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }

    return payment;
  }

  async update(id: string, data: UpdatePaymentDto): Promise<Payments> {
    return await this.prisma.payments.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Payments> {
    return await this.prisma.payments.delete({ where: { id } });
  }
}
