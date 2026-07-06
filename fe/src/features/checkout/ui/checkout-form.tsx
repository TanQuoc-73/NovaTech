"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ShoppingCart } from "lucide-react";

import { getAddresses, type Address } from "@/features/auth/model/auth-client";
import { getCart, type Cart } from "@/features/cart/api/cart-api";
import { createCheckout, type CheckoutResult } from "@/features/checkout/api/checkout-api";
import {
  getPaymentQrSettings,
  type PaymentQrSetting,
} from "@/features/payments/api/payment-api";
import type { Dictionary } from "@/shared/i18n";
import { formatCurrency } from "@/shared/lib/format-currency";
import { FormSkeleton } from "@/shared/ui/loading-skeleton";

export function CheckoutForm({ dictionary }: { dictionary: Dictionary }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentQrSettings, setPaymentQrSettings] = useState<
    PaymentQrSetting[]
  >([]);

  useEffect(() => {
    Promise.all([getCart(), getAddresses(), getPaymentQrSettings()])
      .then(([nextCart, nextAddresses, nextPaymentQrSettings]) => {
        setCart(nextCart);
        setAddresses(nextAddresses);
        setPaymentQrSettings(nextPaymentQrSettings);
        setSelectedAddressId(
          nextAddresses.find((address) => address.isDefault)?.id ??
            nextAddresses[0]?.id ??
            "",
        );
      })
      .catch(() => setMessage(dictionary.ui.checkout.signInRequired))
      .finally(() => setIsLoading(false));
  }, [dictionary.ui.checkout.signInRequired]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [addresses, selectedAddressId],
  );
  const visiblePaymentQrSettings = useMemo(
    () =>
      paymentQrSettings.filter(
        (setting) =>
          (paymentMethod === "bank_transfer" &&
            setting.provider === "bank_transfer") ||
          (paymentMethod === "momo" && setting.provider === "momo"),
      ),
    [paymentMethod, paymentQrSettings],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const checkoutResult = await createCheckout({
        customerName: String(formData.get("customerName") ?? ""),
        customerPhone: String(formData.get("customerPhone") ?? ""),
        shippingProvince: String(formData.get("shippingProvince") ?? ""),
        shippingDistrict: String(formData.get("shippingDistrict") ?? ""),
        shippingWard: String(formData.get("shippingWard") ?? ""),
        shippingLine1: String(formData.get("shippingLine1") ?? ""),
        shippingLine2: String(formData.get("shippingLine2") ?? ""),
        paymentMethod: readPaymentMethod(formData.get("paymentMethod")),
        note: String(formData.get("note") ?? ""),
      });

      if (checkoutResult.paymentUrl) {
        window.location.href = checkoutResult.paymentUrl;
        return;
      }

      setResult(checkoutResult);
      setCart(null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : dictionary.ui.checkout.createFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <FormSkeleton />
        <span className="sr-only">{dictionary.ui.checkout.loading}</span>
      </>
    );
  }

  if (result) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <div className="rounded-lg border border-green-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-700" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold">
            {dictionary.ui.checkout.successTitle}
          </h1>
          <p className="mt-2 text-sm font-medium text-stone-600">
            {dictionary.ui.checkout.orderCode}:{" "}
            <span className="font-semibold text-stone-950">
              {result.orderNumber}
            </span>
          </p>
          <p className="mt-1 text-sm font-medium text-stone-600">
            {dictionary.ui.checkout.totalPayment}:{" "}
            {formatCurrency(result.totalAmount)}
          </p>
          <Link
            href="/cart?tab=ordered"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            {dictionary.ui.checkout.viewOrder}
          </Link>
        </div>
      </section>
    );
  }

  if (message || !cart || cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-8">
          <p className="text-sm font-semibold text-stone-700">
            {message ?? dictionary.ui.checkout.emptyCart}
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-10 items-center rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            {dictionary.ui.checkout.backToProducts}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6">
        <p className="text-sm font-semibold text-amber-800">
          {dictionary.ui.checkout.eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-950">
          {dictionary.ui.checkout.title}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-4 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-800" aria-hidden="true" />
            <h2 className="font-semibold">{dictionary.ui.checkout.shippingInfo}</h2>
          </div>

          {addresses.length ? (
            <label className="mt-5 block">
              <span className="text-xs font-semibold uppercase text-stone-600">
                {dictionary.ui.checkout.savedAddress}
              </span>
              <select
                value={selectedAddressId}
                onChange={(event) => setSelectedAddressId(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
              >
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.recipientName} - {address.line1}, {address.ward}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <CheckoutField
              name="customerName"
              label={dictionary.ui.checkout.recipient}
              defaultValue={selectedAddress?.recipientName ?? ""}
              required
            />
            <CheckoutField
              name="customerPhone"
              label={dictionary.ui.checkout.phone}
              defaultValue={selectedAddress?.phone ?? ""}
              required
            />
            <CheckoutField
              name="shippingProvince"
              label={dictionary.ui.checkout.province}
              defaultValue={selectedAddress?.province ?? ""}
              required
            />
            <CheckoutField
              name="shippingDistrict"
              label={dictionary.ui.checkout.district}
              defaultValue={selectedAddress?.district ?? ""}
              required
            />
            <CheckoutField
              name="shippingWard"
              label={dictionary.ui.checkout.ward}
              defaultValue={selectedAddress?.ward ?? ""}
              required
            />
            <CheckoutField
              name="shippingLine1"
              label={dictionary.ui.checkout.line1}
              defaultValue={selectedAddress?.line1 ?? ""}
              required
            />
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase text-stone-600">
                {dictionary.ui.checkout.line2}
              </span>
              <input
                key={`line2-${selectedAddress?.id ?? "manual"}`}
                name="shippingLine2"
                defaultValue={selectedAddress?.line2 ?? ""}
                className="mt-2 h-11 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
              />
            </label>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold">{dictionary.ui.checkout.paymentMethod}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border border-amber-900/10 bg-white p-4 text-sm font-semibold">
                <input
                  name="paymentMethod"
                  type="radio"
                  value="cod"
                  defaultChecked
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="h-4 w-4 accent-amber-700"
                />
                {dictionary.ui.checkout.cod}
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-amber-900/10 bg-white p-4 text-sm font-semibold">
                <input
                  name="paymentMethod"
                  type="radio"
                  value="bank_transfer"
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="h-4 w-4 accent-amber-700"
                />
                {dictionary.ui.checkout.bankTransfer}
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-amber-900/10 bg-white p-4 text-sm font-semibold">
                <input
                  name="paymentMethod"
                  type="radio"
                  value="vnpay"
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="h-4 w-4 accent-amber-700"
                />
                VNPAY
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-amber-900/10 bg-white p-4 text-sm font-semibold">
                <input
                  name="paymentMethod"
                  type="radio"
                  value="momo"
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="h-4 w-4 accent-amber-700"
                />
                MoMo
              </label>
            </div>
            {(paymentMethod === "bank_transfer" || paymentMethod === "momo") &&
            visiblePaymentQrSettings.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {visiblePaymentQrSettings.map((setting) => (
                  <PaymentQrPreview key={setting.id} setting={setting} />
                ))}
              </div>
            ) : null}
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-semibold uppercase text-stone-600">
              {dictionary.ui.checkout.note}
            </span>
            <textarea
              name="note"
              rows={3}
              className="mt-2 w-full rounded-md border border-amber-900/15 px-3 py-2 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 h-11 w-full rounded-md bg-amber-700 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? dictionary.ui.checkout.submitting
              : dictionary.ui.checkout.placeOrder}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-amber-900/10 bg-[#fffdf7] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-amber-800" aria-hidden="true" />
            <h2 className="font-semibold">{dictionary.ui.checkout.orderSummary}</h2>
          </div>
          <div className="mt-4 max-h-72 divide-y divide-amber-900/10 overflow-y-auto pr-1 [scrollbar-color:#06B6D4_#E0F7FF] [scrollbar-width:thin] lg:max-h-none">
            {cart.items.map((item) => (
              <div key={item.id} className="py-3 text-sm">
                <p className="line-clamp-2 font-semibold">{item.product.name}</p>
                <p className="mt-1 text-xs font-semibold text-stone-500">
                  {item.variant.name} x {item.quantity}
                </p>
                <p className="mt-1 font-semibold text-amber-800">
                  {formatCurrency(item.variant.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-amber-900/10 pt-4 text-base font-semibold">
            <span>{dictionary.ui.checkout.total}</span>
            <span>{formatCurrency(cart.subtotal)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function readPaymentMethod(value: FormDataEntryValue | null) {
  if (
    value === "bank_transfer" ||
    value === "vnpay" ||
    value === "momo"
  ) {
    return value;
  }

  return "cod";
}

function PaymentQrPreview({ setting }: { setting: PaymentQrSetting }) {
  return (
    <article className="rounded-lg border border-amber-900/10 bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-[132px_1fr]">
        <div className="grid place-items-center rounded-md bg-amber-50 p-2">
          <img
            src={setting.qrImageUrl}
            alt={setting.title}
            className="h-28 w-28 rounded object-contain"
          />
        </div>
        <div className="min-w-0 text-sm">
          <p className="line-clamp-1 font-semibold text-stone-950">
            {setting.title}
          </p>
          {setting.bankName ? (
            <p className="mt-1 line-clamp-1 font-medium text-stone-600">
              {setting.bankName}
            </p>
          ) : null}
          {setting.accountName ? (
            <p className="mt-2 line-clamp-1 font-semibold text-stone-700">
              {setting.accountName}
            </p>
          ) : null}
          {setting.accountNumber ? (
            <p className="mt-1 font-semibold text-amber-800">
              {setting.accountNumber}
            </p>
          ) : null}
          {setting.instructions ? (
            <p className="mt-2 line-clamp-2 text-xs font-medium text-stone-500">
              {setting.instructions}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CheckoutField({
  name,
  label,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-stone-600">
        {label}
      </span>
      <input
        key={`${name}-${defaultValue}`}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 h-11 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      />
    </label>
  );
}
