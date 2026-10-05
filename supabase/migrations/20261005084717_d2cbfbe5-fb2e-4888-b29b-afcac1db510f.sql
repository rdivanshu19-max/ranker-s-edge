GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT INSERT ON public.activity_log TO anon;
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.profiles, public.user_roles, public.activity_log, public.admin_audit_log TO service_role;

CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert audit" ON public.admin_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') AND actor_user_id = auth.uid());

CREATE TABLE public.access_codes (
  code text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.access_codes TO service_role;
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
INSERT INTO public.access_codes(code) VALUES ('GCDITSUPRE');

CREATE TABLE public.early_access (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.early_access TO authenticated;
GRANT ALL ON public.early_access TO service_role;
ALTER TABLE public.early_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own early access" ON public.early_access FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read early access" ON public.early_access FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.redeem_access_code(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.access_codes WHERE code = upper(trim(_code))) THEN RETURN false; END IF;
  INSERT INTO public.early_access(user_id) VALUES (auth.uid()) ON CONFLICT DO NOTHING;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.redeem_access_code(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.redeem_access_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;