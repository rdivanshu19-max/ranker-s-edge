import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public — works for anon and authenticated users.
// We resolve the user from the Supabase auth header if present, otherwise log as anonymous.
export const logActivity = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        resource_key: z.string().min(1).max(64),
        path: z.string().max(512).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, request }) => {
    let userId: string | null = null;
    const authHeader = request?.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: u } = await supabaseAdmin.auth.getUser(token);
      userId = u.user?.id ?? null;
    }
    const { error } = await supabaseAdmin.from("activity_log").insert({
      user_id: userId,
      resource_key: data.resource_key,
      path: data.path ?? null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

export const updateLastLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId);
    return { ok: true };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (data ?? []).some((r) => r.role === "admin");
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_banned, email, display_name")
      .eq("id", userId)
      .maybeSingle();
    return { isAdmin, profile };
  });