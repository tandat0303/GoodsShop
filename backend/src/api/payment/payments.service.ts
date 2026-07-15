import { Injectable } from '@nestjs/common';
import { OrdersService } from '../order/orders.service';
import { buildVnpSignData, signVnp } from '../../utils/vnpay';
import { FRONTEND_URL, VNP_CONFIG } from '../../libs/constance';
import { formatVnpDate } from '../../libs/helper';

@Injectable()
export class PaymentsService {
  constructor(private readonly ordersService: OrdersService) {}

  async createVnpayPayment(userId: string, orderId: string, ipAddr: string) {
    const order = await this.ordersService.getPayableOrder(userId, orderId);

    const params: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: VNP_CONFIG.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: `${order.id}-${Date.now()}`,
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(Number(order.totalAmount) * 100),
      vnp_ReturnUrl: VNP_CONFIG.returnUrl,
      vnp_IpAddr: ipAddr || '127.0.0.1',
      vnp_CreateDate: formatVnpDate(new Date()),
    };

    const signData = buildVnpSignData(params);
    const secureHash = signVnp(signData, VNP_CONFIG.hashSecret);

    return {
      paymentUrl: `${VNP_CONFIG.url}?${signData}&vnp_SecureHash=${secureHash}`,
    };
  }

  async handleVnpayCallback(query: Record<string, string>) {
    const { vnp_SecureHash, vnp_SecureHashType, ...rest } = query;
    const signData = buildVnpSignData(rest);
    const expectedHash = signVnp(signData, VNP_CONFIG.hashSecret);

    if (!vnp_SecureHash || expectedHash !== vnp_SecureHash) {
      return {
        verified: false,
        success: false,
        orderId: null as string | null,
      };
    }

    const orderId = String(rest.vnp_TxnRef ?? '').split('-')[0] || null;
    const success = rest.vnp_ResponseCode === '00';

    if (success && orderId) {
      await this.ordersService.markPaid(
        orderId,
        'VNPAY',
        rest.vnp_TransactionNo,
      );
    }

    return { verified: true, success, orderId };
  }

  frontendResultUrl(orderId: string | null, success: boolean) {
    const status = success ? 'success' : 'failed';
    return `${FRONTEND_URL}/payment/result?status=${status}${
      orderId ? `&orderId=${orderId}` : ''
    }`;
  }
}
