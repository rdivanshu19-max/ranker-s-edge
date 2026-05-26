import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, ExternalLink, Code, Sparkles, Box, GraduationCap, Rocket } from "lucide-react";
import studentImg from "@/assets/student-3d.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Rankers Edge" },
      { name: "description", content: "Hi, I'm GCD. I build practical, high-impact digital products including Rankers Edge, Gravitas, Nexus CBT and Rankers Stars." },
      { property: "og:title", content: "About — Rankers Edge" },
      { property: "og:description", content: "Meet the developer behind Rankers Edge." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const services = [
  { icon: Code, label: "Full-stack web" },
  { icon: Sparkles, label: "AI & automation" },
  { icon: Box, label: "3D & animation" },
  { icon: GraduationCap, label: "EdTech platforms" },
];

const platforms = [
  { name: "Rankers Stars", year: "First platform", desc: "AI platform for JEE aspirants — adaptive practice and analytics. Where the journey began.", url: "https://rankers-stars.vercel.app/app/" },
  { name: "Nexus CBT", year: "CBT testing", desc: "Computer-based testing platform built for institutes — clean UX, fast deployment.", url: "https://nexuscbt.vercel.app/" },
  { name: "Gravitas", year: "Modern platform", desc: "Sleek modern platform with a focus on motion and polished UI.", url: "https://gravitas-opal.vercel.app/" },
  { name: "Rankers Edge", year: "You're here", desc: "Cinematic JEE prep hub — only PYQs, only practice, zero noise.", url: "/" },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-10 scroll-smooth">
      {/* Asymmetric hero with 3D illustration */}
      <section className="pt-6 grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex px-3 py-1 rounded-full liquid-glass text-xs">
            <Sparkles className="size-3 mr-1.5 text-primary" /> About the Builder
          </span>
          <h1 className="font-serif text-5xl sm:text-7xl mt-5 leading-[1] tracking-tight">
            Hi, I'm <span className="silver-text italic">GCD</span>.
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl">
            I build practical, high-impact digital products — and Rankers Edge is the latest one. Currently building <span className="text-foreground">Rankers Stars</span>, an AI platform for JEE aspirants, plus freelance turning ideas into real products from landing pages to full platforms.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="mailto:studyspacerankers@gmail.com" className="liquid-glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-1.5 hover:scale-[1.03] transition">
              <Mail className="size-3.5" /> Email me
            </a>
            <a href="https://divyanshuportfolio-beta.vercel.app/" target="_blank" rel="noopener noreferrer" className="liquid-glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-1.5 hover:scale-[1.03] transition">
              <ExternalLink className="size-3.5" /> Portfolio
            </a>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-fuchsia-500/10 to-transparent blur-3xl" aria-hidden />
          <img
            src={studentImg}
            alt="3D illustration of a student studying"
            width={1024}
            height={1024}
            loading="lazy"
            className="relative w-full max-w-sm mx-auto animate-float drop-shadow-[0_30px_50px_rgba(80,120,255,0.35)]"
          />
        </motion.div>
      </section>

      {/* Stats / Quick facts strip */}
      <section className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { k: "4+", v: "Platforms shipped" },
          { k: "2yr", v: "Building EdTech" },
          { k: "∞", v: "Cups of chai" },
          { k: "1", v: "Mission: rank" },
        ].map((s) => (
          <div key={s.v} className="liquid-glass rounded-2xl p-4 text-center">
            <div className="font-serif text-3xl silver-text">{s.k}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.v}</div>
          </div>
        ))}
      </section>

      {/* Work + Freelance */}
      <section className="mt-10 grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-serif text-2xl">Work with me</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Coaching websites · Restaurant UIs · Coaching platforms & apps · High-end 3D experiences.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {services.map((s) => (
              <div key={s.label} className="liquid-glass rounded-xl p-2.5 flex items-center gap-2">
                <s.icon className="size-3.5 text-primary" />
                <span className="text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h3 className="font-serif text-2xl">What I do</h3>
          <ul className="mt-3 text-sm text-muted-foreground space-y-1.5">
            <li>• Coaching institute websites</li>
            <li>• Restaurant websites with modern UI</li>
            <li>• Full coaching platforms & apps</li>
            <li>• High-end 3D animated experiences</li>
          </ul>
        </div>
      </section>

      {/* Timeline — vertical rail with alternating cards */}
      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex px-3 py-1 rounded-full liquid-glass text-xs">
              <Rocket className="size-3 mr-1.5 text-primary" /> Journey
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl mt-4">Platforms I've shipped</h2>
          </div>
          <div className="hidden sm:block text-xs text-muted-foreground">scroll ↓</div>
        </div>
        <div className="mt-10 relative">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-border to-transparent" aria-hidden />
          <div className="space-y-8">
            {platforms.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: "easeOut" }}
                className={`relative flex sm:items-center gap-4 sm:gap-8 ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}
              >
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 size-4 rounded-full bg-gradient-to-br from-primary to-fuchsia-500 shadow-[0_0_20px_rgba(180,200,255,0.6)] ring-4 ring-background" />
                <div className="hidden sm:block sm:w-1/2" />
                <div className="ml-10 sm:ml-0 sm:w-1/2 liquid-glass rounded-2xl p-5 hover:scale-[1.02] transition">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-wider text-primary/80">{p.year}</div>
                    <div className="text-[10px] text-muted-foreground">0{i + 1}</div>
                  </div>
                  <div className="font-serif text-2xl mt-1">{p.name}</div>
                  <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
                  <a href={p.url} target={p.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-primary text-sm hover:underline">
                    Visit <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}