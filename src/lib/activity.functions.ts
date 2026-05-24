import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side activity tracking — works for both anon and signed-in users.
 * RLS policy "Anyone can insert activity" allows either auth.uid() = user_id, or null.
 */
export async function trackActivity(resource_key: string, path?: string) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user_id = session.session?.user.id ?? null;
    await supabase.from("activity_log").insert({
      user_id,
      resource_key,
      path: path ?? null,
    });
  } catch {
    /* swallow — tracking is best-effort */
  }
}

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