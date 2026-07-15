import { Suspense, type ReactNode } from "react";

import { AdminShell } from "@/features/admin/ui/admin-shell";
import { RoleGate } from "@/features/auth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RoleGate allowedRoles={["admin"]}>
        <AdminShell>{children}</AdminShell>
      </RoleGate>
    </Suspense>
  );
}
