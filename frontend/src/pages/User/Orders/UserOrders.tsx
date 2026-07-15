import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Loader2,
  PackageOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Order } from "../../../types/features/order";
import orderApi from "../../../api/features/order";
import paymentApi from "../../../api/features/payment";
import { AppAlert } from "../../../components/ui/AppAlert";
import { getApiErrorMessage, formatVnd } from "../../../libs/helper";
import { useCart } from "../../../contexts/CartContext";
import { BANK_INFO } from "../../../utils/bankInfo";
import { STATUS_LABEL, STATUS_STYLE } from "../../../libs/constance";

type Tab = "cart" | "history";

export default function UserOrders() {
  const { refreshCart } = useCart();
  const [tab, setTab] = useState<Tab>("cart");

  const [cart, setCart] = useState<Order | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const [history, setHistory] = useState<Order[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [checkingOut, setCheckingOut] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "VNPAY" | "BANK_TRANSFER"
  >("COD");
  const [shipping, setShipping] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddr: "",
    note: "",
  });

  const fetchCart = async () => {
    setCartLoading(true);
    try {
      const res = await orderApi.getCart();
      setCart(res);
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Không thể tải giỏ hàng",
      });
    } finally {
      setCartLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await orderApi.getOrders(1, 20);
      setHistory(res?.data ?? []);
      setHistoryLoaded(true);
    } catch (err) {
      AppAlert({
        icon: "error",
        title:
          (await getApiErrorMessage(err)) || "Không thể tải lịch sử đơn hàng",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (tab === "history" && !historyLoaded) fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const changeQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setMutatingId(productId);
    try {
      const res = await orderApi.updateCartItem(productId, quantity);
      setCart(res);
      await refreshCart();
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Không thể cập nhật số lượng",
      });
    } finally {
      setMutatingId(null);
    }
  };

  const removeItem = async (productId: string) => {
    setMutatingId(productId);
    try {
      const res = await orderApi.removeCartItem(productId);
      setCart(res);
      await refreshCart();
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Không thể xóa sản phẩm",
      });
    } finally {
      setMutatingId(null);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setCheckingOut(true);
    try {
      await orderApi.checkout({ ...shipping, paymentMethod });
      AppAlert({ icon: "success", title: "Đặt hàng thành công" });
      setShipping({
        shippingName: "",
        shippingPhone: "",
        shippingAddr: "",
        note: "",
      });
      await fetchCart();
      await refreshCart();
      setTab("history");
      await fetchHistory();
    } catch (err) {
      AppAlert({
        icon: "error",
        title: (await getApiErrorMessage(err)) || "Đặt hàng thất bại",
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const handlePay = async (orderId: string) => {
    setPayingId(orderId);
    try {
      const res = await paymentApi.createVnpayPayment(orderId);
      // Leaves the app — VNPay redirects back to /payment/result once
      // the user finishes (or cancels) paying.
      window.location.href = res.paymentUrl;
    } catch (err) {
      AppAlert({
        icon: "error",
        title:
          (await getApiErrorMessage(err)) || "Không thể khởi tạo thanh toán",
      });
      setPayingId(null);
    }
  };

  const items = cart?.items ?? [];

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6">
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
          Đơn hàng của tôi
        </h1>
        <p className="text-[13px] text-slate-400">
          Quản lý giỏ hàng và theo dõi đơn hàng đã đặt
        </p>
      </div>

      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setTab("cart")}
          className={`relative px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            tab === "cart"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          Giỏ hàng {items.length > 0 && `(${items.length})`}
          {tab === "cart" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-500" />
          )}
        </button>
        <button
          onClick={() => setTab("history")}
          className={`relative px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            tab === "history"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          Lịch sử đơn hàng
          {tab === "history" && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-500" />
          )}
        </button>
      </div>

      {tab === "cart" ? (
        cartLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={22} className="animate-spin text-slate-300" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-16 text-slate-400 dark:border-white/10">
            <ShoppingCart size={28} />
            <span className="text-sm">Giỏ hàng của bạn đang trống</span>
          </div>
        ) : (
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="flex flex-1 flex-col gap-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#1a1d24]"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[13px] font-semibold text-slate-800 dark:text-white">
                      {item.product.name}
                    </p>
                    <p className="text-[12px] text-slate-400">
                      {formatVnd(item.price)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 dark:border-white/10">
                    <button
                      onClick={() =>
                        changeQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={
                        mutatingId === item.productId || item.quantity <= 1
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-white/10 cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-[13px] font-medium text-slate-700 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        changeQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={mutatingId === item.productId}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-white/10 cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <span className="w-24 shrink-0 text-right text-[13px] font-bold text-indigo-600 dark:text-indigo-400">
                    {formatVnd(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.productId)}
                    disabled={mutatingId === item.productId}
                    aria-label="Xóa"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 cursor-pointer disabled:opacity-40"
                  >
                    {mutatingId === item.productId ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1a1d24] md:w-80">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Thông tin giao hàng
              </h3>
              <input
                value={shipping.shippingName}
                onChange={(e) =>
                  setShipping((s) => ({ ...s, shippingName: e.target.value }))
                }
                placeholder="Họ tên người nhận"
                className="h-9 rounded-lg border border-slate-200 bg-transparent px-3 text-[13px] text-slate-700 outline-none focus:border-indigo-400 dark:border-white/10 dark:text-white"
              />
              <input
                value={shipping.shippingPhone}
                onChange={(e) =>
                  setShipping((s) => ({
                    ...s,
                    shippingPhone: e.target.value,
                  }))
                }
                placeholder="Số điện thoại"
                className="h-9 rounded-lg border border-slate-200 bg-transparent px-3 text-[13px] text-slate-700 outline-none focus:border-indigo-400 dark:border-white/10 dark:text-white"
              />
              <input
                value={shipping.shippingAddr}
                onChange={(e) =>
                  setShipping((s) => ({ ...s, shippingAddr: e.target.value }))
                }
                placeholder="Địa chỉ giao hàng"
                className="h-9 rounded-lg border border-slate-200 bg-transparent px-3 text-[13px] text-slate-700 outline-none focus:border-indigo-400 dark:border-white/10 dark:text-white"
              />
              <textarea
                value={shipping.note}
                onChange={(e) =>
                  setShipping((s) => ({ ...s, note: e.target.value }))
                }
                placeholder="Ghi chú (không bắt buộc)"
                rows={2}
                className="resize-none rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-indigo-400 dark:border-white/10 dark:text-white"
              />

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  Phương thức thanh toán
                </span>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 dark:border-white/10 dark:text-white cursor-pointer has-checked:border-indigo-400 has-checked:bg-indigo-50/50 dark:has-checked:bg-white/5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="accent-indigo-500"
                  />
                  Thanh toán khi nhận hàng (COD)
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 dark:border-white/10 dark:text-white cursor-pointer has-checked:border-indigo-400 has-checked:bg-indigo-50/50 dark:has-checked:bg-white/5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                    className="accent-indigo-500"
                  />
                  Thanh toán online qua VNPay
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 dark:border-white/10 dark:text-white cursor-pointer has-checked:border-indigo-400 has-checked:bg-indigo-50/50 dark:has-checked:bg-white/5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={() => setPaymentMethod("BANK_TRANSFER")}
                    className="accent-indigo-500"
                  />
                  Chuyển khoản QR (VietQR)
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-white/10">
                <span className="text-slate-500 dark:text-slate-400">
                  Tổng cộng
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-white">
                  {formatVnd(cart?.totalAmount ?? 0)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex items-center justify-center gap-1.5 rounded-full bg-indigo-500 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {checkingOut && <Loader2 size={14} className="animate-spin" />}
                Đặt hàng
              </button>
            </div>
          </div>
        )
      ) : historyLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-slate-300" />
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 py-16 text-slate-400 dark:border-white/10">
          <PackageOpen size={28} />
          <span className="text-sm">Bạn chưa có đơn hàng nào</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {history.map((order) => {
            const expanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#1a1d24]"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-white">
                      Đơn #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-[12px] text-slate-400">
                      {new Date(order.createdAt).toLocaleString("vi-VN")} ·{" "}
                      {order.items.length} sản phẩm
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                    {order.paymentMethod === "COD" && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                        COD
                      </span>
                    )}
                    {order.paymentMethod === "BANK_TRANSFER" && (
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                        VietQR
                      </span>
                    )}
                    {order.status === "CONFIRMED" &&
                      !order.isPaid &&
                      order.paymentMethod !== "COD" && (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-500 dark:bg-red-950/40 dark:text-red-400">
                          Cần thanh toán
                        </span>
                      )}
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {formatVnd(order.totalAmount)}
                    </span>
                    {expanded ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 p-4 dark:border-white/10">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-[13px] text-slate-700 dark:text-slate-200">
                            {item.product.name}
                          </p>
                          <p className="text-[12px] text-slate-400">
                            {item.quantity} x {formatVnd(item.price)}
                          </p>
                        </div>
                        <span className="text-[13px] font-semibold text-slate-700 dark:text-white">
                          {formatVnd(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1 dark:border-white/10">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          order.isPaid
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300"
                        }`}
                      >
                        {order.isPaid
                          ? `Đã thanh toán${
                              order.paidAt
                                ? ` · ${new Date(order.paidAt).toLocaleString("vi-VN")}`
                                : ""
                            }`
                          : order.paymentMethod === "COD"
                            ? "Thanh toán khi nhận hàng (COD)"
                            : order.paymentMethod === "BANK_TRANSFER"
                              ? "Chờ xác nhận chuyển khoản"
                              : "Chưa thanh toán"}
                      </span>

                      {order.status === "CONFIRMED" &&
                        !order.isPaid &&
                        order.paymentMethod === "VNPAY" && (
                          <button
                            onClick={() => handlePay(order.id)}
                            disabled={payingId === order.id}
                            className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                          >
                            {payingId === order.id && (
                              <Loader2 size={12} className="animate-spin" />
                            )}
                            Thanh toán ngay
                          </button>
                        )}
                    </div>

                    {order.status === "CONFIRMED" &&
                      !order.isPaid &&
                      order.paymentMethod === "BANK_TRANSFER" && (
                        <div className="mt-1 flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-white/10 sm:flex-row sm:items-start sm:text-left">
                          <img
                            src={BANK_INFO.qrImage}
                            alt="Mã QR chuyển khoản"
                            className="h-70 w-70 shrink-0 rounded-lg border border-slate-100 object-contain dark:border-white/10"
                          />
                          <div className="flex flex-col gap-1 text-[13px]">
                            <p className="font-semibold text-slate-700 dark:text-white">
                              Quét mã để chuyển khoản
                            </p>
                            <p className="text-slate-500 dark:text-slate-300">
                              Ngân hàng: {BANK_INFO.bankName}
                            </p>
                            <p className="text-slate-500 dark:text-slate-300">
                              Số tài khoản: {BANK_INFO.accountNumber}
                            </p>
                            <p className="text-slate-500 dark:text-slate-300">
                              Chủ tài khoản: {BANK_INFO.accountHolder}
                            </p>
                            <p className="text-slate-500 dark:text-slate-300">
                              Số tiền: {formatVnd(order.totalAmount)}
                            </p>
                            <p className="text-slate-500 dark:text-slate-300">
                              Nội dung CK: DH{order.id.slice(-8).toUpperCase()}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              Sau khi chuyển khoản, đơn hàng sẽ được xác nhận
                              trong ít phút.
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
