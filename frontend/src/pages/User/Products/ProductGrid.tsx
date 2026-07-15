import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import type { Product } from "../../../types/features/product";
import ProductCard from "../main/ProductCard";

interface ProductGridProps {
  loading: boolean;
  items: Product[];
  pageSize: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductGrid({
  loading,
  items,
  pageSize,
  page,
  totalPages,
  onPageChange,
}: ProductGridProps) {
  if (loading) {
    return (
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
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-16 text-slate-400 dark:border-white/10">
        <PackageSearch size={28} />
        <span className="text-sm">Không tìm thấy sản phẩm phù hợp</span>
        <span className="text-[12px] text-slate-300 dark:text-slate-600">
          Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Trang trước"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-white/10 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                n === page
                  ? "bg-indigo-500 text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Trang sau"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-white/10 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
