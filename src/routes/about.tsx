import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, ExternalLink, Code, Sparkles, Box, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About Developer — Test Rankers" }, { name: "description", content: "Hi, I'm GCD. I build practical, high-impact digital products including Test Rankers and Rankers Stars." }] }),
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
  { name: "Test Rankers", year: "You're here", desc: "Focused JEE prep hub — only PYQs, only practice, zero noise.", url: "/" },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pb-10">
      {/* Hero */}
      <section className="pt-6 text-center">
        <span className="inline-flex px-3 py-1 rounded-full glass text-xs">About Developer</span>
        <h1 className="font-serif text-5xl sm:text-6xl mt-5">
          Hi, I'm <span className="text-gradient italic">GCD</span>.
        </h1>
        <p className="mt-5 text-muted-foreground max-w-2xl mx-auto">
          I build practical, high-impact digital products. Currently building <span className="text-foreground">Rankers Stars</span>,
          an AI platform for JEE aspirants — and freelance turning ideas into real products, from landing pages to full platforms.
        </p>
      </section>

      {/* Work with me */}
      <section className="mt-12 grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-serif text-2xl">Work with me</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Coaching websites · Restaurant UIs · Coaching platforms & apps · High-end 3D experiences.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <a href="mailto:studyspacerankers@gmail.com" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
              <Mail className="size-4" /> studyspacerankers@gmail.com
            </a>
            <a href="https://divyanshuportfolio-beta.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
              <ExternalLink className="size-4" /> Portfolio
            </a>
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h3 className="font-serif text-2xl">Freelance</h3>
          <ul className="mt-3 text-sm text-muted-foreground space-y-1.5">
            <li>• Coaching institute websites</li>
            <li>• Restaurant websites with modern UI</li>
            <li>• Full coaching platforms & apps</li>
            <li>• High-end 3D animated experiences</li>
          </ul>
        </div>
      </section>

      {/* Services */}
      <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {services.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center"><s.icon className="size-4" /></div>
            <span className="text-sm font-medium">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Timeline */}
      <section className="mt-16">
        <div className="text-center">
          <span className="inline-flex px-3 py-1 rounded-full glass text-xs">Journey</span>
          <h2 className="font-serif text-4xl mt-4">Platforms I've shipped</h2>
        </div>
        <div className="mt-10 relative">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-border to-transparent" aria-hidden />
          <div className="space-y-8">
            {platforms.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`relative flex sm:items-center gap-4 sm:gap-8 ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}
              >
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 size-3 rounded-full bg-gradient-to-br from-primary to-fuchsia-500 shadow-glow" />
                <div className="hidden sm:block sm:w-1/2" />
                <div className="ml-10 sm:ml-0 sm:w-1/2 glass rounded-2xl p-5 bg-gradient-to-br from-violet-500/10 to-transparent">
                  <div className="text-xs uppercase tracking-wider text-primary/80">{p.year}</div>
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