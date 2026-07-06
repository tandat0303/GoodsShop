import type {
  AdminOrder,
  AdminOrderListResponse,
  CheckoutPayload,
  Order,
  OrderListResponse,
  OrderStatus,
} from "../../types/features/order";
import apiClient from "../apiClient";

const orderApi = {
  getCart: async (): Promise<Order> => {
    const res = await apiClient.get("/orders/cart");
    return res.data;
  },

  addToCart: async (productId: string, quantity = 1): Promise<Order> => {
    const res = await apiClient.post("/orders/cart/items", {
      productId,
      quantity,
    });
    return res.data;
  },

  updateCartItem: async (
    productId: string,
    quantity: number,
  ): Promise<Order> => {
    const res = await apiClient.patch(`/orders/cart/items/${productId}`, {
      quantity,
    });
    return res.data;
  },

  removeCartItem: async (productId: string): Promise<Order> => {
    const res = await apiClient.delete(`/orders/cart/items/${productId}`);
    return res.data;
  },

  checkout: async (
    payload?: CheckoutPayload,
  ): Promise<{ data: Order; message: string }> => {
    const res = await apiClient.post("/orders/cart/checkout", payload ?? {});
    return res.data;
  },

  getOrders: async (
    currentPage: number,
    pageSize: number,
    status?: string,
  ): Promise<OrderListResponse> => {
    const params: Record<string, any> = { currentPage, pageSize };
    if (status) params.status = status;
    const res = await apiClient.get("/orders", { params });
    return res.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },

  pay: async (id: string): Promise<{ data: Order; message: string }> => {
    const res = await apiClient.post(`/orders/${id}/pay`);
    return res.data;
  },

  adminGetOrders: async (
    currentPage: number,
    pageSize: number,
    search?: string,
    status?: string,
  ): Promise<AdminOrderListResponse> => {
    const params: Record<string, any> = { currentPage, pageSize };
    if (search) params.search = search;
    if (status) params.status = status;
    const res = await apiClient.get("/orders/admin", { params });
    return res.data;
  },

  adminGetOrder: async (id: string): Promise<AdminOrder> => {
    const res = await apiClient.get(`/orders/admin/${id}`);
    return res.data;
  },

  adminUpdateStatus: async (
    id: string,
    status: OrderStatus,
  ): Promise<{ data: AdminOrder; message: string }> => {
    const res = await apiClient.patch(`/orders/admin/${id}/status`, {
      status,
    });
    return res.data;
  },
};

export default orderApi;
