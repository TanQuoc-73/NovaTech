import { CheckoutForm } from "@/features/checkout/ui/checkout-form";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";

type CheckoutPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950">
      <SiteHeader dictionary={dictionary} locale={locale} />
      <CheckoutForm dictionary={dictionary} />
    </main>
  );
}
