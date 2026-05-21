import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Search, Send, Infinity as InfinityIcon, Flame, Trophy, Swords, ArrowRight } from "lucide-react";
import { RESOURCES } from "@/lib/resources";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [mode, setMode] = useState<"ai" | "search">("ai");
  const [q, setQ] = useState("");

  const submit = () => {
    if (mode === "ai") {
      const dest = q.trim() ? `/ai-tutor?q=${encodeURIComponent(q)}` : "/ai-tutor";
      window.location.href = dest;
    } else {
      window.location.href = "/resources";
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="pt-12 sm:pt-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-5xl sm:text-7xl leading-[1.05] tracking-tight"
        >
          Practice PYQs. <span className="text-gradient italic">Crack JEE.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 mx-auto max-w-2xl text-muted-foreground text-base sm:text-lg"
        >
          A focused JEE prep hub — only PYQs, chapter tests and an infinite Maths question bank.
          No coaching ads. No noise. Just practice.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass mt-10 rounded-3xl p-4 sm:p-5 mx-auto max-w-3xl shadow-glow"
        >
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex gap-1 bg-secondary/60 rounded-full p-1">
              <button
                onClick={() => setMode("ai")}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition ${
                  mode === "ai" ? "bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Brain className="size-3.5" /> Ask AI Tutor
              </button>
              <button
                onClick={() => setMode("search")}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition ${
                  mode === "search" ? "bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Search className="size-3.5" /> Browse PYQs
              </button>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Flame className="size-3" /> Instant
            </span>
          </div>
          <div className="flex items-center gap-2 bg-input/60 rounded-2xl px-3 py-2">
            <Brain className="size-4 text-primary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ask anything — concepts, doubts, JEE problems…"
              className="flex-1 bg-transparent outline-none text-sm py-2"
            />
            <button
              onClick={submit}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground text-sm flex items-center gap-1"
            >
              <Send className="size-3.5" /> Go
            </button>
          </div>
          <div className="mt-3 text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
            <span className="opacity-70">TRY:</span>
            {["Explain Rolle's theorem", "Derive de-Broglie wavelength", "Solve a JEE Adv. integral"].map((t) => (
              <button
                key={t}
                onClick={() => { setQ(t); setMode("ai"); }}
                className="px-2.5 py-1 rounded-full border border-border/60 hover:bg-accent/40 transition"
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/resources" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground font-medium flex items-center gap-2 shadow-glow">
            <InfinityIcon className="size-4" /> Study Resources <ArrowRight className="size-4" />
          </Link>
          <Link to="/about" className="px-5 py-2.5 rounded-full glass">
            About Developer
          </Link>
        </div>

        {/* Stat row */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: InfinityIcon, label: "Infinity Bank", sub: "∞ Maths drills" },
            { icon: Flame, label: "PYQs 2010+", sub: "10k+ indexed" },
            { icon: Trophy, label: "Adv. Mocks", sub: "Institute-grade" },
            { icon: Swords, label: "JEE Battle", sub: "1v1 live" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass rounded-2xl p-4 text-left flex items-center gap-3"
            >
              <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center">
                <s.icon className="size-4" />
              </div>
              <div>
                <div className="font-medium text-sm">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Resources preview */}
      <section className="mt-28">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs">
            <Brain className="size-3 text-primary" /> Study Resources
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-5">
            Only PYQs. Only practice. <span className="text-gradient italic">Zero noise.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Eight hand-picked tools that cover every shape of JEE prep — from infinite Maths drills to AI-analyzed mocks.
          </p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {RESOURCES.slice(0, 4).map((r, i) => (
            <motion.div
              key={r.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to="/resource/$key"
                params={{ key: r.key }}
                className={`block glass rounded-3xl p-6 hover:border-primary/60 transition group bg-gradient-to-br ${r.gradient}`}
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full border border-border/60">{r.badge}</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition" />
                </div>
                <div className="mt-8 text-xs uppercase tracking-wider text-primary/80">{r.category}</div>
                <div className="font-serif text-2xl mt-1">{r.title}</div>
                <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/resources" className="text-primary hover:underline text-sm">
            View all 8 resources →
          </Link>
        </div>
      </section>
    </div>
  );
}
