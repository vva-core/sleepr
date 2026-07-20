import {
  CurrentUser,
  RESERVATION_SERVICE_NAME,
  ReservationServiceClient,
  type User,
} from '@app/common';
import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { CreateReservationDto } from './dto/reservation.dto';
import { firstValueFrom } from 'rxjs';

@Controller('reservations')
export class ReservationsController implements OnModuleInit {
  private reservationsClient: ReservationServiceClient;

  constructor(
    @Inject(RESERVATION_SERVICE_NAME) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reservationsClient = this.client.getService(RESERVATION_SERVICE_NAME);
  }

  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: User,
  ) {
    return await firstValueFrom(
      this.reservationsClient.create({
        ...createReservationDto,
        userId: user.id,
      }),
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(this.reservationsClient.findAll({}));
  }
}
