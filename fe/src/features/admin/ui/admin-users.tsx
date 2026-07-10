"use client";

import { useState } from "react";
import { Users, ShieldCheck } from "lucide-react";

import { UserList } from "./user-list";

const TABS = [
  {
    key: "customers",
    label: "Khách hàng",
    icon: Users,
    roles: ["customer"],
  },
  {
    key: "staff",
    label: "Nhân viên & Quản trị",
    icon: ShieldCheck,
    roles: ["staff", "admin"],
    showSubRoleFilter: true,
  },
] as const;

export function AdminUsers() {
  const [activeTab, setActiveTab] = useState<string>("customers");

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const showSubRole = "showSubRoleFilter" in currentTab ? currentTab.showSubRoleFilter : false;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 border-b border-cyan-950/10">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-cyan-500 text-cyan-700"
                  : "border-transparent text-slate-500 hover:border-cyan-300 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <UserList
        key={currentTab.key}
        title={currentTab.label}
        roles={[...currentTab.roles]}
        showSubRoleFilter={showSubRole}
        emptyMessage={
          currentTab.key === "customers"
            ? "Chưa có khách hàng nào."
            : "Chưa có nhân viên nào."
        }
      />
    </div>
  );
}
