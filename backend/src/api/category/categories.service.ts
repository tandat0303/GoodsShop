import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPagination } from '../../common/pagination.dto';
import { slugify } from '../../common/slugify';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCategoryDto) {
    const page = Number(query.currentPage) ?? 1;
    const size = Number(query.pageSize) ?? 10;
    const skip = (page - 1) * size;

    const where: Prisma.CategoryWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { products: true } } },
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data: items, pagination: buildPagination(total, page, size) };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.slug ?? dto.name);
    await this.ensureUnique(dto.name, slug);

    const category = await this.prisma.category.create({
      data: { name: dto.name, slug },
    });

    return { data: category, message: 'Đã thêm danh mục' };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    const slug = dto.slug
      ? slugify(dto.slug)
      : dto.name
        ? slugify(dto.name)
        : undefined;

    if (dto.name || slug) {
      await this.ensureUnique(dto.name, slug, id);
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(slug ? { slug } : {}),
      },
    });

    return { data: category, message: 'Đã cập nhật danh mục' };
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');

    if (category._count.products > 0) {
      throw new BadRequestException(
        'Không thể xóa danh mục đang có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.',
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Đã xóa danh mục' };
  }

  private async ensureUnique(name?: string, slug?: string, excludeId?: string) {
    if (name) {
      const existing = await this.prisma.category.findFirst({
        where: { name, ...(excludeId ? { id: { not: excludeId } } : {}) },
      });
      if (existing) throw new ConflictException('Tên danh mục đã tồn tại');
    }
    if (slug) {
      const existing = await this.prisma.category.findFirst({
        where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      });
      if (existing) throw new ConflictException('Slug danh mục đã tồn tại');
    }
  }
}
