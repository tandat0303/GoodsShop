import { X, Star } from "lucide-react";
import type { ProductFilterState } from "../../../types/features/product";
import type { Brand } from "../../../types/features/brand";

interface FilterOverlayProps {
  open: boolean;
  onClose: () => void;
  filters: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  brands: Brand[];
}

export default function FilterOverlay({
  open,
  onClose,
  filters,
  onChange,
  brands,
}: FilterOverlayProps) {
  const set = <K extends keyof ProductFilterState>(
    key: K,
    value: ProductFilterState[K],
  ) => onChange({ ...filters, [key]: value });

  const toggleBrand = (id: string) => {
    const has = filters.brands.includes(id);
    set(
      "brands",
      has ? filters.brands.filter((b) => b !== id) : [...filters.brands, id],
    );
  };

  const activeCount =
    (filters.priceMin !== null ? 1 : 0) +
    (filters.priceMax !== null ? 1 : 0) +
    (filters.minRating !== null ? 1 : 0) +
    filters.brands.length +
    (filters.inStockOnly ? 1 : 0);

  const reset = () =>
    onChange({
      ...filters,
      priceMin: null,
      priceMax: null,
      minRating: null,
      brands: [],
      inStockOnly: false,
    });

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-100 bg-slate-900/50 backdrop-blur-[1px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bộ lọc nâng cao"
        className={`fixed inset-y-0 right-0 z-101 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#161b22] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              Bộ lọc nâng cao
            </h2>
            {activeCount > 0 && (
              <p className="text-[12px] text-indigo-500 dark:text-indigo-400">
                {activeCount} bộ lọc đang áp dụng
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng bộ lọc"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 dark:hover:bg-white/10 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-5 py-6">
          {/* Price range */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Khoảng giá (đ)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Từ"
                value={filters.priceMin ?? ""}
                onChange={(e) =>
                  set(
                    "priceMin",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 dark:border-white/10 dark:text-white"
              />
              <span className="shrink-0 text-slate-300">–</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="Đến"
                value={filters.priceMax ?? ""}
                onChange={(e) =>
                  set(
                    "priceMax",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400 dark:border-white/10 dark:text-white"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Đánh giá tối thiểu
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[5, 4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    set("minRating", filters.minRating === r ? null : r)
                  }
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                    filters.minRating === r
                      ? "border-amber-400 bg-amber-400/10 text-amber-500"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  {r}
                  <Star size={11} className="fill-current" />
                  trở lên
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          {brands.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Thương hiệu
              </span>
              <div className="flex flex-wrap gap-1.5">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => toggleBrand(brand.id)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                      filters.brands.includes(brand.id)
                        ? "border-indigo-400 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* In stock */}
          <label className="flex items-center gap-2.5 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => set("inStockOnly", e.target.checked)}
              className="h-4 w-4 accent-indigo-500"
            />
            Chỉ hiện sản phẩm còn hàng
          </label>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-4 dark:border-white/10">
          <button
            onClick={reset}
            disabled={activeCount === 0}
            className="flex-1 rounded-full border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-indigo-500 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-indigo-400 cursor-pointer"
          >
            Xem kết quả
          </button>
        </div>
      </div>
    </>
  );
}
