import { Search, SlidersHorizontal, X } from "lucide-react";
import type {
  ProductFilterState,
  SortOption,
} from "../../../types/features/product";
import type { Category } from "../../../types/features/category";
import type { Brand } from "../../../types/features/brand";
import { SORT_OPTIONS } from "../../../libs/constance";
import { formatVnd } from "../../../libs/helper";

interface ProductToolbarProps {
  filters: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  categories: Category[];
  brands: Brand[];
  resultCount: number;
  onOpenFilters: () => void;
}

export default function ProductToolbar({
  filters,
  onChange,
  categories,
  brands,
  resultCount,
  onOpenFilters,
}: ProductToolbarProps) {
  const set = <K extends keyof ProductFilterState>(
    key: K,
    value: ProductFilterState[K],
  ) => onChange({ ...filters, [key]: value });

  const activeAdvancedCount =
    (filters.priceMin !== null ? 1 : 0) +
    (filters.priceMax !== null ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    filters.brands.length +
    (filters.inStockOnly ? 1 : 0);

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.priceMin !== null || filters.priceMax !== null) {
    const label =
      filters.priceMin !== null && filters.priceMax !== null
        ? `${formatVnd(filters.priceMin)} – ${formatVnd(filters.priceMax)}`
        : filters.priceMin !== null
          ? `Từ ${formatVnd(filters.priceMin)}`
          : `Đến ${formatVnd(filters.priceMax as number)}`;
    chips.push({
      key: "price",
      label,
      onRemove: () => onChange({ ...filters, priceMin: null, priceMax: null }),
    });
  }

  if (filters.minRating !== null) {
    chips.push({
      key: "rating",
      label: `${filters.minRating}★ trở lên`,
      onRemove: () => set("minRating", null),
    });
  }

  filters.brands.forEach((brandId) => {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;
    chips.push({
      key: `brand-${brandId}`,
      label: brand.name,
      onRemove: () =>
        set(
          "brands",
          filters.brands.filter((b) => b !== brandId),
        ),
    });
  });

  if (filters.inStockOnly) {
    chips.push({
      key: "inStock",
      label: "Còn hàng",
      onRemove: () => set("inStockOnly", false),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search + sort + filter trigger */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 dark:border-white/10 dark:bg-[#1a1d24] dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <select
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value as SortOption)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-[#1a1d24] dark:text-slate-200 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={onOpenFilters}
          className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            activeAdvancedCount > 0
              ? "border-indigo-400 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
              : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          }`}
        >
          <SlidersHorizontal size={15} />
          Bộ lọc
          {activeAdvancedCount > 0 && (
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
              {activeAdvancedCount}
            </span>
          )}
        </button>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => set("category", "all")}
          className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
            filters.category === "all"
              ? "bg-indigo-500 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => set("category", cat.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
              filters.category === cat.id
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[12px] font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 cursor-pointer"
            >
              {chip.label}
              <X size={11} />
            </button>
          ))}
        </div>
      )}

      <span className="text-[12px] text-slate-400">
        {resultCount} sản phẩm được tìm thấy
      </span>
    </div>
  );
}
