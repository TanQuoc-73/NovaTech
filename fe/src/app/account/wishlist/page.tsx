import { getDictionary, resolveLocale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";
import { AccountSidebar } from "@/features/account/ui/account-sidebar";
import { WishlistContent } from "@/features/account/ui/wishlist-content";

type WishlistPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

export default async function AccountWishlistPage({ searchParams }: WishlistPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950 flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
              Tài khoản
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Sản phẩm yêu thích</h1>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
            <AccountSidebar />
            <WishlistContent dictionary={dictionary} />
          </div>
        </section>
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
