import { apiFetch } from "@/shared/lib/api/client";
import { getSupabaseClient } from "@/shared/lib/supabase/client";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminBrand = {
  id: string;
  name: string;
  slug: string;
};

export type AdminProduct = {
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
  variants: AdminProductVariant[];
};

export type AdminProductVariant = {
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
  images: AdminProductVariantImage[];
};

export type AdminProductVariantImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};

export type AdminDashboard = {
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
  categories: AdminCategory[];
  brands: AdminBrand[];
  products: AdminProduct[];
  recentOrders: AdminRecentOrder[];
  paymentQrSettings: AdminPaymentQrSetting[];
  heroBanners: AdminHeroBanner[];
  newsArticles: AdminNewsArticle[];
  vouchers: AdminVoucher[];
};

export type AdminHeroBanner = {
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

export type AdminNewsArticle = {
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

export type AdminVoucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
};

export type AdminPaymentQrSetting = {
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

export type AdminRecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
};

export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type AdminPaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export type AdminOrderItem = {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type AdminOrder = {
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
  items: AdminOrderItem[];
};

export type AdminUploadResult = {
  bucket: string;
  path: string;
  publicUrl: string;
};

export function getAdminDashboard() {
  return apiFetch<AdminDashboard>("/admin/dashboard", {
    authenticated: true,
  });
}

export function getAdminOrders() {
  return apiFetch<AdminOrder[]>("/admin/orders", {
    authenticated: true,
  });
}

export function updateAdminOrderStatus(id: string, status: AdminOrderStatus) {
  return apiFetch<AdminOrder[]>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify({ status }),
  });
}

export function updateAdminOrderPaymentStatus(
  id: string,
  paymentStatus: AdminPaymentStatus,
) {
  return apiFetch<AdminOrder[]>(`/admin/orders/${id}/payment-status`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify({ paymentStatus }),
  });
}

export async function uploadAdminProductImage(file: File) {
  return uploadAdminImage(file, "/admin/uploads/product-image");
}

export async function uploadAdminPaymentQrImage(file: File) {
  return uploadAdminImage(file, "/admin/uploads/payment-qr");
}

async function uploadAdminImage(file: File, path: string) {
  const formData = new FormData();
  formData.set("file", file);

  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();
  const headers = new Headers();

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);

    if (
      errorBody &&
      typeof errorBody === "object" &&
      "message" in errorBody &&
      typeof errorBody.message === "string"
    ) {
      throw new Error(errorBody.message);
    }

    throw new Error("Khong the upload anh.");
  }

  return response.json() as Promise<AdminUploadResult>;
}

export function createAdminPaymentQrSetting(payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>("/admin/payment-qr-settings", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminPaymentQrSetting(
  id: string,
  payload: Record<string, unknown>,
) {
  return apiFetch<AdminDashboard>(`/admin/payment-qr-settings/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminPaymentQrSetting(id: string) {
  return apiFetch<AdminDashboard>(`/admin/payment-qr-settings/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function createAdminHeroBanner(payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>("/admin/hero-banners", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminHeroBanner(id: string, payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>(`/admin/hero-banners/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminHeroBanner(id: string) {
  return apiFetch<AdminDashboard>(`/admin/hero-banners/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function createAdminNewsArticle(payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>("/admin/news", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminNewsArticle(id: string, payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>(`/admin/news/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminNewsArticle(id: string) {
  return apiFetch<AdminDashboard>(`/admin/news/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function createAdminVoucher(payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>("/admin/vouchers", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminVoucher(id: string, payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>(`/admin/vouchers/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminVoucher(id: string) {
  return apiFetch<AdminDashboard>(`/admin/vouchers/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function createAdminCategory(payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>("/admin/categories", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminCategory(id: string, payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>(`/admin/categories/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminCategory(id: string) {
  return apiFetch<AdminDashboard>(`/admin/categories/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function createAdminBrand(payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>("/admin/brands", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminBrand(id: string, payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>(`/admin/brands/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminBrand(id: string) {
  return apiFetch<AdminDashboard>(`/admin/brands/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function createAdminProduct(payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>("/admin/products", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminProduct(id: string, payload: Record<string, unknown>) {
  return apiFetch<AdminDashboard>(`/admin/products/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminProduct(id: string) {
  return apiFetch<AdminDashboard>(`/admin/products/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function createAdminProductVariant(
  productId: string,
  payload: Record<string, unknown>,
) {
  return apiFetch<AdminDashboard>(`/admin/products/${productId}/variants`, {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminProductVariant(
  productId: string,
  variantId: string,
  payload: Record<string, unknown>,
) {
  return apiFetch<AdminDashboard>(
    `/admin/products/${productId}/variants/${variantId}`,
    {
      method: "PATCH",
      authenticated: true,
      body: JSON.stringify(payload),
    },
  );
}

export function deleteAdminProductVariant(productId: string, variantId: string) {
  return apiFetch<AdminDashboard>(
    `/admin/products/${productId}/variants/${variantId}`,
    {
      method: "DELETE",
      authenticated: true,
    },
  );
}

export function createAdminProductVariantImage(
  productId: string,
  variantId: string,
  payload: Record<string, unknown>,
) {
  return apiFetch<AdminDashboard>(
    `/admin/products/${productId}/variants/${variantId}/images`,
    {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(payload),
    },
  );
}

export function updateAdminProductVariantImage(
  productId: string,
  variantId: string,
  imageId: string,
  payload: Record<string, unknown>,
) {
  return apiFetch<AdminDashboard>(
    `/admin/products/${productId}/variants/${variantId}/images/${imageId}`,
    {
      method: "PATCH",
      authenticated: true,
      body: JSON.stringify(payload),
    },
  );
}

export function deleteAdminProductVariantImage(
  productId: string,
  variantId: string,
  imageId: string,
) {
  return apiFetch<AdminDashboard>(
    `/admin/products/${productId}/variants/${variantId}/images/${imageId}`,
    {
      method: "DELETE",
      authenticated: true,
    },
  );
}

// ---- User Management ----

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "customer" | "admin" | "staff";
  createdAt: string;
  updatedAt: string;
  orderCount: number;
};

export function getAdminUsers(
  opts?: { q?: string; role?: string },
) {
  const params = new URLSearchParams();
  if (opts?.q) params.set("q", opts.q);
  if (opts?.role) params.set("role", opts.role);
  const qs = params.toString();
  return apiFetch<AdminUser[]>(`/admin/users${qs ? `?${qs}` : ""}`, {
    authenticated: true,
  });
}

export function updateAdminUser(
  id: string,
  payload: Record<string, unknown>,
) {
  return apiFetch<AdminUser>(`/admin/users/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAdminUserRole(
  id: string,
  role: string,
) {
  return apiFetch<AdminUser>(`/admin/users/${id}/role`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify({ role }),
  });
}

export function deleteAdminUser(id: string) {
  return apiFetch<{ success: boolean }>(`/admin/users/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}
