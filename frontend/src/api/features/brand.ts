import type { BrandPayload, BrandResponse } from "../../types/features/brand";
import apiClient from "../apiClient";

const brandApi = {
  getBrands: async (
    currentPage: number,
    pageSize: number,
    search?: string,
  ): Promise<BrandResponse> => {
    const params: Record<string, any> = { currentPage, pageSize };
    if (search) params.search = search;
    const res = await apiClient.get("/brands", { params });
    return res.data;
  },

  createBrand: async (payload: BrandPayload): Promise<BrandResponse> => {
    const res = await apiClient.post("/brands", payload);
    return res.data;
  },

  updateBrand: async (
    id: string,
    payload: BrandPayload,
  ): Promise<BrandResponse> => {
    const res = await apiClient.patch(`/brands/${id}`, payload);
    return res.data;
  },

  removeBrand: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/brands/${id}`);
    return res.data;
  },
};

export default brandApi;
