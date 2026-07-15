import {
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from '../../decorators/publicURL';

// IMPORTANT: "/return" and "/ipn" routes below are called directly by
// VNPay (browser redirect or server-to-server), never by our own
// frontend — they must stay PUBLIC. If your app applies a global auth
// guard, add these two paths to its exclusion list. The "/create"
// route DOES need the logged-in user (req.user.id).
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ---------- VNPay ----------

  @Post('vnpay/create')
  createVnpay(
    @Req() req: any,
    @Body() dto: CreatePaymentDto,
    @Ip() ip: string,
  ) {
    return this.paymentsService.createVnpayPayment(
      req.user.id,
      dto.orderId,
      ip,
    );
  }

  @Public()
  @Get('vnpay/return')
  async vnpayReturn(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const { success, orderId } =
      await this.paymentsService.handleVnpayCallback(query);
    return res.redirect(
      this.paymentsService.frontendResultUrl(orderId, success),
    );
  }

  @Get('vnpay/ipn')
  async vnpayIpn(@Query() query: Record<string, string>) {
    const { verified, success } =
      await this.paymentsService.handleVnpayCallback(query);
    if (!verified) return { RspCode: '97', Message: 'Invalid signature' };
    return success
      ? { RspCode: '00', Message: 'Confirm Success' }
      : { RspCode: '02', Message: 'Payment failed' };
  }
}
