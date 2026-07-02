import { BadgeCheck, Headset, RotateCcw, Truck } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Miễn phí vận chuyển",
    desc: "Cho đơn hàng từ 299.000đ",
  },
  {
    icon: RotateCcw,
    title: "Đổi trả trong 7 ngày",
    desc: "Đơn giản, không phức tạp",
  },
  {
    icon: BadgeCheck,
    title: "Cam kết chính hãng",
    desc: "100% sản phẩm nguyên seal",
  },
  {
    icon: Headset,
    title: "Hỗ trợ 24/7",
    desc: "Luôn sẵn sàng giúp đỡ bạn",
  },
];

export default function FeatureHighlights() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {FEATURES.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-[#1a1d24]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-300">
            <Icon size={18} />
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-slate-800 dark:text-white">
              {title}
            </span>
            <span className="text-[11px] text-slate-400">{desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
