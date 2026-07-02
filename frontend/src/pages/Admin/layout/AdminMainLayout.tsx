import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useAppSelector } from "../../../redux";
import {
  ADMIN_PAGE_TITLES,
  DURATION,
  EASING,
  SIDEBAR_COLLAPSED,
  SIDEBAR_EXPANDED,
} from "../../../libs/constance";

export default function AdminMainLayout() {
  const user = useAppSelector((s) => s.auth.user);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const marginLeft = isMobile
    ? 0
    : collapsed
      ? SIDEBAR_COLLAPSED
      : SIDEBAR_EXPANDED;

  const title = ADMIN_PAGE_TITLES[location.pathname] ?? "Dashboard";

  return (
    <div className="h-screen overflow-hidden bg-slate-100 dark:bg-[#0d1117]">
      <div
        className={`fixed inset-0 bg-black/35 z-99 
                    ${isMobile && mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                    transition-opacity ease-[ease] duration-[${DURATION}]`}
        onClick={() => setMobileOpen(false)}
      />

      <AdminSidebar
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className="h-screen flex flex-col"
        style={{
          marginLeft,
          transition: `margin-left ${DURATION} ${EASING}`,
          willChange: "margin-left",
        }}
      >
        <AdminHeader
          collapsed={collapsed}
          onToggle={() => {
            if (isMobile) setMobileOpen((o) => !o);
            else setCollapsed((c) => !c);
          }}
          title={title}
          isMobile={isMobile}
          user={user ?? undefined}
        />

        <div
          className={`flex-1 overflow-y-auto ${isMobile ? "p-3" : "pl-5 py-4 pr-4"}`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
