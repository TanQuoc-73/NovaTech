import { CartPageTabs } from "@/features/cart/ui/cart-page-tabs";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";

type CartPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
    tab?: string | string[];
  }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950 flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />
        <CartPageTabs dictionary={dictionary} initialTab={params?.tab} />
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
