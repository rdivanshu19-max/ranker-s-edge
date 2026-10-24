CREATE TABLE public.paper_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  paper_key text not null,
  paper_title text not null,
  source text not null default 'qft',
  score int,
  attempted int not null default 0,
  correct int not null default 0,
  wrong int not null default 0,
  total_questions int not null default 0,
  subjects jsonb not null default '{}'::jsonb,
  time_spent_seconds int not null default 0,
  created_at timestamptz not null default now()
);
CREATE INDEX paper_attempts_user_idx ON public.paper_attempts (user_id, created_at DESC);
CREATE INDEX paper_attempts_paper_idx ON public.paper_attempts (paper_key);

CREATE TABLE public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  paper_key text not null,
  paper_title text not null,
  source text not null default 'series',
  day date not null default current_date,
  seconds int not null default 0,
  updated_at timestamptz not null default now(),
  UNIQUE (user_id, paper_key, day)
);
CREATE INDEX study_sessions_user_idx ON public.study_sessions (user_id, day DESC);

GRANT SELECT, INSERT, UPDATE ON public.paper_attempts TO authenticated;
GRANT ALL ON public.paper_attempts TO service_role;
ALTER TABLE public.paper_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own attempts" ON public.paper_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and admins read attempts" ON public.paper_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT, INSERT, UPDATE ON public.study_sessions TO authenticated;
GRANT ALL ON public.study_sessions TO service_role;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own sessions" ON public.study_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.study_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users and admins read sessions" ON public.study_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));