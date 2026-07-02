import { useCallback, useEffect, useState } from "react";
import * as yup from "yup";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserRound,
  TriangleAlert,
} from "lucide-react";
import dayjs from "dayjs";
import { AppAlert } from "../../../components/ui/AppAlert";
import { getApiErrorMessage } from "../../../libs/helper";
import {
  PAGE_SIZE,
  REQUIRED_MESSAGE,
  ROLE_OPTIONS,
} from "../../../libs/constance";
import userApi from "../../../api/features/user";
import type {
  AppUser,
  FormErrors,
  Role,
  UserFormValues,
} from "../../../types/features/user";

const EMPTY_FORM: UserFormValues = {
  fullName: "",
  email: "",
  password: "",
  role: "user",
};

const createSchema = yup.object({
  fullName: yup.string().required(REQUIRED_MESSAGE),
  email: yup.string().email("Email không hợp lệ").required(REQUIRED_MESSAGE),
  password: yup
    .string()
    .required(REQUIRED_MESSAGE)
    .min(6, "Mật khẩu tối thiểu 6 ký tự"),
  role: yup.string().oneOf(["admin", "user"]).required(REQUIRED_MESSAGE),
});

const editSchema = yup.object({
  fullName: yup.string().required(REQUIRED_MESSAGE),
  email: yup.string().email("Email không hợp lệ").required(REQUIRED_MESSAGE),
  password: yup
    .string()
    .test(
      "min-if-present",
      "Mật khẩu tối thiểu 6 ký tự",
      (v) => !v || v.length >= 6,
    ),
  role: yup.string().oneOf(["admin", "user"]).required(REQUIRED_MESSAGE),
});

