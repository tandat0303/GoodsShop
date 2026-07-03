import { useCallback, useEffect, useState } from "react";
import * as yup from "yup";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageOff,
  Package,
  Star,
  TriangleAlert,
} from "lucide-react";
import { AppAlert } from "../../../../components/ui/AppAlert";
import { getApiErrorMessage } from "../../../../libs/helper";
import { PAGE_SIZE, REQUIRED_MESSAGE } from "../../../../libs/constance";
import productApi from "../../../../api/features/product";
import categoryApi from "../../../../api/features/category";
import brandApi from "../../../../api/features/brand";
import ProductDetail from "./ProductDetail";
import ProductForm from "./ProductForm";
import type {
  FormErrors,
  Product,
  ProductFormValues,
} from "../../../../types/features/product";
import type { Category } from "../../../../types/features/category";
import type { Brand } from "../../../../types/features/brand";

const EMPTY_FORM: ProductFormValues = {
  name: "",
  image: "",
  category: "",
  brand: "",
  price: "",
  originalPrice: "",
  description: "",
  stock: "",
  rating: "",
  reviewCount: "",
  isNew: false,
  isActive: false,
  featured: false,
};

const productSchema = yup.object({
  name: yup.string().required(REQUIRED_MESSAGE),
  image: yup
    .string()
    .required(REQUIRED_MESSAGE)
    .url("Đường dẫn ảnh không hợp lệ"),
  category: yup.string().required(REQUIRED_MESSAGE),
  brand: yup.string().required(REQUIRED_MESSAGE),
  price: yup
    .string()
    .required(REQUIRED_MESSAGE)
    .test("is-number", "Giá không hợp lệ", (v) => !!v && Number(v) > 0),
  originalPrice: yup
    .string()
    .test("is-number", "Giá gốc không hợp lệ", (v) => !v || Number(v) >= 0)
    .test("gt-price", "Giá gốc phải lớn hơn hoặc bằng giá bán", function (v) {
      if (!v) return true;
      const { price } = this.parent;
      return Number(v) >= Number(price || 0);
    }),
  description: yup.string(),
  stock: yup
    .string()
    .required(REQUIRED_MESSAGE)
    .test("is-number", "Số lượng không hợp lệ", (v) => !!v && Number(v) >= 0),
});

