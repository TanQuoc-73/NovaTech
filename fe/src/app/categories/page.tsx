import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  getCatalogBrands,
  getCatalogCategories,
} from "@/features/catalog/api/catalog-api";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";
type CategoriesPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

const categoryIcons: Record<string, string> = {
  laptop: "💻",
  smartphone: "📱",
  tablet: "📟",
  monitor: "🖥️",
  audio: "🎧",
  accessory: "🔌",
  keyboard: "⌨️",
  mouse: "🖱️",
  camera: "📷",
  watch: "⌚",
  gaming: "🎮",
  printer: "🖨️",
  storage: "💾",
  network: "📡",
  smart_home: "🏠",
};

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);
  const [categories, brands] = await Promise.all([
    getCatalogCategories(),
    getCatalogBrands(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />

        <section className="mx-auto max-w-7xl px-6 pt-12 pb-12 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?lang=${locale}&category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-lg"
              >
                {category.imageUrl ? (
                  <div className="absolute inset-0 opacity-5">
                    <img
                      src={category.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="relative">
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--badge-bg)] text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                    {categoryIcons[category.slug] ?? category.name.charAt(0).toUpperCase()}
                  </div>

                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    {category.name}
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {category.name}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                    {locale === "vi" ? "Xem sản phẩm" : locale === "zh" ? "查看商品" : "View products"}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?lang=${locale}&brand=${brand.slug}`}
                  className="group inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/40 hover:shadow-md"
                >
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-7 w-7 rounded-lg object-contain"
                    />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--badge-bg)] text-xs font-bold text-[var(--badge-text)]">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                    {brand.name}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
