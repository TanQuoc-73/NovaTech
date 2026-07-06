export type AdminCategoryDto = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminBrandDto = {
  id: string;
  name: string;
  slug: string;
};

export type AdminProductDto = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  brandId: string | null;
  brand: string;
  category: string;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  price: number;
  stock: number;
  variants: AdminProductVariantDto[];
};

export type AdminProductVariantDto = {
  id: string;
  sku: string;
  name: string;
  color: string | null;
  storage: string | null;
  ram: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  weightGrams: number | null;
  isActive: boolean;
  images: AdminProductVariantImageDto[];
};

export type AdminProductVariantImageDto = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};

export type AdminDashboardDto = {
  metrics: {
    revenue: number;
    orders: number;
    pendingOrders: number;
    deliveredOrders: number;
    products: number;
    activeProducts: number;
    lowStockVariants: number;
    categories: number;
    brands: number;
  };
  categories: AdminCategoryDto[];
  brands: AdminBrandDto[];
  products: AdminProductDto[];
  recentOrders: AdminRecentOrderDto[];
  paymentQrSettings: AdminPaymentQrSettingDto[];
  heroBanners: AdminHeroBannerDto[];
  newsArticles: AdminNewsArticleDto[];
  vouchers: AdminVoucherDto[];
};

export type AdminHeroBannerDto = {
  id: string;
  title: string;
  subtitle: string | null;
  label: string | null;
  tag: string | null;
  deviceType: string | null;
  priceText: string | null;
  highlightLabel: string | null;
  highlight: string | null;
  imageUrl: string | null;
  href: string | null;
  gradient: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminNewsArticleDto = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  imageUrl: string | null;
  href: string | null;
  isPublished: boolean;
  publishedAt: string;
};

export type AdminVoucherDto = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
};

export type AdminPaymentQrSettingDto = {
  id: string;
  provider: string;
  title: string;
  qrImageUrl: string;
  accountName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  instructions: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type AdminRecentOrderDto = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
};

export type AdminOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type AdminPaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export type AdminOrderItemDto = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type AdminOrderDto = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: AdminOrderStatus;
  paymentStatus: AdminPaymentStatus;
  paymentMethod: string;
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: string;
  note: string | null;
  createdAt: string;
  items: AdminOrderItemDto[];
};

export type AdminOrderStatusPayload = {
  status?: unknown;
};

export type AdminPaymentStatusPayload = {
  paymentStatus?: unknown;
};

export type AdminCategoryPayload = {
  name?: unknown;
  slug?: unknown;
  sortOrder?: unknown;
  isActive?: unknown;
};

export type AdminBrandPayload = {
  name?: unknown;
  slug?: unknown;
};

export type AdminProductPayload = {
  name?: unknown;
  slug?: unknown;
  categoryId?: unknown;
  brandId?: unknown;
  shortDescription?: unknown;
  description?: unknown;
  thumbnailUrl?: unknown;
  isActive?: unknown;
  isFeatured?: unknown;
  variantName?: unknown;
  sku?: unknown;
  price?: unknown;
  compareAtPrice?: unknown;
  stockQuantity?: unknown;
};

export type AdminProductVariantPayload = {
  name?: unknown;
  sku?: unknown;
  color?: unknown;
  storage?: unknown;
  ram?: unknown;
  price?: unknown;
  compareAtPrice?: unknown;
  stockQuantity?: unknown;
  lowStockThreshold?: unknown;
  weightGrams?: unknown;
  isActive?: unknown;
};

export type AdminProductVariantImagePayload = {
  imageUrl?: unknown;
  altText?: unknown;
  sortOrder?: unknown;
};

export type AdminPaymentQrSettingPayload = {
  provider?: unknown;
  title?: unknown;
  qrImageUrl?: unknown;
  accountName?: unknown;
  accountNumber?: unknown;
  bankName?: unknown;
  instructions?: unknown;
  isActive?: unknown;
  sortOrder?: unknown;
};

export type AdminHeroBannerPayload = {
  title?: unknown;
  subtitle?: unknown;
  label?: unknown;
  tag?: unknown;
  deviceType?: unknown;
  priceText?: unknown;
  highlightLabel?: unknown;
  highlight?: unknown;
  imageUrl?: unknown;
  href?: unknown;
  gradient?: unknown;
  sortOrder?: unknown;
  isActive?: unknown;
};

export type AdminNewsArticlePayload = {
  title?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  content?: unknown;
  category?: unknown;
  imageUrl?: unknown;
  href?: unknown;
  isPublished?: unknown;
};

export type AdminVoucherPayload = {
  code?: unknown;
  title?: unknown;
  description?: unknown;
  discountType?: unknown;
  discountValue?: unknown;
  minOrderAmount?: unknown;
  maxDiscountAmount?: unknown;
  usageLimit?: unknown;
  isActive?: unknown;
};
