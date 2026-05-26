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
    title: "Infinity Maths",
    badge: "∞ INFINITY",
    category: "Maths · Adaptive Drill",
    description: "An infinite Maths question bank that adapts to your weak spots. Drill until the concept truly clicks.",
    url: "https://www.acrolly.com/adaptive-learning",
    icon: "Infinity",
    gradient: "from-violet-500/30 to-fuchsia-500/10",
  },
  {
    key: "chapter-pyqs",
    title: "Chapter PYQs",
    badge: "CHAPTER",
    category: "Chapter Slice · PYQ",
    description: "Pick any chapter and get every past question asked on it. Isolated, focused, ruthless practice.",
    url: "https://www.acrolly.com/chapter-selection",
    icon: "Layers",
    gradient: "from-indigo-500/30 to-violet-500/10",
  },
  {
    key: "jee-mains-pyq",
    title: "JEE Mains PYQs",
    badge: "MAINS",
    category: "Mains · Year-by-year",
    description: "Every JEE Mains paper, year by year. See how the exam actually thinks.",
    url: "https://www.acrolly.com/year-selection/JEE_MAINS",
    icon: "FileText",
    gradient: "from-blue-500/30 to-violet-500/10",
  },
  {
    key: "jee-adv-pyq",
    title: "JEE Advanced PYQs",
    badge: "ADVANCED",
    category: "Advanced · Year-by-year",
    description: "The hardest JEE paper on the planet, decoded year by year. Every twist, every trap.",
    url: "https://www.acrolly.com/year-selection/JEE_ADVANCED",
    icon: "ScrollText",
    gradient: "from-fuchsia-500/30 to-violet-500/10",
  },
  {
    key: "ai-teacher",
    title: "AI Personal Tutor",
    badge: "AI TUTOR",
    category: "Chapter Tutor · Long-form",
    description: "A tutor that knows the JEE syllabus. Pick a chapter, get curated notes, deep walkthroughs and voice answers.",
    url: "https://www.acrolly.com/ai-teacher/chapters",
    icon: "Brain",
    gradient: "from-violet-500/30 to-pink-500/10",
  },
  {
    key: "mains-mock-full",
    title: "Mains Full Mocks",
    badge: "MOCK",
    category: "Mains · Fresh Papers",
    description: "Brand-new full-length Mains papers. Test the engine, not just memory.",
    url: "https://www.acrolly.com/mock-full-test-papers?exam=JEE_MAIN",
    icon: "Trophy",
    gradient: "from-emerald-500/20 to-violet-500/10",
  },
  {
    key: "mains-mock-chapter",
    title: "Chapter Mocks",
    badge: "DRILL",
    category: "Chapter Mock · Mains",
    description: "Fresh chapter-scoped mocks for when PYQs run out. Build reflex, one topic at a time.",
    url: "https://www.acrolly.com/mock-chapter-selection",
    icon: "Target",
    gradient: "from-amber-500/20 to-violet-500/10",
  },
  {
    key: "adv-mock-full",
    title: "Advanced Mocks",
    badge: "ELITE",
    category: "Advanced · Fresh Papers",
    description: "Pattern-true JEE Advanced papers for the final stretch. Where stamina meets cunning.",
    url: "https://www.acrolly.com/mock-full-test-papers?exam=JEE_ADVANCED",
    icon: "Swords",
    gradient: "from-rose-500/20 to-violet-500/10",
  },
];

export function getResource(key: string): Resource | undefined {
  return RESOURCES.find((r) => r.key === key);
}