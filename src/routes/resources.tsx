import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { RESOURCES } from "@/lib/resources";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Study Resources — Test Rankers" },
      { name: "description", content: "Eight hand-picked JEE prep tools — PYQs, chapter tests, mocks, infinite Maths bank, and an AI tutor." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-20">
      <div className="text-center pt-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs">Study Resources</span>
        <h1 className="font-serif text-5xl sm:text-6xl mt-5">
          Only PYQs. Only practice. <span className="text-gradient italic">Zero noise.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Tap any tool to launch it inside Test Rankers. Your progress is yours.
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 gap-4">
        {RESOURCES.map((r, i) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          >
            <Link
              to="/resource/$key"
              params={{ key: r.key }}
              className={`block glass rounded-3xl p-6 hover:border-primary/60 hover:shadow-glow transition group bg-gradient-to-br ${r.gradient}`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground">{r.badge}</span>
                <ArrowUpRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition text-primary" />
              </div>
              <div className="mt-8 text-xs uppercase tracking-wider text-primary/80">{r.category}</div>
              <div className="font-serif text-2xl mt-1">{r.title}</div>
              <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
              <div className="mt-5 text-primary text-sm inline-flex items-center gap-1">
                Launch resource <ArrowUpRight className="size-3.5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}