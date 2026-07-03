import type { Pagination } from "../common/pagination";
import type { Brand } from "./brand";
import type { Category } from "./category";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  images: string[] | null;
  categoryId: string;
  brandId: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isActive: boolean;
  featured: boolean;
  stock: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
  brand: Brand;
}

export interface ProductPayload {
  name: string;
  slug?: string;
  description?: string;
  image: string;
  images?: string[];
  categoryId: string;
  brandId: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isActive?: boolean;
  featured?: boolean;
}

export interface ProductFilterState {
  search: string;
  category: string;
  sort: SortOption;
  priceMin: number | null;
  priceMax: number | null;
  minRating: number | null;
  brands: string[];
  inStockOnly: boolean;
}

export interface ProductResponse {
  data: Product[];
  pagination?: Pagination;
  message?: string;
}

export interface ProductFormValues {
  name: string;
  description: string;
  image: string;
  category: string;
  brand: string;
  price: string;
  stock: string;
  originalPrice: string;
  rating: string;
  reviewCount: string;
  isNew: boolean;
  isActive: boolean;
  featured: boolean;
}

export type FormErrors = Partial<Record<keyof ProductFormValues, string>>;

export type SortOption =
  | "popular"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating";

export interface BannerSlide {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  theme: "indigo" | "amber" | "emerald";
}
