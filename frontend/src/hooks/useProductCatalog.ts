import { useEffect, useMemo, useState } from "react";
import type { Product, ProductFilterState } from "../types/features/product";
import type { Category } from "../types/features/category";
import type { Brand } from "../types/features/brand";
import productApi from "../api/features/product";
import categoryApi from "../api/features/category";
import brandApi from "../api/features/brand";
import { AppAlert } from "../components/ui/AppAlert";
import { getApiErrorMessage } from "../libs/helper";
import { CATALOG_FETCH_SIZE, INITIAL_FILTERS } from "../libs/constance";

export function useProductCatalog(pageSize: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ProductFilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProducts(1, CATALOG_FETCH_SIZE);
        const active = (res?.data ?? []).filter((p: Product) => p.isActive);
        setProducts(active);
      } catch (err) {
        AppAlert({
          icon: "error",
          title:
            (await getApiErrorMessage(err)) ||
            "Không thể tải danh sách sản phẩm",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    categoryApi
      .getCategories(1, 100)
      .then((res) => setCategories(res?.data ?? []))
      .catch(() => setCategories([]));
    brandApi
      .getBrands(1, 100)
      .then((res) => setBrands(res?.data ?? []))
      .catch(() => setBrands([]));
  }, []);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (
        filters.search &&
        !p.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.category !== "all" && p.category.id !== filters.category)
        return false;
      if (filters.priceMin !== null && p.price < filters.priceMin) return false;
      if (filters.priceMax !== null && p.price > filters.priceMax) return false;
      if (filters.minRating !== null && p.rating < filters.minRating)
        return false;
      if (filters.brands.length > 0 && !filters.brands.includes(p.brand.id))
        return false;
      if (filters.inStockOnly && p.stock <= 0) return false;
      return true;
    });

    switch (filters.sort) {
      case "price_asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result = [...result].sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      default:
        result = [...result].sort((a, b) => b.soldCount - a.soldCount);
    }
    return result;
  }, [products, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const updateFilters = (next: ProductFilterState) => {
    setFilters(next);
    setPage(1);
  };

  return {
    loading,
    categories,
    brands,
    filters,
    updateFilters,
    filteredCount: filtered.length,
    pageItems,
    page: currentPage,
    setPage,
    totalPages,
  };
}
