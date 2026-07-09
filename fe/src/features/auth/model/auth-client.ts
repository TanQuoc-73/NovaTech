import { getSupabaseClient } from "@/shared/lib/supabase/client";
import { apiFetch } from "@/shared/lib/api/client";

type EmailAuthPayload = {
  email: string;
  password: string;
  fullName?: string;
};

export type UserRole = "customer" | "admin" | "staff";

export type AuthProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Address = {
  id: string;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  line1: string;
  line2: string | null;
  isDefault: boolean;
};

function getRedirectUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

  return `${siteUrl}/`;
}

function getResetPasswordRedirectUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

  return `${siteUrl}/auth/reset-password`;
}

export async function consumeAuthRedirectSession() {
  if (typeof window === "undefined" || !window.location.hash) {
    return null;
  }

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { data, error } = await getSupabaseClient().auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  window.history.replaceState(
    {},
    document.title,
    `${window.location.pathname}${window.location.search}`,
  );

  return data.session;
}

export async function signInWithGoogle() {
  return getSupabaseClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getRedirectUrl(),
    },
  });
}

export async function signInWithEmail({ email, password }: EmailAuthPayload) {
  return getSupabaseClient().auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail({
  email,
  password,
  fullName,
}: EmailAuthPayload) {
  return getSupabaseClient().auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: getRedirectUrl(),
    },
  });
}

export async function syncAuthProfile() {
  return apiFetch<AuthProfile>("/auth/sync-profile", {
    method: "POST",
    authenticated: true,
  });
}

export async function syncAuthProfileSafely() {
  try {
    return await syncAuthProfile();
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function signOut() {
  return getSupabaseClient().auth.signOut();
}

export async function resetPasswordForEmail(email: string) {
  return getSupabaseClient().auth.resetPasswordForEmail(email, {
    redirectTo: getResetPasswordRedirectUrl(),
  });
}

export async function updatePassword(newPassword: string) {
  return getSupabaseClient().auth.updateUser({ password: newPassword });
}

export async function getCurrentProfile() {
  return apiFetch<AuthProfile>("/auth/me", {
    authenticated: true,
  });
}

export async function updateCurrentProfile(payload: {
  fullName: string;
  phone: string;
  avatarUrl: string;
}) {
  return apiFetch<AuthProfile>("/auth/me", {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function getAddresses() {
  return apiFetch<Address[]>("/auth/addresses", {
    authenticated: true,
  });
}

export function createAddress(payload: Record<string, unknown>) {
  return apiFetch<Address[]>("/auth/addresses", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function updateAddress(id: string, payload: Record<string, unknown>) {
  return apiFetch<Address[]>(`/auth/addresses/${id}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function deleteAddress(id: string) {
  return apiFetch<Address[]>(`/auth/addresses/${id}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function getRoleHomePath(role: UserRole) {
  const paths: Record<UserRole, string> = {
    admin: "/admin/dashboard",
    staff: "/staff/dashboard",
    customer: "/",
  };

  return paths[role];
}
