import apiClient from "../apiClient";

const paymentApi = {
  createVnpayPayment: async (
    orderId: string,
  ): Promise<{ paymentUrl: string }> => {
    const res = await apiClient.post("/payments/vnpay/create", { orderId });
    return res.data;
  },
};

export default paymentApi;
