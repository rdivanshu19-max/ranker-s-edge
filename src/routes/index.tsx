import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Send, ArrowRight, Sparkles } from "lucide-react";
import { RESOURCES } from "@/lib/resources";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rankers Edge — JEE prep that fights back." },
      { name: "description", content: "An obsessive prep cockpit for JEE aspirants. Endless adaptive Maths, year-vaulted PYQs, pattern-true mocks, and a live AI tutor that renders real math." },
      { property: "og:title", content: "Rankers Edge — JEE prep that fights back." },
      { property: "og:description", content: "Endless Maths · Year-vault PYQs · Fresh Mocks · Live AI tutor." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const [q, setQ] = useState("");
  const submit = () => {
    const dest = q.trim() ? `/ai-tutor?q=${encodeURIComponent(q)}` : "/ai-tutor";
    window.location.href = dest;
  };

  return (
    <>
      {/* Hero — full-bleed cinematic video, sits BELOW the floating nav */}
      <section className="relative -mt-24 min-h-screen w-full overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
          poster="/rankers-edge-logo.png"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        {/* Cinematic vignette over the video */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/30 to-background/90" aria-hidden />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-44 pb-32 min-h-screen">
          <span className="liquid-glass animate-fade-rise rounded-full px-3 py-1 text-xs text-muted-foreground">
            JEE 2026 · Rankers Edge
          </span>

          <h1
            className="animate-fade-rise font-serif text-5xl sm:text-7xl md:text-8xl mt-6 leading-[0.95] tracking-[-2.46px] max-w-5xl"
          >
            JEE prep that{" "}
            <em className="not-italic silver-text">fights back.</em>
          </h1>

          <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
            An obsessive prep cockpit. Endless adaptive Maths, year-vaulted PYQs, pattern-true mocks,
            and a live AI tutor that renders real math — not chatty fluff.
          </p>

          {/* Cinematic AI search bar */}
          <div className="animate-fade-rise-delay-2 mt-10 w-full max-w-2xl">
            <div className="liquid-glass rounded-full p-2 flex items-center gap-2">
              <Brain className="ml-3 size-4 text-foreground/70" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Ask any JEE concept, problem, or derivation…"
                className="flex-1 bg-transparent outline-none text-sm py-3"
                aria-label="Ask the AI tutor"
              />
              <button
                onClick={submit}
                className="liquid-glass rounded-full px-5 py-2.5 text-sm hover:scale-[1.03] transition flex items-center gap-1.5"
              >
                <Send className="size-3.5" /> Go
              </button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground/70 flex flex-wrap gap-2 items-center justify-center">
              {["Rolle's theorem", "de-Broglie wavelength", "JEE Adv. integral"].map((t) => (
                <button
                  key={t}
                  onClick={() => setQ(t)}
                  className="liquid-glass rounded-full px-3 py-1 hover:scale-[1.03] transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-fade-rise-delay-2 mt-12 flex flex-wrap gap-3 justify-center">
            <Link
              to="/resources"
              className="liquid-glass rounded-full px-8 py-4 text-base hover:scale-[1.03] transition flex items-center gap-2"
            >
              <Sparkles className="size-4" /> Begin Journey <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Resources preview */}
      <section className="mx-auto max-w-6xl px-5 mt-24">
        <div className="text-center">
          <span className="liquid-glass rounded-full px-3 py-1 text-xs">The Arsenal</span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-5">
            Eight weapons. <span className="silver-text italic">One ranker.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From an infinite Maths forge to year-vaulted past papers — every tool below is built around one rule: ship the rank.
          </p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {RESOURCES.slice(0, 4).map((r, i) => (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <Link
                to="/resource/$key"
                params={{ key: r.key }}
                className="block liquid-glass rounded-3xl p-6 hover:scale-[1.01] transition group"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="liquid-glass rounded-full px-2 py-0.5">{r.badge}</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </div>
                <div className="mt-8 text-xs uppercase tracking-wider text-foreground/60">{r.category}</div>
                <div className="font-serif text-2xl mt-1">{r.title}</div>
                <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/resources" className="silver-text hover:underline text-sm">
            View all {RESOURCES.length} resources →
          </Link>
        </div>
      </section>
    </>
  );
}
