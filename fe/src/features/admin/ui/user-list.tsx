"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Search,
  Shield,
  ShoppingBag,
  Trash2,
  UserCog,
  X,
} from "lucide-react";

import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRole,
  type AdminUser,
} from "@/features/admin/api/admin-api";
import { PageSkeleton } from "@/shared/ui/loading-skeleton";

const ROLE_LABELS: Record<string, string> = {
  customer: "Khách hàng",
  staff: "Nhân viên",
  admin: "Quản trị",
};

const ROLE_COLORS: Record<string, string> = {
  customer: "bg-slate-100 text-slate-700",
  staff: "bg-cyan-100 text-cyan-700",
  admin: "bg-violet-100 text-violet-700",
};

const PAGE_SIZE = 12;

type UserListProps = {
  title: string;
  roles: string[];
  showSubRoleFilter?: boolean;
  emptyMessage?: string;
};

export function UserList({
  title,
  roles,
  showSubRoleFilter = false,
  emptyMessage = "Chưa có người dùng nào.",
}: UserListProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [subRole, setSubRole] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "" });
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchUsers = () => {
    setIsLoading(true);
    setMessage(null);
    getAdminUsers({ role: roles.join(",") })
      .then(setUsers)
      .catch(() => setMessage("Không thể tải danh sách."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      if (subRole !== "all" && user.role !== subRole) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        user.email,
        user.fullName ?? "",
        user.phone ?? "",
        user.id,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [users, query, subRole]);

  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  if (safePage !== page) {
    setPage(safePage);
  }

  const pagedUsers = visibleUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const resultStart =
    visibleUsers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const resultEnd = Math.min(safePage * PAGE_SIZE, visibleUsers.length);

  async function handleRoleChange(user: AdminUser, role: string) {
    setPendingAction(user.id);
    setMessage(null);

    try {
      const updated = await updateAdminUserRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setSelectedUser(updated);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Không thể cập nhật quyền.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleEditSave(userId: string) {
    setPendingAction(userId);
    setMessage(null);

    try {
      const payload: Record<string, unknown> = {};
      if (editForm.fullName.trim()) payload.fullName = editForm.fullName.trim();
      if (editForm.phone.trim()) payload.phone = editForm.phone.trim();

      if (Object.keys(payload).length === 0) {
        setEditingUser(null);
        setPendingAction(null);
        return;
      }

      const updated = await updateAdminUser(userId, payload);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setSelectedUser(updated);
      setEditingUser(null);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Không thể cập nhật thông tin.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete(userId: string) {
    if (!window.confirm("Xác nhận xóa người dùng này?")) return;

    setPendingAction(userId);
    setMessage(null);

    try {
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelectedUser(null);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Không thể xóa người dùng.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading) {
    return <PageSkeleton description cards={4} />;
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">
          {resultStart}-{resultEnd} / {visibleUsers.length} {title.toLowerCase()}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm email, tên, SĐT..."
              className="h-10 w-56 rounded-lg border border-cyan-950/10 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
          {showSubRoleFilter ? (
            <select
              value={subRole}
              onChange={(e) => {
                setSubRole(e.target.value);
                setPage(1);
              }}
              aria-label="Lọc quyền"
              className="h-10 rounded-lg border border-cyan-950/10 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">Tất cả</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r] ?? r}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      {message ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-lg border border-cyan-950/10 bg-white shadow-sm">
        {pagedUsers.length ? (
          <div className="divide-y divide-cyan-950/10">
            {pagedUsers.map((user) => (
              <div
                key={user.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedUser(user)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedUser(user);
                  }
                }}
                className="grid cursor-pointer grid-cols-[1fr_100px_80px] items-center gap-4 px-5 py-4 text-sm transition hover:bg-cyan-50/60 md:grid-cols-[1fr_100px_120px_80px]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
                      {(user.fullName ?? user.email)
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {user.fullName || user.email}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="hidden text-xs text-slate-400 md:block">
                  {user.phone || "—"}
                </span>
                <span
                  className={`inline-flex h-7 items-center justify-center rounded-md px-2.5 text-xs font-semibold ${ROLE_COLORS[user.role] ?? ROLE_COLORS.customer}`}
                >
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {user.orderCount} đơn
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm font-medium text-slate-500">
            {query || subRole !== "all"
              ? "Không tìm thấy người dùng phù hợp."
              : emptyMessage}
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-500">
            Trang {safePage} / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-950/10 text-slate-600 transition hover:border-cyan-500 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {createPageNumbers(safePage, totalPages).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                  p === safePage
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "border border-cyan-950/10 text-slate-600 hover:border-cyan-500 hover:text-cyan-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-950/10 text-slate-600 transition hover:border-cyan-500 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {selectedUser ? (
        <UserDetailModal
          user={selectedUser}
          pendingAction={pendingAction}
          roles={roles}
          onClose={() => setSelectedUser(null)}
          onRoleChange={
            roles.includes("admin") || roles.includes("staff")
              ? handleRoleChange
              : undefined
          }
          onDelete={handleDelete}
          onEdit={() => {
            setEditingUser(selectedUser);
            setEditForm({
              fullName: selectedUser.fullName ?? "",
              phone: selectedUser.phone ?? "",
            });
          }}
        />
      ) : null}

      {editingUser ? (
        <EditUserModal
          user={editingUser}
          form={editForm}
          pendingAction={pendingAction}
          onChange={(field, value) =>
            setEditForm((prev) => ({ ...prev, [field]: value }))
          }
          onSave={() => handleEditSave(editingUser.id)}
          onClose={() => setEditingUser(null)}
        />
      ) : null}
    </section>
  );
}

function createPageNumbers(currentPage: number, totalPages: number) {
  const visiblePages = new Set<number>([1, totalPages]);
  for (let p = currentPage - 1; p <= currentPage + 1; p += 1) {
    if (p >= 1 && p <= totalPages) visiblePages.add(p);
  }
  return Array.from(visiblePages).sort((a, b) => a - b);
}

function UserDetailModal({
  user,
  pendingAction,
  roles,
  onClose,
  onRoleChange,
  onDelete,
  onEdit,
}: {
  user: AdminUser;
  pendingAction: string | null;
  roles: string[];
  onClose: () => void;
  onRoleChange?: (user: AdminUser, role: string) => void;
  onDelete: (userId: string) => void;
  onEdit: () => void;
}) {
  const isPending = pendingAction === user.id;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6">
      <section className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-cyan-950/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-cyan-100 text-lg font-bold text-cyan-700">
              {(user.fullName ?? user.email).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {user.fullName || "Chưa có tên"}
              </h2>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-950/10 text-slate-600 transition hover:border-cyan-500 hover:text-cyan-600"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetaBox
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={user.email}
              />
              <MetaBox
                icon={<Phone className="h-4 w-4" />}
                label="Số điện thoại"
                value={user.phone || "Chưa có"}
              />
              <MetaBox
                icon={<Shield className="h-4 w-4" />}
                label="Quyền"
                value={ROLE_LABELS[user.role] ?? user.role}
              />
              <MetaBox
                icon={<ShoppingBag className="h-4 w-4" />}
                label="Số đơn hàng"
                value={`${user.orderCount} đơn`}
              />
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-cyan-950/10 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50"
            >
              <UserCog className="h-4 w-4" />
              Chỉnh sửa thông tin
            </button>

            {onRoleChange ? (
              <div className="rounded-lg border border-cyan-950/10 bg-cyan-50/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
                  <Shield className="h-4 w-4" />
                  Thay đổi quyền
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      disabled={isPending || user.role === r}
                      onClick={() => onRoleChange(user, r)}
                      className={`inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed ${
                        user.role === r
                          ? "bg-cyan-500 text-white shadow-sm"
                          : "border border-cyan-950/10 bg-white text-slate-700 hover:border-cyan-400 hover:text-cyan-700"
                      } ${isPending ? "opacity-50" : ""}`}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              disabled={isPending}
              onClick={() => onDelete(user.id)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Xóa người dùng
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function EditUserModal({
  user,
  form,
  pendingAction,
  onChange,
  onSave,
  onClose,
}: {
  user: AdminUser;
  form: { fullName: string; phone: string };
  pendingAction: string | null;
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const isPending = pendingAction === user.id;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6">
      <section className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-cyan-950/10 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Chỉnh sửa thông tin
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-950/10 text-slate-600 transition hover:border-cyan-500 hover:text-cyan-600"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Họ tên
            </label>
            <input
              value={form.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder="Nhập họ tên..."
              className="mt-1.5 h-10 w-full rounded-lg border border-cyan-950/10 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Số điện thoại
            </label>
            <input
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="mt-1.5 h-10 w-full rounded-lg border border-cyan-950/10 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-cyan-950/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-lg border border-cyan-950/10 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onSave}
            className="inline-flex h-10 items-center rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </section>
    </div>
  );
}

function MetaBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-cyan-950/10 bg-white p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
        <span className="text-cyan-600">{icon}</span>
        {label}
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
