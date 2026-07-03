import type {
  ProductPayload,
  ProductResponse,
} from "../../types/features/product";
import apiClient from "../apiClient";

const productApi = {
  getProducts: async (
    currentPage: number,
    pageSize: number,
    search?: string,
    categoryFilter?: string,
    stockFilter?: boolean,
  ): Promise<ProductResponse> => {
    const params: Record<string, any> = { currentPage, pageSize };
    if (search) params.search = search;
    if (categoryFilter) params.categoryId = categoryFilter;
    if (stockFilter !== undefined) params.inStock = stockFilter;
    const res = await apiClient.get("/products", { params });
    return res.data;
  },

  createProduct: async (payload: ProductPayload): Promise<ProductResponse> => {
    const res = await apiClient.post("/products", payload);
    return res.data;
  },

  updateProduct: async (
    id: string,
    payload: ProductPayload,
  ): Promise<ProductResponse> => {
    const res = await apiClient.patch(`/products/${id}`, payload);
    return res.data;
  },

  removeProduct: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },
};

export default productApi;
