import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  paymentIntentId: string;

  @IsString()
  paymentMethodId: string;
}
