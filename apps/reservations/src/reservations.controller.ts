import {
  CreateReservationRequest,
  Reservation,
  ReservationServiceController,
  ReservationServiceControllerMethods,
  ReservationsList,
  Roles,
} from '@app/common';
import { JwtAuthGuard } from '@app/common/auth';
import { RoleGuard } from '@app/common/guards';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { toProto } from './reservation.mapper';
import { ReservationsService } from './reservations.service';

@Roles('user')
@UseGuards(JwtAuthGuard, RoleGuard)
@ReservationServiceControllerMethods()
@Controller()
export class ReservationsController implements ReservationServiceController {
  constructor(private readonly reservationsService: ReservationsService) {}

  async create(request: CreateReservationRequest): Promise<Reservation> {
    return toProto(await this.reservationsService.create(request));
  }

  async findAll(): Promise<ReservationsList> {
    const reservations = await this.reservationsService.findAll();
    return { reservations: reservations.map(toProto) };
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
