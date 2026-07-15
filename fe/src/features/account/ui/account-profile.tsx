"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { LogIn, Mail, Phone, Shield, UserCircle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { AuthModal } from "@/features/auth";
import {
  syncAuthProfileSafely,
  updateCurrentProfile,
  type AuthProfile,
} from "@/features/auth/model/auth-client";
import type { Dictionary } from "@/shared/i18n";
import { getSupabaseClient } from "@/shared/lib/supabase/client";
import { FormSkeleton } from "@/shared/ui/loading-skeleton";
import { AccountSidebar } from "@/features/account/ui/account-sidebar";

export function AccountProfile({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.ui.account.info;
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;

      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        void syncAuthProfileSafely().then(setProfile);
      }

      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        void syncAuthProfileSafely().then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (!user) {
    return (
      <>
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-900">
              <LogIn className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">{t.title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
              {t.notSignedIn}
            </p>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="mt-5 h-10 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              {dictionary.nav.signIn}
            </button>
          </div>
        </section>
        <AuthModal
          dictionary={dictionary}
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      </>
    );
  }

  const displayName =
    profile?.full_name ??
    getMetadataString(user, "full_name") ??
    getMetadataString(user, "name") ??
    t.fallbackName;
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
      setMessage(t.saved);
    } catch {
      setMessage(t.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
          {t.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold">{t.pageTitle}</h1>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <AccountSidebar dictionary={dictionary} />

        <div className="space-y-6">
        <div className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">{t.contactTitle}</h2>
              <p className="mt-1 text-sm text-stone-500">
                {t.contactDesc}
              </p>
            </div>
            {message ? (
              <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
                {message}
              </span>
            ) : null}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoItem icon={<UserCircle className="h-4 w-4" />} label={t.fullName} value={displayName} />
            <InfoItem icon={<Mail className="h-4 w-4" />} label={t.email} value={user.email ?? t.noEmail} />
            <InfoItem icon={<Phone className="h-4 w-4" />} label={t.phone} value={profile?.phone ?? t.noPhone} />
            <InfoItem icon={<Shield className="h-4 w-4" />} label={t.role} value={roleLabel} />
          </div>
        </div>

        <form
          onSubmit={handleUpdateProfile}
          className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold">{t.editTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ProfileField
              name="fullName"
              label={t.fullName}
              defaultValue={displayName}
            />
            <ProfileField
              name="phone"
              label={t.phone}
              defaultValue={profile?.phone ?? ""}
            />
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase text-stone-600">
                {t.avatarUrl}
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
            {isSaving ? t.saving : t.save}
          </button>
        </form>

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
