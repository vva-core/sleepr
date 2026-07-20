import {
  CurrentUser,
  PaymentDto,
  PAYMENTS_SERVICE_NAME,
  PaymentsServiceClient,
  type User,
} from '@app/common';
import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ConfirmPaymentDto } from './dto/payments.dto';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '@app/common';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController implements OnModuleInit {
  private paymentsServiceClient: PaymentsServiceClient;

  constructor(
    @Inject(PAYMENTS_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentsServiceClient = this.client.getService(PAYMENTS_SERVICE_NAME);
  }

  @Post('reservations/:id')
  async createReservationPayment(
    @Body() { amount, currency }: PaymentDto,
    @Param('id') reservationId: string,
    @CurrentUser() user: User,
  ) {
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
  async confirmReservationPayment(@Body() data: ConfirmPaymentDto) {
    return await firstValueFrom(
      this.paymentsServiceClient.confirmPayment(data),
    );
  }
}
