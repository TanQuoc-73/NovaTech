"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  Download,
  Megaphone,
  PackageSearch,
  Printer,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import {
  getAdminDashboard,
  type AdminDashboard,
  type AdminRecentOrder,
} from "@/features/admin/api/admin-api";
import { formatCurrency } from "@/shared/lib/format-currency";
import { PageSkeleton } from "@/shared/ui/loading-skeleton";

const STATUS_COLORS = ["#06B6D4", "#F59E0B", "#10B981", "#6366F1", "#EF4444", "#8B5CF6", "#EC4899"];

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  refunded: "Hoàn tiền",
};

export function AdminOverview() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportScope, setReportScope] = useState("all");

  useEffect(() => {
    getAdminDashboard()
      .then(setDashboard)
      .catch(() => setMessage("Không thể tải thống kê admin."))
      .finally(() => setIsLoading(false));
  }, []);

  const analytics = useMemo(() => buildAdminAnalytics(dashboard), [dashboard]);
  const reportOptions = useMemo(() => buildReportOptions(dashboard), [dashboard]);
  const report = useMemo(
    () => buildAdminReport(dashboard, analytics, reportScope),
    [analytics, dashboard, reportScope],
  );

  const revenueChartData = useMemo(() => {
    const dayMap = new Map<string, number>();

    for (const order of report.orders) {
      const day = order.createdAt.slice(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + order.totalAmount);
    }

    return Array.from(dayMap, ([date, revenue]) => ({ date, revenue })).sort(
      (a, b) => a.date.localeCompare(b.date),
    );
  }, [report.orders]);

  const statusChartData = useMemo(() => {
    const statusMap = new Map<string, number>();

    for (const order of report.orders) {
      const label = statusLabels[order.status] ?? order.status;
      statusMap.set(label, (statusMap.get(label) ?? 0) + 1);
    }

    return Array.from(statusMap, ([name, value]) => ({ name, value }));
  }, [report.orders]);

  const inventoryChartData = useMemo(
    () => [
      { name: "Sản phẩm", value: dashboard?.metrics.products ?? 0 },
      { name: "Đang bán", value: dashboard?.metrics.activeProducts ?? 0 },
      { name: "Danh mục", value: dashboard?.metrics.categories ?? 0 },
      { name: "Thương hiệu", value: dashboard?.metrics.brands ?? 0 },
    ],
    [dashboard],
  );

  if (isLoading) {
    return <PageSkeleton description cards={4} />;
  }

  if (!dashboard) {
    return (
      <section className="grid min-h-[360px] place-items-center text-slate-700">
        <p className="text-sm font-semibold">{message}</p>
      </section>
    );
  }

  return (
      <section id="admin-report">
        <PrintableBusinessReport report={report} analytics={analytics} />

        <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                getAdminDashboard()
                  .then(setDashboard)
                  .catch(() => setMessage("Không thể tải thống kê admin."))
                  .finally(() => setIsLoading(false));
              }}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-cyan-950/10 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Làm mới
            </button>
            <div className="rounded-lg border border-cyan-950/10 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
              Cập nhật theo dữ liệu mới nhất từ hệ thống
            </div>
          <select
            value={reportScope}
            onChange={(event) => setReportScope(event.target.value)}
            className="h-11 rounded-lg border border-cyan-950/10 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            aria-label="Chọn kỳ báo cáo"
          >
            <option value="all">Tổng</option>
            {reportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => downloadExcelReport(report)}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-cyan-950/10 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Tải Excel
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-slate-950 shadow-sm shadow-cyan-900/20 transition hover:bg-cyan-400"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            In báo cáo
          </button>
        </div>

      {message ? (
        <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <section className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Nội dung website
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Dashboard quản lý
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Tổng quan trạng thái các nội dung, truy cập nhanh đến trang quản lý chi tiết.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/admin/catalog"
            className="group rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Kho hàng
              </p>
              <Boxes className="h-5 w-5 text-cyan-600 transition group-hover:text-cyan-500" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{dashboard.metrics.products}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {dashboard.metrics.activeProducts} đang bán &middot; {dashboard.metrics.categories} danh mục &middot; {dashboard.metrics.brands} thương hiệu
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="group rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Đơn hàng
              </p>
              <ShoppingBag className="h-5 w-5 text-cyan-600 transition group-hover:text-cyan-500" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{dashboard.metrics.orders}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {dashboard.metrics.pendingOrders} đơn chờ xử lý &middot; {dashboard.metrics.deliveredOrders} đã giao
            </p>
          </Link>

          <Link
            href="/admin/payments"
            className="group rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Thanh toán
              </p>
              <CircleDollarSign className="h-5 w-5 text-cyan-600 transition group-hover:text-cyan-500" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{dashboard.paymentQrSettings.length}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Phương thức QR &middot; Doanh thu {formatCurrency(dashboard.metrics.revenue)}
            </p>
          </Link>

          <Link
            href="/admin/marketing"
            className="group rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
                Marketing
              </p>
              <Megaphone className="h-5 w-5 text-cyan-600 transition group-hover:text-cyan-500" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{dashboard.heroBanners.length + dashboard.newsArticles.length + dashboard.vouchers.length}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {dashboard.heroBanners.length} banner &middot; {dashboard.newsArticles.length} tin tức &middot; {dashboard.vouchers.length} voucher
            </p>
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Báo cáo
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {report.title}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Dùng bộ chọn kỳ báo cáo để in hoặc tải file Excel theo tháng/tổng.
            </p>
          </div>
          <span className="rounded-lg bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700">
            {report.orders.length} đơn trong kỳ
          </span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <ReportValue label="Doanh thu kỳ này" value={formatCurrency(report.revenue)} />
          <ReportValue label="Số đơn" value={report.orders.length} />
          <ReportValue label="Đơn trung bình" value={formatCurrency(report.averageOrderValue)} />
          <ReportValue label="Dự báo" value={formatCurrency(report.forecastRevenue)} />
        </div>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <OverviewCard
          icon={<CircleDollarSign className="h-5 w-5" />}
          label="Doanh thu ghi nhận"
          value={formatCurrency(dashboard.metrics.revenue)}
        />
        <OverviewCard
          icon={<ReceiptText className="h-5 w-5" />}
          label="Tổng đơn gần đây"
          value={dashboard.metrics.orders}
        />
        <OverviewCard
          icon={<ReceiptText className="h-5 w-5" />}
          label="Đơn chờ xử lý"
          value={dashboard.metrics.pendingOrders}
        />
        <OverviewCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Variant sắp hết"
          value={dashboard.metrics.lowStockVariants}
        />
      </div>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            Doanh thu theo ngày
          </p>
          <div className="mt-4 h-64">
            {revenueChartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(val) => val.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                    }}
                    formatter={(val) => formatCurrency(Number(val) || 0)}
                    labelFormatter={(label) => {
                      const d = new Date(label + "T00:00:00");
                      return d.toLocaleDateString("vi-VN");
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-500">
                {revenueChartData.length === 1
                  ? "Cần thêm dữ liệu để hiển thị biểu đồ."
                  : "Chưa có dữ liệu doanh thu."}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            Trạng thái đơn hàng
          </p>
          <div className="mt-4 h-64">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((_entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-500">
                Chưa có đơn hàng.
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {statusChartData.map((entry, index) => (
              <span key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
          Tồn kho
        </p>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="value" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Dự đoán phát triển
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Xu hướng kỳ tới
              </h2>
            </div>
            <TrendingUp className="h-5 w-5 text-cyan-700" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ForecastCard
              label="Doanh thu dự kiến"
              value={formatCurrency(analytics.forecastRevenue)}
              note={analytics.forecastNote}
            />
            <ForecastCard
              label="Đơn dự kiến"
              value={`${analytics.forecastOrders} đơn`}
              note="Ước tính từ nhịp đơn gần đây"
            />
            <ForecastCard
              label="Tăng trưởng mục tiêu"
              value={`${analytics.growthTarget}%`}
              note="Mốc đề xuất cho kỳ tiếp theo"
            />
          </div>
        </section>

        <section className="rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-950">Chỉ số vận hành</h2>
            <Activity className="h-5 w-5 text-cyan-700" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-4">
            <ProgressLine
              label="Tỷ lệ giao thành công"
              value={analytics.deliveryRate}
              detail={`${dashboard.metrics.deliveredOrders}/${dashboard.metrics.orders} đơn`}
            />
            <ProgressLine
              label="Sản phẩm đang bán"
              value={analytics.activeProductRate}
              detail={`${dashboard.metrics.activeProducts}/${dashboard.metrics.products} sản phẩm`}
            />
            <ProgressLine
              label="Áp lực tồn kho thấp"
              value={analytics.lowStockRate}
              detail={`${dashboard.metrics.lowStockVariants} variant cần chú ý`}
              danger={analytics.lowStockRate > 20}
            />
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-lg border border-cyan-950/10 bg-white shadow-sm">
          <div className="border-b border-cyan-950/10 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Đơn hàng gần đây</h2>
          </div>
          {dashboard.recentOrders.length ? (
            dashboard.recentOrders.map((order) => (
              <RecentOrderRow key={order.id} order={order} />
            ))
          ) : (
            <p className="px-5 py-6 text-sm font-medium text-slate-500">
              Chưa có đơn hàng nào.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-950">Tình trạng kho hàng</h2>
            <Boxes className="h-5 w-5 text-cyan-700" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-4 text-sm">
            <StatusLine label="Tổng sản phẩm" value={dashboard.metrics.products} />
            <StatusLine label="Đang bán" value={dashboard.metrics.activeProducts} />
            <StatusLine label="Danh mục" value={dashboard.metrics.categories} />
            <StatusLine label="Thương hiệu" value={dashboard.metrics.brands} />
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Gợi ý hành động
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Việc nên ưu tiên
            </h2>
          </div>
          <Target className="h-5 w-5 text-cyan-700" aria-hidden="true" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {analytics.actions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>
    </section>
  );
}

function buildAdminAnalytics(dashboard: AdminDashboard | null) {
  const orderCount = Math.max(dashboard?.metrics.orders ?? 0, 0);
  const activeProducts = Math.max(dashboard?.metrics.activeProducts ?? 0, 0);
  const products = Math.max(dashboard?.metrics.products ?? 0, 0);
  const revenue = Math.max(dashboard?.metrics.revenue ?? 0, 0);
  const deliveredOrders = Math.max(dashboard?.metrics.deliveredOrders ?? 0, 0);
  const averageOrderValue = orderCount ? revenue / orderCount : 0;
  const deliveryRate = orderCount
    ? Math.round((deliveredOrders / orderCount) * 100)
    : 0;
  const activeProductRate = products
    ? Math.round((activeProducts / products) * 100)
    : 0;
  const lowStockRate = products
    ? Math.min(100, Math.round(((dashboard?.metrics.lowStockVariants ?? 0) / products) * 100))
    : 0;
  const recentRevenue = (dashboard?.recentOrders ?? []).reduce(
    (total, order) => total + order.totalAmount,
    0,
  );
  const forecastBase = recentRevenue || revenue || averageOrderValue;
  const forecastRevenue = Math.round(forecastBase * 1.15);
  const forecastOrders = Math.max(1, Math.ceil(orderCount * 1.12));
  const growthTarget = revenue > 0 ? 15 : 10;

  return {
    averageOrderValue,
    deliveryRate,
    activeProductRate,
    lowStockRate,
    forecastRevenue,
    forecastOrders,
    growthTarget,
    forecastNote:
      revenue > 0 ? "Tăng 15% so với nền hiện tại" : "Cần thêm dữ liệu đơn hàng",
    actions: [
      {
        icon: <PackageSearch className="h-5 w-5" aria-hidden="true" />,
        title: "Bổ sung tồn kho",
        description:
          (dashboard?.metrics.lowStockVariants ?? 0) > 0
            ? `${dashboard?.metrics.lowStockVariants} variant đang gần ngưỡng cảnh báo.`
            : "Tồn kho hiện chưa có cảnh báo lớn.",
      },
      {
        icon: <ReceiptText className="h-5 w-5" aria-hidden="true" />,
        title: "Xử lý đơn chờ",
        description:
          (dashboard?.metrics.pendingOrders ?? 0) > 0
            ? `${dashboard?.metrics.pendingOrders} đơn cần xác nhận để giữ nhịp giao hàng.`
            : "Không có đơn chờ xử lý.",
      },
      {
        icon: <CircleDollarSign className="h-5 w-5" aria-hidden="true" />,
        title: "Tăng giá trị đơn",
        description: `Giá trị đơn trung bình hiện là ${formatCurrency(
          averageOrderValue,
        )}.`,
      },
    ],
  };
}

function buildReportOptions(dashboard: AdminDashboard | null) {
  const monthMap = new Map<string, string>();

  for (const order of dashboard?.recentOrders ?? []) {
    const date = new Date(order.createdAt);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("vi-VN", {
      month: "long",
      year: "numeric",
    }).format(date);

    monthMap.set(value, label);
  }

  return Array.from(monthMap, ([value, label]) => ({ value, label })).sort(
    (left, right) => right.value.localeCompare(left.value),
  );
}

function buildAdminReport(
  dashboard: AdminDashboard | null,
  analytics: ReturnType<typeof buildAdminAnalytics>,
  reportScope: string,
) {
  const allOrders = dashboard?.recentOrders ?? [];
  const orders =
    reportScope === "all"
      ? allOrders
      : allOrders.filter((order) => {
          const date = new Date(order.createdAt);
          const orderMonth = `${date.getFullYear()}-${String(
            date.getMonth() + 1,
          ).padStart(2, "0")}`;

          return orderMonth === reportScope;
        });
  const revenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const averageOrderValue = orders.length ? revenue / orders.length : 0;
  const forecastRevenue = Math.round((revenue || analytics.forecastRevenue) * 1.15);
  const title =
    reportScope === "all"
      ? "Báo cáo tổng"
      : `Báo cáo ${new Intl.DateTimeFormat("vi-VN", {
          month: "long",
          year: "numeric",
        }).format(new Date(`${reportScope}-01T00:00:00`))}`;

  return {
    title,
    revenue,
    averageOrderValue,
    forecastRevenue,
    orders,
    metrics: dashboard?.metrics,
    generatedAt: new Date(),
  };
}

function downloadExcelReport(report: ReturnType<typeof buildAdminReport>) {
  const rows = [
    ["Chỉ số", "Giá trị"],
    ["Kỳ báo cáo", report.title],
    ["Ngày xuất", new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(report.generatedAt)],
    ["Doanh thu kỳ này", report.revenue],
    ["Số đơn", report.orders.length],
    ["Đơn trung bình", Math.round(report.averageOrderValue)],
    ["Doanh thu dự báo", report.forecastRevenue],
    [],
    ["Mã đơn", "Khách hàng", "Trạng thái", "Thanh toán", "Tổng tiền", "Ngày tạo"],
    ...report.orders.map((order) => [
      order.orderNumber,
      order.customerName,
      order.status,
      order.paymentStatus,
      order.totalAmount,
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(order.createdAt)),
    ]),
  ];
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body>${toExcelTable(rows)}</body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${slugify(report.title)}.xls`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function PrintableBusinessReport({
  report,
  analytics,
}: {
  report: ReturnType<typeof buildAdminReport>;
  analytics: ReturnType<typeof buildAdminAnalytics>;
}) {
  const generatedAt = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(report.generatedAt);

  return (
    <article className="admin-print-report hidden">
      <header className="admin-print-header">
        <div>
          <p className="admin-print-kicker">NovaTech Commerce</p>
          <h1>Báo cáo vận hành kinh doanh</h1>
          <p>{report.title}</p>
        </div>
        <div className="admin-print-meta">
          <span>Ngày xuất</span>
          <strong>{generatedAt}</strong>
        </div>
      </header>

      <section className="admin-print-summary">
        <PrintMetric label="Doanh thu kỳ này" value={formatCurrency(report.revenue)} />
        <PrintMetric label="Số đơn" value={`${report.orders.length}`} />
        <PrintMetric
          label="Đơn trung bình"
          value={formatCurrency(report.averageOrderValue)}
        />
        <PrintMetric label="Doanh thu dự báo" value={formatCurrency(report.forecastRevenue)} />
      </section>

      <section className="admin-print-section">
        <h2>Chỉ số vận hành</h2>
        <table>
          <tbody>
            <tr>
              <th>Tỷ lệ giao thành công</th>
              <td>{analytics.deliveryRate}%</td>
            </tr>
            <tr>
              <th>Sản phẩm đang bán</th>
              <td>{analytics.activeProductRate}%</td>
            </tr>
            <tr>
              <th>Áp lực tồn kho thấp</th>
              <td>{analytics.lowStockRate}%</td>
            </tr>
            <tr>
              <th>Mục tiêu tăng trưởng</th>
              <td>{analytics.growthTarget}%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="admin-print-section">
        <h2>Danh sách đơn hàng trong kỳ</h2>
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th className="admin-print-number">Tổng tiền</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {report.orders.length ? (
              report.orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{formatOrderStatus(order.status)}</td>
                  <td>{formatPaymentStatus(order.paymentStatus)}</td>
                  <td className="admin-print-number">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td>{formatShortDate(order.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>Không có đơn hàng trong kỳ báo cáo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <footer className="admin-print-footer">
        <div>
          <span>Người lập báo cáo</span>
          <strong>NovaTech Admin</strong>
        </div>
        <div>
          <span>Xác nhận</span>
          <strong>____________________</strong>
        </div>
      </footer>
    </article>
  );
}

function PrintMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function toExcelTable(rows: Array<Array<string | number>>) {
  return `<table>${rows
    .map((row) =>
      row.length
        ? `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`
        : "<tr></tr>",
    )
    .join("")}</table>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatOrderStatus(status: string) {
  const labels: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipped: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    refunded: "Hoàn tiền",
  };

  return labels[status] ?? status;
}

function formatPaymentStatus(status: string) {
  const labels: Record<string, string> = {
    unpaid: "Chưa thanh toán",
    paid: "Đã thanh toán",
    failed: "Thất bại",
    refunded: "Đã hoàn tiền",
  };

  return labels[status] ?? status;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ForecastCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="rounded-lg border border-cyan-950/10 bg-cyan-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">{note}</p>
    </article>
  );
}

function ProgressLine({
  label,
  value,
  detail,
  danger = false,
}: {
  label: string;
  value: number;
  detail: string;
  danger?: boolean;
}) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className={danger ? "font-semibold text-red-600" : "font-semibold text-cyan-700"}>
          {safeValue}%
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${danger ? "bg-red-500" : "bg-cyan-500"}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">{detail}</p>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-cyan-950/10 bg-[#f8fbfd] p-4">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-50 text-cyan-700">
        {icon}
      </span>
      <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function ReportValue({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <article className="rounded-lg bg-[#f8fbfd] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-xl font-semibold text-slate-950">{value}</p>
    </article>
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

function RecentOrderRow({ order }: { order: AdminRecentOrder }) {
  return (
    <div className="grid grid-cols-[1fr_120px_120px] items-center gap-4 border-b border-cyan-950/10 px-5 py-4 text-sm last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-950">{order.orderNumber}</p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
          {order.customerName}
        </p>
      </div>
      <span className="rounded-md bg-cyan-50 px-3 py-2 text-center text-xs font-semibold text-cyan-700">
        {order.status}
      </span>
      <span className="text-right font-semibold text-slate-950">
        {formatCurrency(order.totalAmount)}
      </span>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-cyan-950/10 pb-3 last:border-b-0 last:pb-0">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}
