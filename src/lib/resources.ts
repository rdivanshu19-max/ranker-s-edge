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
    title: "Infinity Question Bank",
    badge: "∞ QUESTIONS",
    category: "Adaptive · Maths",
    description: "Never-ending adaptive Maths problems. Loop till mastery, every session unique.",
    url: "https://www.acrolly.com/adaptive-learning",
    icon: "Infinity",
    gradient: "from-violet-500/30 to-fuchsia-500/10",
  },
  {
    key: "chapter-pyqs",
    title: "Chapter-wise Test Series",
    badge: "TARGETED",
    category: "Chapter-wise · PYQ",
    description: "Surgical chapter-by-chapter PYQ practice for laser-focused prep.",
    url: "https://www.acrolly.com/chapter-selection",
    icon: "Layers",
    gradient: "from-indigo-500/30 to-violet-500/10",
  },
  {
    key: "jee-mains-pyq",
    title: "JEE Mains · PYQ Series",
    badge: "MAINS",
    category: "Full Syllabus · Year-wise",
    description: "Every JEE Mains paper since 2010, organized year by year.",
    url: "https://www.acrolly.com/year-selection/JEE_MAINS",
    icon: "FileText",
    gradient: "from-blue-500/30 to-violet-500/10",
  },
  {
    key: "jee-adv-pyq",
    title: "JEE Advanced · PYQ Series",
    badge: "ADVANCED",
    category: "Full Syllabus · Year-wise",
    description: "Complete JEE Advanced PYQ archive, surfaced year by year.",
    url: "https://www.acrolly.com/year-selection/JEE_ADVANCED",
    icon: "ScrollText",
    gradient: "from-fuchsia-500/30 to-violet-500/10",
  },
  {
    key: "ai-teacher",
    title: "AI Personal Tutor",
    badge: "ON-DEMAND",
    category: "Every chapter",
    description: "An AI teacher that explains, solves and drills every JEE concept instantly.",
    url: "https://www.acrolly.com/ai-teacher/chapters",
    icon: "Brain",
    gradient: "from-violet-500/30 to-pink-500/10",
  },
  {
    key: "mains-mock-full",
    title: "JEE Mains Mock Test Series",
    badge: "MOCK",
    category: "Full Syllabus · Non-PYQ",
    description: "Institute-grade full mocks crafted to JEE Mains pattern.",
    url: "https://www.acrolly.com/mock-full-test-papers?exam=JEE_MAIN",
    icon: "Trophy",
    gradient: "from-emerald-500/20 to-violet-500/10",
  },
  {
    key: "mains-mock-chapter",
    title: "JEE Mains Chapter Mocks",
    badge: "CHAPTER",
    category: "Chapter-wise · Non-PYQ",
    description: "Chapter-level mock tests beyond PYQs for sharper drilling.",
    url: "https://www.acrolly.com/mock-chapter-selection",
    icon: "Target",
    gradient: "from-amber-500/20 to-violet-500/10",
  },
  {
    key: "adv-mock-full",
    title: "JEE Advanced Mocks",
    badge: "ADV · MOCK",
    category: "Full Syllabus · Non-PYQ",
    description: "Pattern-true JEE Advanced mocks for the final stretch.",
    url: "https://www.acrolly.com/mock-full-test-papers?exam=JEE_ADVANCED",
    icon: "Swords",
    gradient: "from-rose-500/20 to-violet-500/10",
  },
];

export function getResource(key: string): Resource | undefined {
  return RESOURCES.find((r) => r.key === key);
}