import Link from "next/link";

import {
  getCatalogBrands,
  getCatalogCategories,
} from "@/features/catalog/api/catalog-api";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";

type CategoriesPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
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
    <main className="min-h-screen bg-[#fff8ed] text-stone-950">
      <SiteHeader dictionary={dictionary} locale={locale} />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-amber-800">
            {dictionary.nav.categories}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950">
            Mua sam theo danh muc
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?lang=${locale}&category=${category.slug}#featured-products`}
              className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-700/50 hover:bg-amber-50"
            >
              <h2 className="text-base font-semibold text-stone-950">
                {category.name}
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Xem cac san pham thuoc danh muc {category.name}.
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="mb-5">
          <p className="text-sm font-semibold text-amber-800">Thuong hieu</p>
          <h2 className="mt-2 text-xl font-semibold text-stone-950">
            Loc san pham theo hang
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?lang=${locale}&brand=${brand.slug}#featured-products`}
              className="rounded-md border border-amber-900/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-amber-700/50 hover:bg-amber-50"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
