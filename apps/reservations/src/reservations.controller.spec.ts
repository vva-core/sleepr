import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { PAYMENTS_SERVICE_NAME } from '@app/common/types/proto/payments';
import { JwtAuthGuard } from '@app/common/auth';
import { RoleGuard } from '@app/common/guards';

describe('ReservationsController', () => {
  let reservationsController: ReservationsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: PAYMENTS_SERVICE_NAME, useValue: { getService: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    reservationsController = app.get<ReservationsController>(
      ReservationsController,
    );
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(reservationsController).toBeTruthy();
    });
  });
});
