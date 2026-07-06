import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsPublisher } from './payments.publisher';

describe('PaymentsController', () => {
  let paymentsController: PaymentsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: { createPayment: jest.fn(), confirmPayment: jest.fn() },
        },
        { provide: PaymentsPublisher, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    paymentsController = app.get<PaymentsController>(PaymentsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(paymentsController).toBeTruthy();
    });
  });
});
