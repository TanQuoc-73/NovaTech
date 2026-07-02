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
