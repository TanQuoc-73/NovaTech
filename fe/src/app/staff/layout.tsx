import type { ReactNode } from "react";

import { RoleGate } from "@/features/auth";
import { StaffShell } from "@/features/staff/ui/staff-shell";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGate allowedRoles={["staff"]}>
      <StaffShell>{children}</StaffShell>
    </RoleGate>
  );
}
