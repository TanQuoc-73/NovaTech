"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Scale, ShoppingCart, Star, X } from "lucide-react";

import { ProductCard, type Product } from "@/entities/product";
import { addCartItem } from "@/features/cart/api/cart-api";
import type { Cart } from "@/features/cart/api/cart-api";
import { formatCurrency } from "@/shared/lib/format-currency";
import type { Dictionary } from "@/shared/i18n";

type ProductGridProps = {
  products: Product[];
  dictionary: Dictionary;
  enableCompare?: boolean;
};

export function ProductGrid({
  products,
  dictionary,
  enableCompare = false,
}: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [compareMessage, setCompareMessage] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedProduct(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProduct]);

  function handleCompareToggle(product: Product) {
    setCompareMessage(null);

    setCompareProducts((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current.filter((item) => item.id !== product.id);
      }

      if (current.length > 0 && current[0].category !== product.category) {
        setCompareMessage(dictionary.ui.compare.sameCategoryOnly);
        return current;
      }

      if (current.length >= 2) {
        setCompareMessage(dictionary.ui.compare.maxItems);
        return current;
      }

      const nextProducts = [...current, product];

      if (nextProducts.length === 2) {
        setIsCompareOpen(true);
      }

      return nextProducts;
    });
  }

  function getCompareState(product: Product) {
    if (compareProducts.length === 0) {
      return "idle";
    }

    if (compareProducts.some((item) => item.id === product.id)) {
      return "idle";
    }

    return compareProducts[0].category === product.category
      ? "compatible"
      : "incompatible";
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            dictionary={dictionary}
            onSelect={setSelectedProduct}
            onCompareToggle={enableCompare ? handleCompareToggle : undefined}
            isCompareSelected={
              enableCompare &&
              compareProducts.some((item) => item.id === product.id)
            }
            compareState={enableCompare ? getCompareState(product) : "idle"}
          />
        ))}
      </div>

      {enableCompare && compareProducts.length > 0 ? (
        <div className="sticky bottom-4 z-30 mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-900/10 bg-[#fffaf2] p-3 shadow-xl shadow-stone-950/15">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-stone-950">
              <Scale className="h-4 w-4 text-amber-800" aria-hidden="true" />
              {dictionary.ui.compare.title}
            </p>
            <p className="mt-1 text-xs font-semibold text-stone-500">
              {compareMessage ??
                `${compareProducts.length}/2 - ${dictionary.ui.compare.hint}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={compareProducts.length !== 2}
              onClick={() => setIsCompareOpen(true)}
              className="h-9 rounded-md bg-amber-700 px-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dictionary.ui.compare.open}
            </button>
            <button
              type="button"
              onClick={() => {
                setCompareProducts([]);
                setCompareMessage(null);
                setIsCompareOpen(false);
              }}
              className="h-9 rounded-md border border-amber-900/15 px-3 text-sm font-semibold text-stone-700 transition hover:border-amber-700 hover:text-amber-800"
            >
              {dictionary.ui.compare.clear}
            </button>
          </div>
        </div>
      ) : null}

      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          dictionary={dictionary}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}

      {enableCompare && isCompareOpen && compareProducts.length === 2 ? (
        <ProductCompareModal
          products={compareProducts as [Product, Product]}
          dictionary={dictionary}
          onClose={() => setIsCompareOpen(false)}
          onRemove={(productId) => {
            setCompareProducts((current) =>
              current.filter((product) => product.id !== productId),
            );
            setIsCompareOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

type ProductCompareModalProps = {
  products: [Product, Product];
  dictionary: Dictionary;
  onClose: () => void;
  onRemove: (productId: string) => void;
};

function ProductCompareModal({
  products,
  dictionary,
  onClose,
  onRemove,
}: ProductCompareModalProps) {
  const [firstProduct, secondProduct] = products;
  const [selectedVariantIds, setSelectedVariantIds] = useState<
    Record<string, string>
  >({
    [firstProduct.id]: firstProduct.variants[0]?.id ?? "",
    [secondProduct.id]: secondProduct.variants[0]?.id ?? "",
  });
  const categoryLabel =
    firstProduct.category in dictionary.categories
      ? dictionary.categories[
          firstProduct.category as keyof typeof dictionary.categories
        ]
      : firstProduct.category;
  const selectedVariants = products.map(
    (product) =>
      product.variants.find(
        (variant) => variant.id === selectedVariantIds[product.id],
      ) ?? product.variants[0],
  ) as [ProductVariant | undefined, ProductVariant | undefined];

  const overviewRows = [
    {
      label: dictionary.ui.compare.brand,
      getValue: (product: Product) => product.brand,
    },
    {
      label: dictionary.ui.compare.category,
      getValue: () => categoryLabel,
    },
    {
      label: dictionary.ui.compare.price,
      getValue: (product: Product, variant: ProductVariant | undefined) =>
        formatCurrency(variant?.price ?? product.price),
    },
    {
      label: dictionary.ui.compare.rating,
      getValue: (product: Product) =>
        `${product.rating.toFixed(1)} ${dictionary.common.rating}`,
    },
    {
      label: dictionary.ui.compare.stock,
      getValue: (product: Product, variant: ProductVariant | undefined) =>
        `${variant?.stock ?? product.stock} ${dictionary.common.inStock}`,
    },
    {
      label: dictionary.ui.compare.variants,
      getValue: (product: Product) => String(product.variants.length),
    },
    {
      label: dictionary.ui.compare.cheapestVariant,
      getValue: (product: Product) => {
        const variant = [...product.variants].sort(
          (first, second) => first.price - second.price,
        )[0];

        return variant
          ? `${variant.name} - ${formatCurrency(variant.price)}`
          : dictionary.ui.compare.noVariant;
      },
    },
  ];
  const variantRows = [
    {
      label: dictionary.ui.compare.sku,
      getValue: (variant: ProductVariant | undefined) =>
        variant?.sku ?? dictionary.ui.compare.notAvailable,
    },
    {
      label: dictionary.ui.compare.ram,
      getValue: (variant: ProductVariant | undefined) =>
        variant?.ram ?? dictionary.ui.compare.notAvailable,
    },
    {
      label: dictionary.ui.compare.storage,
      getValue: (variant: ProductVariant | undefined) =>
        variant?.storage ?? dictionary.ui.compare.notAvailable,
    },
    {
      label: dictionary.ui.compare.color,
      getValue: (variant: ProductVariant | undefined) =>
        variant?.color ?? dictionary.ui.compare.notAvailable,
    },
    {
      label: dictionary.ui.compare.price,
      getValue: (variant: ProductVariant | undefined) =>
        variant ? formatCurrency(variant.price) : dictionary.ui.compare.notAvailable,
    },
    {
      label: dictionary.ui.compare.stock,
      getValue: (variant: ProductVariant | undefined) =>
        variant
          ? `${variant.stock} ${dictionary.common.inStock}`
          : dictionary.ui.compare.notAvailable,
    },
  ];

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/70 px-3 py-4 backdrop-blur-sm sm:px-4">
      <button
        type="button"
        aria-label={dictionary.ui.compare.close}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative flex max-h-[88dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-amber-200/60 bg-[#fffaf2] shadow-2xl shadow-stone-950/30">
        <div className="flex items-start justify-between gap-4 border-b border-amber-900/10 p-4 sm:p-6">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <Scale className="h-4 w-4" aria-hidden="true" />
              {dictionary.ui.compare.title}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950 sm:text-2xl">
              {categoryLabel}
            </h2>
          </div>
          <button
            type="button"
            aria-label={dictionary.ui.compare.close}
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-amber-900/15 text-stone-700 transition hover:bg-amber-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-3 [scrollbar-color:#06B6D4_#E0F7FF] [scrollbar-width:thin] sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {[firstProduct, secondProduct].map((product) => (
              <ProductCompareHeader
                key={product.id}
                product={product}
                dictionary={dictionary}
                selectedVariantId={selectedVariantIds[product.id] ?? ""}
                onVariantChange={(variantId) =>
                  setSelectedVariantIds((current) => ({
                    ...current,
                    [product.id]: variantId,
                  }))
                }
                onRemove={onRemove}
              />
            ))}
          </div>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-amber-800">
            {dictionary.ui.compare.overview}
          </h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-amber-900/10 bg-white [scrollbar-color:#06B6D4_#E0F7FF] [scrollbar-width:thin]">
            <div className="grid min-w-[620px] grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] text-sm sm:min-w-0 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
              {overviewRows.map((row) => (
                <div key={row.label} className="contents">
                  <div className="border-r border-t border-amber-900/10 bg-amber-50 p-3 text-xs font-semibold uppercase text-stone-600 first:border-t-0 sm:text-sm">
                    {row.label}
                  </div>
                  {products.map((product, index) => (
                    <div
                      key={`${row.label}-${product.id}`}
                      className="min-w-0 border-t border-amber-900/10 p-3 text-sm font-semibold leading-6 text-stone-900 first:border-t-0"
                    >
                      <span className="line-clamp-2 break-words">
                        {row.getValue(product, selectedVariants[index])}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-amber-800">
            {dictionary.ui.compare.variantSpecs}
          </h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-amber-900/10 bg-white [scrollbar-color:#06B6D4_#E0F7FF] [scrollbar-width:thin]">
            <div className="grid min-w-[620px] grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] text-sm sm:min-w-0 sm:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
              {variantRows.map((row) => (
                <div key={row.label} className="contents">
                  <div className="border-r border-t border-amber-900/10 bg-amber-50 p-3 text-xs font-semibold uppercase text-stone-600 first:border-t-0 sm:text-sm">
                    {row.label}
                  </div>
                  {selectedVariants.map((variant, index) => (
                    <div
                      key={`${row.label}-${products[index].id}`}
                      className="min-w-0 border-t border-amber-900/10 p-3 text-sm font-semibold leading-6 text-stone-900 first:border-t-0"
                    >
                      <span className="line-clamp-2 break-words">
                        {row.getValue(variant)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function ProductCompareHeader({
  product,
  dictionary,
  selectedVariantId,
  onVariantChange,
  onRemove,
}: {
  product: Product;
  dictionary: Dictionary;
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  onRemove: (productId: string) => void;
}) {
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants[0];
  const imageUrl = selectedVariant?.images[0]?.imageUrl ?? product.imageUrl;

  return (
    <article className="relative overflow-hidden rounded-xl border border-amber-900/10 bg-white p-3 sm:p-4">
      <button
        type="button"
        aria-label={dictionary.ui.compare.remove}
        onClick={() => onRemove(product.id)}
        className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-stone-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100 p-4 sm:h-56 lg:h-64">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-xs font-bold uppercase text-amber-900">
            {product.brand.slice(0, 3)}
          </span>
        )}
      </div>
      <div className="min-w-0 pt-3">
        <p className="line-clamp-1 text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
          {product.brand}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-stone-950 sm:text-base sm:leading-6">
          {product.name}
        </h3>
        <p className="mt-2 truncate text-sm font-semibold text-amber-800">
          {formatCurrency(selectedVariant?.price ?? product.price)}
        </p>
        {product.variants.length > 0 ? (
          <label className="mt-3 block">
            <span className="sr-only">{dictionary.ui.compare.selectVariant}</span>
            <select
              value={selectedVariant?.id ?? ""}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onVariantChange(event.target.value)}
              className="h-10 w-full rounded-md border border-amber-900/15 bg-[#fffdf7] px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
            >
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </article>
  );
}

type ProductVariant = Product["variants"][number];

type ProductDetailModalProps = {
  product: Product;
  dictionary: Dictionary;
  onClose: () => void;
};

function ProductDetailModal({
  product,
  dictionary,
  onClose,
}: ProductDetailModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants[0];
  const categoryLabel =
    product.category in dictionary.categories
      ? dictionary.categories[
          product.category as keyof typeof dictionary.categories
        ]
      : product.category;

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompareAtPrice =
    selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const displayStock = selectedVariant?.stock ?? product.stock;
  const displayImageUrl = selectedVariant?.images[0]?.imageUrl ?? product.imageUrl;
  const stockStatus =
    displayStock > 0
      ? `${displayStock} ${dictionary.common.inStock}`
      : dictionary.ui.product.outOfStock;
  const canAddToCart = Boolean(selectedVariant) && displayStock > 0;

  async function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    if (!selectedVariant || isAddingToCart) {
      return;
    }

    const sourceRect = event.currentTarget.getBoundingClientRect();
    setIsAddingToCart(true);
    setCartMessage(null);

    try {
      const cart = await addCartItem(selectedVariant.id, 1);

      setCartMessage(
        dictionary.ui.product.addedToCart.replace(
          "{count}",
          String(cart.totalQuantity),
        ),
      );
      window.dispatchEvent(
        new CustomEvent<CartUpdatedEventDetail>("novatech:cart-updated", {
          detail: {
            cart,
            productName: product.name,
            productBrand: product.brand,
            sourceRect: {
              x: sourceRect.left + sourceRect.width / 2,
              y: sourceRect.top + sourceRect.height / 2,
            },
          },
        }),
      );
    } catch {
      setCartMessage(dictionary.ui.product.addFailed);
    } finally {
      setIsAddingToCart(false);
    }
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <button
        type="button"
        aria-label={dictionary.ui.product.closeDetail}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <section className="relative grid h-[86dvh] w-full max-w-5xl overflow-hidden rounded-2xl border border-amber-200/60 bg-[#fffaf2] shadow-2xl shadow-stone-950/30 md:h-[720px] md:grid-cols-[1fr_1.08fr]">
        <div className="flex min-h-40 items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100 p-3 sm:min-h-56 sm:p-4 md:min-h-0 md:p-8">
          <div className="grid h-36 w-full max-w-[13rem] place-items-center overflow-hidden rounded-xl border border-amber-900/10 bg-white/80 p-3 text-center shadow-sm sm:h-52 sm:max-w-[18rem] sm:rounded-2xl sm:p-4 md:aspect-square md:h-auto md:max-w-md">
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt={selectedVariant?.name ?? product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
                  {product.brand}
                </p>
                <p className="mt-3 px-6 text-xl font-semibold text-stone-950">
                  {categoryLabel}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-[auto_1fr_auto] bg-[#fffaf2]">
          <div className="border-b border-amber-900/10 p-3 md:p-6 md:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {product.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-sm bg-amber-100 px-1.5 py-1 text-[11px] font-semibold text-amber-800 sm:px-2 sm:text-xs"
                    >
                      {badge in dictionary.badges
                        ? dictionary.badges[badge as keyof typeof dictionary.badges]
                        : badge}
                    </span>
                  ))}
                </div>

                <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-stone-950 sm:text-xl md:mt-4 md:text-2xl">
                  {product.name}
                </h3>
                <p className="mt-1 truncate text-xs font-semibold text-stone-500 sm:mt-2 sm:text-sm">
                  {product.brand} / {categoryLabel}
                </p>
              </div>

              <button
                type="button"
                aria-label="Dong"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-amber-900/15 text-stone-700 transition hover:bg-amber-100 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-3 py-3 [scrollbar-color:#06B6D4_#E0F7FF] [scrollbar-width:thin] sm:px-4 sm:py-4 md:px-8 md:py-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-500/75 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-cyan-100/80">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-xl font-semibold text-stone-950 sm:text-2xl md:text-3xl">
                {formatCurrency(displayPrice)}
              </p>
              {displayCompareAtPrice ? (
                <p className="text-sm text-stone-400 line-through sm:text-base">
                  {formatCurrency(displayCompareAtPrice)}
                </p>
              ) : null}
            </div>
            <div className="mt-3 grid gap-2 text-xs font-semibold text-stone-700 sm:mt-4 sm:grid-cols-2 sm:gap-3 sm:text-sm">
              <p className="rounded-md bg-white/70 px-3 py-2">
                {product.rating.toFixed(1)} {dictionary.common.rating}
              </p>
                <p className="rounded-md bg-white/70 px-3 py-2">{stockStatus}</p>
            </div>

            <div className="mt-4 text-xs text-stone-700 sm:mt-6 sm:text-sm">
              <div
                className={`grid gap-3 ${
                  isDescriptionExpanded ? "" : "line-clamp-3"
                }`}
              >
                <p>
                  {dictionary.ui.product.descriptionIntro.replace(
                    "{category}",
                    categoryLabel,
                  )}
                </p>
                <p>{dictionary.ui.product.descriptionMore}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setIsDescriptionExpanded((current) => !current)
                }
                className="mt-2 text-xs font-semibold text-amber-800 hover:text-amber-900 sm:text-sm"
              >
                {isDescriptionExpanded
                  ? dictionary.ui.product.collapse
                  : dictionary.ui.product.showMore}
              </button>
            </div>

            {product.variants.length > 0 ? (
              <div className="mt-4 sm:mt-6">
                <p className="text-sm font-semibold text-stone-950">
                  {dictionary.ui.product.variants}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === selectedVariant?.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`grid h-[7.25rem] gap-1.5 rounded-lg border p-1.5 text-left transition sm:h-[8.5rem] sm:gap-2 sm:p-2 ${
                          isSelected
                            ? "border-amber-700 bg-amber-100/80 shadow-sm"
                            : "border-amber-900/10 bg-white/70 hover:border-amber-700/60 hover:bg-amber-50"
                        }`}
                      >
                        <span className="grid h-[3.75rem] place-items-center overflow-hidden rounded-md bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100 p-1 sm:h-[4.5rem]">
                          {variant.images[0]?.imageUrl ? (
                            <img
                              src={variant.images[0].imageUrl}
                              alt={variant.images[0].altText ?? variant.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-900">
                              {product.brand.slice(0, 3)}
                            </span>
                          )}
                        </span>
                        <span className="line-clamp-2 text-[11px] font-semibold leading-4 text-stone-900 sm:text-xs sm:leading-5">
                          {variant.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-4 rounded-lg border border-amber-900/10 bg-white/70 p-3 sm:mt-6 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-950">
                    {dictionary.ui.product.reviews}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-stone-500">
                    {dictionary.ui.product.reviewCount.replace(
                      "{count}",
                      String(product.reviews?.length ?? 0),
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-700">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.round(product.rating)
                          ? "fill-amber-500"
                          : "fill-transparent"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              {product.reviews?.length ? (
                <div className="mt-3 grid gap-3">
                  {product.reviews.slice(0, 3).map((review) => (
                    <article
                      key={review.id}
                      className="rounded-md border border-amber-900/10 bg-[#fffdf7] p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-950">
                            {review.authorName}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-emerald-700">
                            {dictionary.ui.product.verifiedPurchase}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-800">
                          <Star className="h-3.5 w-3.5 fill-amber-500" aria-hidden="true" />
                          {review.rating}/5
                        </div>
                      </div>
                      {review.title ? (
                        <h4 className="mt-3 text-sm font-semibold text-stone-900">
                          {review.title}
                        </h4>
                      ) : null}
                      {review.content ? (
                        <p className="mt-2 text-sm leading-6 text-stone-600">
                          {review.content}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs font-semibold text-stone-400">
                        {formatReviewDate(review.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-md bg-amber-50 px-3 py-3 text-sm font-semibold text-stone-500">
                  {dictionary.ui.product.noReviews}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 border-t border-amber-900/10 bg-[#fffaf2] p-3 sm:gap-3 sm:p-4 md:p-6 md:px-8">
            <button
              type="button"
              disabled={!canAddToCart || isAddingToCart}
              onClick={handleAddToCart}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:flex-none sm:px-5"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {isAddingToCart
                ? dictionary.ui.product.adding
                : dictionary.ui.product.addToCart}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 flex-1 rounded-md border border-amber-900/15 px-4 text-sm font-semibold text-stone-700 transition hover:border-amber-700 hover:text-amber-800 sm:h-11 sm:flex-none sm:px-5"
            >
              {dictionary.ui.product.continueViewing}
            </button>
            {cartMessage ? (
              <p className="basis-full text-sm font-semibold text-stone-700">
                {cartMessage}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

type CartUpdatedEventDetail = {
  cart: Cart;
  productName: string;
  productBrand: string;
  sourceRect: {
    x: number;
    y: number;
  };
};
