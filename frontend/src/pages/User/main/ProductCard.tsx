import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "../../../types/features/product";
import { useState } from "react";
import { formatVnd } from "../../../libs/helper";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const inStock = product.stock > 0;
  const discount = product.originalPrice
    ? Math.round(100 - (product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-[#1a1d24]">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-white/5">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
              MỚI
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-white">
              Hết hàng
            </span>
          )}
        </div>

        <button
          onClick={() => setWishlisted((w) => !w)}
          aria-label="Yêu thích"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow transition-colors hover:text-red-500 dark:bg-[#161b22]/90 dark:text-slate-300 cursor-pointer"
        >
          <Heart
            size={15}
            className={wishlisted ? "fill-red-500 text-red-500" : ""}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {product.brand.name}
        </span>
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-800 dark:text-white">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {product.rating}
          </span>
          <span>({product.reviewCount})</span>
          <span className="mx-0.5">·</span>
          <span>Đã bán {product.soldCount}</span>
        </div>

        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-indigo-600 dark:text-indigo-400">
            {formatVnd(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] text-slate-400 line-through">
              {formatVnd(product.originalPrice)}
            </span>
          )}
        </div>

        <button
          disabled={!inStock}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-indigo-500 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-white/10 dark:disabled:text-slate-500 cursor-pointer"
        >
          <ShoppingCart size={14} />
          {inStock ? "Thêm vào giỏ" : "Hết hàng"}
        </button>
      </div>
    </div>
  );
}
