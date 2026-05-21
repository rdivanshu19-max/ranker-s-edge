## Test Rankers — JEE Prep Hub

A dark, animated portal (inspired by prepjee.lovable.app) that embeds your Acrolly tools via iframe under the Test Rankers brand. Includes auth, admin controls, AI tutor, and a developer page.

### 1. Backend setup (Lovable Cloud)

Enable Lovable Cloud and provision:

**Tables**

- `profiles` — `id (uuid, FK auth.users)`, `email`, `display_name`, `created_at`, `last_login_at`, `is_banned (bool default false)`
- `user_roles` — `id`, `user_id`, `role ('admin'|'user')` + `has_role()` security-definer function
- `activity_log` — `id`, `user_id`, `resource_key`, `path`, `created_at` (tracks which resource each user opens)

**Auth**

- Email + password, **email confirmation disabled** (configure_auth)
- Session persisted → "remember me" by default
- On first signup matching `studyspacerankers@gmail.com` → auto-insert admin role via trigger
- Banned users blocked at login (server-side check + RLS)

**RLS**

- Users read/update own profile; admins read all
- `activity_log`: users insert own; admins read all

### 2. Routes (TanStack Start file routes)

```
/                       Landing (hero, AI search bar, resource cards, stats, footer)
/resources              Study Resources grid (8 tools as iframe launchers)
/resource/$key          Full-screen iframe wrapper for a given Acrolly tool
/ai-tutor               Lovable AI Gateway chat (Gemini) — markdown rendering
/pricing                "Free forever" page
/about                  About Developer (GCD) — bio, timeline, project cards
/login                  Email login/signup (single form, toggle)
/_authenticated/_admin/dashboard   Admin: user list, ban/unban, delete, activity feed
```

### 3. Resource catalog (iframe targets)

Each card opens `/resource/$key` which renders a full-bleed `<iframe>` with the brand header on top. Keys: hide every acrolly thing hide by something 


| Key                | Title                          | URL                                                 |
| ------------------ | ------------------------------ | --------------------------------------------------- |
| infinity-maths     | Infinity Question Bank — Maths | acrolly.com/adaptive-learning                       |
| chapter-pyqs       | Chapter-wise PYQ Tests         | acrolly.com/chapter-selection                       |
| jee-mains-pyq      | JEE Mains PYQ (year-wise)      | acrolly.com/year-selection/JEE_MAINS                |
| jee-adv-pyq        | JEE Advanced PYQ (year-wise)   | acrolly.com/year-selection/JEE_ADVANCED             |
| ai-teacher         | AI Personal Tutor (chapters)   | acrolly.com/ai-teacher/chapters                     |
| mains-mock-full    | JEE Mains Mocks (non-PYQ)      | acrolly.com/mock-full-test-papers?exam=JEE_MAIN     |
| mains-mock-chapter | JEE Mains chapter mocks        | acrolly.com/mock-chapter-selection                  |
| adv-mock-full      | JEE Advanced Mocks             | acrolly.com/mock-full-test-papers?exam=JEE_ADVANCED |


Iframe wrapper: sticky brand bar at top ("Test Rankers" logo + back button), `<iframe>` fills remainder with `sandbox="allow-same-origin allow-scripts allow-forms allow-popups"`. On open, log to `activity_log` via server fn.

### 4. AI tutor

- Floating search bar on landing (like screenshot): "Ask AI Tutor" toggle + "Search PYQs" toggle
- "Ask AI Tutor" → routes to `/ai-tutor`, streams from Lovable AI Gateway (Gemini Flash) via `createServerFn` async generator
- "Search PYQs" → opens Acrolly resource list filtered by query
- Try-chips: "Explain Rolle's theorem", "Derive de-Broglie wavelength", "Solve a JEE Adv. integral"

### 5. About Developer page

Hero: "Hi, I'm GCD" with subtitle about Rankers Stars + freelance.

**Cards / sections:**

- Work with me — email `studyspacerankers@gmail.com`, portfolio link `divyanshuportfolio-beta.vercel.app`
- Services grid: Coaching websites · Restaurant UIs · Coaching platforms · 3D experiences · Full-stack web · AI & automation · 3D & animation · EdTech
- **Timeline of platforms** (vertical animated timeline):
  1. **Rankers Stars** — first platform, AI for JEE aspirants → rankers-stars.vercel.app/app/
  2. **Nexus CBT** — CBT testing platform → nexuscbt.vercel.app
  3. **Gravitas** — gravitas-opal.vercel.app
  4. **Test Rankers** (current)
- Each item: gradient card, icon, short description, "Visit" button

### 6. Design system (dark, prepjee-inspired)

- Background `oklch(0.05 0.02 270)` deep navy-black; subtle radial purple glow
- Primary: violet `oklch(0.65 0.25 295)`; gradient `violet → soft-purple` for accents
- Serif display font (Instrument Serif / similar) for hero italics; Inter for body
- Glass cards with thin border + subtle inner glow; rounded-2xl; small grid background pattern
- Animations: Framer Motion fade-up on scroll, gradient text shimmer on hero italic words, hover-glow on cards, sticky animated nav pill
- **Not copying** prepjee theme verbatim — using same compositional ideas (centered hero, big italic emphasis, AI search bar, stat cards, 2-col resource grid)

### 7. Admin dashboard

Server fns gated by `has_role(uid, 'admin')`:

- `listUsers()` → email, signup, last login, banned status, role
- `setBanned(userId, banned)` 
- `deleteUser(userId)` (cascades)
- `listActivity(limit, userId?)` → recent resource opens

UI: tabs `Users | Activity`. Users table with ban toggle, delete confirm. Activity table with user email + resource + timestamp.

### 8. Tech notes

- TanStack Start file routes; QueryClientProvider already set
- Auth gate: `/_authenticated` layout + nested `/_admin` checking role
- All Supabase user-scoped queries via `createServerFn` + `requireSupabaseAuth`
- Admin ops via `supabaseAdmin` after role check
- AI streaming via async generator pattern (no Edge Functions)
- SEO: per-route `head()` titles ("Test Rankers — Practice PYQs. Crack JEE.")

### Out of scope (confirmed)

- No Stripe / paid upgrade (free forever)
- No email verification
- No iframe fallback handling (Acrolly allows embedding)

### Build order

1. Enable Lovable Cloud + migrations + auth config
2. Design tokens in `styles.css` + shared layout (nav, footer, glow background)
3. Landing page + resource grid + iframe wrapper route
4. Auth pages + `_authenticated` guard + auth state listener
5. AI tutor (server fn + chat UI)
6. About Developer page with timeline
7. Admin dashboard
8. Polish: animations, SEO meta, llms.txt