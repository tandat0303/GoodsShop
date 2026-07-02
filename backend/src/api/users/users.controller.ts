import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/createUserDTO';
import { UpdateUserDTO } from './dto/updateUserDTO';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll(
    @Query('currentPage') currentPage: string,
    @Query('pageSize') pageSize: string,
    @Query('search') search: string,
    @Query('role') role: string,
  ) {
    return this.usersService.getAllUsers(currentPage, pageSize, search, role);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Post()
  async createUser(@Body() dto: CreateUserDTO) {
    await this.usersService.createUser(dto);

    return {
      message: 'Tạo người dùng thành công!',
    };
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
    await this.usersService.updateUser(id, dto);

    return {
      message: 'Cập nhật người dùng thành công!',
    };
  }

  @Delete(':id')
  async removeUser(@Param('id') id: string) {
    await this.usersService.removeUser(id);

    return {
      message: 'Xóa người dùng thành công!',
    };
  }
}
