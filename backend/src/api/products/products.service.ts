import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPagination } from '../../common/pagination.dto';
import { slugify } from '../../common/slugify';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product-dto';

const PRODUCT_INCLUDE = { category: true, brand: true } as const;

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const page = Number(query.currentPage) ?? 1;
    const size = Number(query.pageSize) ?? 10;
    const skip = (page - 1) * size;

    const where: Prisma.ProductWhereInput = {
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.brandId ? { brandId: query.brandId } : {}),
      ...(query.isNew !== undefined ? { isNew: query.isNew } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.inStock !== undefined
        ? query.inStock
          ? { stock: { gt: 0 } }
          : { stock: { lte: 0 } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: PRODUCT_INCLUDE,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items.map((p) => this.toResponse(p)),
      pagination: buildPagination(total, page, size),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return this.toResponse(product);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return this.toResponse(product);
  }

  async create(dto: CreateProductDto) {
    await this.ensureRelationsExist(dto.categoryId, dto.brandId);
    this.ensurePriceValid(dto.price, dto.originalPrice);

    const slug = await this.ensureUniqueSlug(dto.slug ?? dto.name);

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        image: dto.image,
        images: dto.images ?? undefined,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        price: dto.price,
        originalPrice: dto.originalPrice,
        stock: dto.stock ?? 0,
        rating: dto.rating ?? 0.0,
        reviewCount: dto.reviewCount ?? 0,
        isNew: dto.isNew ?? false,
        isActive: dto.isActive ?? true,
        featured: dto.featured ?? false,
      },
      include: PRODUCT_INCLUDE,
    });

    return { data: this.toResponse(product), message: 'Đã thêm sản phẩm' };
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy sản phẩm');

    if (dto.categoryId || dto.brandId) {
      await this.ensureRelationsExist(
        dto.categoryId ?? existing.categoryId,
        dto.brandId ?? existing.brandId,
      );
    }

    const nextPrice = dto.price ?? Number(existing.price);
    const nextOriginalPrice =
      dto.originalPrice !== undefined
        ? dto.originalPrice
        : existing.originalPrice !== null
          ? Number(existing.originalPrice)
          : undefined;
    this.ensurePriceValid(nextPrice, nextOriginalPrice);

    let slug: string | undefined;
    if (dto.slug) {
      slug = await this.ensureUniqueSlug(dto.slug, id);
    } else if (dto.name && dto.name !== existing.name) {
      slug = await this.ensureUniqueSlug(dto.name, id);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(slug ? { slug } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.image ? { image: dto.image } : {}),
        ...(dto.images !== undefined ? { images: dto.images } : {}),
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        ...(dto.brandId ? { brandId: dto.brandId } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.originalPrice !== undefined
          ? { originalPrice: dto.originalPrice }
          : {}),
        ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.reviewCount !== undefined
          ? { reviewCount: dto.reviewCount }
          : {}),
        ...(dto.isNew !== undefined ? { isNew: dto.isNew } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
      },
      include: PRODUCT_INCLUDE,
    });

    return {
      data: this.toResponse(product),
      message: 'Đã cập nhật sản phẩm',
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy sản phẩm');

    await this.prisma.product.delete({ where: { id } });
    return { message: 'Đã xóa sản phẩm' };
  }

  private ensurePriceValid(price: number, originalPrice?: number) {
    if (originalPrice !== undefined && originalPrice < price) {
      throw new BadRequestException('Giá gốc phải lớn hơn hoặc bằng giá bán');
    }
  }

  private async ensureRelationsExist(categoryId: string, brandId: string) {
    const [category, brand] = await Promise.all([
      this.prisma.category.findUnique({ where: { id: categoryId } }),
      this.prisma.brand.findUnique({ where: { id: brandId } }),
    ]);
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    if (!brand) throw new NotFoundException('Thương hiệu không tồn tại');
  }

  private async ensureUniqueSlug(source: string, excludeId?: string) {
    const base = slugify(source);
    let slug = base;
    let suffix = 1;

    while (true) {
      const existing = await this.prisma.product.findFirst({
        where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      });
      if (!existing) return slug;
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
  }

  private toResponse(product: any) {
    return {
      ...product,
      price: Number(product.price),
      originalPrice:
        product.originalPrice !== null && product.originalPrice !== undefined
          ? Number(product.originalPrice)
          : undefined,
    };
  }
}
