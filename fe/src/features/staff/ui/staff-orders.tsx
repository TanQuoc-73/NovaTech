"use client";

import { useEffect, useState } from "react";

import {
  getStaffOrders,
  updateStaffOrderStatus,
  type StaffOrder,
  type StaffOrderStatus,
} from "@/features/staff/api/staff-api";
import {
  StaffEmpty,
  StaffLoading,
  StaffPageTitle,
} from "@/features/staff/ui/staff-dashboard";
import { formatCurrency } from "@/shared/lib/format-currency";

const orderStatuses: StaffOrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function StaffOrdersView() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    getStaffOrders()
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleStatusChange(id: string, status: StaffOrderStatus) {
    setPendingId(id);

    try {
      setOrders(await updateStaffOrderStatus(id, status));
    } finally {
      setPendingId(null);
    }
  }

  if (isLoading) {
    return <StaffLoading label="Dang tai don hang..." />;
  }

  return (
    <section>
      <StaffPageTitle eyebrow="Xu ly don" title="Don hang can thao tac" />

      <div className="mt-8 space-y-4">
        {orders.length ? (
          orders.map((order) => (
            <article
              key={order.id}
              className="rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="mt-1 text-sm font-medium text-stone-500">
                    {order.customerName} / {order.customerPhone}
                  </p>
                  <p className="mt-1 max-w-2xl text-sm text-stone-500">
                    {order.shippingAddress}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                  <p className="mt-1 text-xs font-semibold uppercase text-amber-800">
                    {order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-amber-900/10 pt-4 md:grid-cols-[1fr_180px]">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-md bg-[#fffdf7] px-3 py-2 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {item.productName}
                        </span>
                        <span className="text-xs font-medium text-stone-500">
                          {item.variantName} x {item.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                <label className="block">
                  <span className="text-xs font-semibold uppercase text-stone-500">
                    Trang thai
                  </span>
                  <select
                    value={order.status}
                    disabled={pendingId === order.id}
                    onChange={(event) =>
                      void handleStatusChange(
                        order.id,
                        event.target.value as StaffOrderStatus,
                      )
                    }
                    className="mt-2 h-10 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70 disabled:opacity-60"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))
        ) : (
          <StaffEmpty label="Chua co don hang can thao tac." />
        )}
      </div>
    </section>
  );
}
