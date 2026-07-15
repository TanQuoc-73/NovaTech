"use client";

import { useEffect, useState } from "react";
import { getMyOrders, type CustomerOrder } from "@/features/orders/api/orders-api";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";
import { formatCurrency } from "@/shared/lib/format-currency";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import type { Locale } from "@/shared/i18n/config";

const statusLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

export default function OrdersPage() {
  const locale = resolveLocale(undefined);
  const dictionary = getDictionary(locale);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-2xl font-bold">Lịch sử đơn hàng</h1>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface)]" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
              Bạn chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">#{order.orderNumber}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                        {statusLabel[order.status] ?? order.status}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(order.totalAmount, locale as Locale)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-[var(--border)] pt-3 text-sm">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-1">
                        <span className="text-[var(--muted)]">
                          {item.productName} ({item.variantName}) x{item.quantity}
                        </span>
                        <span>{formatCurrency(item.totalPrice, locale as Locale)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
