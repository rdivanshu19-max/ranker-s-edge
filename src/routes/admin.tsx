import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Ban, CheckCircle2, Trash2, Shield, Search } from "lucide-react";
import { listUsers, setUserBanned, deleteUser, listActivity } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [tab, setTab] = useState<"users" | "activity">("users");

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
    <div className="mx-auto max-w-6xl px-5 pb-10">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="size-5 text-primary" />
        <h1 className="font-serif text-4xl">Admin</h1>
      </div>
      <div className="flex gap-1 bg-secondary/60 rounded-full p-1 w-fit mb-6">
        {(["users", "activity"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize ${tab === t ? "bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground" : "text-muted-foreground"}`}
          >{t}</button>
        ))}
      </div>
      {tab === "users" ? <UsersTab /> : <ActivityTab />}
    </div>
  );
}

function UsersTab() {
  const list = useServerFn(listUsers);
  const ban = useServerFn(setUserBanned);
  const del = useServerFn(deleteUser);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });
  const banM = useMutation({
    mutationFn: (v: { user_id: string; banned: boolean }) => ban({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const delM = useMutation({
    mutationFn: (v: { user_id: string }) => del({ data: v }),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
  const [sortBy, setSortBy] = useState<"joined-desc" | "joined-asc" | "lastlogin-desc">("joined-desc");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter((u) => u.email?.toLowerCase().includes(s) || u.display_name?.toLowerCase().includes(s));
    }
    if (statusFilter !== "all") {
      rows = rows.filter((u) => (statusFilter === "banned" ? u.is_banned : !u.is_banned));
    }
    const cmp = (a: string | null, b: string | null) => (a && b ? a.localeCompare(b) : a ? 1 : -1);
    if (sortBy === "joined-desc") rows = [...rows].sort((a, b) => cmp(b.created_at, a.created_at));
    if (sortBy === "joined-asc")  rows = [...rows].sort((a, b) => cmp(a.created_at, b.created_at));
    if (sortBy === "lastlogin-desc") rows = [...rows].sort((a, b) => cmp(b.last_login_at, a.last_login_at));
    return rows;
  }, [data, search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) return <p className="text-muted-foreground">Loading users…</p>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="liquid-glass rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-input/40 rounded-xl px-3 py-1.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email or name…"
            className="flex-1 bg-transparent outline-none text-sm py-1"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
          className="bg-input/40 rounded-xl px-3 py-2 text-sm outline-none"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-input/40 rounded-xl px-3 py-2 text-sm outline-none"
        >
          <option value="joined-desc">Newest signups</option>
          <option value="joined-asc">Oldest signups</option>
          <option value="lastlogin-desc">Recent logins</option>
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} users</span>
      </div>

      <div className="liquid-glass rounded-2xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40 text-left text-xs text-muted-foreground uppercase">
          <tr>
            <th className="p-3">Email</th>
            <th className="p-3">Roles</th>
            <th className="p-3">Joined</th>
            <th className="p-3">Last login</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((u) => (
            <tr key={u.id} className="border-t border-border/60">
              <td className="p-3">{u.email}</td>
              <td className="p-3 text-xs">{u.roles.join(", ") || "user"}</td>
              <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="p-3 text-xs text-muted-foreground">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "—"}</td>
              <td className="p-3">
                {u.is_banned ? <span className="text-destructive text-xs">Banned</span> : <span className="text-emerald-400 text-xs">Active</span>}
              </td>
              <td className="p-3 text-right space-x-2">
                <button
                  onClick={() => banM.mutate({ user_id: u.id, banned: !u.is_banned })}
                  className="px-2 py-1 rounded-md text-xs liquid-glass inline-flex items-center gap-1 hover:scale-[1.03] transition"
                >
                  {u.is_banned ? <><CheckCircle2 className="size-3" /> Unban</> : <><Ban className="size-3" /> Ban</>}
                </button>
                <button
                  onClick={() => { if (confirm(`Delete ${u.email}? This cannot be undone.`)) delM.mutate({ user_id: u.id }); }}
                  className="px-2 py-1 rounded-md text-xs liquid-glass hover:text-destructive inline-flex items-center gap-1 transition"
                >
                  <Trash2 className="size-3" /> Delete
                </button>
              </td>
            </tr>
          ))}
          {pageRows.length === 0 && (
            <tr><td colSpan={6} className="p-6 text-center text-muted-foreground text-sm">No users match.</td></tr>
          )}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="liquid-glass rounded-md px-3 py-1 disabled:opacity-40">Prev</button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="liquid-glass rounded-md px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}

function ActivityTab() {
  const list = useServerFn(listActivity);
  const { data, isLoading } = useQuery({ queryKey: ["admin-activity"], queryFn: () => list({ data: { limit: 200 } }) });
  if (isLoading) return <p className="text-muted-foreground">Loading activity…</p>;
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/40 text-left text-xs text-muted-foreground uppercase">
          <tr><th className="p-3">When</th><th className="p-3">User</th><th className="p-3">Resource</th></tr>
        </thead>
        <tbody>
          {data?.map((a) => (
            <tr key={a.id} className="border-t border-border/60">
              <td className="p-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</td>
              <td className="p-3">{a.email}</td>
              <td className="p-3 text-xs">{a.resource_key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}