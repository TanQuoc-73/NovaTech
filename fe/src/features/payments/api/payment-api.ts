import { apiFetch } from "@/shared/lib/api/client";

export type PaymentQrSetting = {
  id: string;
  provider: string;
  title: string;
  qrImageUrl: string;
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  instructions: string | null;
};

export function getPaymentQrSettings() {
  return apiFetch<PaymentQrSetting[]>("/payments/qr-settings");
}
