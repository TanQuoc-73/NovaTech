import { apiFetch } from "@/shared/lib/api/client";

export type CustomerOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type CustomerOrderItem = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  review: CustomerOrderItemReview | null;
};

export type CustomerOrderItemReview = {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isApproved: boolean;
  createdAt: string;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress: string;
  items: CustomerOrderItem[];
};

export function getMyOrders() {
  return apiFetch<CustomerOrder[]>("/orders/me", {
    authenticated: true,
  });
}

export function cancelMyOrder(orderId: string) {
  return apiFetch<CustomerOrder[]>(`/orders/me/${orderId}/cancel`, {
    method: "PATCH",
    authenticated: true,
  });
}

export function submitOrderItemReview(
  itemId: string,
  payload: {
    rating: number;
    title?: string;
    content?: string;
  },
) {
  return apiFetch<CustomerOrder[]>(`/orders/me/items/${itemId}/review`, {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}
