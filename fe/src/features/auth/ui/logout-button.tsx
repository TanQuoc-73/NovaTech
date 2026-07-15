"use client";

import { LogOut } from "lucide-react";

import type { Dictionary } from "@/shared/i18n";
import { signOut } from "../model/auth-client";

type LogoutButtonProps = {
  className?: string;
  dictionary: Dictionary;
};

export function LogoutButton({ className = "", dictionary }: LogoutButtonProps) {
  const t = dictionary.ui.admin;
  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      aria-label={t.logoutAria}
      onClick={handleLogout}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-amber-900/15 bg-white text-stone-800 shadow-sm transition hover:border-amber-700/40 hover:bg-amber-50 ${className}`}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
