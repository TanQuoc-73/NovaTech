"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  PackageCheck,
  ReceiptText,
  Search,
  X,
} from "lucide-react";

import {
  getAdminOrders,
  updateAdminOrderPaymentStatus,
  updateAdminOrderStatus,
  type AdminOrder,
  type AdminOrderStatus,
  type AdminPaymentStatus,
} from "@/features/admin/api/admin-api";
import { formatCurrency } from "@/shared/lib/format-currency";
import { PageSkeleton } from "@/shared/ui/loading-skeleton";

const pageSize = 10;

const orderStatuses: AdminOrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const paymentStatuses: AdminPaymentStatus[] = [
  "unpaid",
  "paid",
  "failed",
  "refunded",
];

const statusLabels: Record<AdminOrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  refunded: "Hoàn tiền",
};

const paymentStatusLabels: Record<AdminPaymentStatus, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | AdminOrderStatus>(
    "all",
  );
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | AdminPaymentStatus
  >("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .catch(() => setMessage("Không thể tải danh sách đơn hàng."))
      .finally(() => setIsLoading(false));
  }, []);

  const metrics = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      shipping: orders.filter((order) =>
        ["confirmed", "processing", "shipped"].includes(order.status),
      ).length,
      paidRevenue: orders
        .filter(
          (order) =>
            order.paymentStatus === "paid" || order.status === "delivered",
        )
        .reduce((sum, order) => sum + order.totalAmount, 0),
    }),
    [orders],
  );

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      if (
        paymentFilter !== "all" &&
        order.paymentStatus !== paymentFilter
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.shippingAddress,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [orders, paymentFilter, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleOrders.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedOrders = visibleOrders.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const pageStart = visibleOrders.length ? (safePage - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(safePage * pageSize, visibleOrders.length);

  async function handleStatusChange(id: string, status: AdminOrderStatus) {
    setPendingAction(`${id}:status`);
    setMessage(null);

    try {
      applyNextOrders(await updateAdminOrderStatus(id, status), id);
    } catch {
      setMessage("Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePaymentStatusChange(
    id: string,
    paymentStatus: AdminPaymentStatus,
  ) {
    setPendingAction(`${id}:payment`);
    setMessage(null);

    try {
      applyNextOrders(await updateAdminOrderPaymentStatus(id, paymentStatus), id);
    } catch {
      setMessage("Không thể cập nhật trạng thái thanh toán.");
    } finally {
      setPendingAction(null);
    }
  }

  function applyNextOrders(nextOrders: AdminOrder[], selectedId: string) {
    setOrders(nextOrders);
    setSelectedOrder(
      nextOrders.find((order) => order.id === selectedId) ?? null,
    );
  }

  if (isLoading) {
    return <PageSkeleton description cards={4} />;
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-end gap-4">
        <span className="rounded-md border border-cyan-950/10 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
          {visibleOrders.length} / {orders.length} đơn
        </span>
      </div>

      {message ? (
        <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={<ReceiptText className="h-5 w-5" />}
          label="Tổng đơn"
          value={metrics.total}
        />
        <MetricCard
          icon={<CalendarClock className="h-5 w-5" />}
          label="Chờ xử lý"
          value={metrics.pending}
        />
        <MetricCard
          icon={<PackageCheck className="h-5 w-5" />}
          label="Đang vận hành"
          value={metrics.shipping}
        />
        <MetricCard
          icon={<CreditCard className="h-5 w-5" />}
          label="Doanh thu đã thu"
          value={formatCurrency(metrics.paidRevenue)}
        />
      </div>

      <div className="mt-6 grid gap-3 rounded-lg border border-cyan-950/10 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px]">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm mã đơn, khách hàng, email, số điện thoại"
            className="h-11 w-full rounded-md border border-cyan-950/15 pl-9 pr-3 text-sm font-medium outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
          />
        </label>
        <FilterSelect
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value as "all" | AdminOrderStatus);
            setPage(1);
          }}
          options={[
            ["all", "Tất cả trạng thái"],
            ...orderStatuses.map((status) => [status, statusLabels[status]]),
          ]}
        />
        <FilterSelect
          value={paymentFilter}
          onChange={(value) => {
            setPaymentFilter(value as "all" | AdminPaymentStatus);
            setPage(1);
          }}
          options={[
            ["all", "Tất cả thanh toán"],
            ...paymentStatuses.map((status) => [
              status,
              paymentStatusLabels[status],
            ]),
          ]}
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-lg border border-cyan-950/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead className="bg-cyan-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.length ? (
                pagedOrders.map((order) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    onSelect={() => setSelectedOrder(order)}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    Không có đơn hàng phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cyan-950/10 px-4 py-3 text-sm">
          <p className="font-medium text-slate-500">
            Hiển thị {pageStart}-{pageEnd} trong {visibleOrders.length} đơn
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="grid h-9 w-9 place-items-center rounded-md border border-cyan-950/15 text-slate-700 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="min-w-24 text-center font-semibold">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="grid h-9 w-9 place-items-center rounded-md border border-cyan-950/15 text-slate-700 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {selectedOrder ? (
        <OrderDetailModal
          order={selectedOrder}
          pendingAction={pendingAction}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onPaymentStatusChange={handlePaymentStatusChange}
        />
      ) : null}
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <article className="rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-50 text-cyan-700">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 rounded-md border border-cyan-950/15 px-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
    >
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}

function OrderTableRow({
  order,
  onSelect,
}: {
  order: AdminOrder;
  onSelect: () => void;
}) {
  return (
    <tr
      onClick={onSelect}
      className="cursor-pointer border-t border-cyan-950/10 transition hover:bg-cyan-50/70"
    >
      <td className="px-4 py-4">
        <p className="font-semibold text-slate-950">{order.orderNumber}</p>
        <p className="mt-1 text-xs font-semibold uppercase text-cyan-700">
          {order.paymentMethod}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="font-semibold">{order.customerName}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {order.customerPhone}
        </p>
      </td>
      <td className="px-4 py-4 text-slate-600">{formatDate(order.createdAt)}</td>
      <td className="px-4 py-4">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-4 py-4">
        <PaymentBadge status={order.paymentStatus} />
      </td>
      <td className="px-4 py-4 text-right font-semibold">
        {formatCurrency(order.totalAmount)}
      </td>
    </tr>
  );
}

function OrderDetailModal({
  order,
  pendingAction,
  onClose,
  onStatusChange,
  onPaymentStatusChange,
}: {
  order: AdminOrder;
  pendingAction: string | null;
  onClose: () => void;
  onStatusChange: (id: string, status: AdminOrderStatus) => Promise<void>;
  onPaymentStatusChange: (
    id: string,
    paymentStatus: AdminPaymentStatus,
  ) => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Đóng chi tiết đơn hàng"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-[#f8fbfd] shadow-2xl shadow-slate-950/30">
        <div className="flex items-start justify-between gap-4 border-b border-cyan-950/10 bg-white px-5 py-4 text-slate-950">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Chi tiết đơn hàng
            </p>
            <h2 className="mt-2 truncate text-2xl font-semibold">
              {order.orderNumber}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-cyan-950/15 text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-73px)] overflow-y-auto p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="space-y-5">
              <section>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={order.status} />
                  <PaymentBadge status={order.paymentStatus} />
                  <span className="rounded-md bg-cyan-50 px-2.5 py-1 text-xs font-semibold uppercase text-cyan-700">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <InfoLine label="Khách hàng" value={order.customerName} />
                  <InfoLine label="Số điện thoại" value={order.customerPhone} />
                  <InfoLine label="Email" value={order.customerEmail} />
                  <InfoLine label="Ngày tạo" value={formatDate(order.createdAt)} />
                </div>
                <InfoLine
                  className="mt-3"
                  label="Địa chỉ giao hàng"
                  value={order.shippingAddress}
                />
                {order.note ? (
                  <InfoLine className="mt-3" label="Ghi chú" value={order.note} />
                ) : null}
              </section>

              <section>
                <h3 className="font-semibold">Sản phẩm trong đơn</h3>
                <div className="mt-3 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 rounded-md bg-white px-3 py-3 text-sm shadow-sm sm:grid-cols-[1fr_130px_130px]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {item.productName}
                        </p>
                        <p className="mt-1 truncate text-xs font-medium text-slate-500">
                          {item.variantName} / {item.sku}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-600">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </p>
                      <p className="font-semibold sm:text-right">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="grid content-start gap-4">
              <section className="rounded-lg border border-cyan-950/10 bg-white p-4 shadow-sm">
                <h3 className="font-semibold">Xử lý đơn</h3>
                <label className="mt-4 block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Trạng thái đơn
                  </span>
                  <select
                    value={order.status}
                    disabled={pendingAction === `${order.id}:status`}
                    onChange={(event) =>
                      void onStatusChange(
                        order.id,
                        event.target.value as AdminOrderStatus,
                      )
                    }
                    className="mt-2 h-10 w-full rounded-md border border-cyan-950/15 px-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:opacity-60"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 block">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    Thanh toán
                  </span>
                  <select
                    value={order.paymentStatus}
                    disabled={pendingAction === `${order.id}:payment`}
                    onChange={(event) =>
                      void onPaymentStatusChange(
                        order.id,
                        event.target.value as AdminPaymentStatus,
                      )
                    }
                    className="mt-2 h-10 w-full rounded-md border border-cyan-950/15 px-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:opacity-60"
                  >
                    {paymentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {paymentStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              <section className="rounded-lg border border-cyan-950/10 bg-white p-4 shadow-sm">
                <h3 className="font-semibold">Thành tiền</h3>
                <div className="mt-4 grid gap-3">
                  <SummaryLine label="Tạm tính" value={order.subtotalAmount} />
                  <SummaryLine label="Vận chuyển" value={order.shippingAmount} />
                  <SummaryLine label="Giảm giá" value={-order.discountAmount} />
                  <div className="flex items-center justify-between gap-4 border-t border-cyan-950/10 pt-3 text-base">
                    <span className="font-semibold">Tổng cộng</span>
                    <span className="font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoLine({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-cyan-950/10 pb-2 text-sm last:border-b-0">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminOrderStatus }) {
  const tone =
    status === "delivered"
      ? "bg-emerald-50 text-emerald-700"
      : status === "cancelled" || status === "refunded"
        ? "bg-red-50 text-red-700"
        : "bg-cyan-50 text-cyan-700";

  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {statusLabels[status]}
    </span>
  );
}

function PaymentBadge({ status }: { status: AdminPaymentStatus }) {
  const tone =
    status === "paid"
      ? "bg-emerald-50 text-emerald-700"
      : status === "failed" || status === "refunded"
        ? "bg-red-50 text-red-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {paymentStatusLabels[status]}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
