import { useCallback, useEffect, useState } from "react";
import * as yup from "yup";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  ImageOff,
  TriangleAlert,
} from "lucide-react";
import dayjs from "dayjs";
import { AppAlert } from "../../../components/ui/AppAlert";
import { getApiErrorMessage } from "../../../libs/helper";
import { PAGE_SIZE, REQUIRED_MESSAGE } from "../../../libs/constance";
import brandApi from "../../../api/features/brand";
import ImageUploadField from "../../../components/ImageUploadField";
import type {
  Brand,
  BrandFormValues,
  FormErrors,
} from "../../../types/features/brand";

const EMPTY_FORM: BrandFormValues = { name: "", logo: "" };

const brandSchema = yup.object({
  name: yup.string().required(REQUIRED_MESSAGE).max(120, "Tối đa 120 ký tự"),
  logo: yup.string().url("Đường dẫn logo không hợp lệ"),
});

function BrandLogo({ src, alt }: { src?: string | null; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#30363d] text-slate-300 dark:text-[#5a6478] shrink-0">
        <ImageOff size={15} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-100 dark:border-[#30363d] shrink-0 p-1"
    />
  );
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-500 dark:text-[#8b95a8] tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[11px] text-slate-400 dark:text-[#6e7681]">
          {hint}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formValues, setFormValues] = useState<BrandFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await brandApi.getBrands(
        page,
        PAGE_SIZE,
        search || undefined,
      );
      setBrands(res?.data ?? []);
      setTotal(res?.pagination?.total ?? 0);
    } catch (err) {
      AppAlert({
        icon: "error",
        title:
          (await getApiErrorMessage(err)) ||
          "Không thể tải danh sách thương hiệu",
      });
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* ------------------------------- Modal helpers ------------------------------ */

  const openCreateModal = () => {
    setModalMode("create");
    setEditingBrand(null);
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setModalMode("edit");
    setEditingBrand(brand);
    setFormValues({ name: brand.name, logo: brand.logo ?? "" });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleFieldChange = (field: keyof BrandFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      await brandSchema.validate(formValues, { abortEarly: false });
      setFormErrors({});
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: FormErrors = {};
        err.inner.forEach((e) => {
          if (e.path && !fieldErrors[e.path as keyof BrandFormValues]) {
            fieldErrors[e.path as keyof BrandFormValues] = e.message;
          }
        });
        setFormErrors(fieldErrors);
      }
      return;
    }

    const payload = {
      name: formValues.name,
      ...(formValues.logo ? { logo: formValues.logo } : {}),
    };

    setSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await brandApi.createBrand(payload);
        AppAlert({
          icon: "success",
          title: res?.message || "Đã thêm thương hiệu",
        });
      } else if (editingBrand) {
        const res = await brandApi.updateBrand(editingBrand.id, payload);
        AppAlert({
          icon: "success",
          title: res?.message || "Đã cập nhật thương hiệu",
        });
      }
      setModalOpen(false);
      fetchBrands();
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Thao tác thất bại",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------------------- Delete flow -------------------------------- */

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await brandApi.removeBrand(deleteTarget.id);
      AppAlert({
        icon: "success",
        title: res?.message || "Đã xóa thương hiệu",
      });
      setDeleteTarget(null);
      if (brands.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchBrands();
      }
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Không thể xóa thương hiệu",
      });
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    "h-10 rounded-lg border bg-white dark:bg-[#161b26] px-3.5 text-sm text-slate-700 dark:text-[#e6e9ef] placeholder:text-slate-300 dark:placeholder:text-[#5a6478] outline-none transition-colors focus:ring-2 focus:ring-offset-0 border-slate-200 dark:border-[#30363d] focus:border-[#EF4444] focus:ring-[#EF4444]/20 w-full";

  /* ----------------------------------- Render ----------------------------------- */

  return (
    <div className="bg-white dark:bg-[#1c2333] rounded-2xl border border-slate-100 dark:border-[#30363d] p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-[#e6e9ef]">
            Quản lý thương hiệu
          </h1>
          <p className="text-xs text-slate-400 dark:text-[#8b95a8] mt-0.5">
            {total} thương hiệu
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#EF4444] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <Plus size={16} />
          Thêm thương hiệu
        </button>
      </div>

      {/* Toolbar: search */}
      <div className="flex flex-wrap items-center mb-4 gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-[#5a6478]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên thương hiệu..."
            className={`${inputClass} pl-9`}
            style={{ width: 280 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-[#30363d]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#161b26] text-left">
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Thương hiệu
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Số sản phẩm
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Ngày tạo
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="px-4 py-3.5">
                    <div className="h-4 rounded bg-slate-100 dark:bg-[#30363d] animate-pulse" />
                  </td>
                </tr>
              ))
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-14">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-[#5a6478]">
                    <Tag size={28} />
                    <span className="text-[13px]">
                      Không tìm thấy thương hiệu nào
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              brands.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#161b26]/60 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BrandLogo src={b.logo} alt={b.name} />
                      <span className="font-medium text-slate-700 dark:text-[#e6e9ef]">
                        {b.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-[#9aa4b2]">
                    {b._count?.products ?? 0}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-[#9aa4b2]">
                    {dayjs(b.createdAt).format("DD/MM/YYYY")}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(b)}
                        aria-label="Sửa"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-[#8b95a8] cursor-pointer transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(b)}
                        aria-label="Xóa"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-[#8b95a8] cursor-pointer transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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

      {/* Add / Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1c2333] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-800 dark:text-[#e6e9ef]">
                {modalMode === "create"
                  ? "Thêm thương hiệu"
                  : "Sửa thương hiệu"}
              </h2>
              <button
                onClick={closeModal}
                className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-[#30363d] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <FormField label="Tên thương hiệu" error={formErrors.name}>
                <input
                  value={formValues.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Nova"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Logo (không bắt buộc)" error={formErrors.logo}>
                <ImageUploadField
                  value={formValues.logo}
                  onChange={(url) => handleFieldChange("logo", url)}
                  shape="circle"
                />
              </FormField>

              <div className="flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
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
                  {modalMode === "create" ? "Thêm" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
                  Xóa thương hiệu này?
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#8b95a8] mt-1.5">
                  "{deleteTarget.name}" sẽ bị xóa vĩnh viễn.
                  {deleteTarget._count?.products
                    ? " Thương hiệu đang có sản phẩm sẽ không thể xóa cho tới khi chuyển hết sản phẩm sang thương hiệu khác."
                    : " Hành động này không thể hoàn tác."}
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
    </div>
  );
}
