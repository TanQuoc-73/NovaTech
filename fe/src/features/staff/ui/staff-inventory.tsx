"use client";

import { useEffect, useState } from "react";

import {
  getStaffLowStockInventory,
  updateStaffInventory,
  type StaffInventoryItem,
} from "@/features/staff/api/staff-api";
import {
  StaffEmpty,
  StaffLoading,
  StaffPageTitle,
} from "@/features/staff/ui/staff-dashboard";

export function StaffInventoryView() {
  const [items, setItems] = useState<StaffInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    getStaffLowStockInventory()
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleUpdateStock(id: string, formData: FormData) {
    setPendingId(id);

    try {
      setItems(
        await updateStaffInventory(
          id,
          Number(formData.get("stockQuantity") ?? 0),
        ),
      );
    } finally {
      setPendingId(null);
    }
  }

  if (isLoading) {
    return <StaffLoading label="Dang tai ton kho..." />;
  }

  return (
    <section>
      <StaffPageTitle eyebrow="Kiem kho" title="San pham sap het hang" />

      <div className="mt-8 overflow-hidden rounded-lg border border-amber-900/10 bg-white shadow-sm">
        {items.length ? (
          items.map((item) => (
            <form
              key={item.id}
              action={(formData) => void handleUpdateStock(item.id, formData)}
              className="grid gap-4 border-b border-amber-900/10 px-5 py-4 last:border-b-0 md:grid-cols-[1fr_130px_170px]"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.productName}</p>
                <p className="mt-1 truncate text-xs font-semibold text-stone-500">
                  {item.variantName} / {item.sku}
                </p>
              </div>
              <div className="text-sm font-semibold text-red-700">
                Ton {item.stockQuantity}
                <span className="mt-1 block text-xs text-stone-500">
                  Nguong {item.lowStockThreshold}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  name="stockQuantity"
                  type="number"
                  min="0"
                  defaultValue={item.stockQuantity}
                  className="h-10 min-w-0 flex-1 rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
                />
                <button
                  type="submit"
                  disabled={pendingId === item.id}
                  className="h-10 rounded-md bg-amber-700 px-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
                >
                  Luu
                </button>
              </div>
            </form>
          ))
        ) : (
          <div className="p-5">
            <StaffEmpty label="Ton kho hien dang on." />
          </div>
        )}
      </div>
    </section>
  );
}
