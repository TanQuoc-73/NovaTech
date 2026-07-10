"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Users, UserPlus, ShoppingBag } from "lucide-react";

import { getAdminUsers, type AdminUser } from "@/features/admin/api/admin-api";
import { UserList } from "./user-list";

export function AdminCustomers() {
  const [allCustomers, setAllCustomers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminUsers({ role: "customer" })
      .then(setAllCustomers)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const newThisMonth = allCustomers.filter((c) =>
      c.createdAt.startsWith(thisMonth),
    ).length;

    const withOrders = allCustomers.filter((c) => c.orderCount > 0).length;

    return {
      total: allCustomers.length,
      newThisMonth,
      withOrders,
      avgOrders:
        allCustomers.length > 0
          ? (
              allCustomers.reduce((s, c) => s + c.orderCount, 0) /
              allCustomers.length
            ).toFixed(1)
          : "0",
    };
  }, [allCustomers]);

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Tổng khách hàng"
          value={metrics.total}
        />
        <MetricCard
          icon={<UserPlus className="h-5 w-5" />}
          label="Mới trong tháng"
          value={metrics.newThisMonth}
        />
        <MetricCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Đã mua hàng"
          value={metrics.withOrders}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Đơn trung bình / KH"
          value={metrics.avgOrders}
        />
      </div>

      <div className="mt-8">
        <UserList
          roles={["customer"]}
          title="Khách hàng"
          emptyMessage="Chưa có khách hàng nào."
        />
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
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
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}
