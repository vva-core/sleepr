import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsModule } from './../src/payments.module';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
});