const formatVnd = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-slate-100 dark:bg-[#30363d] text-slate-300 dark:text-[#5a6478] shrink-0">
        <ImageOff size={16} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-100 dark:border-[#30363d]"
    />
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-slate-100 text-slate-500 dark:bg-[#30363d] dark:text-[#9aa4b2]"
      }`}
    >
      {isActive ? "Mở bán" : "Tạm dừng"}
    </span>
  );
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState<ProductFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts(
        page,
        PAGE_SIZE,
        search || undefined,
        categoryFilter === "all" ? undefined : categoryFilter,
        stockFilter === "all" ? undefined : stockFilter === "in",
      );
      setProducts(res?.data ?? []);
      setTotal(res?.pagination?.total ?? 0);
    } catch (err) {
      AppAlert({
        icon: "error",
        title:
          (await getApiErrorMessage(err)) || "Không thể tải danh sách sản phẩm",
      });
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, stockFilter, page]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryApi.getCategories(1, 100);
      setCategories(res?.data ?? []);
    } catch (err) {
      AppAlert({
        icon: "error",
        title:
          (await getApiErrorMessage(err)) || "Không thể tải danh sách danh mục",
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    setBrandsLoading(true);
    try {
      const res = await brandApi.getBrands(1, 100);
      setBrands(res?.data ?? []);
    } catch (err) {
      AppAlert({
        icon: "error",
        title:
          (await getApiErrorMessage(err)) ||
          "Không thể tải danh sách thương hiệu",
      });
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openCreateModal = () => {
    setModalMode("create");
    setEditingProduct(null);
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode("edit");
    setEditingProduct(product);
    setFormValues({
      name: product.name,
      image: product.image,
      category: product.category.id,
      brand: product.brand.id,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      description: product.description ?? "",
      stock: String(product.stock ?? ""),
      rating: String(product.rating ?? ""),
      reviewCount: String(product.reviewCount ?? ""),
      isNew: product.isNew,
      isActive: product.isActive,
      featured: product.featured,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleFieldChange = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      await productSchema.validate(formValues, { abortEarly: false });
      setFormErrors({});
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: FormErrors = {};
        err.inner.forEach((e) => {
          if (e.path && !fieldErrors[e.path as keyof ProductFormValues]) {
            fieldErrors[e.path as keyof ProductFormValues] = e.message;
          }
        });
        setFormErrors(fieldErrors);
      }
      return;
    }

    const payload = {
      name: formValues.name,
      image: formValues.image,
      categoryId: formValues.category,
      brandId: formValues.brand,
      price: Number(formValues.price),
      originalPrice: formValues.originalPrice
        ? Number(formValues.originalPrice)
        : undefined,
      description: formValues.description,
      stock: Number(formValues.stock),
      rating: Number(formValues.rating),
      reviewCount: Number(formValues.reviewCount),
      isNew: formValues.isNew,
      isActive: formValues.isActive,
      featured: formValues.featured,
    };

    setSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await productApi.createProduct(payload);
        AppAlert({
          icon: "success",
          title: res?.message || "Đã thêm sản phẩm",
        });
      } else if (editingProduct) {
        const res = await productApi.updateProduct(editingProduct.id, payload);
        AppAlert({
          icon: "success",
          title: res?.message || "Đã cập nhật sản phẩm",
        });
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Thao tác thất bại",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await productApi.removeProduct(deleteTarget.id);
      AppAlert({ icon: "success", title: res?.message || "Đã xóa sản phẩm" });
      setDeleteTarget(null);
      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchProducts();
      }
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Không thể xóa sản phẩm",
      });
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    "h-10 rounded-lg border bg-white dark:bg-[#161b26] px-3.5 text-sm text-slate-700 dark:text-[#e6e9ef] placeholder:text-slate-300 dark:placeholder:text-[#5a6478] outline-none transition-colors focus:ring-2 focus:ring-offset-0 border-slate-200 dark:border-[#30363d] focus:border-[#EF4444] focus:ring-[#EF4444]/20 w-full";

  return (
    <div className="bg-white dark:bg-[#1c2333] rounded-2xl border border-slate-100 dark:border-[#30363d] p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-[#e6e9ef]">
            Quản lý sản phẩm
          </h1>
          <p className="text-xs text-slate-400 dark:text-[#8b95a8] mt-0.5">
            {total} sản phẩm
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#EF4444] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <Plus size={16} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="flex flex-wrap items-center mb-4 gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-[#5a6478]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className={`${inputClass} min-w-64 pl-9`}
            style={{ width: 260 }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className={`${inputClass} cursor-pointer`}
          style={{ width: 170 }}
          disabled={categoriesLoading}
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => {
            setStockFilter(e.target.value as "all" | "in" | "out");
            setPage(1);
          }}
          className={`${inputClass} cursor-pointer`}
          style={{ width: 150 }}
        >
          <option value="all">Tất cả tồn kho</option>
          <option value="in">Còn hàng</option>
          <option value="out">Hết hàng</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-[#30363d]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#161b26] text-left">
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Sản phẩm
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Danh mục / Thương hiệu
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Giá
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Đánh giá
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Số tồn
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Đã bán
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-4 py-3.5">
                    <div className="h-4 rounded bg-slate-100 dark:bg-[#30363d] animate-pulse" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-[#5a6478]">
                    <Package size={28} />
                    <span className="text-[13px]">
                      Không tìm thấy sản phẩm nào
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const hasDiscount =
                  !!p.originalPrice && p.originalPrice > p.price;
                const discountPercent = hasDiscount
                  ? Math.round(100 - (p.price / p.originalPrice!) * 100)
                  : 0;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#161b26]/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumb src={p.image} alt={p.name} />
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-medium text-slate-700 dark:text-[#e6e9ef] truncate max-w-56">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-[#6e7681]">
                              #{p.id}
                            </span>
                          </div>
                          {p.isNew && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#EF4444]/10 text-[#EF4444]">
                              MỚI
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-[#9aa4b2]">
                      <div className="flex flex-col">
                        <span>{p.category.name}</span>
                        <span className="text-[11px] text-slate-400 dark:text-[#6e7681]">
                          {p.brand.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 dark:text-[#e6e9ef]">
                          {formatVnd(p.price)}
                        </span>
                        {hasDiscount && (
                          <span className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 dark:text-[#6e7681] line-through">
                              {formatVnd(p.originalPrice!)}
                            </span>
                            <span className="text-[10px] font-bold text-[#EF4444]">
                              -{discountPercent}%
                            </span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-[#9aa4b2]">
                        <Star
                          size={13}
                          className="text-amber-400 fill-amber-400"
                        />
                        <span className="font-medium text-slate-700 dark:text-[#e6e9ef]">
                          {p.rating.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-[#6e7681]">
                          ({p.reviewCount})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-[#9aa4b2]">
                      {p.stock.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-[#9aa4b2]">
                      {p.soldCount.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={p.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingProduct(p)}
                          aria-label="Xem chi tiết"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-[#8b95a8] cursor-pointer transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          aria-label="Sửa"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-[#8b95a8] cursor-pointer transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          aria-label="Xóa"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-[#8b95a8] cursor-pointer transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-slate-400 dark:text-[#8b95a8]">
            Trang {page}/{totalPages} · {total} kết quả
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b26] text-slate-500 dark:text-[#9aa4b2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b26] text-slate-500 dark:text-[#9aa4b2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <ProductForm
          mode={modalMode}
          editingProduct={editingProduct}
          formValues={formValues}
          formErrors={formErrors}
          categories={categories}
          categoriesLoading={categoriesLoading}
          brands={brands}
          brandsLoading={brandsLoading}
          submitting={submitting}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c2333] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500">
                <TriangleAlert size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#e6e9ef]">
                  Xóa sản phẩm này?
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#8b95a8] mt-1.5">
                  "{deleteTarget.name}" sẽ bị xóa vĩnh viễn. Hành động này không
                  thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="h-10 px-4 rounded-lg text-sm font-semibold text-slate-500 dark:text-[#9aa4b2] bg-slate-100 dark:bg-[#30363d] border-none cursor-pointer hover:opacity-90 disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 h-10 px-4 rounded-lg text-sm font-semibold text-white bg-red-600 border-none cursor-pointer hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingProduct && (
        <ProductDetail
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />
      )}
    </div>
  );
}
