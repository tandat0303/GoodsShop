import { X, Star } from "lucide-react";
import type { Product } from "../../../../types/features/product";
import { formatDate, formatVnd } from "../../../../libs/helper";

export default function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const hasDiscount =
    !!product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(100 - (product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#1c2333] p-6 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800 dark:text-[#e6e9ef]">
            Chi tiết sản phẩm
          </h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-[#30363d] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Header: image + name + badges */}
        <div className="flex gap-4 mb-5">
          <img
            src={product.image}
            alt={product.name}
            className="w-28 h-28 rounded-xl object-cover border border-slate-100 dark:border-[#30363d] shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-1.5 mb-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-[#e6e9ef]">
                {product.name}
              </h3>
              {product.isNew && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#EF4444]/10 text-[#EF4444]">
                  MỚI
                </span>
              )}
              {product.featured && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  NỔI BẬT
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mb-1.5 truncate">
              #{product.id} · /{product.slug}
            </p>
            <div className="flex items-center gap-1 text-slate-500 dark:text-[#9aa4b2] mb-2">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="font-medium text-slate-700 dark:text-[#e6e9ef]">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-[#6e7681]">
                ({product.reviewCount} đánh giá) · Đã bán{" "}
                {product.soldCount.toLocaleString("vi-VN")}
              </span>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                product.isActive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-[#30363d] dark:text-[#9aa4b2]"
              }`}
            >
              {product.isActive ? "Mở bán" : "Tạm dừng"} · Tồn kho{" "}
              {product.stock.toLocaleString("vi-VN")}
            </span>
          </div>
        </div>

        {/* Category / Brand */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="col-span-2 rounded-xl border border-slate-100 dark:border-[#30363d] p-3 flex items-center gap-2">
            {product.brand.logo && (
              <img
                src={product.brand.logo}
                alt={product.brand.name}
                className="h-28 w-28 rounded-lg object-cover shrink-0 border border-slate-100 dark:border-[#30363d]"
              />
            )}
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mb-1">
                Thương hiệu
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-[#e6e9ef] truncate">
                {product.brand.name}
              </p>
            </div>
          </div>
          <div className="col-span-1 rounded-xl border border-slate-100 dark:border-[#30363d] p-3 flex items-center">
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mb-1">
                Danh mục
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-[#e6e9ef] truncate">
                {product.category.name}
              </p>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="rounded-xl border border-slate-100 dark:border-[#30363d] p-3 mb-4">
          <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mb-1.5">
            Giá bán
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-slate-800 dark:text-[#e6e9ef]">
              {formatVnd(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-slate-400 dark:text-[#6e7681] line-through">
                  {formatVnd(product.originalPrice!)}
                </span>
                <span className="text-[11px] font-bold text-[#EF4444]">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mb-4">
            <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mb-1.5">
              Mô tả
            </p>
            <p className="text-sm text-slate-600 dark:text-[#cdd5e0] leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-[#6e7681] pt-3 border-t border-slate-100 dark:border-[#30363d]">
          <span>Tạo lúc: {formatDate(product.createdAt)}</span>
          <span>Cập nhật: {formatDate(product.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
