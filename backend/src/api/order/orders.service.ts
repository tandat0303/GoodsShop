import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildPagination } from '../../common/pagination.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { AdminQueryOrderDto } from './dto/admin-query-order.dto';

const USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
} satisfies Prisma.UserSelect;

const ADMIN_ORDER_INCLUDE = {
  items: { include: { product: true }, orderBy: { createdAt: 'asc' as const } },
  user: { select: USER_SELECT },
} satisfies Prisma.OrderInclude;

const ORDER_INCLUDE = {
  items: { include: { product: true }, orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // ---------- Cart ----------

  async getCart(userId: string) {
    const order = await this.getOrCreateCart(userId);
    return this.toResponse(order);
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    if (!product.isActive) {
      throw new BadRequestException('Sản phẩm hiện không kinh doanh');
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await this.prisma.orderItem.findUnique({
      where: {
        orderId_productId: { orderId: cart.id, productId: dto.productId },
      },
    });

    const nextQuantity = (existingItem?.quantity ?? 0) + dto.quantity;
    if (product.stock < nextQuantity) {
      throw new BadRequestException(
        `Chỉ còn ${product.stock} sản phẩm trong kho`,
      );
    }

    if (existingItem) {
      await this.prisma.orderItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity, price: product.price },
      });
    } else {
      await this.prisma.orderItem.create({
        data: {
          orderId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
          price: product.price,
        },
      });
    }

    await this.recalcTotal(cart.id);
    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.orderItem.findUnique({
      where: { orderId_productId: { orderId: cart.id, productId } },
    });
    if (!item) throw new NotFoundException('Sản phẩm không có trong giỏ hàng');

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (product && product.stock < dto.quantity) {
      throw new BadRequestException(
        `Chỉ còn ${product.stock} sản phẩm trong kho`,
      );
    }

    await this.prisma.orderItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    });

    await this.recalcTotal(cart.id);
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.prisma.orderItem.findUnique({
      where: { orderId_productId: { orderId: cart.id, productId } },
    });
    if (!item) throw new NotFoundException('Sản phẩm không có trong giỏ hàng');

    await this.prisma.orderItem.delete({ where: { id: item.id } });
    await this.recalcTotal(cart.id);
    return this.getCart(userId);
  }

  async checkout(userId: string, dto: CheckoutOrderDto) {
    const cart = await this.getOrCreateCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng đang trống');
    }

    // Validate stock before committing
    for (const item of cart.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm "${item.product.name}" không đủ hàng trong kho`,
        );
      }
    }

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      return tx.order.update({
        where: { id: cart.id },
        data: {
          status: OrderStatus.PENDING,
          paymentMethod: dto.paymentMethod,
          note: dto.note,
          shippingName: dto.shippingName,
          shippingPhone: dto.shippingPhone,
          shippingAddr: dto.shippingAddr,
        },
        include: ORDER_INCLUDE,
      });
    });

    return {
      data: this.toResponse(order),
      message: 'Đặt hàng thành công',
    };
  }

  // ---------- Order history ----------

  async findAllByUser(userId: string, query: QueryOrderDto) {
    const page = Number(query.currentPage) || 1;
    const size = Number(query.pageSize) || 10;
    const skip = (page - 1) * size;

    const where: Prisma.OrderWhereInput = {
      userId,
      status: query.status
        ? (query.status as OrderStatus)
        : { not: OrderStatus.CART },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: ORDER_INCLUDE,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: items.map((o) => this.toResponse(o)),
      pagination: buildPagination(total, page, size),
    };
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return this.toResponse(order);
  }

  // async payOrder(userId: string, id: string) {
  //   const order = await this.prisma.order.findFirst({ where: { id, userId } });
  //   if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
  //   if (order.status !== OrderStatus.CONFIRMED) {
  //     throw new BadRequestException(
  //       'Đơn hàng cần được xác nhận trước khi thanh toán',
  //     );
  //   }
  //   if (order.isPaid) {
  //     throw new BadRequestException('Đơn hàng đã được thanh toán');
  //   }

  //   const updated = await this.prisma.order.update({
  //     where: { id },
  //     data: { isPaid: true, paidAt: new Date() },
  //     include: ORDER_INCLUDE,
  //   });

  //   return { data: this.toResponse(updated), message: 'Thanh toán thành công' };
  // }

  /**
   * Fetches an order and validates it's actually payable, before a
   * payment gateway URL is created. Throws if it doesn't belong to the
   * user, isn't confirmed yet, or has already been paid.
   */
  async getPayableOrder(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.paymentMethod === 'COD') {
      throw new BadRequestException(
        'Đơn hàng thanh toán khi nhận hàng (COD), không cần thanh toán online',
      );
    }
    if (order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        'Đơn hàng cần được xác nhận trước khi thanh toán',
      );
    }
    if (order.isPaid) {
      throw new BadRequestException('Đơn hàng đã được thanh toán');
    }
    return order;
  }

  /**
   * Marks an order as paid. Only ever called from the payments module
   * after a gateway signature has been verified (IPN, or a verified
   * return-URL as a fallback) — never directly from client input.
   */
  async markPaid(id: string, method: string, ref?: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.isPaid) return this.toResponse(order); // idempotent: IPN may fire more than once

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentMethod: method,
        paymentRef: ref,
      },
      include: ORDER_INCLUDE,
    });
    return this.toResponse(updated);
  }

  // ---------- Admin ----------

  async adminFindAll(query: AdminQueryOrderDto) {
    const page = Number(query.currentPage) || 1;
    const size = Number(query.pageSize) || 10;
    const skip = (page - 1) * size;

    const where: Prisma.OrderWhereInput = {
      status: query.status
        ? (query.status as OrderStatus)
        : { not: OrderStatus.CART },
      ...(query.search
        ? {
            OR: [
              { id: { contains: query.search, mode: 'insensitive' } },
              {
                user: {
                  fullName: { contains: query.search, mode: 'insensitive' },
                },
              },
              {
                user: {
                  email: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: ADMIN_ORDER_INCLUDE,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: items.map((o) => this.toResponse(o)),
      pagination: buildPagination(total, page, size),
    };
  }

  async adminFindOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ADMIN_ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return this.toResponse(order);
  }

  async adminMarkPaid(id: string) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (existing.status === OrderStatus.CART) {
      throw new BadRequestException(
        'Không thể xác nhận thanh toán cho giỏ hàng',
      );
    }
    if (existing.isPaid) {
      throw new BadRequestException('Đơn hàng đã được thanh toán');
    }

    await this.markPaid(id, existing.paymentMethod ?? 'BANK_TRANSFER');
    return {
      data: await this.adminFindOne(id),
      message: 'Đã xác nhận thanh toán',
    };
  }

  async adminUpdateStatus(id: string, status: OrderStatus) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (existing.status === OrderStatus.CART) {
      throw new BadRequestException('Không thể cập nhật trạng thái giỏ hàng');
    }
    const isCodAutoPay =
      status === OrderStatus.COMPLETED &&
      existing.paymentMethod === 'COD' &&
      !existing.isPaid;

    if (status === OrderStatus.COMPLETED && !existing.isPaid && !isCodAutoPay) {
      throw new BadRequestException(
        'Đơn hàng chưa được thanh toán, không thể hoàn tất',
      );
    }

    const statusData = isCodAutoPay
      ? { status, isPaid: true, paidAt: new Date() }
      : { status };

    const isCancelling =
      status === OrderStatus.CANCELLED &&
      existing.status !== OrderStatus.CANCELLED;

    if (isCancelling) {
      await this.prisma.$transaction([
        ...existing.items.map((item) =>
          this.prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              soldCount: { decrement: item.quantity },
            },
          }),
        ),
        this.prisma.order.update({ where: { id }, data: statusData }),
      ]);
    } else {
      await this.prisma.order.update({ where: { id }, data: statusData });
    }

    return {
      data: await this.adminFindOne(id),
      message: 'Đã cập nhật trạng thái đơn hàng',
    };
  }

  // ---------- Helpers ----------

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.order.findFirst({
      where: { userId, status: OrderStatus.CART },
      include: ORDER_INCLUDE,
    });

    if (!cart) {
      cart = await this.prisma.order.create({
        data: { userId, status: OrderStatus.CART },
        include: ORDER_INCLUDE,
      });
    }

    return cart;
  }

  private async recalcTotal(orderId: string) {
    const items = await this.prisma.orderItem.findMany({
      where: { orderId },
    });
    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    await this.prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: total },
    });
  }

  private toResponse(order: any) {
    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items?.map((item: any) => ({
        ...item,
        price: Number(item.price),
        product: item.product
          ? {
              ...item.product,
              price: Number(item.product.price),
              originalPrice:
                item.product.originalPrice !== null &&
                item.product.originalPrice !== undefined
                  ? Number(item.product.originalPrice)
                  : undefined,
            }
          : undefined,
      })),
    };
  }
}
