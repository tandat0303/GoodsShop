import { IsIn, IsOptional, IsString } from 'class-validator';

export class CheckoutOrderDto {
  @IsIn(['COD', 'VNPAY', 'BANK_TRANSFER'])
  paymentMethod!: 'COD' | 'VNPAY' | 'BANK_TRANSFER';

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  shippingName?: string;

  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  shippingAddr?: string;
}
