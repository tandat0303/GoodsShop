export const VNP_CONFIG = {
  tmnCode: process.env.VNP_TMN_CODE ?? '',
  hashSecret: process.env.VNP_HASH_SECRET ?? '',
  url:
    process.env.VNP_URL ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl:
    process.env.VNP_RETURN_URL ?? 'http://localhost:8080/payments/vnpay/return',
};

export const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
