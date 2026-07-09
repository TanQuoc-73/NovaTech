"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import { getMyOrders, type CustomerOrder } from "@/features/orders/api/orders-api";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";
import { formatCurrency } from "@/shared/lib/format-currency";

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function OrderConfirmPage({
  searchParams,
}: {
  searchParams?: Promise<{
    lang?: string | string[];
    order?: string | string[];
    payment?: string | string[];
  }>;
}) {
  return <OrderConfirmClient searchParamsPromise={searchParams} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Client component
// ─────────────────────────────────────────────────────────────────────────────

function OrderConfirmClient({
  searchParamsPromise,
}: {
  searchParamsPromise?: Promise<{
    lang?: string | string[];
    order?: string | string[];
    payment?: string | string[];
  }>;
}) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState(true);
  const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading");
  const [locale, setLocale] = useState<ReturnType<typeof resolveLocale>>("vi");

  useEffect(() => {
    async function init() {
      // Read search params
      const params = await searchParamsPromise;
      const lang = Array.isArray(params?.lang) ? params?.lang[0] : params?.lang;
      const orderNum = Array.isArray(params?.order) ? params?.order[0] : params?.order;
      const payment = Array.isArray(params?.payment) ? params?.payment[0] : params?.payment;

      const resolvedLocale = resolveLocale(lang);
      setLocale(resolvedLocale);
      setOrderNumber(orderNum ?? "");
      setPaymentSuccess(payment !== "failed");

      if (!orderNum) {
        setStatus("not-found");
        return;
      }

      try {
        const orders = await getMyOrders();
        const found = orders.find((o) => o.orderNumber === orderNum);
        if (found) {
          setOrder(found);
          setStatus("found");
        } else {
          setStatus("not-found");
        }
      } catch {
        setStatus("not-found");
      }
    }

    void init();
  }, [searchParamsPromise]);

  const dictionary = getDictionary(locale);
  const t = dictionary.ui.checkout;

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950 flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />

      {/* ── LOADING ── */}
      {status === "loading" && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-700" />
            <p className="text-sm font-medium text-stone-500">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      )}

      {/* ── NOT FOUND ── */}
      {status === "not-found" && (
        <section className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-8">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-stone-100">
            <ClipboardList className="h-9 w-9 text-stone-400" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold text-stone-900">
            {t.confirmNotFound}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {orderNumber
              ? `Không tìm thấy đơn hàng "${orderNumber}". Có thể đơn chưa được xác nhận.`
              : "Không có mã đơn hàng trong URL."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/cart?tab=ordered"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-amber-700 px-5 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              {t.confirmViewOrders}
            </Link>
            <Link
              href="/products"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              {t.confirmContinue}
            </Link>
          </div>
        </section>
      )}

      {/* ── FOUND ── */}
      {status === "found" && order && (
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {/* ── Hero banner ── */}
          <div
            className={`relative overflow-hidden rounded-2xl p-8 text-white ${
              paymentSuccess
                ? "bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500"
                : "bg-gradient-to-br from-orange-700 via-amber-600 to-yellow-500"
            }`}
          >
            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />

            <div className="relative flex flex-wrap items-start gap-6">
              <span
                className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${
                  paymentSuccess ? "bg-white/20" : "bg-white/20"
                }`}
              >
                {paymentSuccess ? (
                  <CheckCircle2 className="h-9 w-9 text-white" />
                ) : (
                  <XCircle className="h-9 w-9 text-white" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                  NovaTech
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {paymentSuccess ? t.confirmTitle : t.confirmPaymentFailed}
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/80">
                  {paymentSuccess
                    ? t.confirmSubtitle
                    : "Vui lòng kiểm tra lại phương thức thanh toán hoặc liên hệ NovaTech để được hỗ trợ."}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ConfirmStat
                label={t.confirmOrderNumber}
                value={order.orderNumber}
                mono
              />
              <ConfirmStat
                label={t.confirmTotal}
                value={formatCurrency(order.totalAmount)}
              />
              <ConfirmStat
                label={t.confirmPayment}
                value={readablePaymentMethod(order.paymentMethod, t)}
              />
              <ConfirmStat
                label={t.confirmStatus}
                value={t.confirmStatusPending}
              />
            </div>
          </div>

          {/* ── Body grid ── */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* LEFT */}
            <div className="space-y-5">
              {/* Order steps */}
              {paymentSuccess && (
                <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-800">
                    Tiến trình đơn hàng
                  </h2>
                  <div className="mt-5 flex items-start gap-0">
                    {(t.confirmSteps as unknown as Array<{ title: string; desc: string }>).map(
                      (step, index) => {
                        const isActive = index === 0;
                        const icons = [CheckCircle2, Package, Truck];
                        const Icon = icons[index]!;
                        const isLast = index === (t.confirmSteps as unknown as Array<unknown>).length - 1;

                        return (
                          <div key={step.title} className="flex flex-1 flex-col items-center">
                            <div className="flex w-full items-center">
                              <div
                                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition ${
                                  isActive
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-stone-200 bg-white text-stone-300"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              {!isLast && (
                                <div
                                  className={`h-0.5 flex-1 ${
                                    isActive ? "bg-emerald-200" : "bg-stone-100"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="mt-3 pr-4 text-left w-full">
                              <p
                                className={`text-xs font-semibold ${
                                  isActive ? "text-emerald-700" : "text-stone-400"
                                }`}
                              >
                                {step.title}
                              </p>
                              <p className="mt-0.5 text-xs text-stone-400">{step.desc}</p>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-5 w-5 text-amber-700" aria-hidden="true" />
                  <h2 className="font-semibold text-stone-900">{t.confirmItems}</h2>
                  <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                    {order.items.length} sản phẩm
                  </span>
                </div>

                <div className="mt-5 divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 py-4">
                      {/* Color dot placeholder */}
                      <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
                        <Package className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-snug text-stone-900 line-clamp-2">
                          {item.productName}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-stone-500">
                          {item.variantName} · x{item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-amber-800">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total row */}
                <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-4">
                  <span className="text-sm font-semibold text-stone-700">
                    {t.confirmTotal}
                  </span>
                  <span className="text-lg font-bold text-stone-900">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              {/* Shipping address */}
              <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-5 w-5 text-amber-700" aria-hidden="true" />
                  <h2 className="font-semibold text-stone-900">Địa chỉ giao hàng</h2>
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-600">
                  {order.shippingAddress}
                </p>
              </div>

              {/* Payment info */}
              <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-stone-900">{t.confirmPayment}</h2>
                <div className="mt-4 space-y-3">
                  <ConfirmRow
                    label="Hình thức"
                    value={readablePaymentMethod(order.paymentMethod, t)}
                  />
                  <ConfirmRow
                    label="Trạng thái thanh toán"
                    value={
                      order.paymentStatus === "paid"
                        ? "Đã thanh toán"
                        : order.paymentStatus === "failed"
                          ? "Thất bại"
                          : "Chờ thanh toán"
                    }
                    accent={
                      order.paymentStatus === "paid"
                        ? "emerald"
                        : order.paymentStatus === "failed"
                          ? "red"
                          : "amber"
                    }
                  />
                  <ConfirmRow
                    label="Trạng thái đơn"
                    value={t.confirmStatusPending}
                    accent="amber"
                  />
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Link
                  href="/cart?tab=ordered"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-700 text-sm font-semibold text-white transition hover:bg-amber-800"
                >
                  <ClipboardList className="h-4 w-4" />
                  {t.confirmViewOrders}
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Link>
                <Link
                  href="/products"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t.confirmContinue}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function readablePaymentMethod(
  method: string,
  t: { confirmPaymentCod: string; confirmPaymentBank: string; confirmPaymentOnline: string },
): string {
  if (method === "cod") return t.confirmPaymentCod;
  if (method === "bank_transfer") return t.confirmPaymentBank;
  return t.confirmPaymentOnline;
}

function ConfirmStat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm">
      <p className="text-xs font-medium text-white/70">{label}</p>
      <p
        className={`mt-1 truncate text-sm font-bold text-white ${
          mono ? "font-mono tracking-wide" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ConfirmRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "amber" | "red";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-700"
      : accent === "red"
        ? "text-red-600"
        : accent === "amber"
          ? "text-amber-700"
          : "text-stone-900";

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-medium text-stone-500">{label}</span>
      <span className={`text-xs font-semibold ${accentClass}`}>{value}</span>
    </div>
  );
}
