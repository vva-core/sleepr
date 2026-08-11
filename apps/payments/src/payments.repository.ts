import { Injectable } from '@nestjs/common';
import { IBaseRepository } from '@app/common';
import { Payments, PaymentStatus } from './prisma/generated';
import { PaymentsPrismaService } from './database/payments-prisma.service';

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
  constructor(private readonly prisma: PaymentsPrismaService) {}

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

  async findOne(id: string): Promise<Payments | null> {
    return await this.prisma.payments.findUnique({
      where: { id },
    });
  }

  async findByStripeIntentId(
    stripePaymentIntentId: string,
  ): Promise<Payments | null> {
    return await this.prisma.payments.findFirst({
      where: { stripePaymentIntentId },
    });
  }

  async update(id: string, data: UpdatePaymentDto): Promise<Payments> {
    return await this.prisma.payments.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Payments> {
    return await this.prisma.payments.delete({ where: { id } });
  }
}
