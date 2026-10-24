import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Play, X } from "lucide-react";
import { toast } from "sonner";
import { QFTS, qftUnlockDate } from "@/lib/resources";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { logStudyTime, saveAttempt } from "@/lib/progress.functions";

function paperNo(url: string): number | null {
  const m = url.match(/qft\/(\d+)\.html/);
  return m ? Number(m[1]) : null;
}

/**
 * Mathango 2027 QFT collection — weekly unlock schedule, early-access code,
 * CBT viewer with score capture into the Rank Ledger and time tracking.
 */
export function QftSection({ backTo }: { backTo?: { to: string; label: string } }) {
  const { user } = useAuth();
  const [now, setNow] = useState<number | null>(null);
  const [early, setEarly] = useState(false);
  const [code, setCode] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const secondsRef = useRef(0);

  useEffect(() => setNow(Date.now()), []);

  useEffect(() => {
    if (!user) {
      setEarly(false);
      return;
    }
    supabase
      .from("early_access" as any)
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setEarly(!!data));
  }, [user]);

  const flushTime = (seconds: number) => {
    const n = open ? paperNo(open) : null;
    if (!user || !n || seconds < 1) return;
    logStudyTime({
      data: {
        paper_key: `qft-${n}`,
        paper_title: `QFT ${n} · Full Syllabus`,
        source: "qft",
        seconds: Math.min(seconds, 3600),
      },
    }).catch(() => {});
  };

  // Track time in one-minute heartbeats while a paper is open.
  useEffect(() => {
    if (!open) {
      flushTime(secondsRef.current);
      secondsRef.current = 0;
      return;
    }
    const iv = setInterval(() => {
      secondsRef.current += 60;
      if (secondsRef.current >= 60) {
        flushTime(secondsRef.current);
        secondsRef.current = 0;
      }
    }, 60_000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  // Receive the score each paper reports on submit.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as any;
      if (d?.type !== "qft-result") return;
      const openN = open ? paperNo(open) : null;
      if (!openN || d.paper !== openN) return;
      if (!user) {
        toast.error("Sign in to save this attempt to your Rank Ledger.");
        return;
      }
      saveAttempt({
        data: {
          paper_key: `qft-${d.paper}`,
          paper_title: `QFT ${d.paper} · Full Syllabus`,
          source: "qft",
          score: d.score,
          attempted: d.attempted,
          correct: d.correct,
          wrong: d.wrong,
          total_questions: d.total,
          subjects: d.subjects ?? {},
          time_spent_seconds: d.time_spent_seconds ?? 0,
        },
      })
        .then(() => toast.success("Score saved to your Rank Ledger."))
        .catch(() => toast.error("Could not save this attempt."));
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  const redeem = async () => {
    if (!user) return toast.error("Sign in first to use an early-access code.");
    const { data, error } = await supabase.rpc("redeem_access_code" as any, { _code: code });
    if (error || !data) return toast.error("Invalid code.");
    setEarly(true);
    toast.success("All papers unlocked for your account.");
  };

  const closeViewer = () => {
    setOpen(null);
  };

  if (open) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-background">
        <div className="liquid-glass flex items-center justify-between px-4 py-3 border-b border-border/40">
          <span className="text-sm font-medium">Mathango 2027 · QFT</span>
          <button onClick={closeViewer} className="size-9 rounded-full liquid-glass grid place-items-center" aria-label="Close test">
            <X className="size-4" />
          </button>
        </div>
        <iframe src={open} title="QFT test" className="flex-1 w-full border-0 bg-white" />
      </div>
    );
  }

  return (
    <div>
      {backTo && (
        <Link to={backTo.to} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {backTo.label}
        </Link>
      )}
      <div className="text-center mt-6">
        <span className="liquid-glass rounded-full px-3 py-1 text-xs uppercase tracking-widest">{QFTS.length} papers · new every Sunday</span>
        <h2 className="font-serif text-4xl sm:text-5xl mt-4">
          Mathango 2027 · <span className="silver-text italic">QFTs</span>
        </h2>
        <p className="mt-2 text-muted-foreground">Full-syllabus papers in a desktop CBT view. Every score lands in your Rank Ledger.</p>
        {!early && (
          <div className="mt-5 mx-auto flex max-w-md gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Have an early-access code?"
              className="flex-1 rounded-xl bg-input/40 px-4 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-primary"
            />
            <button onClick={redeem} className="rounded-xl bg-primary px-5 text-sm text-primary-foreground">
              Unlock
            </button>
          </div>
        )}
        {early && <p className="mt-5 text-sm text-primary">Early access active — every paper is open.</p>}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {QFTS.map((q) => {
          const at = qftUnlockDate(q.n);
          const unlocked = early || (now !== null && now >= at.getTime());
          return (
            <div key={q.n} className="liquid-glass rounded-3xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="size-12 rounded-2xl grid place-items-center bg-primary/20 font-serif text-xl">{String(q.n).padStart(2, "0")}</span>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-primary">Full test</div>
                    <div className="font-medium">{q.title}</div>
                  </div>
                </div>
                {!unlocked && <Lock className="size-4 text-muted-foreground" />}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {[["Time", "180 min"], ["Qs", "75"], ["Marks", "300"]].map(([l, v]) => (
                  <div key={l} className="rounded-xl bg-secondary/40 p-2">
                    <div className="text-muted-foreground uppercase">{l}</div>
                    <div className="text-sm">{v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Physics, Chemistry & Mathematics — full syllabus.</p>
              <button
                disabled={!unlocked}
                onClick={() => setOpen(q.url)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground"
              >
                {unlocked ? (
                  <>
                    <Play className="size-4" /> Start Test
                  </>
                ) : (
                  <>Unlocks {at.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
