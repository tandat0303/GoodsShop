import type { Pagination } from "../common/pagination";

export interface Brand {
  id: string;
  name: string;
  logo?: string | null;
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface BrandResponse {
  data: Brand[];
  pagination?: Pagination;
  message?: string;
}

export interface BrandPayload {
  name: string;
  logo?: string;
}

export interface BrandFormValues {
  name: string;
  logo: string;
}

export type FormErrors = Partial<Record<keyof BrandFormValues, string>>;
