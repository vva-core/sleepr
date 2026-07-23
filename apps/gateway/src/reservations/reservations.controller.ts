import {
  CurrentUser,
  JwtAuthGuard,
  RESERVATION_SERVICE_NAME,
  ReservationServiceClient,
  Roles,
  type User,
} from '@app/common';
import { RoleGuard } from '@app/common/guards';
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
import { firstValueFrom } from 'rxjs';
import {
  CreateReservationDto,
  UpdateReservationDto,
} from './dto/reservation.dto';

@Roles('user')
@UseGuards(JwtAuthGuard, RoleGuard)
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(this.reservationsClient.findOne({ id }));
  }

  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return await firstValueFrom(
      this.reservationsClient.update({ id, ...updateReservationDto }),
    );
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await firstValueFrom(this.reservationsClient.remove({ id }));
  }
}
