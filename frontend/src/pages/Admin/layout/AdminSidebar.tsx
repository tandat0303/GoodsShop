import React, { useState } from "react";
import { HomeOutlined, ProductOutlined, TeamOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../../assets/icons/logo.png";
import { SIDEBAR_COLLAPSED, SIDEBAR_EXPANDED } from "../../../libs/constance";

interface SidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface MenuItem {
  key: string;
  path: string;
  icon: React.ReactNode;
  label: string;
}

const menuItems: MenuItem[] = [
  {
    key: "home",
    path: "/admin",
    icon: <HomeOutlined size={16} />,
    label: "Trang chủ",
  },
  {
    key: "products-mgmt",
    path: "/admin/products-mgmt",
    icon: <ProductOutlined size={16} />,
    label: "Sản phẩm",
  },
  {
    key: "users-mgmt",
    path: "/admin/users-mgmt",
    icon: <TeamOutlined size={16} />,
    label: "Người dùng",
  },
];

function SidebarTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-110 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px] font-medium text-white bg-[#27171a] shadow-lg pointer-events-none"
          style={{ animation: "fadeIn 0.1s ease" }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

const AdminSidebar: React.FC<SidebarProps> = ({
  collapsed,
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
}) => {
  const isCollapsed = !isMobile && collapsed;
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey =
    menuItems.find(
      (m) => m.path !== "/admin" && location.pathname.startsWith(m.path),
    )?.key ?? "home";

  const handleSelect = (path: string) => {
    navigate(path);
    if (isMobile) onMobileClose?.();
  };

  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-100 flex flex-col overflow-hidden"
      style={{
        width: isMobile
          ? SIDEBAR_EXPANDED
          : isCollapsed
            ? SIDEBAR_COLLAPSED
            : SIDEBAR_EXPANDED,
        background: "#111827",
        boxShadow: "4px 0 24px rgba(0,0,0,0.28)",
        willChange: "width, transform",
        transition:
          "width 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        transform: isMobile
          ? `translateX(${mobileOpen ? 0 : -SIDEBAR_EXPANDED}px)`
          : "none",
      }}
    >
      <div
        className="flex items-center shrink-0 overflow-hidden border-b border-white/10"
        style={{
          height: 60,
          paddingLeft: isCollapsed ? 0 : 16,
          paddingRight: isCollapsed ? 0 : 16,
          transition:
            "padding-left 0.28s cubic-bezier(0.4,0,0.2,1), padding-right 0.28s cubic-bezier(0.4,0,0.2,1), gap 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <img
          src={Logo}
          alt="Logo"
          className={`h-16 ${isCollapsed ? "w-16" : ""}`}
        />
        <span
          className="text-white font-bold text-[13px] leading-snug whitespace-nowrap overflow-hidden shrink-0 pointer-events-none"
          style={{
            maxWidth: isCollapsed ? 0 : 140,
            opacity: isCollapsed ? 0 : 1,
            transition:
              "max-width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
          }}
        >
          "Good"s Shop
        </span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {menuItems.map((item) => {
          const isSelected = selectedKey === item.key;

          const inner = (
            <div
              key={item.key}
              onClick={() => handleSelect(item.path)}
              className="flex items-center rounded-[10px] cursor-pointer overflow-hidden"
              style={{
                height: 42,
                margin: isCollapsed ? "0 auto 2px" : "0 8px 2px",
                width: isCollapsed ? 48 : "auto",
                justifyContent: isCollapsed ? "center" : "flex-start",
                paddingLeft: isCollapsed ? 0 : 12,
                paddingRight: isCollapsed ? 0 : 12,
                gap: isCollapsed ? 0 : 12,
                background: isSelected ? "rgba(239,68,68,0.18)" : "transparent",
                transition: [
                  "background 0.15s ease",
                  "padding-left  0.28s cubic-bezier(0.4,0,0.2,1)",
                  "padding-right 0.28s cubic-bezier(0.4,0,0.2,1)",
                  "gap           0.28s cubic-bezier(0.4,0,0.2,1)",
                  "width         0.28s cubic-bezier(0.4,0,0.2,1)",
                  "margin        0.28s cubic-bezier(0.4,0,0.2,1)",
                ].join(", "),
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "transparent";
              }}
            >
              <span
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 20,
                  height: 20,
                  paddingLeft: isCollapsed ? 24 : 0,
                  color: isSelected ? "#F87171" : "rgba(255,255,255,0.5)",
                  transition: "color 0.15s ease",
                  position: "relative",
                }}
              >
                {item.icon}
              </span>

              <span
                className="text-[13px] whitespace-nowrap overflow-hidden flex items-center gap-1.5"
                style={{
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? "#fff" : "rgba(255,255,255,0.6)",
                  maxWidth: isCollapsed ? 0 : 160,
                  opacity: isCollapsed ? 0 : 1,
                  transition:
                    "max-width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease, color 0.15s ease",
                }}
              >
                {item.label}
              </span>

              <div
                className="ml-auto shrink-0 rounded-sm"
                style={{
                  width: 3,
                  height: 18,
                  background: "#EF4444",
                  opacity: isSelected && !isCollapsed ? 1 : 0,
                  transition: "opacity 0.18s ease",
                }}
              />
            </div>
          );

          return isCollapsed ? (
            <SidebarTooltip key={item.key} label={item.label}>
              {inner}
            </SidebarTooltip>
          ) : (
            <React.Fragment key={item.key}>{inner}</React.Fragment>
          );
        })}
      </div>

      <style>{`
        @keyframes badge-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AdminSidebar;
