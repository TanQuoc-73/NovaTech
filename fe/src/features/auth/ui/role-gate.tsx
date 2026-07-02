"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  getCurrentProfile,
  getRoleHomePath,
  type UserRole,
} from "../model/auth-client";

type RoleGateProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
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

  return (
    <main className="grid min-h-screen place-items-center bg-[#fff8ed] px-6 text-stone-700">
      <p className="text-sm font-semibold">
        {status === "checking" ? "Dang kiem tra quyen..." : "Khong co quyen truy cap."}
      </p>
    </main>
  );
}