function RoleBadge({ role }: { role: Role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        isAdmin
          ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
          : "bg-slate-100 text-slate-500 dark:bg-[#30363d] dark:text-[#9aa4b2]"
      }`}
    >
      {isAdmin ? "Admin" : "Người dùng"}
    </span>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-500 dark:text-[#8b95a8] tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default function UsersManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [formValues, setFormValues] = useState<UserFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getUsers(
        page,
        PAGE_SIZE,
        search || undefined,
        roleFilter === "all" ? undefined : roleFilter,
      );
      setUsers(res?.data ?? []);
      setTotal(res?.pagination.total ?? 0);
      setTotalPages(res?.pagination.totalPages ?? 0);
    } catch (err) {
      AppAlert({
        icon: "error",
        title:
          (await getApiErrorMessage(err)) ||
          "Không thể tải danh sách người dùng",
      });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingUser(null);
    setFormValues(EMPTY_FORM);
    setFormErrors({});
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (user: AppUser) => {
    setModalMode("edit");
    setEditingUser(user);
    setFormValues({
      fullName: user.fullName,
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormErrors({});
    setShowPassword(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleFieldChange = (field: keyof UserFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const schema = modalMode === "create" ? createSchema : editSchema;
    try {
      await schema.validate(formValues, { abortEarly: false });
      setFormErrors({});
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: FormErrors = {};
        err.inner.forEach((e) => {
          if (e.path && !fieldErrors[e.path as keyof UserFormValues]) {
            fieldErrors[e.path as keyof UserFormValues] = e.message;
          }
        });
        setFormErrors(fieldErrors);
      }
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === "create") {
        const res = await userApi.createUser({
          fullName: formValues.fullName,
          email: formValues.email,
          password: formValues.password,
          role: formValues.role,
        });
        AppAlert({ icon: "success", title: res.message });
      } else if (editingUser) {
        const res = await userApi.updateUser(editingUser.id, {
          fullName: formValues.fullName,
          email: formValues.email,
          role: formValues.role,
          ...(formValues.password ? { password: formValues.password } : {}),
        });
        AppAlert({ icon: "success", title: res.message });
      }
      setModalOpen(false);
      fetchUsers();
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
      const res = await userApi.removeUser(deleteTarget.id);
      AppAlert({ icon: "success", title: res.message });
      setDeleteTarget(null);
      // nếu xóa hết item trang cuối thì lùi về trang trước
      if (users.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchUsers();
      }
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Không thể xóa người dùng",
      });
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    "h-10 rounded-lg border bg-white dark:bg-[#161b26] px-3.5 text-sm text-slate-700 dark:text-[#e6e9ef] placeholder:text-slate-300 dark:placeholder:text-[#5a6478] outline-none transition-colors focus:ring-2 focus:ring-offset-0 border-slate-200 dark:border-[#30363d] focus:border-[#EF4444] focus:ring-[#EF4444]/20";

  return (
    <div className="bg-white dark:bg-[#1c2333] rounded-2xl border border-slate-100 dark:border-[#30363d] p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-[#e6e9ef]">
            Quản lý người dùng
          </h1>
          <p className="text-xs text-slate-400 dark:text-[#8b95a8] mt-0.5">
            {total} người dùng
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#EF4444] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <Plus size={16} />
          Thêm người dùng
        </button>
      </div>

      {/* Toolbar: filter/search */}
      <div className="flex flex-wrap items-center mb-4 gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-[#5a6478]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className={`${inputClass} min-w-72 pl-9`}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as "all" | Role);
            setPage(1);
          }}
          className={`${inputClass} min-w-30 cursor-pointer`}
        >
          <option value="all">Tất cả vai trò</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-[#30363d]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#161b26] text-left">
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Họ và tên
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Vai trò
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
                  <td colSpan={5} className="px-4 py-3.5">
                    <div className="h-4 rounded bg-slate-100 dark:bg-[#30363d] animate-pulse" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-14">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-[#5a6478]">
                    <UserRound size={28} />
                    <span className="text-[13px]">
                      Không tìm thấy người dùng nào
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#161b26]/60 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center rounded-full font-bold text-[12px] text-white shrink-0"
                        style={{
                          width: 30,
                          height: 30,
                          background:
                            "linear-gradient(135deg, #EF4444, #B91C1C)",
                        }}
                      >
                        {u.fullName?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-[#e6e9ef]">
                        {u.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-[#9aa4b2]">
                    {u.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-[#9aa4b2]">
                    {dayjs(u.createdAt).format("DD/MM/YYYY HH:mm")}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        aria-label="Sửa"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-[#8b95a8] cursor-pointer transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
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
                {modalMode === "create" ? "Thêm người dùng" : "Sửa người dùng"}
              </h2>
              <button
                onClick={closeModal}
                className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-[#30363d] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <FormField label="Họ và tên" error={formErrors.fullName}>
                <input
                  value={formValues.fullName}
                  onChange={(e) =>
                    handleFieldChange("fullName", e.target.value)
                  }
                  placeholder="Nguyễn Văn A"
                  className={`w-full ${inputClass}`}
                />
              </FormField>

              <FormField label="Email" error={formErrors.email}>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="email@example.com"
                  className={`w-full ${inputClass}`}
                />
              </FormField>

              <FormField
                label={
                  modalMode === "create"
                    ? "Mật khẩu"
                    : "Mật khẩu (để trống nếu không đổi)"
                }
                error={formErrors.password}
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formValues.password}
                    onChange={(e) =>
                      handleFieldChange("password", e.target.value)
                    }
                    placeholder="••••••••"
                    className={`${inputClass} w-full pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-[#5a6478] hover:text-slate-500 dark:hover:text-[#8b95a8] cursor-pointer bg-transparent border-none"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>

              <FormField label="Vai trò" error={formErrors.role}>
                <select
                  value={formValues.role}
                  onChange={(e) =>
                    handleFieldChange("role", e.target.value as Role)
                  }
                  className={`${inputClass} w-full cursor-pointer`}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
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
                  Xóa người dùng này?
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#8b95a8] mt-1.5">
                  {deleteTarget.fullName} ({deleteTarget.email}) sẽ bị xóa vĩnh
                  viễn. Hành động này không thể hoàn tác.
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
