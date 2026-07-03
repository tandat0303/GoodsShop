import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPagination } from '../../common/pagination.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryBrandDto) {
    const page = Number(query.currentPage) ?? 1;
    const size = Number(query.pageSize) ?? 10;
    const skip = (page - 1) * size;

    const where: Prisma.BrandWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.brand.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { products: true } } },
      }),
      this.prisma.brand.count({ where }),
    ]);

    return { data: items, pagination: buildPagination(total, page, size) };
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException('Không tìm thấy thương hiệu');
    return brand;
  }

  async create(dto: CreateBrandDto) {
    await this.ensureUniqueName(dto.name);

    const brand = await this.prisma.brand.create({
      data: { name: dto.name, logo: dto.logo },
    });

    return { data: brand, message: 'Đã thêm thương hiệu' };
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);
    if (dto.name) await this.ensureUniqueName(dto.name, id);

    const brand = await this.prisma.brand.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.logo !== undefined ? { logo: dto.logo } : {}),
      },
    });

    return { data: brand, message: 'Đã cập nhật thương hiệu' };
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException('Không tìm thấy thương hiệu');

    if (brand._count.products > 0) {
      throw new BadRequestException(
        'Không thể xóa thương hiệu đang có sản phẩm. Vui lòng chuyển sản phẩm sang thương hiệu khác trước.',
      );
    }

    await this.prisma.brand.delete({ where: { id } });
    return { message: 'Đã xóa thương hiệu' };
  }

  private async ensureUniqueName(name: string, excludeId?: string) {
    const existing = await this.prisma.brand.findFirst({
      where: { name, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (existing) throw new ConflictException('Tên thương hiệu đã tồn tại');
  }
}
