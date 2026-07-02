export type StaffOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type StaffOrderDto = {
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
  items: StaffOrderItemDto[];
};

export type StaffOrderItemDto = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  totalPrice: number;
};

export type StaffInventoryItemDto = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
};

export type StaffReviewDto = {
  id: string;
  productName: string;
  rating: number;
  title: string | null;
  content: string | null;
  isApproved: boolean;
  createdAt: string;
};

export type StaffDashboardDto = {
  metrics: {
    pendingOrders: number;
    processingOrders: number;
    lowStockItems: number;
    supportReviews: number;
  };
  orders: StaffOrderDto[];
  inventory: StaffInventoryItemDto[];
  reviews: StaffReviewDto[];
};

export type StaffOrderStatusPayload = {
  status?: unknown;
};

export type StaffInventoryPayload = {
  stockQuantity?: unknown;
};
