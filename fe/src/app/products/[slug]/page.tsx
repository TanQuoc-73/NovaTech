import { notFound } from "next/navigation";
import { getProductBySlug } from "@/features/catalog/api/catalog-api";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { formatCurrency } from "@/shared/lib/format-currency";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";
import type { Product } from "@/entities/product";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ lang?: string }>;
};

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = resolveLocale(sp?.lang);
  const dictionary = getDictionary(locale);
  const raw = await getProductBySlug(slug);

  if (!raw || (Array.isArray(raw) && raw.length === 0)) {
    notFound();
  }

  const product = raw as Product;
  const selectedVariant = product.variants[0];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm text-[var(--muted)]">
            <a href="/products" className="hover:text-[var(--primary)]">
              Sản phẩm
            </a>
            <span className="mx-2">/</span>
            <span>{product.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image gallery */}
            <div className="space-y-4">
              {selectedVariant?.images?.length ? (
                <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <img
                    src={selectedVariant.images[0].imageUrl}
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                  />
                </div>
              ) : (
                <div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                  />
                </div>
              )}
              {selectedVariant?.images && selectedVariant.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {selectedVariant.images.map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]"
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.altText ?? product.name}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[var(--muted)]">{product.brand}</p>
                <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[var(--primary)]">
                  {formatCurrency(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-lg text-[var(--muted)] line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-amber-500">
                  {"★".repeat(Math.round(product.rating))}
                  {"☆".repeat(5 - Math.round(product.rating))}
                </span>
                <span className="text-[var(--muted)]">
                  ({product.reviews.length} đánh giá)
                </span>
              </div>

              <p className="text-sm text-[var(--muted)]">
                {product.stock > 0
                  ? `Còn hàng (${product.stock})`
                  : "Hết hàng"}
              </p>

              {/* Variants */}
              {product.variants.length > 1 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Phân loại:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <span
                        key={v.id}
                        className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs"
                      >
                        {v.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {product.reviews.length > 0 && (
                <div className="border-t border-[var(--border)] pt-6">
                  <h2 className="mb-4 text-lg font-semibold">Đánh giá</h2>
                  <div className="space-y-4">
                    {product.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-lg border border-[var(--border)] p-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 text-sm">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </span>
                          <span className="text-sm font-medium">
                            {review.authorName}
                          </span>
                        </div>
                        {review.title && (
                          <p className="mt-1 text-sm font-medium">
                            {review.title}
                          </p>
                        )}
                        {review.content && (
                          <p className="mt-1 text-sm text-[var(--muted)]">
                            {review.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
