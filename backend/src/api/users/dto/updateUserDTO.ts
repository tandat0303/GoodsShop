import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDTO {
  @IsEmail()
  @IsOptional()
  email?: string;

  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsOptional()
  fullName?: string;

  @IsOptional()
  role?: string;
}
