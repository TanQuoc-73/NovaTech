"use client";

import { LogOut } from "lucide-react";

import { signOut } from "../model/auth-client";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      aria-label="Dang xuat"
      onClick={handleLogout}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-amber-900/15 bg-white text-stone-800 shadow-sm transition hover:border-amber-700/40 hover:bg-amber-50 ${className}`}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
