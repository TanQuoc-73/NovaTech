import type { Locale } from "@/shared/i18n/config";

const currencyByLocale: Record<Locale, { locale: string; currency: string }> = {
  vi: { locale: "vi-VN", currency: "VND" },
  en: { locale: "en-US", currency: "USD" },
  zh: { locale: "zh-CN", currency: "CNY" },
};

export function formatCurrency(value: number, locale: Locale = "vi") {
  const { locale: intlLocale, currency } = currencyByLocale[locale];

  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
