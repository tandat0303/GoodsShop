import { useRef, useState } from "react";
import { ImageOff, Loader2, UploadCloud, X } from "lucide-react";
import { AppAlert } from "./ui/AppAlert";
import { getApiErrorMessage } from "../libs/helper";
import uploadApi from "../api/features/upload";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  /** "square" cho ảnh sản phẩm, "circle" cho logo thương hiệu */
  shape?: "square" | "circle";
  size?: number;
}

export default function ImageUploadField({
  value,
  onChange,
  shape = "square",
  size = 72,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng 1 file lần sau
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      AppAlert({
        icon: "error",
        title: "Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      AppAlert({ icon: "error", title: "Ảnh vượt quá dung lượng 5MB" });
      return;
    }

    setUploading(true);
    setBroken(false);
    try {
      const res = await uploadApi.uploadImage(file);
      onChange(res.url);
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Tải ảnh lên thất bại",
      });
    } finally {
      setUploading(false);
    }
  };

  const radius = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative shrink-0 ${radius} overflow-hidden border border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b26] flex items-center justify-center`}
        style={{ width: size, height: size }}
      >
        {value && !broken ? (
          <img
            src={value}
            alt="preview"
            onError={() => setBroken(true)}
            className={`w-full h-full object-cover ${shape === "circle" ? "object-contain p-1.5 bg-white" : ""}`}
          />
        ) : (
          <ImageOff size={18} className="text-slate-300 dark:text-[#5a6478]" />
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 size={18} className="text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-[#EF4444] bg-red-50 dark:bg-red-950/30 border-none cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <UploadCloud size={14} />
            {value ? "Đổi ảnh" : "Tải ảnh lên"}
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={uploading}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 bg-slate-100 dark:bg-[#30363d] border-none cursor-pointer hover:opacity-90 disabled:opacity-60"
              aria-label="Xóa ảnh"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-[#6e7681]">
          JPG, PNG, WEBP, GIF · tối đa 5MB
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
