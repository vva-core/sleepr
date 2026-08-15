import {
  CurrentUser,
  JwtAuthGuard,
  PaymentDto,
  PAYMENTS_SERVICE_NAME,
  PaymentsServiceClient,
  RESERVATION_SERVICE_NAME,
  ReservationServiceClient,
  Roles,
  type User,
} from '@app/common';
import { RoleGuard } from '@app/common/guards';
import { status } from '@grpc/grpc-js';
import {
  Body,
  Controller,
  ForbiddenException,
  Inject,
  NotFoundException,
  OnModuleInit,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ConfirmPaymentDto } from './dto/payments.dto';

@Roles('user')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('payments')
export class PaymentsController implements OnModuleInit {
  private paymentsServiceClient: PaymentsServiceClient;
  private reservationsServiceClient: ReservationServiceClient;

  constructor(
    @Inject(PAYMENTS_SERVICE_NAME) private readonly client: ClientGrpc,
    @Inject(RESERVATION_SERVICE_NAME)
    private readonly reservationsClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentsServiceClient = this.client.getService(PAYMENTS_SERVICE_NAME);
    this.reservationsServiceClient = this.reservationsClient.getService(
      RESERVATION_SERVICE_NAME,
    );
  }

  private async findReservation(id: string) {
    try {
      return await firstValueFrom(
        this.reservationsServiceClient.findOne({ id }),
      );
    } catch (error) {
      if ((error as { code?: number })?.code === status.NOT_FOUND) {
        throw new NotFoundException(`Reservation #${id} not found`);
      }
      throw error;
    }
  }

  @Post('reservations/:id')
  async createReservationPayment(
    @Body() { amount, currency }: PaymentDto,
    @Param('id') reservationId: string,
    @CurrentUser() user: User,
  ) {
    const reservation = await this.findReservation(reservationId);

    if (reservation.userId !== user.id) {
      throw new ForbiddenException();
    }

    return await firstValueFrom(
      this.paymentsServiceClient.createPayment({
        amount,
        currency,
        email: user.email,
        reservationId,
      }),
    );
  }

  @Post('reservations/:id/confirm')
  async confirmReservationPayment(
    @Body() data: ConfirmPaymentDto,
    @Param('id') reservationId: string,
    @CurrentUser() user: User,
  ) {
    const reservation = await this.findReservation(reservationId);

    if (reservation.userId !== user.id) {
      throw new ForbiddenException();
    }

    return await firstValueFrom(
      this.paymentsServiceClient.confirmPayment({ ...data, reservationId }),
    );
  }
}
