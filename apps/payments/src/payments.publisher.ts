import { PAYMENTS_EXCHANGE } from '@app/common/consts';
import { BasePublisher, ExchangeType } from '@app/common/publishers';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsPublisher extends BasePublisher {
  protected exchange: string = PAYMENTS_EXCHANGE;
  protected exchangeType: ExchangeType = 'topic';

  constructor(configService: ConfigService) {
    super(configService);
  }
}
