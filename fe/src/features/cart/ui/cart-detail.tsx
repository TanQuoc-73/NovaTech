"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
  type Cart,
} from "@/features/cart/api/cart-api";
import { formatCurrency } from "@/shared/lib/format-currency";

export function CartDetail({ onCartChange }: { onCartChange?: (cart: Cart) => void }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    getCart()
      .then((data) => {
        setCart(data);
        onCartChange?.(data);
        setMessage(null);
      })
      .catch(() => {
        setCart(null);
        setMessage("Vui long dang nhap de xem chi tiet gio hang.");
      })
      .finally(() => setIsLoading(false));
  }, [onCartChange]);

  async function runCartAction(actionKey: string, action: () => Promise<Cart>) {
    setPendingAction(actionKey);
    setMessage(null);

    try {
      const nextCart = await action();
      setCart(nextCart);
      onCartChange?.(nextCart);
    } catch {
      setMessage("Khong the cap nhat gio hang. Vui long thu lai.");
    } finally {
      setPendingAction(null);
    }
  }

  function handleQuantityChange(itemId: string, quantity: number) {
    if (quantity < 1) {
      return;
    }

    void runCartAction(`quantity:${itemId}`, () =>
      updateCartItem(itemId, quantity),
    );
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <CartDetailSkeleton />
      </section>
    );
  }

  if (message) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-8">
          <p className="text-sm font-semibold text-stone-700">{message}</p>
          <Link
            href="/"
            className="mt-5 inline-flex h-10 items-center rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Ve trang chu
          </Link>
        </div>
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid place-items-center rounded-lg border border-dashed border-amber-900/20 bg-[#fffdf7] p-10 text-center">
          <ShoppingCart className="h-10 w-10 text-amber-800" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold text-stone-950">
            Gio hang dang trong
          </h1>
          <Link
            href="/#featured-products"
            className="mt-5 inline-flex h-10 items-center rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Tiep tuc mua sam
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-800">Gio hang</p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950">
            Chi tiet gio hang
          </h1>
        </div>
        <Link
          href="/#featured-products"
          className="inline-flex h-10 items-center rounded-md border border-amber-900/15 px-4 text-sm font-semibold text-stone-700 transition hover:border-amber-700 hover:text-amber-800"
        >
          Tiep tuc mua sam
        </Link>
      </div>

      {message ? (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-lg border border-amber-900/10 bg-[#fffdf7]">
          {cart.items.map((item) => (
            <article
              key={item.id}
              className="grid grid-cols-[72px_1fr] gap-4 border-b border-amber-900/10 p-4 last:border-b-0 lg:grid-cols-[72px_1fr_150px_120px_44px]"
            >
              <div className="grid h-18 w-18 place-items-center overflow-hidden rounded-md bg-amber-100 text-sm font-bold text-amber-900">
                {item.variant.imageUrl ?? item.product.thumbnailUrl ? (
                  <img
                    src={item.variant.imageUrl ?? item.product.thumbnailUrl ?? ""}
                    alt={item.variant.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  item.product.name.slice(0, 2).toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <h2 className="line-clamp-2 text-base font-semibold text-stone-950">
                  {item.product.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-stone-500">
                  {item.variant.name}
                </p>
                <p className="mt-2 text-xs font-semibold text-stone-500">
                  SKU: {item.variant.sku}
                </p>
              </div>

              <div className="col-span-2 flex h-10 w-fit items-center rounded-md border border-amber-900/15 bg-white lg:col-span-1">
                <button
                  type="button"
                  aria-label="Giam so luong"
                  disabled={item.quantity <= 1 || pendingAction !== null}
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="grid h-10 w-10 place-items-center text-stone-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <input
                  aria-label="So luong"
                  type="number"
                  min={1}
                  max={item.variant.stock}
                  defaultValue={item.quantity}
                  disabled={pendingAction !== null}
                  onBlur={(event) => {
                    const nextQuantity = Number(event.currentTarget.value);

                    if (
                      Number.isInteger(nextQuantity) &&
                      nextQuantity >= 1 &&
                      nextQuantity !== item.quantity
                    ) {
                      handleQuantityChange(item.id, nextQuantity);
                    } else {
                      event.currentTarget.value = String(item.quantity);
                    }
                  }}
                  className="h-10 w-12 border-x border-amber-900/15 bg-transparent text-center text-sm font-semibold text-stone-950 outline-none"
                />
                <button
                  type="button"
                  aria-label="Tang so luong"
                  disabled={
                    item.quantity >= item.variant.stock || pendingAction !== null
                  }
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="grid h-10 w-10 place-items-center text-stone-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="col-span-2 text-left lg:col-span-1 lg:text-right">
                <p className="text-xs font-semibold text-stone-500">Thanh tien</p>
                <p className="mt-1 text-base font-semibold text-stone-950">
                  {formatCurrency(item.variant.price * item.quantity)}
                </p>
              </div>

              <div className="col-span-2 lg:col-span-1">
                <button
                  type="button"
                  aria-label="Xoa san pham"
                  disabled={pendingAction !== null}
                  onClick={() =>
                    void runCartAction(`remove:${item.id}`, () =>
                      removeCartItem(item.id),
                    )
                  }
                  className="grid h-10 w-full place-items-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 lg:w-10"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-lg border border-amber-900/10 bg-[#fffdf7] p-5">
          <h2 className="text-base font-semibold text-stone-950">
            Tom tat don hang
          </h2>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-stone-700">
            <div className="flex items-center justify-between">
              <span>Tong so luong</span>
              <span>{cart.totalQuantity}</span>
            </div>
            <div className="flex items-center justify-between border-t border-amber-900/10 pt-3">
              <span>Tam tinh</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-5 flex h-11 w-full items-center justify-center rounded-md bg-amber-700 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Thanh toan
          </Link>
          <button
            type="button"
            disabled={pendingAction !== null}
            onClick={() => void runCartAction("clear", clearCart)}
            className="mt-3 h-11 w-full rounded-md border border-red-200 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xoa tat ca
          </button>
        </aside>
      </div>
    </section>
  );
}

function CartDetailSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="h-4 w-20 rounded bg-amber-200/70" />
          <div className="mt-3 h-8 w-56 rounded bg-stone-200" />
        </div>
        <div className="h-10 w-36 rounded-md bg-stone-200" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-lg border border-amber-900/10 bg-[#fffdf7]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[72px_1fr] gap-4 border-b border-amber-900/10 p-4 last:border-b-0 lg:grid-cols-[72px_1fr_150px_120px_44px]"
            >
              <div className="h-18 w-18 rounded-md bg-amber-100" />
              <div className="min-w-0">
                <div className="h-5 w-4/5 rounded bg-stone-200" />
                <div className="mt-3 h-4 w-1/2 rounded bg-stone-200" />
                <div className="mt-3 h-3 w-28 rounded bg-stone-100" />
              </div>
              <div className="col-span-2 h-10 w-32 rounded-md bg-stone-200 lg:col-span-1" />
              <div className="col-span-2 lg:col-span-1 lg:justify-self-end">
                <div className="h-3 w-20 rounded bg-stone-100 lg:ml-auto" />
                <div className="mt-3 h-5 w-28 rounded bg-stone-200 lg:ml-auto" />
              </div>
              <div className="col-span-2 h-10 rounded-md bg-stone-100 lg:col-span-1 lg:w-10" />
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-lg border border-amber-900/10 bg-[#fffdf7] p-5">
          <div className="h-5 w-40 rounded bg-stone-200" />
          <div className="mt-5 grid gap-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-stone-100" />
              <div className="h-4 w-10 rounded bg-stone-200" />
            </div>
            <div className="flex items-center justify-between border-t border-amber-900/10 pt-4">
              <div className="h-4 w-20 rounded bg-stone-100" />
              <div className="h-5 w-28 rounded bg-stone-200" />
            </div>
          </div>
          <div className="mt-5 h-11 rounded-md bg-amber-200/80" />
          <div className="mt-3 h-11 rounded-md bg-stone-100" />
        </aside>
      </div>
    </div>
  );
}
