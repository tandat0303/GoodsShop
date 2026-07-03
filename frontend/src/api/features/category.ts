import type {
  CategoryPayload,
  CategoryResponse,
} from "../../types/features/category";
import apiClient from "../apiClient";

const categoryApi = {
  getCategories: async (
    currentPage: number,
    pageSize: number,
    search?: string,
  ): Promise<CategoryResponse> => {
    const params: Record<string, any> = { currentPage, pageSize };
    if (search) params.search = search;
    const res = await apiClient.get("/categories", { params });
    return res.data;
  },

  createCategory: async (
    payload: CategoryPayload,
  ): Promise<CategoryResponse> => {
    const res = await apiClient.post("/categories", payload);
    return res.data;
  },

  updateCategory: async (
    id: string,
    payload: CategoryPayload,
  ): Promise<CategoryResponse> => {
    const res = await apiClient.patch(`/categories/${id}`, payload);
    return res.data;
  },

  removeCategory: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/categories/${id}`);
    return res.data;
  },
};

export default categoryApi;
