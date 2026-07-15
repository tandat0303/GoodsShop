import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { CurrentUser } from '../../decorators/getUser';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminQueryOrderDto } from './dto/admin-query-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('cart')
  getCart(@CurrentUser() req: any) {
    return this.ordersService.getCart(req.id);
  }

  @Post('cart/items')
  addItem(@CurrentUser() req: any, @Body() dto: AddToCartDto) {
    return this.ordersService.addItem(req.id, dto);
  }

  @Patch('cart/items/:productId')
  updateItem(
    @CurrentUser() req: any,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.ordersService.updateItem(req.id, productId, dto);
  }

  @Delete('cart/items/:productId')
  removeItem(@CurrentUser() req: any, @Param('productId') productId: string) {
    return this.ordersService.removeItem(req.id, productId);
  }

  @Post('cart/checkout')
  checkout(@CurrentUser() req: any, @Body() dto: CheckoutOrderDto) {
    return this.ordersService.checkout(req.id, dto);
  }

  @Get('admin')
  adminFindAll(@Query() query: AdminQueryOrderDto) {
    return this.ordersService.adminFindAll(query);
  }

  @Get('admin/:id')
  adminFindOne(@Param('id') id: string) {
    return this.ordersService.adminFindOne(id);
  }

  @Patch('admin/:id/mark-paid')
  adminMarkPaid(@Param('id') id: string) {
    return this.ordersService.adminMarkPaid(id);
  }

  @Patch('admin/:id/status')
  adminUpdateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.adminUpdateStatus(id, dto.status);
  }

  @Get()
  findAll(@CurrentUser() req: any, @Query() query: QueryOrderDto) {
    return this.ordersService.findAllByUser(req.id, query);
  }

  @Get(':id')
  findOne(@CurrentUser() req: any, @Param('id') id: string) {
    return this.ordersService.findOne(req.id, id);
  }

  // @Post(':id/pay')
  // pay(@CurrentUser() req: any, @Param('id') id: string) {
  //   return this.ordersService.payOrder(req.id, id);
  // }
}
