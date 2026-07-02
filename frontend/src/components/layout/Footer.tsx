import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsFacebook } from "react-icons/bs";
import { RiInstagramFill } from "react-icons/ri";
import { TbBrandLinkedinFilled } from "react-icons/tb";
import { Send } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import Logo from "../../assets/icons/logo.png";
import { LINK_COLUMNS } from "../../libs/constance";

const SOCIALS = [
  {
    icon: BsFacebook,
    label: "Facebook",
    href: "https://www.facebook.com/tan.at.823069",
  },
  {
    icon: RiInstagramFill,
    label: "Instagram",
    href: "https://www.instagram.com/d.truongtan/",
  },
  {
    icon: TbBrandLinkedinFilled,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dattruongtan",
  },
];

const SkylineScene: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <svg
    viewBox="0 0 1200 260"
    preserveAspectRatio="xMidYMax slice"
    className="pointer-events-none absolute inset-0 h-full w-full"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="sky-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#312a63" />
        <stop offset="55%" stopColor="#241f4a" />
        <stop offset="100%" stopColor="#161329" />
      </linearGradient>
      <linearGradient id="sky-light" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c7d7f5" />
        <stop offset="55%" stopColor="#dfe9fb" />
        <stop offset="100%" stopColor="#eef3fc" />
      </linearGradient>
    </defs>

    <rect
      width="1200"
      height="260"
      fill={isDark ? "url(#sky-dark)" : "url(#sky-light)"}
    />

    {isDark ? (
      <>
        <circle cx="1040" cy="55" r="24" fill="#f3ead0" opacity="0.9" />
        {[
          [80, 30],
          [160, 70],
          [230, 40],
          [340, 90],
          [420, 35],
          [520, 60],
          [610, 25],
          [700, 80],
          [790, 45],
          [900, 95],
          [960, 30],
          [1120, 60],
          [1150, 110],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i % 3 === 0 ? 1.6 : 1}
            fill="#fff"
            opacity="0.8"
          />
        ))}
      </>
    ) : (
      <>
        <circle cx="1040" cy="55" r="34" fill="#fbbf24" opacity="0.9" />
        <g opacity="0.85" fill="#ffffff">
          <ellipse cx="180" cy="55" rx="42" ry="16" />
          <ellipse cx="215" cy="45" rx="30" ry="14" />
          <ellipse cx="880" cy="80" rx="38" ry="14" />
        </g>
      </>
    )}

    <path
      d="M0,180 L60,150 L140,175 L220,130 L300,170 L380,120 L470,168 L560,140 L650,175 L740,145 L830,178 L920,150 L1000,180 L1080,155 L1200,180 L1200,260 L0,260 Z"
      fill={isDark ? "#1f1a3d" : "#a9bfe3"}
    />
    <path
      d="M0,220 L90,195 L190,215 L280,185 L380,218 L480,190 L580,222 L680,198 L780,224 L900,200 L1020,222 L1120,205 L1200,222 L1200,260 L0,260 Z"
      fill={isDark ? "#150f2e" : "#8ca6d6"}
    />
  </svg>
);

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="relative mt-12 overflow-hidden">
      <SkylineScene isDark={isDark} />

      <div className="relative mx-auto flex max-w-8xl flex-col gap-10 px-6 pb-10 pt-14 sm:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_2fr]">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={Logo} alt="Logo" className="h-50" />
              <span
                className={`text-[15px] font-bold ${isDark ? "text-white" : "text-slate-800"}`}
              >
                "Good"s Shop
              </span>
            </Link>
            <p
              className={`max-w-xs text-[16px] font-bold leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}
            >
              Order "đến là đón", "xong là đi".
            </p>

            <form
              onSubmit={handleSubscribe}
              className="mt-2 flex flex-col gap-2"
            >
              <span
                className={`flex items-center gap-1.5 text-[13px] font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
              >
                ⚡ Đăng ký nhận bản tin
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn..."
                  className={`w-full rounded-full border px-4 py-2 text-[13px] outline-none focus:border-indigo-400 ${
                    isDark
                      ? "border-white/15 bg-white/5 text-white placeholder:text-slate-400"
                      : "border-slate-300/70 bg-white/70 text-slate-700 placeholder:text-slate-400"
                  }`}
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-amber-300 cursor-pointer"
                >
                  <Send size={13} />
                  Đăng ký
                </button>
              </div>
              {subscribed && (
                <span className="text-[12px] text-emerald-400">
                  Cảm ơn bạn đã đăng ký!
                </span>
              )}
            </form>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {LINK_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-2.5">
                <span
                  className={`text-[13px] font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
                >
                  {col.title}
                </span>
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className={`text-[13px] transition-colors hover:text-indigo-400 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row ${
            isDark ? "border-white/10" : "border-slate-900/10"
          }`}
        >
          <div
            className={`flex items-center gap-3 text-[12px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            <a
              href="#"
              className=" hover:text-white dark:hover:text-indigo-400"
            >
              Điều khoản sử dụng
            </a>
            <span>|</span>
            <a href="#" className="hover:text-white dark:hover:text-indigo-400">
              Chính sách bảo mật
            </a>
          </div>

          <div className="flex items-center gap-2">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  isDark
                    ? "bg-white/10 text-white hover:bg-indigo-500"
                    : "bg-slate-900/10 text-slate-700 hover:bg-indigo-500 hover:text-white"
                }`}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
