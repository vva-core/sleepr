import { CurrentUser, PaymentDto, Roles } from '@app/common';
import { JwtAuthGuard } from '@app/common/auth';
import { PAYMENTS_MESSAGES, PAYMENTS_SERVICE } from '@app/common/consts';
import { RoleGuard } from '@app/common/guards';
import type { User } from '@app/common/prisma/generated/prisma';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

@Roles('user')
@UseGuards(JwtAuthGuard, RoleGuard)
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

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
