import { useEffect, useRef, useState, type RefObject } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useAppDispatch } from "../../redux";
import storage from "../../libs/storage";
import { logout } from "../../redux/features/authSlice";
import type { User } from "../../types/features/user";
import { NAV_ITEMS, TIME_UPDATE_INTERVAL } from "../../libs/constance";
// import { useNotifications } from "../../hooks/useNotification";
// import { socketClient } from "../../libs/socket";
// import { NotificationContent } from "../../pages/ChangeRequest/NotificationContent";
import { useTheme } from "../../contexts/ThemeContext";
import Logo from "../../assets/icons/logo.png";
import { useCart } from "../../contexts/CartContext";

dayjs.extend(utc);

interface HeaderProps {
  user?: User;
}

function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

export default function Header({ user }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [now, setNow] = useState(dayjs());
  const isPM = now.hour() >= 12;

  //   const [bellOpen, setBellOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  //   useOnClickOutside(bellRef, () => setBellOpen(false));
  useOnClickOutside(avatarRef, () => setAvatarOpen(false));

  //   const { notifications, unreadCount, loading, markRead, markAllRead } =
  //     useNotifications(user?.accountId);

  //   useEffect(() => {
  //     if (user?.accountId) {
  //       socketClient.identify(user.accountId);
  //     }

  //     const unsub = socketClient.onConnect(() => {
  //       if (user?.accountId) {
  //         socketClient.identify(user.accountId);
  //       }
  //     });

  //     return unsub;
  //   }, [user?.accountId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(dayjs()), TIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    storage.remove("auth");
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const navLinkClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
      active
        ? "bg-indigo-500 text-white"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
    }`;

  return (
    <header className="top-0 z-50 px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="mx-auto flex max-w-8xl items-center gap-1.5 rounded-full border border-slate-200 bg-white pl-1.5 pr-2 shadow-lg shadow-slate-900/10 dark:border-transparent dark:bg-[#24272f] dark:shadow-black/25 sm:gap-3 sm:pl-2 sm:pr-3">
        <Link to="/" className="flex shrink-0 items-center pl-1">
          <img src={Logo} alt="Logo" className="h-20 w-20" />
          <span className="hidden text-[15px] font-bold tracking-tight text-slate-800 sm:inline dark:text-white">
            Hệ thống Đặt hàng
            <span className="font-extrabold text-indigo-500 dark:text-indigo-400 ml-1">
              "Good"s Shop
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 overflow-x-auto md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={navLinkClass(isActive(item.path))}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 md:flex-none">
          <div
            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 sm:flex ${
              isPM
                ? "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
            }`}
          >
            {isPM ? <Moon size={13} /> : <Sun size={13} />}
            <span className="text-[12px] font-medium">
              <span className="hidden lg:inline">
                {now.format("DD/MM/YYYY - hh:mm:ss A")}
              </span>
              <span className="lg:hidden">{now.format("DD/MM/YYYY")}</span>
            </span>
          </div>

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title="Toggle theme"
            className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-[1.5px] border-amber-400/45 bg-amber-400/15 transition-colors duration-300 dark:border-violet-400/45 dark:bg-violet-400/20"
          >
            <span
              className={`absolute top-1/2 flex h-4.5 w-4.5 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.5)] transition-[left] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:bg-violet-600 dark:shadow-[0_2px_8px_rgba(124,58,237,0.55)] ${
                theme === "dark" ? "left-[calc(100%-19px)]" : "left-0.5"
              }`}
            >
              {theme === "dark" ? <Moon size={11} /> : <Sun size={11} />}
            </span>
          </button>

          <div className="relative" ref={bellRef}>
            <button
              //   onClick={() => setBellOpen((o) => !o)}
              aria-label="Notifications"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
            >
              <Bell size={18} />
              {/* {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#0B0F19]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )} */}
            </button>

            {/* {bellOpen && (
              <div className="absolute right-0 top-11 w-[min(85vw,22rem)] rounded-2xl border border-slate-100 bg-white p-3 shadow-xl dark:border-[#30363d] dark:bg-[#161b22]">
                <div className="mb-1 flex items-center justify-between border-b border-slate-100 px-1 pb-2 dark:border-[#30363d]">
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-[#cdd5e0]">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-1.5 text-[11px] font-bold text-red-500">
                        ({unreadCount} unread)
                      </span>
                    )}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 border-none bg-transparent p-0 text-[11px] text-blue-500 hover:text-blue-700"
                    >
                      <Check size={12} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 size={18} className="animate-spin text-slate-400" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-slate-300 dark:text-[#5a6478]">
                      <Bell size={22} />
                      <span className="text-xs">No notifications</span>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.Notification_ID}
                        onClick={() => {
                          if (!n.Is_Read) markRead(n.Notification_ID);
                        }}
                        className={`flex cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                          n.Is_Read ? "" : "bg-indigo-50/70 dark:bg-indigo-500/10"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-1.5 h-1.75 w-1.75 shrink-0 rounded-full ${
                              n.Is_Read
                                ? "bg-transparent"
                                : n.Type.toLowerCase().includes("rejected")
                                  ? "bg-red-500"
                                  : "bg-emerald-400"
                            }`}
                          />
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span
                              className={`text-[13px] leading-snug text-slate-700 dark:text-[#cdd5e0] ${
                                n.Is_Read ? "font-normal" : "font-semibold"
                              }`}
                            >
                              {n.Title}
                            </span>
                            {n.Message && (
                              <NotificationContent
                                title="Notification Content"
                                value={n.Message}
                              />
                            )}
                            <span className="mt-0.5 text-[10px] text-slate-300 dark:text-[#484f58]">
                              {dayjs.utc(n.Created_At).format("DD/MM/YYYY HH:mm:ss")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )} */}
          </div>

          <div className="relative">
            <button
              onClick={() => navigate("/cart")}
              aria-label="Giỏ hàng"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-[#24272f]">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="mx-0.5 h-6 w-px shrink-0 bg-slate-200 dark:bg-white/10" />

          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setAvatarOpen((o) => !o)}
              className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 sm:pr-2 cursor-pointer"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#4F8EF7] to-[#7c3aed] text-[13px] font-bold text-white">
                {user?.fullName?.[0] ?? "U"}
              </span>
              <span className="hidden flex-col items-start text-left lg:flex">
                <span className="text-[13px] font-semibold text-slate-800 dark:text-white">
                  {user?.fullName}
                </span>
                <span className="text-[11px] text-slate-400">
                  {user?.email}
                </span>
              </span>
              <ChevronDown
                size={14}
                className={`hidden shrink-0 text-slate-400 transition-transform lg:block ${
                  avatarOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {avatarOpen && (
              <div className="absolute right-0 top-12 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl dark:border-[#30363d] dark:bg-[#161b22]">
                <div className="mb-1 px-2.5 py-1.5 lg:hidden">
                  <div className="text-[13px] font-semibold text-slate-700 dark:text-[#cdd5e0]">
                    {user?.fullName}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white md:hidden"
          >
            {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <nav className="mx-auto mt-2 flex max-w-7xl flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-transparent dark:bg-[#0B0F19] md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-indigo-500 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
