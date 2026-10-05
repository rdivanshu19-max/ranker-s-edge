import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, FolderOpen, Lock, Sparkles } from "lucide-react";
import { TEST_SERIES } from "@/lib/resources";

export const Route = createFileRoute("/test-series/")({
  head: () => ({
    meta: [
      { title: "Test Series — ALLEN, Mathango & PW | Rankers Edge" },
      { name: "description", content: "Open ALLEN, Mathango and PW JEE test series folders plus weekly-unlocking Mathango 2027 QFTs, all inside Rankers Edge." },
      { property: "og:title", content: "Test Series — Rankers Edge" },
      { property: "og:description", content: "ALLEN, Mathango and PW test series in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/test-series" }],
  }),
  component: TestSeriesPage,
});

function TestSeriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-6">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass text-xs">
        <Sparkles className="size-3 text-primary" /> Test Series Vault
      </span>
      <h1 className="font-serif text-5xl sm:text-6xl mt-5 leading-[1.05]">
        Every series. <span className="silver-text italic">One shelf.</span>
      </h1>
      <p className="mt-4 text-muted-foreground max-w-xl">Pick a folder, pick a batch, and the papers open right here.</p>

      <Link to="/test-series/mathango-qfts" className="block mt-10 liquid-glass rounded-3xl p-6 sm:p-8 group bg-gradient-to-br from-primary/20 via-transparent to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-primary">New · Weekly unlock</span>
          <Lock className="size-4 text-muted-foreground" />
        </div>
        <div className="font-serif text-3xl sm:text-4xl mt-3">Mathango 2027 · QFTs</div>
        <p className="text-sm text-muted-foreground mt-2">Full-syllabus QFT papers in a desktop CBT view. A new paper opens every Sunday.</p>
        <div className="mt-5 inline-flex items-center gap-1 text-sm group-hover:gap-2 transition-all">Browse papers <ArrowUpRight className="size-4" /></div>
      </Link>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {TEST_SERIES.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="liquid-glass rounded-3xl p-6"
          >
            <div className="flex items-center gap-3">
              <span className="size-11 rounded-2xl grid place-items-center bg-primary/15 ring-1 ring-primary/30"><FolderOpen className="size-5 text-primary" /></span>
              <div>
                <div className="font-serif text-2xl">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.items.length} folder{s.items.length > 1 ? "s" : ""}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{s.tagline}</p>
            <div className="mt-4 grid gap-2">
              {s.items.map((it) => (
                <Link key={it.key} to="/resource/$key" params={{ key: it.key }} className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3 text-sm hover:bg-secondary/70 transition group">
                  {it.title}
                  <ArrowUpRight className="size-4 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
