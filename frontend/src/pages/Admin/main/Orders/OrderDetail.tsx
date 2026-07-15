import { useState } from "react";
import { Loader2, X } from "lucide-react";
import type { AdminOrder } from "../../../../types/features/order";
import { formatDate, formatVnd } from "../../../../libs/helper";
import { STATUS_LABEL, STATUS_STYLE } from "../../../../libs/constance";

export default function OrderDetail({
  order,
  onClose,
  onMarkPaid,
}: {
  order: AdminOrder;
  onClose: () => void;
  onMarkPaid?: (order: AdminOrder) => Promise<void> | void;
}) {
  const [marking, setMarking] = useState(false);

  const handleMarkPaid = async () => {
    if (!onMarkPaid) return;
    setMarking(true);
    try {
      await onMarkPaid(order);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1c2333] p-6 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-[#e6e9ef]">
              Đơn hàng #{order.id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mt-0.5">
              Đặt lúc {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-[#30363d] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLE[order.status]}`}
            >
              {STATUS_LABEL[order.status]}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                order.isPaid
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-[#30363d] dark:text-[#9aa4b2]"
              }`}
            >
              {order.isPaid
                ? `Đã thanh toán${order.paidAt ? ` · ${formatDate(order.paidAt)}` : ""}`
                : order.paymentMethod === "COD"
                  ? "Chưa thu tiền (COD)"
                  : order.paymentMethod === "BANK_TRANSFER"
                    ? "Chờ xác nhận chuyển khoản"
                    : "Chưa thanh toán"}
            </span>
            {order.paymentMethod && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                {order.paymentMethod === "COD"
                  ? "COD"
                  : order.paymentMethod === "BANK_TRANSFER"
                    ? "VietQR"
                    : "VNPay"}
              </span>
            )}
            {!order.isPaid && order.paymentMethod === "BANK_TRANSFER" && (
              <button
                onClick={handleMarkPaid}
                disabled={marking}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500 text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {marking && <Loader2 size={11} className="animate-spin" />}
                Xác nhận đã thanh toán
              </button>
            )}
          </div>
          <span className="text-lg font-bold text-slate-800 dark:text-[#e6e9ef]">
            {formatVnd(order.totalAmount)}
          </span>
        </div>

        {/* Customer + shipping */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-slate-100 dark:border-[#30363d] p-3">
            <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mb-1.5">
              Khách hàng
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-[#e6e9ef]">
              {order.user.fullName}
            </p>
            <p className="text-[12px] text-slate-400 dark:text-[#6e7681] truncate">
              {order.user.email}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-[#30363d] p-3">
            <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mb-1.5">
              Giao đến
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-[#e6e9ef]">
              {order.shippingName || "—"}
              {order.shippingPhone ? ` · ${order.shippingPhone}` : ""}
            </p>
            <p className="text-[12px] text-slate-400 dark:text-[#6e7681] truncate">
              {order.shippingAddr || "Chưa có địa chỉ"}
            </p>
          </div>
        </div>

        {order.note && (
          <div className="mb-4 rounded-xl border border-slate-100 dark:border-[#30363d] p-3">
            <p className="text-[11px] text-slate-400 dark:text-[#6e7681] mb-1">
              Ghi chú
            </p>
            <p className="text-sm text-slate-600 dark:text-[#cdd5e0]">
              {order.note}
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-[#30363d] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-slate-700 dark:text-[#e6e9ef] truncate">
                  {item.product.name}
                </p>
                <p className="text-[12px] text-slate-400 dark:text-[#6e7681]">
                  {item.quantity} x {formatVnd(item.price)}
                </p>
              </div>
              <span className="text-[13px] font-semibold text-slate-700 dark:text-[#e6e9ef] shrink-0">
                {formatVnd(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-[#6e7681] pt-3 mt-4 border-t border-slate-100 dark:border-[#30363d]">
          <span>Mã đơn: {order.id}</span>
          <span>Cập nhật: {formatDate(order.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
