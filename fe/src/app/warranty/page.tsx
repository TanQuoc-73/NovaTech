import { getDictionary, resolveLocale, type Locale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";

import { WarrantyContent } from "./warranty-content";

type WarrantyPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

export default async function WarrantyPage({ searchParams }: WarrantyPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />
        <WarrantyContent locale={locale} dictionary={dictionary} />
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
