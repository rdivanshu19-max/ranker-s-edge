import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "@/lib/admin.functions";

const attemptSchema = z.object({
  paper_key: z.string().min(1).max(80),
  paper_title: z.string().min(1).max(160),
  source: z.enum(["qft", "series"]).default("qft"),
  score: z.number().int().optional(),
  attempted: z.number().int().min(0).max(500),
  correct: z.number().int().min(0).max(500),
  wrong: z.number().int().min(0).max(500),
  total_questions: z.number().int().min(0).max(500),
  subjects: z.record(z.string(), z.any()).default({}),
  time_spent_seconds: z.number().int().min(0).max(6 * 3600).default(0),
});

/** Save a finished paper attempt (score, accuracy, time). */
export const saveAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => attemptSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("paper_attempts")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Accumulate study time for a paper (heartbeated from the client every minute). */
export const logStudyTime = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        paper_key: z.string().min(1).max(80),
        paper_title: z.string().min(1).max(160),
        source: z.enum(["qft", "series"]).default("series"),
        seconds: z.number().int().min(1).max(3600),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const day = new Date().toISOString().slice(0, 10);
    const { data: existing } = await sb
      .from("study_sessions")
      .select("seconds")
      .eq("user_id", context.userId)
      .eq("paper_key", data.paper_key)
      .eq("day", day)
      .maybeSingle();
    const seconds = Math.min((existing?.seconds ?? 0) + data.seconds, 6 * 3600);
    const { error } = await sb
      .from("study_sessions")
      .upsert(
        {
          user_id: context.userId,
          paper_key: data.paper_key,
          paper_title: data.paper_title,
          source: data.source,
          day,
          seconds,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,paper_key,day" },
      );
    if (error) throw new Error(error.message);
    return { ok: true, seconds };
  });

/** The signed-in student's ledger: every attempt plus accumulated time per paper. */
export const getMyProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const [{ data: attempts, error: e1 }, { data: sessions, error: e2 }] = await Promise.all([
      sb
        .from("paper_attempts")
        .select("*")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false }),
      sb
        .from("study_sessions")
        .select("paper_key,paper_title,source,day,seconds")
        .eq("user_id", context.userId),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    return { attempts: attempts ?? [], sessions: sessions ?? [] };
  });

type StudentAgg = {
  user_id: string;
  email: string;
  attempts: number;
  best_pct: number;
  seconds: number;
  last_active: string | null;
};

/** Admin: per-student ledger overview. */
export const adminProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb: any = context.supabase;
    const [{ data: attempts, error: e1 }, { data: sessions, error: e2 }, { data: profiles, error: e3 }] =
      await Promise.all([
        sb.from("paper_attempts").select("user_id,score,total_questions,created_at"),
        sb.from("study_sessions").select("user_id,seconds"),
        sb.from("profiles").select("id,email,display_name"),
      ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    if (e3) throw new Error(e3.message);

    const agg = new Map<string, StudentAgg>();
    const ensure = (id: string): StudentAgg => {
      let a = agg.get(id);
      if (!a) {
        a = { user_id: id, email: "—", attempts: 0, best_pct: 0, seconds: 0, last_active: null };
        agg.set(id, a);
      }
      return a;
    };
    (profiles ?? []).forEach((p: any) => {
      ensure(p.id).email = p.email ?? "—";
    });
    (attempts ?? []).forEach((a: any) => {
      const row = ensure(a.user_id);
      row.attempts++;
      if (a.total_questions > 0 && a.score != null) {
        row.best_pct = Math.max(row.best_pct, Math.round((a.score / (a.total_questions * 4)) * 100));
      }
      if (!row.last_active || new Date(a.created_at) > new Date(row.last_active)) row.last_active = a.created_at;
    });
    (sessions ?? []).forEach((s: any) => {
      ensure(s.user_id).seconds += s.seconds ?? 0;
    });
    return Array.from(agg.values()).sort((x, y) => (y.last_active ?? "").localeCompare(x.last_active ?? ""));
  });

type PaperAgg = {
  paper_key: string;
  attempts: number;
  students: number;
  avg_pct: number;
  seconds: number;
};

/** Admin: engagement stats for every test paper. */
export const adminPaperStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb: any = context.supabase;
    const [{ data: attempts, error: e1 }, { data: sessions, error: e2 }] = await Promise.all([
      sb.from("paper_attempts").select("paper_key,score,total_questions,user_id"),
      sb.from("study_sessions").select("paper_key,seconds"),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);

    const agg = new Map<string, PaperAgg & { sum_pct: number; pct_n: number }>();
    const ensure = (k: string) => {
      let a = agg.get(k);
      if (!a) {
        a = { paper_key: k, attempts: 0, students: 0, avg_pct: 0, seconds: 0, sum_pct: 0, pct_n: 0 };
        agg.set(k, a);
      }
      return a;
    };
    const usersByPaper = new Map<string, Set<string>>();
    (attempts ?? []).forEach((a: any) => {
      const row = ensure(a.paper_key);
      row.attempts++;
      if (a.total_questions > 0 && a.score != null) {
        row.sum_pct += (a.score / (a.total_questions * 4)) * 100;
        row.pct_n++;
      }
      const set = usersByPaper.get(a.paper_key) ?? new Set<string>();
      set.add(a.user_id);
      usersByPaper.set(a.paper_key, set);
    });
    usersByPaper.forEach((set, k) => {
      ensure(k).students = set.size;
    });
    (sessions ?? []).forEach((s: any) => {
      ensure(s.paper_key).seconds += s.seconds ?? 0;
    });
    return Array.from(agg.values()).map(({ sum_pct, pct_n, ...row }) => ({
      ...row,
      avg_pct: pct_n ? Math.round(sum_pct / pct_n) : 0,
    }));
  });
