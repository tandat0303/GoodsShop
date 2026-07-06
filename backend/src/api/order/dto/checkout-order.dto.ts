import { IsOptional, IsString } from 'class-validator';

export class CheckoutOrderDto {
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
