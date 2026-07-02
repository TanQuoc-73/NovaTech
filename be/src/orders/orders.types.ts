export type CustomerOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type CustomerOrderItemDto = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

export type CustomerOrderDto = {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress: string;
  items: CustomerOrderItemDto[];
};
