export type Resource = {
  key: string;
  title: string;
  badge: string;
  category: string;
  description: string;
  url: string;
  icon: string; // lucide icon name
  gradient: string;
};

export const RESOURCES: Resource[] = [
  {
    key: "infinity-maths",
    title: "Endless Maths Forge",
    badge: "∞ FORGE",
    category: "Maths · Adaptive Drill",
    description: "An infinite Maths arena that retunes itself to your weak spots. Drill until the concept clicks — no two sessions repeat.",
    url: "https://www.acrolly.com/adaptive-learning",
    icon: "Infinity",
    gradient: "from-violet-500/30 to-fuchsia-500/10",
  },
  {
    key: "chapter-pyqs",
    title: "Chapter Surgical Strike",
    badge: "PRECISION",
    category: "Chapter Slice · PYQ",
    description: "Pick one chapter, get every past question ever asked on it. Sharp, isolated, ruthlessly focused practice.",
    url: "https://www.acrolly.com/chapter-selection",
    icon: "Layers",
    gradient: "from-indigo-500/30 to-violet-500/10",
  },
  {
    key: "jee-mains-pyq",
    title: "Mains Archive · Year Vault",
    badge: "VAULT",
    category: "Mains · Year-by-year",
    description: "Walk through every Mains paper, year-stamped and chronological. See how the exam thinks, paper after paper.",
    url: "https://www.acrolly.com/year-selection/JEE_MAINS",
    icon: "FileText",
    gradient: "from-blue-500/30 to-violet-500/10",
  },
  {
    key: "jee-adv-pyq",
    title: "Advanced Archive · Year Vault",
    badge: "ELITE VAULT",
    category: "Advanced · Year-by-year",
    description: "The hardest JEE paper on the planet, decoded year by year. Every twist, every trap, in one place.",
    url: "https://www.acrolly.com/year-selection/JEE_ADVANCED",
    icon: "ScrollText",
    gradient: "from-fuchsia-500/30 to-violet-500/10",
  },
  {
    key: "ai-teacher",
    title: "Chapter-Aware AI Mentor",
    badge: "DEEP MENTOR",
    category: "Chapter Tutor · Long-form",
    description: "A mentor that knows the JEE syllabus map. Pick a chapter, get curated notes, deep walkthroughs and voice-friendly explanations.",
    url: "https://www.acrolly.com/ai-teacher/chapters",
    icon: "Brain",
    gradient: "from-violet-500/30 to-pink-500/10",
  },
  {
    key: "mains-mock-full",
    title: "Mains Pattern Mocks",
    badge: "FULL MOCK",
    category: "Mains · Fresh Papers",
    description: "Brand-new full-length papers stitched to the Mains blueprint. Test the engine, not the memory.",
    url: "https://www.acrolly.com/mock-full-test-papers?exam=JEE_MAIN",
    icon: "Trophy",
    gradient: "from-emerald-500/20 to-violet-500/10",
  },
  {
    key: "mains-mock-chapter",
    title: "Chapter Mock Lab",
    badge: "LAB",
    category: "Chapter Mock · Mains",
    description: "Chapter-scoped fresh mocks for when PYQs run out. Build the reflex one topic at a time.",
    url: "https://www.acrolly.com/mock-chapter-selection",
    icon: "Target",
    gradient: "from-amber-500/20 to-violet-500/10",
  },
  {
    key: "adv-mock-full",
    title: "Advanced Final-Stretch Mocks",
    badge: "ARENA",
    category: "Advanced · Fresh Papers",
    description: "Pattern-true Advanced papers for the last 60 days. Where stamina meets cunning.",
    url: "https://www.acrolly.com/mock-full-test-papers?exam=JEE_ADVANCED",
    icon: "Swords",
    gradient: "from-rose-500/20 to-violet-500/10",
  },
];

export function getResource(key: string): Resource | undefined {
  return RESOURCES.find((r) => r.key === key);
}