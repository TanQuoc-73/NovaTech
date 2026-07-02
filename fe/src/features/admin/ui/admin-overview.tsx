"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Boxes, CircleDollarSign, ReceiptText } from "lucide-react";

import {
  getAdminDashboard,
  type AdminDashboard,
  type AdminRecentOrder,
} from "@/features/admin/api/admin-api";
import { formatCurrency } from "@/shared/lib/format-currency";

export function AdminOverview() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(setDashboard)
      .catch(() => setMessage("Khong the tai thong ke admin."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="grid min-h-[360px] place-items-center text-stone-700">
        <p className="text-sm font-semibold">Dang tai tong quan...</p>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="grid min-h-[360px] place-items-center text-stone-700">
        <p className="text-sm font-semibold">{message}</p>
      </section>
    );
  }

  return (
    <section>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
          Tong quan
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Thong ke van hanh</h1>
      </div>

      {message ? (
        <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <OverviewCard
          icon={<CircleDollarSign className="h-5 w-5" />}
          label="Doanh thu ghi nhan"
          value={formatCurrency(dashboard.metrics.revenue)}
        />
        <OverviewCard
          icon={<ReceiptText className="h-5 w-5" />}
          label="Tong don gan day"
          value={dashboard.metrics.orders}
        />
        <OverviewCard
          icon={<ReceiptText className="h-5 w-5" />}
          label="Don cho xu ly"
          value={dashboard.metrics.pendingOrders}
        />
        <OverviewCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Variant sap het"
          value={dashboard.metrics.lowStockVariants}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-lg border border-amber-900/10 bg-white shadow-sm">
          <div className="border-b border-amber-900/10 px-5 py-4">
            <h2 className="font-semibold">Don hang gan day</h2>
          </div>
          {dashboard.recentOrders.length ? (
            dashboard.recentOrders.map((order) => (
              <RecentOrderRow key={order.id} order={order} />
            ))
          ) : (
            <p className="px-5 py-6 text-sm font-medium text-stone-500">
              Chua co don hang nao.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Tinh trang catalog</h2>
            <Boxes className="h-5 w-5 text-amber-800" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-4 text-sm">
            <StatusLine label="Tong san pham" value={dashboard.metrics.products} />
            <StatusLine label="Dang ban" value={dashboard.metrics.activeProducts} />
            <StatusLine label="Danh muc" value={dashboard.metrics.categories} />
            <StatusLine label="Thuong hieu" value={dashboard.metrics.brands} />
          </div>
        </section>
      </div>
    </section>
  );
}

function OverviewCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <article className="rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <span className="text-amber-800">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function RecentOrderRow({ order }: { order: AdminRecentOrder }) {
  return (
    <div className="grid grid-cols-[1fr_120px_120px] items-center gap-4 border-b border-amber-900/10 px-5 py-4 text-sm last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-semibold">{order.orderNumber}</p>
        <p className="mt-1 truncate text-xs font-semibold text-stone-500">
          {order.customerName}
        </p>
      </div>
      <span className="rounded-md bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-800">
        {order.status}
      </span>
      <span className="text-right font-semibold">
        {formatCurrency(order.totalAmount)}
      </span>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-amber-900/10 pb-3 last:border-b-0 last:pb-0">
      <span className="font-medium text-stone-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
