import { IsNumber, IsString } from 'class-validator';

export class PaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}
