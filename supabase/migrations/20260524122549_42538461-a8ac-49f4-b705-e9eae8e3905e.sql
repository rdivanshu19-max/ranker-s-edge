
-- Make activity_log accept anonymous activity
ALTER TABLE public.activity_log ALTER COLUMN user_id DROP NOT NULL;

-- Drop old insert policy and recreate to allow either own user or anon
DROP POLICY IF EXISTS "Users insert own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users read own activity" ON public.activity_log;

CREATE POLICY "Anyone can insert activity"
ON public.activity_log
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() = user_id)
);

-- Only admins read activity (admins-only)
-- (keep existing "Admins read all activity" policy)

-- Helpful indexes
CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON public.activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_user_id_idx   ON public.activity_log (user_id);
CREATE INDEX IF NOT EXISTS profiles_email_idx         ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx    ON public.profiles (created_at DESC);

-- Tighten SECURITY DEFINER functions: revoke from anon, allow only authenticated
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- handle_new_user is invoked by the auth trigger (postgres role); revoke from clients
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
