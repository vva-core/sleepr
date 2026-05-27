import { CurrentUser, PaymentDto } from '@app/common';
import { JwtAuthGuard } from '@app/common/auth';
import { PAYMENTS_MESSAGES, PAYMENTS_SERVICE } from '@app/common/consts';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '@app/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    @Inject(PAYMENTS_SERVICE) private readonly paymentsService: ClientProxy,
  ) {}

  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: User,
  ) {
    return this.reservationsService.create(createReservationDto, user);
  }

  @Post(':id/payments')
  createReservationPayment(
    @Body() paymentDto: PaymentDto,
    @Param('id') reservationId: string,
  ) {
    return this.paymentsService.send(PAYMENTS_MESSAGES.CREATE, {
      ...paymentDto,
      reservationId,
    });
  }

  @Post(':id/payments/confirm')
  confirmReservationPayment(
    @Body() data: { paymentIntentId: string; paymentMethodId: string },
  ) {
    return this.paymentsService.send(PAYMENTS_MESSAGES.CONFIRM, data);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
