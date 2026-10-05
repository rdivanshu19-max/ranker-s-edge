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
export type SeriesItem = { key: string; title: string; url: string };
export type Series = { key: string; title: string; tagline: string; items: SeriesItem[] };

export const TEST_SERIES: Series[] = [
  {
    key: "allen",
    title: "ALLEN Test Series",
    tagline: "Batch-wise ALLEN folders — Nurture, Enthuse and Leader papers.",
    items: [
      { key: "allen-nurture-2026", title: "Nurture 2026", url: "https://pikachu-jee-cbt.vercel.app/?view=tests&batch=nurture-2026-434306f7cb" },
      { key: "allen-nurture-2025", title: "Nurture 2025", url: "https://pikachu-jee-cbt.vercel.app/?view=tests&batch=nurture-2025-231a3dabc1" },
      { key: "allen-enthuse-2025", title: "Enthuse 2025", url: "https://pikachu-jee-cbt.vercel.app/?view=tests&batch=enthuse-2025-de6797c69c" },
      { key: "allen-enthuse-2026-delhi", title: "Enthuse 2026 (Delhi)", url: "https://pikachu-jee-cbt.vercel.app/?view=tests&batch=enthuse-2026-delhi-1416355017" },
      { key: "allen-leader-2026", title: "Leader 2026", url: "https://pikachu-jee-cbt.vercel.app/?view=tests&batch=leader-2026-d323d9be0d" },
    ],
  },
  {
    key: "mathango",
    title: "Mathango Test Series",
    tagline: "Class 12th, dropper and Advanced series in one shelf.",
    items: [
      { key: "mathango-12th-2027", title: "12th JEE 2027", url: "https://ruhvan.indevs.in/library?tab=JEE%20Main" },
      { key: "mathango-dropper-2027", title: "Dropper JEE 2027", url: "https://ruhvan.indevs.in/tests?src=qpt" },
      { key: "mathango-adv-2026", title: "JEE Advanced 2026", url: "https://ruhvan.indevs.in/tests?src=adv" },
      { key: "mathango-dropper-2026", title: "Dropper 2026", url: "https://ruhvan.indevs.in/tests?src=dropper" },
      { key: "mathango-12th-2026", title: "12th 2026", url: "https://ruhvan.indevs.in/tests?src=12th" },
    ],
  },
  {
    key: "pw",
    title: "PW Test Series",
    tagline: "Physics Wallah full test series, opened right here.",
    items: [{ key: "pw-tests", title: "PW Test Series", url: "https://ruhvan.indevs.in/uw-tests" }],
  },
];

const SERIES_RESOURCES: Resource[] = TEST_SERIES.flatMap((s) =>
  s.items.map((i) => ({
    key: i.key,
    title: i.title,
    badge: s.title.split(" ")[0].toUpperCase(),
    category: s.title,
    description: s.tagline,
    url: i.url,
    icon: "Folder",
    gradient: "from-sky-500/20 to-violet-500/10",
  })),
);

export function getAnyResource(key: string): Resource | undefined {
  return RESOURCES.find((r) => r.key === key) ?? SERIES_RESOURCES.find((r) => r.key === key);
}

/** Mathango QFT papers. Paper 1 is open from launch; each following paper unlocks on the next Sunday. */
export const QFT_LAUNCH = new Date("2026-10-05T00:00:00+05:30");
export const QFTS = [1, 2, 3, 4, 5, 6].map((n) => ({ n, title: `QFT ${n} · Full Syllabus`, url: `/qft/${n}.html` }));

export function qftUnlockDate(n: number): Date {
  if (n === 1) return QFT_LAUNCH;
  const d = new Date(QFT_LAUNCH);
  const toSunday = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + toSunday + 7 * (n - 2));
  return d;
}
