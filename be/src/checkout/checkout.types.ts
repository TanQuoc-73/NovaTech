export type CheckoutPayload = {
  customerName?: unknown;
  customerPhone?: unknown;
  shippingProvince?: unknown;
  shippingDistrict?: unknown;
  shippingWard?: unknown;
  shippingLine1?: unknown;
  shippingLine2?: unknown;
  paymentMethod?: unknown;
  voucherCode?: unknown;
  note?: unknown;
};

export type CheckoutResultDto = {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  paymentUrl?: string;
  paymentProvider?: 'vnpay' | 'momo';
};
