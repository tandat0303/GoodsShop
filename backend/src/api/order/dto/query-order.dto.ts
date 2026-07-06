import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination.dto';

export class QueryOrderDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
