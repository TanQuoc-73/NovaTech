"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Home, LogIn, Mail, Phone, Shield, Trash2, UserCircle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { AuthModal } from "@/features/auth";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  syncAuthProfileSafely,
  updateAddress,
  updateCurrentProfile,
  type Address,
  type AuthProfile,
} from "@/features/auth/model/auth-client";
import { getSupabaseClient } from "@/shared/lib/supabase/client";

export function AccountProfile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);
  const [pendingAddressId, setPendingAddressId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      const sessionUser = data.session?.user ?? null;

      setUser(sessionUser);

      if (sessionUser) {
        void syncAuthProfileSafely().then(setProfile);
        void getAddresses().then(setAddresses).catch(() => setAddresses([]));
      }

      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      const sessionUser = session?.user ?? null;

      setUser(sessionUser);

      if (sessionUser) {
        void syncAuthProfileSafely().then(setProfile);
        void getAddresses().then(setAddresses).catch(() => setAddresses([]));
      } else {
        setProfile(null);
        setAddresses([]);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-stone-600">
            Dang tai thong tin tai khoan...
          </p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <>
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-900">
              <LogIn className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">Tai khoan cua toi</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
              Dang nhap de xem thong tin ca nhan, email va trang thai tai khoan.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="mt-5 h-10 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              Dang nhap
            </button>
          </div>
        </section>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  const displayName =
    profile?.full_name ??
    getMetadataString(user, "full_name") ??
    getMetadataString(user, "name") ??
    "Tai khoan NovaTech";
  const avatarUrl =
    profile?.avatar_url ??
    getMetadataString(user, "avatar_url") ??
    getMetadataString(user, "picture");
  const roleLabel = profile?.role ?? "customer";

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const nextProfile = await updateCurrentProfile({
        fullName: String(formData.get("fullName") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        avatarUrl: String(formData.get("avatarUrl") ?? ""),
      });

      setProfile(nextProfile);
      setMessage("Da luu thong tin ca nhan.");
    } catch {
      setMessage("Khong the luu thong tin. Vui long thu lai.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddressMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      setAddresses(
        await createAddress({
          recipientName: String(formData.get("recipientName") ?? ""),
          phone: String(formData.get("addressPhone") ?? ""),
          province: String(formData.get("province") ?? ""),
          district: String(formData.get("district") ?? ""),
          ward: String(formData.get("ward") ?? ""),
          line1: String(formData.get("line1") ?? ""),
          line2: String(formData.get("line2") ?? ""),
          isDefault: formData.get("isDefault") === "on",
        }),
      );
      form.reset();
      setAddressMessage("Da them dia chi giao hang.");
    } catch {
      setAddressMessage("Khong the luu dia chi. Kiem tra lai thong tin.");
    }
  }

  async function handleSetDefaultAddress(addressId: string) {
    setPendingAddressId(addressId);
    setAddressMessage(null);

    try {
      setAddresses(await updateAddress(addressId, { isDefault: true }));
      setAddressMessage("Da dat dia chi mac dinh.");
    } catch {
      setAddressMessage("Khong the cap nhat dia chi.");
    } finally {
      setPendingAddressId(null);
    }
  }

  async function handleDeleteAddress(addressId: string) {
    setPendingAddressId(addressId);
    setAddressMessage(null);

    try {
      setAddresses(await deleteAddress(addressId));
      setAddressMessage("Da xoa dia chi.");
    } catch {
      setAddressMessage("Khong the xoa dia chi.");
    } finally {
      setPendingAddressId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
          Tai khoan
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Thong tin ca nhan</h1>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
          <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-amber-100 text-amber-900">
            {avatarUrl ? (
              <span
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${avatarUrl})` }}
                aria-hidden="true"
              />
            ) : (
              <UserCircle className="h-10 w-10" aria-hidden="true" />
            )}
          </span>
          <h2 className="mt-5 truncate text-xl font-semibold">{displayName}</h2>
          {user.email ? (
            <p className="mt-1 truncate text-sm font-medium text-stone-500">
              {user.email}
            </p>
          ) : null}
          <span className="mt-4 inline-flex h-9 items-center rounded-full bg-amber-100 px-3 text-xs font-semibold uppercase text-amber-900">
            {roleLabel}
          </span>
        </aside>

        <div className="space-y-6">
        <div className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Thong tin lien he</h2>
              <p className="mt-1 text-sm text-stone-500">
                Cac thong tin dang hien thi tren tai khoan cua ban.
              </p>
            </div>
            {message ? (
              <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
                {message}
              </span>
            ) : null}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoItem icon={<UserCircle className="h-4 w-4" />} label="Ho ten" value={displayName} />
            <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={user.email ?? "Chua co email"} />
            <InfoItem icon={<Phone className="h-4 w-4" />} label="So dien thoai" value={profile?.phone ?? "Chua cap nhat"} />
            <InfoItem icon={<Shield className="h-4 w-4" />} label="Vai tro" value={roleLabel} />
          </div>
        </div>

        <form
          onSubmit={handleUpdateProfile}
          className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold">Chinh sua thong tin</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ProfileField
              name="fullName"
              label="Ho ten"
              defaultValue={displayName}
            />
            <ProfileField
              name="phone"
              label="So dien thoai"
              defaultValue={profile?.phone ?? ""}
            />
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase text-stone-600">
                Avatar URL
              </span>
              <input
                name="avatarUrl"
                type="url"
                defaultValue={avatarUrl ?? ""}
                placeholder="https://..."
                className="mt-2 h-11 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-5 h-10 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Dang luu..." : "Luu thong tin"}
          </button>
        </form>

        <div className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Dia chi giao hang</h2>
              <p className="mt-1 text-sm text-stone-500">
                Quan ly dia chi de dung nhanh khi thanh toan.
              </p>
            </div>
            {addressMessage ? (
              <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
                {addressMessage}
              </span>
            ) : null}
          </div>

          <form
            onSubmit={handleCreateAddress}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            <ProfileField
              name="recipientName"
              label="Nguoi nhan"
              defaultValue={displayName}
            />
            <ProfileField
              name="addressPhone"
              label="So dien thoai"
              defaultValue={profile?.phone ?? ""}
            />
            <ProfileField name="province" label="Tinh/Thanh pho" defaultValue="" />
            <ProfileField name="district" label="Quan/Huyen" defaultValue="" />
            <ProfileField name="ward" label="Phuong/Xa" defaultValue="" />
            <ProfileField name="line1" label="Dia chi chi tiet" defaultValue="" />
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase text-stone-600">
                Ghi chu dia chi
              </span>
              <input
                name="line2"
                className="mt-2 h-11 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <input name="isDefault" type="checkbox" className="h-4 w-4 accent-amber-700" />
              Dat lam dia chi mac dinh
            </label>
            <div className="md:text-right">
              <button
                type="submit"
                className="h-10 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
              >
                Them dia chi
              </button>
            </div>
          </form>

          <div className="mt-6 grid gap-3">
            {addresses.length ? (
              addresses.map((address) => (
                <article
                  key={address.id}
                  className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{address.recipientName}</p>
                        {address.isDefault ? (
                          <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                            Mac dinh
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-medium text-stone-600">
                        {address.phone}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {[address.line1, address.line2, address.ward, address.district, address.province]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!address.isDefault ? (
                        <button
                          type="button"
                          disabled={pendingAddressId !== null}
                          onClick={() => void handleSetDefaultAddress(address.id)}
                          className="grid h-10 w-10 place-items-center rounded-full border border-amber-900/15 text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                          aria-label="Dat dia chi mac dinh"
                        >
                          <Home className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={pendingAddressId !== null}
                        onClick={() => void handleDeleteAddress(address.id)}
                        className="grid h-10 w-10 place-items-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        aria-label="Xoa dia chi"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-amber-900/20 bg-[#fffdf7] p-5 text-sm font-medium text-stone-500">
                Chua co dia chi giao hang.
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

function ProfileField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-stone-600">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      />
    </label>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-amber-800">
        {icon}
        {label}
      </div>
      <p className="mt-3 break-words text-sm font-semibold text-stone-950">
        {value}
      </p>
    </div>
  );
}

function getMetadataString(user: SupabaseUser, key: string) {
  const value = user.user_metadata?.[key];

  return typeof value === "string" && value.trim() ? value : null;
}
