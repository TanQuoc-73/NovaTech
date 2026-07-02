export type PaymentProvider = 'vnpay' | 'momo';

export type CreatePaymentRequest = {
  orderId: string;
  orderNumber: string;
  amount: number;
  provider: PaymentProvider;
  ipAddress?: string;
};

export type CreatePaymentResult = {
  provider: PaymentProvider;
  paymentUrl: string;
};

export type PaymentQrSettingDto = {
  id: string;
  provider: string;
  title: string;
  qrImageUrl: string;
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  instructions: string | null;
};
