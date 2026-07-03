import type { Pagination } from "../common/pagination";

export interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  data: Category[];
  pagination?: Pagination;
  message?: string;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
}

export type FormErrors = Partial<Record<keyof CategoryFormValues, string>>;
