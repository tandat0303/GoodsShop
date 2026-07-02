import React, { useEffect, useRef, useState } from "react";
import { Menu, LogOut, Moon, Sun, BellRing } from "lucide-react";
import { useAppDispatch } from "../../../redux";
import storage from "../../../libs/storage";
import { logout } from "../../../redux/features/authSlice";
import { useNavigate } from "react-router-dom";
import type { User } from "../../../types/features/user";
import dayjs from "dayjs";
import { TIME_UPDATE_INTERVAL } from "../../../libs/constance";
// import { useNotifications } from "../../hooks/useNotification";
// import { socketClient } from "../../libs/socket";
import utc from "dayjs/plugin/utc";
// import { NotificationContent } from "../../pages/ChangeRequest/NotificationContent";
import { useTheme } from "../../../contexts/ThemeContext";

dayjs.extend(utc);

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  title: string;
  isMobile?: boolean;
  user?: User;
}

function useClickOutside(
  refs: React.RefObject<HTMLElement | null>[],
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = refs.some((r) => r.current?.contains(target));
      if (!inside) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active, onOutside, refs]);
}

const AdminHeader: React.FC<HeaderProps> = ({
  onToggle,
  title,
  isMobile = false,
  user,
}) => {
  const { theme, toggleTheme } = useTheme();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [now, setNow] = useState(dayjs());
  const isPM = now.hour() >= 12;

  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);
  const bellPanelRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useClickOutside([bellRef, bellPanelRef], () => setBellOpen(false), bellOpen);
  useClickOutside([menuRef, menuPanelRef], () => setMenuOpen(false), menuOpen);

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

  const handleLogout = () => {
    storage.remove("auth");
    dispatch(logout());
    navigate("/admin/login", { replace: true });
  };

  return (
    <div
      className={`h-15 bg-white dark:bg-[#1c2333] border-b border-[#f1f5f9] dark:border-[#30363d] shadow-[0_1px_4px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3)]
                    flex items-center sticky top-0 gap-3 ${isMobile ? "z-101" : "z-99"}`}
      style={{
        padding: "0 16px 0 10px",
      }}
    >
      <div className="flex flex-1 items-center gap-2.5 min-w-0">
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#30363d] shrink-0 border-none bg-transparent cursor-pointer"
        >
          <Menu size={18} />
        </button>
        <h2 className="m-0 text-[15px] font-bold text-[#1e293b] dark:text-[#e6edf3] whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
            isPM
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
              : "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400"
          }`}
        >
          {isPM ? (
            <Moon size={14} fill="currentColor" />
          ) : (
            <Sun size={14} fill="currentColor" />
          )}
        </div>

        <span
          className={`inline font-medium text-sm ${
            isPM
              ? "text-rose-600 dark:text-rose-400"
              : "text-amber-500 dark:text-amber-400"
          }`}
        >
          {isMobile
            ? now.format("DD/MM/YYYY")
            : now.format("DD/MM/YYYY - hh:mm:ss A")}
        </span>

        <button
          className="flex items-center border-none bg-transparent cursor-pointer shrink-0"
          style={{ padding: "0 4px" }}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title="Toggle theme"
        >
          <span
            className="
                  relative w-11.5 h-6.25 rounded-full block transition-colors duration-300
                  bg-[rgba(251,191,36,0.15)] border-[1.5px] border-[rgba(251,191,36,0.45)]
                  dark:bg-[rgba(239,68,68,0.18)] dark:border-[rgba(239,68,68,0.45)]
                "
          >
            <span
              className="
                    flex absolute top-1/2 -translate-y-1/2 w-4.75 h-4.75
                    rounded-full items-center justify-center text-white
                    [transition:left_0.28s_cubic-bezier(0.34,1.56,0.64,1),background_0.3s_ease,box-shadow_0.3s_ease]
                    left-0.5 bg-[#f59e0b] shadow-[0_2px_8px_rgba(245,158,11,0.5)]
                    dark:left-[calc(100%-21px)] dark:bg-[#EF4444] dark:shadow-[0_2px_8px_rgba(239,68,68,0.55)]
                  "
            >
              {theme === "dark" ? <Moon size={12} /> : <Sun size={12} />}
            </span>
          </span>
        </button>

        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((o) => !o)}
            aria-label="Notifications"
            className="relative flex items-center justify-center w-9 h-9 border-none bg-transparent cursor-pointer text-[#64748b] dark:text-[#8b949e] hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <BellRing size={21} />
            {/* {unreadCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 flex items-center justify-center rounded-full bg-red-500 text-white font-bold"
                style={{
                  minWidth: 15,
                  height: 15,
                  fontSize: 9,
                  padding: "0 3px",
                  lineHeight: 1,
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )} */}
          </button>

          {/* {bellOpen && (
            <div
              ref={bellPanelRef}
              className="absolute right-0 top-[calc(100%+8px)] z-120 w-85 rounded-xl bg-white dark:bg-[#1c2333] border border-slate-100 dark:border-[#30363d] shadow-xl p-3"
            >
              <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100 dark:border-[#30363d] mb-1">
                <span className="font-semibold text-[13px] text-slate-700 dark:text-[#cdd5e0]">
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
                    className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 cursor-pointer bg-transparent border-none p-0"
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-0.5 max-w-90 max-h-72 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <Spinner className="w-5 h-5" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-1 py-6 text-slate-300 dark:text-[#5a6478]">
                    <BellRing size={22} />
                    <span className="text-[12px]">No notifications</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.Notification_ID}
                      onClick={() => {
                        if (!n.Is_Read) markRead(n.Notification_ID);
                      }}
                      className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                      style={{
                        background: n.Is_Read
                          ? "transparent"
                          : "rgba(239,68,68,0.07)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background =
                          "rgba(0,0,0,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background =
                          n.Is_Read ? "transparent" : "rgba(239,68,68,0.07)";
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: n.Is_Read
                              ? "transparent"
                              : n.Type.toLowerCase().includes("rejected")
                                ? "#ef4444"
                                : "#35E859",
                            flexShrink: 0,
                            marginTop: 5,
                          }}
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span
                            className="text-[13px] text-slate-700 dark:text-[#cdd5e0] leading-snug"
                            style={{ fontWeight: n.Is_Read ? 400 : 600 }}
                          >
                            {n.Title}
                          </span>
                          {n.Message && (
                            <NotificationContent
                              title="Notification Content"
                              value={n.Message}
                            />
                          )}
                          <span className="text-[10px] text-slate-300 dark:text-[#484f58] mt-0.5">
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

        <div
          className={`w-px h-6 bg-[#f1f5f9] dark:bg-[#30363d]`} //${unreadCount > 0 ? "ml-2" : "ml-0.5"}
        />

        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center justify-center gap-2 cursor-pointer"
          >
            <div
              className="flex items-center justify-center rounded-full font-bold text-[13px] text-white shrink-0"
              style={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #EF4444, #B91C1C)",
              }}
            >
              {user?.fullName?.[0] ?? "U"}
            </div>
            {!isMobile && (
              <div className="flex flex-col items-start">
                <div className="text-[13px] font-semibold text-[#334155] dark:text-[#cdd5e0]">
                  {user?.fullName}
                </div>
                <div className="text-[11px] text-[#94a3b8] dark:text-[#6e7681]">
                  {user?.email}
                </div>
              </div>
            )}
          </div>

          {menuOpen && (
            <div
              ref={menuPanelRef}
              className="absolute right-0 top-[calc(100%+8px)] z-120 min-w-40 rounded-xl bg-white dark:bg-[#1c2333] border border-slate-100 dark:border-[#30363d] shadow-xl py-1.5 overflow-hidden"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent border-none cursor-pointer text-left"
              >
                <LogOut size={14} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
