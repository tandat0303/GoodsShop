import { useState } from "react";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import type {
  ProductFilterState,
  SortOption,
} from "../../../types/features/product";
import { BRANDS, CATEGORIES, SORT_OPTIONS } from "../../../libs/constance";

interface ProductFiltersProps {
  filters: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  resultCount: number;
}

export default function ProductFilters({
  filters,
  onChange,
  resultCount,
}: ProductFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const set = <K extends keyof ProductFilterState>(
    key: K,
    value: ProductFilterState[K],
  ) => onChange({ ...filters, [key]: value });

  const toggleBrand = (brand: string) => {
    const has = filters.brands.includes(brand);
    set(
      "brands",
      has
        ? filters.brands.filter((b) => b !== brand)
        : [...filters.brands, brand],
    );
  };

  const activeAdvancedCount =
    (filters.priceMin !== null ? 1 : 0) +
    (filters.priceMax !== null ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    filters.brands.length +
    (filters.inStockOnly ? 1 : 0);

  const resetAdvanced = () =>
    onChange({
      ...filters,
      priceMin: null,
      priceMax: null,
      minRating: null,
      brands: [],
      inStockOnly: false,
    });

  return (
    <div className="flex flex-col gap-3">
      {/* Basic filters */}
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
          onClick={() => setAdvancedOpen((o) => !o)}
          className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            advancedOpen || activeAdvancedCount > 0
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
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => set("category", cat)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
              filters.category === cat
                ? "bg-indigo-500 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Advanced filters panel */}
      {advancedOpen && (
        <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3 dark:border-white/10 dark:bg-[#1a1d24]">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
              Khoảng giá (đ)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                placeholder="Từ"
                value={filters.priceMin ?? ""}
                onChange={(e) =>
                  set(
                    "priceMin",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-400 dark:border-white/10 dark:text-white"
              />
              <span className="text-slate-300">–</span>
              <input
                type="number"
                min={0}
                placeholder="Đến"
                value={filters.priceMax ?? ""}
                onChange={(e) =>
                  set(
                    "priceMax",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-indigo-400 dark:border-white/10 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
              Đánh giá tối thiểu
            </span>
            <div className="flex items-center gap-1.5">
              {[5, 4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    set("minRating", filters.minRating === r ? null : r)
                  }
                  className={`flex items-center gap-0.5 rounded-full border px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                    filters.minRating === r
                      ? "border-amber-400 bg-amber-400/10 text-amber-500"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  {r}
                  <Star size={11} className="fill-current" />
                </button>
              ))}
            </div>
            <label className="mt-1 flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => set("inStockOnly", e.target.checked)}
                className="h-3.5 w-3.5 accent-indigo-500"
              />
              Chỉ hiện còn hàng
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
              Thương hiệu
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`rounded-full border px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                    filters.brands.includes(brand)
                      ? "border-indigo-400 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {activeAdvancedCount > 0 && (
            <button
              onClick={resetAdvanced}
              className="flex w-fit items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-red-500 sm:col-span-3 cursor-pointer"
            >
              <X size={13} />
              Xóa bộ lọc nâng cao
            </button>
          )}
        </div>
      )}

      <span className="text-[12px] text-slate-400">
        {resultCount} sản phẩm được tìm thấy
      </span>
    </div>
  );
}
