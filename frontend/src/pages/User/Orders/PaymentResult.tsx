import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get("status") === "success";

  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      {success ? (
        <CheckCircle2 size={56} className="text-emerald-500" />
      ) : (
        <XCircle size={56} className="text-red-500" />
      )}
      <h1 className="text-lg font-bold text-slate-800 dark:text-white">
        {success ? "Thanh toán thành công" : "Thanh toán thất bại"}
      </h1>
      <p className="text-sm text-slate-400">
        {success
          ? "Đơn hàng của bạn đã được thanh toán. Cảm ơn bạn đã mua sắm!"
          : "Giao dịch không thành công hoặc đã bị hủy. Bạn có thể thử lại."}
      </p>
      <button
        onClick={() => navigate("/cart")}
        className="mt-2 rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 cursor-pointer"
      >
        Xem đơn hàng của tôi
      </button>
    </section>
  );
}
