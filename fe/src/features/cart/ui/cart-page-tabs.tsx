"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, PackageCheck, ShoppingBag, Truck } from "lucide-react";

import { getCart, type Cart } from "@/features/cart/api/cart-api";
import { CartDetail } from "@/features/cart/ui/cart-detail";
import {
  cancelMyOrder,
  getMyOrders,
  type CustomerOrder,
  type CustomerOrderStatus,
} from "@/features/orders/api/orders-api";
import { formatCurrency } from "@/shared/lib/format-currency";

type CartTab = "cart" | "ordered" | "shipping" | "received";

const tabs: Array<{
  id: CartTab;
  label: string;
  icon: typeof ShoppingBag;
}> = [
  { id: "cart", label: "Gio hang", icon: ShoppingBag },
  { id: "ordered", label: "San pham da dat", icon: ClipboardList },
  { id: "shipping", label: "Dang giao", icon: Truck },
  { id: "received", label: "Da nhan", icon: PackageCheck },
];

const orderStatusGroups: Record<Exclude<CartTab, "cart">, CustomerOrderStatus[]> = {
  ordered: ["pending", "confirmed", "processing"],
  shipping: ["shipped"],
  received: ["delivered"],
};

function resolveCartTab(tab?: string | string[]): CartTab {
  const value = Array.isArray(tab) ? tab[0] : tab;

  return tabs.some((item) => item.id === value) ? (value as CartTab) : "cart";
}

export function CartPageTabs({ initialTab }: { initialTab?: string | string[] }) {
  const defaultTab = resolveCartTab(initialTab);
  const [activeTab, setActiveTab] = useState<CartTab>(defaultTab);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersMessage, setOrdersMessage] = useState<string | null>(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(defaultTab !== "cart");
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);

  useEffect(() => {
    getCart()
      .then((data) => setCartQuantity(data.totalQuantity))
      .catch(() => setCartQuantity(0));
  }, []);

  useEffect(() => {
    getMyOrders()
      .then((data) => {
        setOrders(data);
        setOrdersMessage(null);
      })
      .catch(() => {
        setOrders([]);
        setOrdersMessage("Vui long dang nhap de xem don hang.");
      })
      .finally(() => setIsOrdersLoading(false));
  }, []);

  const visibleOrders = useMemo(() => {
    if (activeTab === "cart") {
      return [];
    }

    return orders.filter((order) =>
      orderStatusGroups[activeTab].includes(order.status),
    );
  }, [activeTab, orders]);

  const tabCounts = useMemo<Record<CartTab, number>>(
    () => ({
      cart: cartQuantity,
      ordered: orders.filter((order) =>
        orderStatusGroups.ordered.includes(order.status),
      ).length,
      shipping: orders.filter((order) =>
        orderStatusGroups.shipping.includes(order.status),
      ).length,
      received: orders.filter((order) =>
        orderStatusGroups.received.includes(order.status),
      ).length,
    }),
    [cartQuantity, orders],
  );

  const handleCartChange = useCallback((nextCart: Cart) => {
    setCartQuantity(nextCart.totalQuantity);
  }, []);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <div className="flex flex-wrap gap-2 border-b border-amber-900/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-11 items-center gap-2 rounded-t-md px-4 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#fffdf7] text-amber-900 shadow-sm"
                    : "text-stone-600 hover:bg-white/60 hover:text-stone-950"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
                <span
                  className={`grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${
                    isActive
                      ? "bg-amber-800 text-white"
                      : "bg-amber-900/10 text-stone-700"
                  }`}
                >
                  {tabCounts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "cart" ? (
        <CartDetail onCartChange={handleCartChange} />
      ) : (
        <OrderList
          orders={visibleOrders}
          isLoading={isOrdersLoading}
          message={ordersMessage}
          pendingOrderId={pendingOrderId}
          onCancelOrder={async (orderId) => {
            setPendingOrderId(orderId);
            setOrdersMessage(null);

            try {
              setOrders(await cancelMyOrder(orderId));
            } catch (error) {
              setOrdersMessage(
                error instanceof Error
                  ? error.message
                  : "Khong the huy don hang.",
              );
            } finally {
              setPendingOrderId(null);
            }
          }}
        />
      )}
    </section>
  );
}

function OrderList({
  orders,
  isLoading,
  message,
  pendingOrderId,
  onCancelOrder,
}: {
  orders: CustomerOrder[];
  isLoading: boolean;
  message: string | null;
  pendingOrderId: string | null;
  onCancelOrder: (orderId: string) => Promise<void>;
}) {
  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-6 text-sm font-semibold text-stone-600">
          Dang tai don hang...
        </div>
      </section>
    );
  }

  if (message) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-6 text-sm font-semibold text-stone-600">
          {message}
        </div>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="rounded-lg border border-dashed border-amber-900/20 bg-[#fffdf7] p-8 text-center text-sm font-semibold text-stone-500">
          Chua co don hang trong muc nay.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-amber-800">
                  {order.status} / {order.paymentStatus}
                </p>
                <p className="mt-2 max-w-3xl text-sm text-stone-500">
                  {order.shippingAddress}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-stone-500">Tong tien</p>
                <p className="mt-1 text-base font-semibold">
                  {formatCurrency(order.totalAmount)}
                </p>
                {order.status === "pending" ? (
                  <button
                    type="button"
                    disabled={pendingOrderId !== null}
                    onClick={() => void onCancelOrder(order.id)}
                    className="mt-3 h-9 rounded-md border border-red-200 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pendingOrderId === order.id ? "Dang huy..." : "Huy don"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-4 divide-y divide-amber-900/10 border-t border-amber-900/10 pt-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-semibold">{item.productName}</p>
                    <p className="mt-1 text-xs font-semibold text-stone-500">
                      {item.variantName} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
