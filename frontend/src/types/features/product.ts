export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  soldCount: number;
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
