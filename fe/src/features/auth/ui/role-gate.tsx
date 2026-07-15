"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import {
  getCurrentProfile,
  getRoleHomePath,
  type UserRole,
} from "../model/auth-client";
import { getDictionary, resolveLocale } from "@/shared/i18n";

type RoleGateProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams?.get("lang") ?? undefined);
  const t = getDictionary(locale).ui.roleGate;
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">(
    "checking",
  );
  const allowedRoleKey = allowedRoles.join(",");

  useEffect(() => {
    let isMounted = true;
    const roles = allowedRoleKey.split(",") as UserRole[];

    getCurrentProfile()
      .then((profile) => {
        if (!isMounted) {
          return;
        }

        if (roles.includes(profile.role)) {
          setStatus("allowed");
          return;
        }

        window.location.replace(getRoleHomePath(profile.role));
      })
      .catch(() => {
        if (isMounted) {
          setStatus("denied");
          window.location.replace("/");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [allowedRoleKey]);

  if (status === "allowed") {
    return children;
  }

  if (status === "checking") {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <img src="/NovaTech_daymode.png" alt="" className="logo-light h-12 w-auto" />
            <img src="/NovaTech_nightmode.png" alt="" className="logo-dark h-12 w-auto" />
            <span className="absolute inset-0 -m-3 animate-spin rounded-full border-2 border-transparent border-t-[var(--primary)]" />
          </div>
          <p className="text-sm text-[var(--muted)]">{t.checking}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-6">
      <p className="text-sm text-[var(--muted)]">
        {t.denied}
      </p>
    </main>
  );
}
