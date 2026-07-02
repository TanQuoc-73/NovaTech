import { apiFetch } from "@/shared/lib/api/client";

export type StaffOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type StaffOrderItem = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  totalPrice: number;
};

export type StaffOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: StaffOrderStatus;
  paymentStatus: string;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: StaffOrderItem[];
};

export type StaffInventoryItem = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
};

export type StaffReview = {
  id: string;
  productName: string;
  rating: number;
  title: string | null;
  content: string | null;
  isApproved: boolean;
  createdAt: string;
};

export type StaffDashboard = {
  metrics: {
    pendingOrders: number;
    processingOrders: number;
    lowStockItems: number;
    supportReviews: number;
  };
  orders: StaffOrder[];
  inventory: StaffInventoryItem[];
  reviews: StaffReview[];
};

export function getStaffDashboard() {
  return apiFetch<StaffDashboard>("/staff/dashboard", {
    authenticated: true,
  });
}

export function getStaffOrders() {
  return apiFetch<StaffOrder[]>("/staff/orders", {
    authenticated: true,
  });
}

export function updateStaffOrderStatus(id: string, status: StaffOrderStatus) {
  return apiFetch<StaffOrder[]>(`/staff/orders/${id}/status`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify({ status }),
  });
}

export function getStaffLowStockInventory() {
  return apiFetch<StaffInventoryItem[]>("/staff/inventory/low-stock", {
    authenticated: true,
  });
}

export function updateStaffInventory(id: string, stockQuantity: number) {
  return apiFetch<StaffInventoryItem[]>(`/staff/inventory/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify({ stockQuantity }),
  });
}

export function getStaffSupportReviews() {
  return apiFetch<StaffReview[]>("/staff/support/reviews", {
    authenticated: true,
  });
}
