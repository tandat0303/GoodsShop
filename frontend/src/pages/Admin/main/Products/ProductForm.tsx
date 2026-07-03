import { Loader2, X } from "lucide-react";
import ImageUploadField from "../../../../components/ImageUploadField";
import type {
  FormErrors,
  Product,
  ProductFormValues,
} from "../../../../types/features/product";
import type { Category } from "../../../../types/features/category";
import type { Brand } from "../../../../types/features/brand";

const inputClass =
  "h-10 rounded-lg border bg-white dark:bg-[#161b26] px-3.5 text-sm text-slate-700 dark:text-[#e6e9ef] placeholder:text-slate-300 dark:placeholder:text-[#5a6478] outline-none transition-colors focus:ring-2 focus:ring-offset-0 border-slate-200 dark:border-[#30363d] focus:border-[#EF4444] focus:ring-[#EF4444]/20 w-full";

function FormField({
  label,
  error,
  children,
  required = false,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-500 dark:text-[#8b95a8] tracking-wide mb-1.5">
        {label}{" "}
        {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none p-0"
    >
      <span
        className={`relative w-9.5 h-5.5 rounded-full transition-colors duration-200 ${
          checked ? "bg-[#EF4444]" : "bg-slate-200 dark:bg-[#30363d]"
        }`}
      >
        <span
          className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: checked ? "calc(100% - 20px)" : 2 }}
        />
      </span>
      <span className="text-sm text-slate-600 dark:text-[#cdd5e0]">
        {label}
      </span>
    </button>
  );
}

interface ProductFormProps {
  mode: "create" | "edit";
  editingProduct: Product | null;
  formValues: ProductFormValues;
  formErrors: FormErrors;
  categories: Category[];
  categoriesLoading: boolean;
  brands: Brand[];
  brandsLoading: boolean;
  submitting: boolean;
  onFieldChange: <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => void;
  onSubmit: React.SubmitEventHandler<HTMLFormElement>;
  onClose: () => void;
}

export default function ProductForm({
  mode,
  editingProduct,
  formValues,
  formErrors,
  categories,
  categoriesLoading,
  brands,
  brandsLoading,
  submitting,
  onFieldChange,
  onSubmit,
  onClose,
}: ProductFormProps) {
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#1c2333] p-6 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800 dark:text-[#e6e9ef]">
            {mode === "create" ? "Thêm sản phẩm" : "Sửa sản phẩm"}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-[#30363d] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6">
            {/* Left column */}
            <div>
              <FormField label="Ảnh sản phẩm" error={formErrors.image} required>
                <ImageUploadField
                  value={formValues.image}
                  onChange={(url) => onFieldChange("image", url)}
                />
              </FormField>

              <FormField label="Tên sản phẩm" error={formErrors.name} required>
                <input
                  value={formValues.name}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  placeholder="Tai nghe không dây NovaSound Pro"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Mô tả" error={formErrors.description}>
                <textarea
                  value={formValues.description}
                  onChange={(e) => onFieldChange("description", e.target.value)}
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  rows={5}
                  className={`${inputClass} h-auto py-2.5 resize-none`}
                />
              </FormField>
            </div>

            {/* Right column */}
            <div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Danh mục"
                  error={formErrors.category}
                  required
                >
                  <select
                    value={formValues.category}
                    onChange={(e) => onFieldChange("category", e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                    disabled={categoriesLoading}
                  >
                    <option value="" disabled>
                      Chọn danh mục
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Thương hiệu"
                  error={formErrors.brand}
                  required
                >
                  <select
                    value={formValues.brand}
                    onChange={(e) => onFieldChange("brand", e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                    disabled={brandsLoading}
                  >
                    <option value="" disabled>
                      Chọn thương hiệu
                    </option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Giá bán (VNĐ)"
                  error={formErrors.price}
                  required
                >
                  <input
                    type="number"
                    min={0}
                    value={formValues.price}
                    onChange={(e) => onFieldChange("price", e.target.value)}
                    placeholder="890000"
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Giá gốc (VNĐ)"
                  error={formErrors.originalPrice}
                >
                  <input
                    type="number"
                    min={0}
                    value={formValues.originalPrice}
                    onChange={(e) =>
                      onFieldChange("originalPrice", e.target.value)
                    }
                    placeholder="1290000"
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormField label="Số lượng" error={formErrors.stock} required>
                  <input
                    type="number"
                    min={0}
                    value={formValues.stock}
                    onChange={(e) => onFieldChange("stock", e.target.value)}
                    placeholder="100"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Đánh giá" error={formErrors.rating}>
                  <input
                    type="number"
                    min={0}
                    value={formValues.rating}
                    onChange={(e) => onFieldChange("rating", e.target.value)}
                    placeholder="4.0"
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Số lượt đánh giá"
                  error={formErrors.reviewCount}
                >
                  <input
                    type="number"
                    min={0}
                    value={formValues.reviewCount}
                    onChange={(e) =>
                      onFieldChange("reviewCount", e.target.value)
                    }
                    placeholder="999"
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="flex items-center flex-wrap gap-x-6 gap-y-2 mt-2 mb-2">
                <Switch
                  checked={formValues.isActive}
                  onChange={(v) => onFieldChange("isActive", v)}
                  label="Mở bán"
                />
                <Switch
                  checked={formValues.isNew}
                  onChange={(v) => onFieldChange("isNew", v)}
                  label="Sản phẩm mới"
                />
                <Switch
                  checked={formValues.featured}
                  onChange={(v) => onFieldChange("featured", v)}
                  label="Nổi bật"
                />
              </div>

              {mode === "edit" && editingProduct && (
                <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mb-2">
                  Đã bán {editingProduct.soldCount.toLocaleString("vi-VN")} —
                  chỉ số này được hệ thống tự tính, không chỉnh sửa thủ công.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 px-4 rounded-lg text-sm font-semibold text-slate-500 dark:text-[#9aa4b2] bg-slate-100 dark:bg-[#30363d] border-none cursor-pointer hover:opacity-90 disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 h-10 px-4 rounded-lg text-sm font-semibold text-white bg-[#EF4444] border-none cursor-pointer hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {mode === "create" ? "Thêm" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
