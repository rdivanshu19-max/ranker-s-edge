import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Play, X } from "lucide-react";
import { toast } from "sonner";
import { QFTS, qftUnlockDate } from "@/lib/resources";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/test-series/mathango-qfts")({
  head: () => ({
    meta: [
      { title: "Mathango 2027 QFTs — Weekly Full Tests | Rankers Edge" },
      { name: "description", content: "Mathango 2027 full-syllabus QFT papers in a desktop CBT view. A new paper unlocks every Sunday." },
      { property: "og:title", content: "Mathango 2027 QFTs — Rankers Edge" },
      { property: "og:description", content: "A new full-syllabus QFT every Sunday." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/test-series/mathango-qfts" }],
  }),
  component: QftPage,
});

function QftPage() {
  const { user } = useAuth();
  const [now, setNow] = useState<number | null>(null);
  const [early, setEarly] = useState(false);
  const [code, setCode] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => setNow(Date.now()), []);
  useEffect(() => {
    if (!user) return setEarly(false);
    supabase.from("early_access" as any).select("user_id").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setEarly(!!data));
  }, [user]);

  const redeem = async () => {
    if (!user) return toast.error("Sign in first to use an early-access code.");
    const { data, error } = await supabase.rpc("redeem_access_code" as any, { _code: code });
    if (error || !data) return toast.error("Invalid code.");
    setEarly(true);
    toast.success("All papers unlocked for your account.");
  };

  if (open) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-background">
        <div className="liquid-glass flex items-center justify-between px-4 py-3 border-b border-border/40">
          <span className="text-sm font-medium">Mathango 2027 · QFT</span>
          <button onClick={() => setOpen(null)} className="size-9 rounded-full liquid-glass grid place-items-center" aria-label="Close test"><X className="size-4" /></button>
        </div>
        <iframe src={open} title="QFT test" className="flex-1 w-full border-0 bg-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-6">
      <Link to="/test-series" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Test Series</Link>
      <div className="text-center mt-6">
        <span className="liquid-glass rounded-full px-3 py-1 text-xs uppercase tracking-widest">{QFTS.length} papers · new every Sunday</span>
        <h1 className="font-serif text-5xl sm:text-6xl mt-5">Mathango 2027 · <span className="silver-text italic">QFTs</span></h1>
        <p className="mt-3 text-muted-foreground">Desktop view recommended for the best CBT experience.</p>
        {!early && (
          <div className="mt-6 mx-auto flex max-w-md gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Have an early-access code?" className="flex-1 rounded-xl bg-input/40 px-4 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-primary" />
            <button onClick={redeem} className="rounded-xl bg-primary px-5 text-sm text-primary-foreground">Unlock</button>
          </div>
        )}
        {early && <p className="mt-6 text-sm text-primary">Early access active — every paper is open.</p>}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
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
                  <div key={l} className="rounded-xl bg-secondary/40 p-2"><div className="text-muted-foreground uppercase">{l}</div><div className="text-sm">{v}</div></div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Physics, Chemistry & Mathematics — full syllabus.</p>
              <button
                disabled={!unlocked}
                onClick={() => setOpen(q.url)}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm text-primary-foreground disabled:bg-secondary disabled:text-muted-foreground"
              >
                {unlocked ? <><Play className="size-4" /> Start Test</> : <>Unlocks {at.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
