"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Headphones, PackageCheck, Timer } from "lucide-react";

import { getStaffDashboard, type StaffDashboard } from "@/features/staff/api/staff-api";
import { formatCurrency } from "@/shared/lib/format-currency";

export function StaffDashboardView() {
  const [dashboard, setDashboard] = useState<StaffDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStaffDashboard()
      .then(setDashboard)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <StaffLoading label="Dang tai tong quan nhan vien..." />;
  }

  if (!dashboard) {
    return <StaffEmpty label="Khong the tai du lieu van hanh." />;
  }

  const cards = [
    {
      title: "Don cho xu ly",
      value: dashboard.metrics.pendingOrders,
      icon: ClipboardList,
      tone: "bg-amber-100 text-amber-900",
    },
    {
      title: "Dang xu ly",
      value: dashboard.metrics.processingOrders,
      icon: Timer,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      title: "Can kiem kho",
      value: dashboard.metrics.lowStockItems,
      icon: PackageCheck,
      tone: "bg-green-50 text-green-700",
    },
    {
      title: "Review can xem",
      value: dashboard.metrics.supportReviews,
      icon: Headphones,
      tone: "bg-red-50 text-red-700",
    },
  ];

  return (
    <section>
      <StaffPageTitle eyebrow="Staff" title="Van hanh cua hang" />

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-stone-500">{item.title}</p>
                <span className={`grid h-10 w-10 place-items-center rounded-full ${item.tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold">{item.value}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <StaffPreview title="Don moi">
          {dashboard.orders.length ? (
            dashboard.orders.map((order) => (
              <div key={order.id} className="border-b border-amber-900/10 py-3 last:border-b-0">
                <p className="truncate text-sm font-semibold">{order.orderNumber}</p>
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  {order.customerName} / {formatCurrency(order.totalAmount)}
                </p>
              </div>
            ))
          ) : (
            <StaffMuted>Chua co don moi.</StaffMuted>
          )}
        </StaffPreview>
        <StaffPreview title="Can kiem kho">
          {dashboard.inventory.length ? (
            dashboard.inventory.map((item) => (
              <div key={item.id} className="border-b border-amber-900/10 py-3 last:border-b-0">
                <p className="truncate text-sm font-semibold">{item.productName}</p>
                <p className="mt-1 text-xs font-semibold text-red-700">
                  Ton {item.stockQuantity} / nguong {item.lowStockThreshold}
                </p>
              </div>
            ))
          ) : (
            <StaffMuted>Ton kho dang on.</StaffMuted>
          )}
        </StaffPreview>
        <StaffPreview title="Ho tro">
          {dashboard.reviews.length ? (
            dashboard.reviews.map((review) => (
              <div key={review.id} className="border-b border-amber-900/10 py-3 last:border-b-0">
                <p className="truncate text-sm font-semibold">{review.productName}</p>
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  {review.rating}/5 {review.title ? `- ${review.title}` : ""}
                </p>
              </div>
            ))
          ) : (
            <StaffMuted>Khong co review can xem.</StaffMuted>
          )}
        </StaffPreview>
      </div>
    </section>
  );
}

export function StaffPageTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
    </div>
  );
}

export function StaffLoading({ label }: { label: string }) {
  return (
    <section className="grid min-h-[320px] place-items-center rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-stone-600">{label}</p>
    </section>
  );
}

export function StaffEmpty({ label }: { label: string }) {
  return (
    <section className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-stone-600">{label}</p>
    </section>
  );
}

function StaffPreview({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function StaffMuted({ children }: { children: React.ReactNode }) {
  return <p className="py-3 text-sm font-medium text-stone-500">{children}</p>;
}
