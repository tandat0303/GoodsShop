import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageSearch,
} from "lucide-react";
import { AppAlert } from "../../../../components/ui/AppAlert";
import {
  formatDate,
  formatVnd,
  getApiErrorMessage,
} from "../../../../libs/helper";
import {
  PAGE_SIZE,
  STATUS_FILTER_OPTIONS,
  STATUS_LABEL,
  STATUS_SELECT_OPTIONS,
  STATUS_STYLE,
} from "../../../../libs/constance";
import orderApi from "../../../../api/features/order";
import OrderDetail from "./OrderDetail";
import type { AdminOrder, OrderStatus } from "../../../../types/features/order";

export default function OrdersManagement() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [page, setPage] = useState(1);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.adminGetOrders(
        page,
        PAGE_SIZE,
        search || undefined,
        statusFilter === "all" ? undefined : statusFilter,
      );
      setOrders(res?.data ?? []);
      setTotal(res?.pagination?.total ?? 0);
    } catch (err) {
      AppAlert({
        icon: "error",
        title:
          (await getApiErrorMessage(err)) || "Không thể tải danh sách đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleStatusChange = async (order: AdminOrder, status: OrderStatus) => {
    if (status === order.status) return;
    setUpdatingId(order.id);
    try {
      const res = await orderApi.adminUpdateStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? res.data : o)));
      AppAlert({
        icon: "success",
        title: res?.message || "Đã cập nhật trạng thái đơn hàng",
      });
    } catch (err) {
      AppAlert({
        icon: "error",
        title:
          (await getApiErrorMessage(err)) ||
          "Không thể cập nhật trạng thái đơn hàng",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const inputClass =
    "h-10 rounded-lg border bg-white dark:bg-[#161b26] px-3.5 text-sm text-slate-700 dark:text-[#e6e9ef] placeholder:text-slate-300 dark:placeholder:text-[#5a6478] outline-none transition-colors focus:ring-2 focus:ring-offset-0 border-slate-200 dark:border-[#30363d] focus:border-[#EF4444] focus:ring-[#EF4444]/20 w-full";

  return (
    <div className="bg-white dark:bg-[#1c2333] rounded-2xl border border-slate-100 dark:border-[#30363d] p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-[#e6e9ef]">
            Quản lý đơn hàng
          </h1>
          <p className="text-xs text-slate-400 dark:text-[#8b95a8] mt-0.5">
            {total} đơn hàng
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center mb-4 gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-[#5a6478]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã đơn, tên hoặc email khách hàng..."
            className={`${inputClass} min-w-64 pl-9`}
            style={{ width: 320 }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as "all" | OrderStatus);
            setPage(1);
          }}
          className={`${inputClass} cursor-pointer`}
          style={{ width: 180 }}
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-[#30363d]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#161b26] text-left">
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Mã đơn
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Khách hàng
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Sản phẩm
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Tổng tiền
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Ngày đặt
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide">
                Trạng thái
              </th>
              <th className="px-4 py-3 font-semibold text-[12px] text-slate-500 dark:text-[#8b95a8] uppercase tracking-wide text-center">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-3.5">
                    <div className="h-4 rounded bg-slate-100 dark:bg-[#30363d] animate-pulse" />
                  </td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-[#5a6478]">
                    <PackageSearch size={28} />
                    <span className="text-[13px]">
                      Không tìm thấy đơn hàng nào
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const previewItems = o.items.slice(0, 3);
                const extraCount = o.items.length - previewItems.length;

                return (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50 dark:hover:bg-[#161b26]/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-700 dark:text-[#e6e9ef]">
                        #{o.id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-[#9aa4b2]">
                      <div className="flex flex-col">
                        <span className="text-slate-700 dark:text-[#e6e9ef] truncate max-w-40">
                          {o.user.fullName}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-[#6e7681] truncate max-w-40">
                          {o.user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center -space-x-2">
                        {previewItems.map((item) => (
                          <img
                            key={item.id}
                            src={item.product.image}
                            alt={item.product.name}
                            title={item.product.name}
                            className="w-8 h-8 rounded-lg object-cover border-2 border-white dark:border-[#1c2333]"
                          />
                        ))}
                        {extraCount > 0 && (
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#30363d] text-[10px] font-semibold text-slate-500 dark:text-[#9aa4b2] border-2 border-white dark:border-[#1c2333]">
                            +{extraCount}
                          </span>
                        )}
                        <span className="pl-3 text-[11px] text-slate-400 dark:text-[#6e7681]">
                          {o.items.length} sản phẩm
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-[#e6e9ef]">
                      {formatVnd(o.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-[#9aa4b2] whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              handleStatusChange(
                                o,
                                e.target.value as OrderStatus,
                              )
                            }
                            disabled={updatingId === o.id}
                            className={`h-8 rounded-full border-none px-2.5 text-[11px] font-semibold outline-none cursor-pointer disabled:opacity-60 ${STATUS_STYLE[o.status]}`}
                          >
                            {STATUS_SELECT_OPTIONS.map((s) => (
                              <option
                                key={s}
                                value={s}
                                disabled={s === "COMPLETED" && !o.isPaid}
                              >
                                {STATUS_LABEL[s]}
                                {s === "COMPLETED" && !o.isPaid
                                  ? " (chưa thanh toán)"
                                  : ""}
                              </option>
                            ))}
                          </select>
                          {updatingId === o.id && (
                            <Loader2
                              size={13}
                              className="animate-spin text-slate-300"
                            />
                          )}
                        </div>
                        <span
                          className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            o.isPaid
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-400"
                          }`}
                        >
                          {o.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setViewingOrder(o)}
                          aria-label="Xem chi tiết"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-slate-400 hover:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-[#8b95a8] cursor-pointer transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-slate-400 dark:text-[#8b95a8]">
            Trang {page}/{totalPages} · {total} kết quả
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b26] text-slate-500 dark:text-[#9aa4b2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b26] text-slate-500 dark:text-[#9aa4b2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {viewingOrder && (
        <OrderDetail
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </div>
  );
}
