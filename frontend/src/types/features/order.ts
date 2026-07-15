import type { Product } from "./product";

export type OrderStatus =
  | "CART"
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  isPaid: boolean;
  paidAt?: string | null;
  paymentMethod?: string | null;
  paymentRef?: string | null;
  totalAmount: number;
  note?: string | null;
  shippingName?: string | null;
  shippingPhone?: string | null;
  shippingAddr?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderCustomer {
  id: string;
  fullName: string;
  email: string;
}

export interface AdminOrder extends Order {
  user: OrderCustomer;
}

export interface CheckoutPayload {
  paymentMethod: "COD" | "VNPAY" | "BANK_TRANSFER";
  note?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddr?: string;
}

export interface OrderListResponse {
  data: Order[];
  pagination: {
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface AdminOrderListResponse {
  data: AdminOrder[];
  pagination: {
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}
