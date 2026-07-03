import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  /** Nếu không truyền, service tự sinh từ name (và tự thêm hậu tố nếu trùng) */
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsUrl({}, { message: 'Ảnh đại diện phải là đường dẫn URL hợp lệ' })
  image!: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: 'Mỗi ảnh phải là đường dẫn URL hợp lệ' })
  images?: string[];

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @Type(() => Number)
  @IsPositive({ message: 'Giá bán phải lớn hơn 0' })
  price!: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  originalPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @Min(0.0)
  rating?: number = 0.0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reviewCount?: number = 0;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  featured?: boolean = false;
}
