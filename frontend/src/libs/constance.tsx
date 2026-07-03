import type {
  BannerSlide,
  ProductFilterState,
  SortOption,
} from "../types/features/product";
import type { Role } from "../types/features/user";

export const REQUIRED_MESSAGE = "Nhập cái này điiii >.<";

export const TIME_UPDATE_INTERVAL = 1000;

export const SIDEBAR_EXPANDED = 220;
export const SIDEBAR_COLLAPSED = 64;
export const EASING = "cubic-bezier(0.4,0,0.2,1)";
export const DURATION = "0.28s";

export const PAGE_SIZE = 10;

export const FEATURED_FETCH_SIZE = 100;

export const NAV_ITEMS = [{ path: "/", label: "Trang chủ" }];

export const LINK_COLUMNS: { title: string; links: string[] }[] = [
  { title: "Công ty", links: ["Về chúng tôi", "Tuyển dụng", "Liên hệ"] },
  {
    title: "Danh mục",
    links: ["Điện tử", "Thời trang", "Gia dụng", "Làm đẹp"],
  },
  {
    title: "Hỗ trợ khách hàng",
    links: ["Chính sách đổi trả", "Vận chuyển", "Câu hỏi thường gặp"],
  },
];

export const THEME_STYLES: Record<
  BannerSlide["theme"],
  { badge: string; button: string }
> = {
  indigo: {
    badge: "bg-indigo-500/15 text-indigo-200",
    button: "bg-indigo-500 hover:bg-indigo-400",
  },
  amber: {
    badge: "bg-amber-500/15 text-amber-200",
    button: "bg-amber-500 hover:bg-amber-400 text-slate-900",
  },
  emerald: {
    badge: "bg-emerald-500/15 text-emerald-200",
    button: "bg-emerald-500 hover:bg-emerald-400 text-slate-900",
  },
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá: Thấp đến cao" },
  { value: "price_desc", label: "Giá: Cao đến thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
];

export const INITIAL_FILTERS: ProductFilterState = {
  search: "",
  category: "all",
  sort: "popular",
  priceMin: null,
  priceMax: null,
  minRating: null,
  brands: [],
  inStockOnly: false,
};

export const ADMIN_PAGE_TITLES: Record<string, string> = {
  "/admin": "Trang chủ",
  "/admin/products-mgmt": "Sản phẩm",
  "/admin/categories-mgmt": "Danh mục",
  "/admin/brands-mgmt": "Thương hiệu",
  "/admin/users-mgmt": "Người dùng",
};

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "Người dùng" },
];

export const BANNER_SLIDES: BannerSlide[] = [
  {
    id: "banner-1",
    image:
      "https://images.unsplash.com/photo-1577538928305-3807c3993047?q=80w=1600&auto=format&fit=crop",
    eyebrow: "Ưu đãi mùa hè",
    title: "Giảm đến 90% cho đơn hàng đầu tiên 😌",
    subtitle: "Áp dụng cho toàn bộ danh mục.",
    ctaLabel: "Mua sắm ngay",
    ctaHref: "/products",
    theme: "indigo",
  },
  {
    id: "banner-2",
    image:
      "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1600&auto=format&fit=crop",
    eyebrow: "Siu ngonnn",
    title: "Thưởng thức các món ăn tại VeeAyy Food 🍴",
    subtitle: "Cập nhật món ăn đa dạng mỗi tuần.",
    ctaLabel: "Khám phá",
    ctaHref: "/products?category=veeayy-food",
    theme: "amber",
  },
  {
    id: "banner-3",
    image:
      "https://images.unsplash.com/photo-1607273685680-6bd976c5a5ce?q=80&w=1600&auto=format&fit=crop",
    eyebrow: "Miễn phí vận chuyển",
    title: "Freeship toàn khu vực chỉ từ 1 cái ôm 🫂",
    subtitle: "Giao hàng siêu tốc trong 24h tại nội thành.",
    ctaLabel: "Tìm hiểu thêm",
    ctaHref: "/shipping",
    theme: "emerald",
  },
];

export const CATEGORIES = [
  "Tất cả",
  "Điện tử",
  "Thời trang",
  "Gia dụng",
  "Làm đẹp",
  "Thể thao",
  "Sách",
];

export const BRANDS = ["Good's Shop", "UrbanLine", "Nova", "Kraft", "Studio 9"];
