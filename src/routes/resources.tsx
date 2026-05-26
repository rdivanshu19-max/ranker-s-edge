import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { RESOURCES } from "@/lib/resources";
import studentImg from "@/assets/student-3d.png";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "The Arsenal — Rankers Edge" },
      { name: "description", content: "Eight battle-tested JEE weapons: endless Maths forge, year-vaulted PYQs, fresh pattern mocks, and a chapter-aware AI mentor." },
      { property: "og:title", content: "The Arsenal — Rankers Edge" },
      { property: "og:description", content: "Eight weapons. One ranker." },
    ],
    links: [{ rel: "canonical", href: "/resources" }],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 scroll-smooth">
      {/* Hero with 3D student */}
      <section className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-center pt-6">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass text-xs">
            <Sparkles className="size-3 text-primary" /> The Arsenal
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl mt-5 leading-[1.05]">
            Eight tools. <span className="silver-text italic">One rank.</span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl">
            Each tool opens right here inside Rankers Edge — no new tabs, no detours. Pick one and start sharpening.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-2xl" aria-hidden />
          <img
            src={studentImg}
            alt="3D student studying with floating equations"
            width={1024}
            height={1024}
            className="relative w-full max-w-sm mx-auto animate-float drop-shadow-[0_30px_50px_rgba(80,120,255,0.3)]"
          />
        </motion.div>
      </section>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {RESOURCES.map((r) => (
          <motion.div
            key={r.key}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.96 },
              show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } },
            }}
            whileHover={{ y: -6 }}
          >
            <Link
              to="/resource/$key"
              params={{ key: r.key }}
              className={`block liquid-glass rounded-3xl p-6 h-full transition-all duration-300 group bg-gradient-to-br ${r.gradient} hover:shadow-[0_20px_60px_-15px_rgba(180,200,255,0.25)]`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                <span className="liquid-glass rounded-full px-2 py-0.5">{r.badge}</span>
                <ArrowUpRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition text-primary" />
              </div>
              <div className="mt-8 text-[10px] uppercase tracking-wider text-primary/80">{r.category}</div>
              <div className="font-serif text-2xl mt-1 leading-tight">{r.title}</div>
              <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
              <div className="mt-5 text-foreground/80 text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Launch <ArrowUpRight className="size-3.5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}