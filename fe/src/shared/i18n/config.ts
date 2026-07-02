export const locales = ["vi", "en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "vi";

export const localeLabels: Record<Locale, string> = {
  vi: "VI",
  en: "EN",
  zh: "中文",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

export function resolveLocale(value: string | string[] | undefined): Locale {
  const locale = Array.isArray(value) ? value[0] : value;

  return isLocale(locale) ? locale : defaultLocale;
}
