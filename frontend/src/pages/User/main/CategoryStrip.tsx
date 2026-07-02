import {
  Book,
  Dumbbell,
  Laptop,
  // LayoutGrid,
  Shirt,
  // Sofa,
  Sparkles,
  Utensils,
} from "lucide-react";

const ITEMS = [
  // { label: "Tất cả", icon: LayoutGrid },
  { label: "Dịch vụ 😈", icon: Laptop },
  { label: "Thời trang", icon: Shirt },
  { label: "Ăn uống", icon: Utensils },
  // { label: "Gia dụng", icon: Sofa },
  { label: "Làm đẹp", icon: Sparkles },
  { label: "Thể thao", icon: Dumbbell },
  { label: "Sách", icon: Book },
];

export default function CategoryStrip() {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 sm:gap-3">
      {ITEMS.map(({ label, icon: Icon }) => (
        <button
          key={label}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2 py-3.5 text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-[#1a1d24] dark:text-slate-300 dark:hover:text-indigo-300 cursor-pointer"
        >
          <Icon size={18} />
          <span className="text-[16px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
