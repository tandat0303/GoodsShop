import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import type {
  Product,
  ProductFilterState,
} from "../../../types/features/product";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import { FEATURED_FETCH_SIZE, INITIAL_FILTERS } from "../../../libs/constance";
import productApi from "../../../api/features/product";
import { AppAlert } from "../../../components/ui/AppAlert";
import { getApiErrorMessage } from "../../../libs/helper";

interface ProductListProps {
  pageSize?: number;
}

export default function ProductList({ pageSize = 8 }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ProductFilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const res = await productApi.getProducts(1, FEATURED_FETCH_SIZE);
        const featured = (res?.data ?? []).filter(
          (p: Product) => p.featured && p.isActive,
        );
        setProducts(featured);
      } catch (err) {
        AppAlert({
          icon: "error",
          title:
            (await getApiErrorMessage(err)) ||
            "Không thể tải danh sách sản phẩm nổi bật",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
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

  const handleFiltersChange = (next: ProductFilterState) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
            Sản phẩm nổi bật
          </h2>
          <p className="text-[13px] text-slate-400">
            Chọn lọc từ hàng nghìn sản phẩm chất lượng
          </p>
        </div>
      </div>

      <ProductFilters
        filters={filters}
        onChange={handleFiltersChange}
        resultCount={filtered.length}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-[3/4.2] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#1a1d24]"
            >
              <div className="aspect-square w-full animate-pulse bg-slate-100 dark:bg-white/5" />
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                <div className="h-3.5 w-full animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : pageItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-16 text-slate-400 dark:border-white/10">
          <PackageSearch size={28} />
          <span className="text-sm">Không tìm thấy sản phẩm phù hợp</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {pageItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-white/10 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                n === currentPage
                  ? "bg-indigo-500 text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-white/10 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
