import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/createUserDTO';
import { UpdateUserDTO } from './dto/updateUserDTO';
import { UserPayload } from '../../types/users';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkExistUser(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return !!user;
  }

  async validateUser(email: string, password: string) {
    const payload = await this.prisma.user.findUnique({
      where: {
        email,
        password,
      },
    });

    if (payload === null) return false;
    const raw = payload;

    if (raw?.email !== email) return false;
    if (raw.password !== password) return false;

    const user: UserPayload = {
      id: raw.id,
      email: raw.email,
      fullName: raw.fullName,
      role: raw.role,
    };

    return user;
  }

  async getAllUsers(
    currentPage: string,
    pageSize: string,
    search?: string,
    role?: string,
  ) {
    const page = Number(currentPage);
    const size = Number(pageSize);
    const skip = (Number(page) - 1) * Number(size);

    const where: Prisma.UserWhereInput = {
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(role ? { role } : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: size,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        total,
        currentPage: page,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async getUser(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createUser(dto: CreateUserDTO) {
    return this.prisma.user.create({
      data: {
        email: dto.email,

        password: dto.password,

        fullName: dto.fullName,

        role: dto.role,
      },
    });
  }

  async updateUser(id: string, dto: UpdateUserDTO) {
    return this.prisma.user.update({
      where: { id },

      data: dto,
    });
  }

  async removeUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
