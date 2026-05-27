import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const adminDb = supabaseAdmin as any;

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: profiles, error } = await adminDb
      .from("profiles")
      .select("id, email, display_name, is_banned, ban_reason, banned_at, banned_by, last_login_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleByUser = new Map<string, string[]>();
    (roles ?? []).forEach((r) => {
      const arr = roleByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      roleByUser.set(r.user_id, arr);
    });
    return (profiles ?? []).map((p) => ({
      ...p,
      roles: roleByUser.get(p.id) ?? [],
    }));
  });

export const setUserBanned = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ user_id: z.string().uuid(), banned: z.boolean(), reason: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const reason = data.reason?.trim() || null;
    const { error } = await adminDb
      .from("profiles")
      .update({
        is_banned: data.banned,
        ban_reason: data.banned ? reason : null,
        banned_at: data.banned ? new Date().toISOString() : null,
        banned_by: data.banned ? context.userId : null,
      })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);
    await adminDb.from("admin_audit_log").insert({
      actor_user_id: context.userId,
      target_user_id: data.user_id,
      action: data.banned ? "ban" : "unban",
      reason,
      metadata: {},
    });
    // also sign out all sessions when banned
    if (data.banned) {
      await supabaseAdmin.auth.admin.signOut(data.user_id).catch(() => {});
    }
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (data.user_id === context.userId) throw new Error("Cannot delete yourself");
    await adminDb.from("admin_audit_log").insert({
      actor_user_id: context.userId,
      target_user_id: data.user_id,
      action: "delete_user",
      metadata: {},
    });
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ limit: z.number().min(1).max(500).default(100) }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("activity_log")
      .select("id, user_id, resource_key, path, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    const ids = Array.from(
      new Set((rows ?? []).map((r) => r.user_id).filter((x): x is string => !!x)),
    );
    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const emailById = new Map((profs ?? []).map((p) => [p.id, p.email]));
    return (rows ?? []).map((r) => ({
      ...r,
      email: r.user_id ? emailById.get(r.user_id) ?? "—" : "Anonymous",
    }));
  });

export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ user_id: z.string().uuid().optional(), limit: z.number().min(1).max(1000).default(500) }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let q = adminDb
      .from("admin_audit_log")
      .select("id, actor_user_id, target_user_id, action, reason, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.user_id) q = q.eq("target_user_id", data.user_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((rows ?? []).flatMap((r: any) => [r.actor_user_id, r.target_user_id]).filter(Boolean)));
    const { data: profs } = await adminDb.from("profiles").select("id, email").in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const emailById = new Map((profs ?? []).map((p: any) => [p.id, p.email]));
    return (rows ?? []).map((r: any) => ({
      ...r,
      actor_email: r.actor_user_id ? emailById.get(r.actor_user_id) ?? "—" : "System",
      target_email: r.target_user_id ? emailById.get(r.target_user_id) ?? "—" : "—",
    }));
  });