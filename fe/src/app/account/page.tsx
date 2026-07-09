import { AccountProfile } from "@/features/account/ui/account-profile";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";

type AccountPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950 flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />
        <AccountProfile dictionary={dictionary} />
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
