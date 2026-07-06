import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination.dto';

export class AdminQueryOrderDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
