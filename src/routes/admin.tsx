import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Ban, CheckCircle2, Download, FileClock, Search, Shield, Trash2 } from "lucide-react";
import { deleteUser, listActivity, listAuditLog, listUsers, setUserBanned } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AdminUser = {
  id: string;
  email: string | null;
  display_name: string | null;
  is_banned: boolean;
  ban_reason?: string | null;
  banned_at?: string | null;
  created_at: string;
  last_login_at: string | null;
  roles: string[];
};

type ActivityRow = { id: string; created_at: string; email: string; resource_key: string; path?: string | null };
type AuditRow = { id: string; created_at: string; actor_email: string; target_email: string; action: string; reason?: string | null };

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Rankers Edge" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"users" | "activity" | "audit">("users");

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login", search: { redirect: "/admin" } });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  if (loading || !user || isAdmin === null) return <div className="py-20 text-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return <div className="py-20 text-center"><h1 className="font-serif text-3xl">Not authorized</h1></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-5 pb-10">
      <div className="mb-6 flex items-center gap-2">
        <Shield className="size-5 text-primary" />
        <h1 className="font-serif text-4xl">Admin</h1>
      </div>
      <div className="mb-6 flex w-full gap-1 overflow-x-auto rounded-full bg-secondary/60 p-1 sm:w-fit">
        {(["users", "activity", "audit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground" : "text-muted-foreground"}`}
          >{t}</button>
        ))}
      </div>
      {tab === "users" ? <UsersTab /> : tab === "activity" ? <ActivityTab /> : <AuditTab />}
    </div>
  );
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const keys = Object.keys(rows[0] ?? { empty: "" });
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function UsersTab() {
  const list = useServerFn(listUsers);
  const ban = useServerFn(setUserBanned);
  const del = useServerFn(deleteUser);
  const audit = useServerFn(listAuditLog);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { data: userAudit } = useQuery({
    queryKey: ["admin-user-audit", selectedUser?.id],
    queryFn: () => audit({ data: { user_id: selectedUser!.id, limit: 100 } }),
    enabled: !!selectedUser,
  });
  const banM = useMutation({
    mutationFn: (v: { user_id: string; banned: boolean; reason?: string }) => ban({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); qc.invalidateQueries({ queryKey: ["admin-user-audit"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const delM = useMutation({
    mutationFn: (v: { user_id: string }) => del({ data: v }),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
  const rows = (data ?? []) as AdminUser[];
  const filtered = useMemo(() => {
    let next = rows;
    if (search.trim()) {
      const s = search.toLowerCase();
      next = next.filter((u: AdminUser) => u.email?.toLowerCase().includes(s) || u.display_name?.toLowerCase().includes(s));
    }
    if (statusFilter !== "all") next = next.filter((u: AdminUser) => (statusFilter === "banned" ? u.is_banned : !u.is_banned));
    return [...next].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [rows, search, statusFilter]);

  const toggleBan = (u: AdminUser) => {
    const reason = u.is_banned ? undefined : window.prompt(`Ban reason for ${u.email}:`, u.ban_reason ?? "")?.trim();
    if (!u.is_banned && reason === undefined) return;
    banM.mutate({ user_id: u.id, banned: !u.is_banned, reason });
  };

  if (isLoading) return <p className="text-muted-foreground">Loading users…</p>;

  return (
    <div className="space-y-4">
      <div className="liquid-glass flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl bg-input/40 px-3 py-1.5">
          <Search className="size-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="flex-1 bg-transparent py-1 text-sm outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl bg-input/40 px-3 py-2 text-sm outline-none">
          <option value="all">All status</option><option value="active">Active</option><option value="banned">Banned</option>
        </select>
        <button onClick={() => downloadCsv("rankers-users.csv", filtered as unknown as Array<Record<string, unknown>>)} className="liquid-glass inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm"><Download className="size-4" /> Export</button>
      </div>

      <div className="grid gap-3 md:hidden">
        {filtered.map((u: AdminUser) => <UserCard key={u.id} u={u} onBan={() => toggleBan(u)} onLogs={() => setSelectedUser(u)} onDelete={() => { if (confirm(`Delete ${u.email}?`)) delM.mutate({ user_id: u.id }); }} />)}
      </div>

      <div className="liquid-glass hidden overflow-x-auto rounded-2xl md:block">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Email</th><th className="p-3">Joined</th><th className="p-3">Last login</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody>{filtered.map((u: AdminUser) => (
            <tr key={u.id} className="border-t border-border/60">
              <td className="p-3"><div>{u.email}</div><div className="text-xs text-muted-foreground">{u.roles.join(", ") || "user"}</div></td>
              <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-xs text-muted-foreground">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "—"}</td>
              <td className="p-3 text-xs">{u.is_banned ? <span className="text-destructive">Banned · {u.ban_reason || "No reason"}</span> : <span className="text-emerald-400">Active</span>}</td>
              <td className="p-3 text-right"><ActionButtons u={u} onBan={() => toggleBan(u)} onLogs={() => setSelectedUser(u)} onDelete={() => { if (confirm(`Delete ${u.email}?`)) delM.mutate({ user_id: u.id }); }} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {selectedUser && <AuditPanel user={selectedUser} rows={(userAudit ?? []) as AuditRow[]} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}

function ActionButtons({ u, onBan, onLogs, onDelete }: { u: AdminUser; onBan: () => void; onLogs: () => void; onDelete: () => void }) {
  return <div className="flex flex-wrap justify-end gap-2"><button onClick={onBan} className="liquid-glass inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs">{u.is_banned ? <CheckCircle2 className="size-3" /> : <Ban className="size-3" />}{u.is_banned ? "Unban" : "Ban"}</button><button onClick={onLogs} className="liquid-glass inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs"><FileClock className="size-3" /> Logs</button><button onClick={onDelete} className="liquid-glass inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:text-destructive"><Trash2 className="size-3" /> Delete</button></div>;
}

function UserCard({ u, onBan, onLogs, onDelete }: { u: AdminUser; onBan: () => void; onLogs: () => void; onDelete: () => void }) {
  return <div className="liquid-glass rounded-2xl p-4"><div className="font-medium break-all">{u.email}</div><div className="mt-1 text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()} · {u.roles.join(", ") || "user"}</div><div className="mt-2 text-xs">{u.is_banned ? <span className="text-destructive">Banned · {u.ban_reason || "No reason"}</span> : <span className="text-emerald-400">Active</span>}</div><div className="mt-3"><ActionButtons u={u} onBan={onBan} onLogs={onLogs} onDelete={onDelete} /></div></div>;
}

function AuditPanel({ user, rows, onClose }: { user: AdminUser; rows: AuditRow[]; onClose: () => void }) {
  return <div className="liquid-glass rounded-2xl p-4"><div className="flex items-center justify-between gap-3"><h2 className="font-serif text-2xl">Audit · {user.email}</h2><button onClick={onClose} className="text-sm text-muted-foreground">Close</button></div><div className="mt-3 space-y-2">{rows.length ? rows.map((r) => <div key={r.id} className="rounded-xl bg-secondary/30 p-3 text-sm"><div className="font-medium capitalize">{r.action.replaceAll("_", " ")}</div><div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()} by {r.actor_email}</div>{r.reason && <div className="mt-1 text-xs">Reason: {r.reason}</div>}</div>) : <p className="text-sm text-muted-foreground">No audit events yet.</p>}</div></div>;
}

function ActivityTab() {
  const list = useServerFn(listActivity);
  const { data, isLoading } = useQuery({ queryKey: ["admin-activity"], queryFn: () => list({ data: { limit: 500 } }) });
  const rows = (data ?? []) as ActivityRow[];
  if (isLoading) return <p className="text-muted-foreground">Loading activity…</p>;
  return <LogTable rows={rows.map((a) => ({ when: new Date(a.created_at).toLocaleString(), user: a.email, event: a.resource_key, detail: a.path ?? "" }))} filename="rankers-activity.csv" />;
}

function AuditTab() {
  const list = useServerFn(listAuditLog);
  const { data, isLoading } = useQuery({ queryKey: ["admin-audit"], queryFn: () => list({ data: { limit: 1000 } }) });
  const rows = ((data ?? []) as AuditRow[]).map((a) => ({ when: new Date(a.created_at).toLocaleString(), user: a.target_email, event: a.action, detail: a.reason ?? `by ${a.actor_email}` }));
  if (isLoading) return <p className="text-muted-foreground">Loading audit…</p>;
  return <LogTable rows={rows} filename="rankers-audit-log.csv" />;
}

function LogTable({ rows, filename }: { rows: Array<{ when: string; user: string; event: string; detail: string }>; filename: string }) {
  return <div className="space-y-3"><button onClick={() => downloadCsv(filename, rows)} className="liquid-glass inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm"><Download className="size-4" /> Export log</button><div className="liquid-glass overflow-x-auto rounded-2xl"><table className="w-full text-sm"><thead className="bg-secondary/40 text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">When</th><th className="p-3">User</th><th className="p-3">Event</th><th className="p-3">Detail</th></tr></thead><tbody>{rows.map((r, i) => <tr key={`${r.when}-${i}`} className="border-t border-border/60"><td className="p-3 text-xs text-muted-foreground">{r.when}</td><td className="p-3">{r.user}</td><td className="p-3 text-xs">{r.event}</td><td className="p-3 text-xs text-muted-foreground">{r.detail}</td></tr>)}</tbody></table></div></div>;
}