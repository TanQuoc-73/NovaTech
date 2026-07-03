"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/entities/product";
import type { Dictionary } from "@/shared/i18n";
import { ProductGrid } from "@/widgets/product-grid";

type LatestProductPagerProps = {
  products: Product[];
  dictionary: Dictionary;
};

const pageSize = 8;

export function LatestProductPager({
  products,
  dictionary,
}: LatestProductPagerProps) {
  const [activePage, setActivePage] = useState(0);
  const pages = useMemo(() => {
    const chunks: Product[][] = [];

    for (let index = 0; index < products.length; index += pageSize) {
      chunks.push(products.slice(index, index + pageSize));
    }

    return chunks;
  }, [products]);
  const currentProducts = pages[activePage] ?? pages[0] ?? [];

  return (
    <div>
      <ProductGrid products={currentProducts} dictionary={dictionary} />

      {pages.length > 1 ? (
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-current={activePage === index ? "page" : undefined}
              onClick={() => setActivePage(index)}
              className={`grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-semibold transition ${
                activePage === index
                  ? "border-cyan-500 bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                  : "border-cyan-500/20 bg-white text-slate-700 hover:border-cyan-500/40 hover:text-cyan-700"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
