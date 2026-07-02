import { useState } from "react";
import * as yup from "yup";
import { AppAlert } from "../../components/ui/AppAlert";
import { getApiErrorMessage } from "../../libs/helper";
import Logo from "../../assets/icons/logo.png";
import type { AuthPayload, LoginFormValue } from "../../types/features/auth";
import authApi from "../../api/features/auth";
import { useAppDispatch, useAppSelector } from "../../redux";
import { Navigate, useNavigate } from "react-router-dom";
import Loading from "../../components/ui/Loading";
import { setToken } from "../../redux/features/authSlice";
import { REQUIRED_MESSAGE } from "../../libs/constance";
import { CircleUser, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import Spinner from "../../components/ui/Spinner";

const loginSchema = yup.object({
  email: yup.string().required(REQUIRED_MESSAGE),
  password: yup.string().required(REQUIRED_MESSAGE),
});

type FormErrors = Partial<Record<keyof LoginFormValue, string>>;

function FormField({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-xs font-medium text-slate-500 dark:text-[#8b95a8] tracking-wide mb-1.5"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default function AdminLogin() {
  const [values, setValues] = useState<LoginFormValue>({
    email: "",
    password: "",
  } as LoginFormValue);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { access_token, user, isHydrated } = useAppSelector((s) => s.auth);

  if (!isHydrated) return null;
  if (navigating) return <Loading fullScreen />;

  if (!navigating && access_token && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const handleChange =
    (field: keyof LoginFormValue) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleLogin = async (values: LoginFormValue) => {
    setLoading(true);
    try {
      const payload: AuthPayload = {
        email: values.email,
        password: values.password,
      };

      const res = await authApi.login(payload);
      const accessToken = res?.access_token;
      const refreshToken = res?.refresh_token;
      const loggedInUser = res?.user;

      if (!res) {
        AppAlert({ icon: "error", title: "Đăng nhập thất bại" });
        return;
      }

      if (loggedInUser?.role !== "admin") {
        AppAlert({
          icon: "error",
          title: "Tài khoản này không có quyền truy cập trang quản trị",
        });
        return;
      }

      dispatch(
        setToken({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: loggedInUser,
        }),
      );
      setNavigating(true);
      setTimeout(() => navigate("/admin", { replace: true }), 3000);
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Đăng nhập thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      await loginSchema.validate(values, { abortEarly: false });
      setErrors({});
      await handleLogin(values);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: FormErrors = {};
        err.inner.forEach((e) => {
          if (e.path && !fieldErrors[e.path as keyof LoginFormValue]) {
            fieldErrors[e.path as keyof LoginFormValue] = e.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const inputBaseClass =
    "w-full h-11 rounded-xl border bg-white dark:bg-[#161b26] pl-10 pr-4 text-sm text-slate-700 dark:text-[#e6e9ef] placeholder:text-slate-300 dark:placeholder:text-[#5a6478] outline-none transition-colors focus:ring-2 focus:ring-offset-0";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0d1117] px-4 py-8">
      <div className="flex flex-col md:flex-row w-full max-w-sm md:max-w-4xl rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="hidden md:flex flex-1 flex-col items-center justify-between py-10 px-8 relative overflow-hidden bg-[#111827]">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(239,68,68,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.13) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 40% 35%, rgba(239,68,68,0.20) 0%, transparent 60%), linear-gradient(to bottom, transparent 55%, #111827 100%)",
            }}
          />

          <div className="relative z-10 flex items-center">
            <img src={Logo} className="w-36 h-30 object-contain" />
            <p className="text-white font-bold text-xl">
              Hệ thống Đặt hàng
              <br />
              <span className="text-[#F87171]">"Good"s Shop</span>
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-65">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#F87171]/10 border border-[#F87171]/30">
              <ShieldCheck className="w-9 h-9 text-[#F87171]" />
            </div>
            <p className="text-center text-sm text-[#94A3B8]">
              Khu vực dành riêng cho quản trị viên hệ thống
            </p>
          </div>

          <div className="relative z-10 w-full">
            <ul className="flex flex-col gap-3">
              {[
                "Quản lý đơn hàng & sản phẩm",
                "Giám sát hoạt động hệ thống",
                "Phân quyền người dùng",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#F87171]" />
                  <span className="text-xs text-[#94A3B8]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex md:hidden flex-col items-center justify-center py-4 px-4 gap-3 relative overflow-hidden bg-[#111827]">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(239,68,68,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.13) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <img src={Logo} className="w-24 h-24 object-contain" />
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#F87171]/10 border border-[#F87171]/30">
                <ShieldCheck className="w-8 h-8 text-[#F87171]" />
              </div>
            </div>
            <p className="text-white font-bold text-base tracking-tight">
              Hệ thống Đặt hàng{" "}
              <span className="text-[#F87171]">"Good"s Shop</span>
            </p>
          </div>
        </div>

        <div className="w-full md:w-100 flex flex-col justify-center bg-white dark:bg-[#1c2333] px-8 sm:px-10 py-10 sm:py-14">
          <div className="mb-1 md:mb-4">
            <p className="hidden md:inline text-[11px] text-[#EF4444] font-semibold tracking-widest uppercase mb-1.5">
              Cổng quản trị
            </p>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-[#e6e9ef] tracking-tight leading-tight mb-1">
              Đăng nhập Quản trị
            </h1>
            <p className="hidden md:inline text-sm text-slate-400 dark:text-[#8b95a8]">
              Chỉ dành cho quản trị viên hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <FormField label="Email" name="email" error={errors.email}>
              <div className="relative">
                <CircleUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-[#5a6478]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  placeholder="Nhập Email quản trị"
                  value={values.email ?? ""}
                  onChange={handleChange("email")}
                  className={`${inputBaseClass} ${
                    errors.email
                      ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900/40"
                      : "border-slate-200 dark:border-[#30363d] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
                  }`}
                />
              </div>
            </FormField>

            <FormField label="Mật khẩu" name="password" error={errors.password}>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-[#5a6478]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={values.password ?? ""}
                  onChange={handleChange("password")}
                  className={`${inputBaseClass} pr-10 ${
                    errors.password
                      ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900/40"
                      : "border-slate-200 dark:border-[#30363d] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-[#5a6478] hover:text-slate-500 dark:hover:text-[#8b95a8] transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 mb-2 md:mt-4 w-full h-11 rounded-xl font-semibold text-sm text-white bg-[#EF4444] flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-95 cursor-pointer"
            >
              {loading && <Spinner className="w-4 h-4" />}
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
