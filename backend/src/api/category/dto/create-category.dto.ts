import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination.dto';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  /** Nếu không truyền, service sẽ tự sinh từ name */
  @IsOptional()
  @IsString()
  slug?: string;
}
