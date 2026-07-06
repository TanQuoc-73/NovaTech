import { apiFetch } from "@/shared/lib/api/client";

export type CheckoutPayload = {
  customerName: string;
  customerPhone: string;
  shippingProvince: string;
  shippingDistrict: string;
  shippingWard: string;
  shippingLine1: string;
  shippingLine2: string;
  paymentMethod: "cod" | "bank_transfer" | "vnpay" | "momo";
  voucherCode?: string;
  note: string;
};

export type CheckoutResult = {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  paymentUrl?: string;
  paymentProvider?: "vnpay" | "momo";
};

export function createCheckout(payload: CheckoutPayload) {
  return apiFetch<CheckoutResult>("/checkout", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}
