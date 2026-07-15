import { CurrentUser, PaymentDto, Roles } from '@app/common';
import { JwtAuthGuard } from '@app/common/auth';
import { RoleGuard } from '@app/common/guards';
import type { User } from '@app/common/prisma/generated/prisma';
import {
  PAYMENTS_SERVICE_NAME,
  PaymentsServiceClient,
} from '@app/common/types/proto/payments';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

@Roles('user')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('reservations')
export class ReservationsController implements OnModuleInit {
  private paymentsService: PaymentsServiceClient;

  constructor(
    private readonly reservationsService: ReservationsService,
    @Inject(PAYMENTS_SERVICE_NAME) private readonly paymentsClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentsService =
      this.paymentsClient.getService<PaymentsServiceClient>(
        PAYMENTS_SERVICE_NAME,
      );
  }

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
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.createPayment({
      amount: paymentDto.amount,
      reservationId,
      email: user.email,
    });
  }

  @Post(':id/payments/confirm')
  confirmReservationPayment(
    @Body() data: { paymentIntentId: string; paymentMethodId: string },
  ) {
    return this.paymentsService.confirmPayment(data);
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
