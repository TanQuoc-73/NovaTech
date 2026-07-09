import Link from "next/link";

import {
  getCatalogBrands,
  getCatalogCategories,
} from "@/features/catalog/api/catalog-api";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";
import type { Locale } from "@/shared/i18n";

type CategoriesPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

const pageCopy: Record<
  Locale,
  {
    title: string;
    categoryDescription: string;
    brandsEyebrow: string;
    brandsTitle: string;
  }
> = {
  vi: {
    title: "Mua sắm theo danh mục",
    categoryDescription: "Xem các sản phẩm thuộc danh mục {category}.",
    brandsEyebrow: "Thương hiệu",
    brandsTitle: "Lọc sản phẩm theo hãng",
  },
  en: {
    title: "Shop by category",
    categoryDescription: "View products in the {category} category.",
    brandsEyebrow: "Brands",
    brandsTitle: "Filter products by brand",
  },
  zh: {
    title: "按分类选购",
    categoryDescription: "查看 {category} 分类中的商品。",
    brandsEyebrow: "品牌",
    brandsTitle: "按品牌筛选商品",
  },
};

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);
  const copy = pageCopy[locale];
  const [categories, brands] = await Promise.all([
    getCatalogCategories(),
    getCatalogBrands(),
  ]);

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950 flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-amber-800">
            {dictionary.nav.categories}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950">
            {copy.title}
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
                {copy.categoryDescription.replace("{category}", category.name)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="mb-5">
          <p className="text-sm font-semibold text-amber-800">
            {copy.brandsEyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-stone-950">
            {copy.brandsTitle}
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
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
