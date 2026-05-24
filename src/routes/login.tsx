import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) ?? "/" }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav({ to: redirect ?? "/" });
  }, [user, redirect, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created — signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Check ban
        const { data: prof } = await supabase
          .from("profiles")
          .select("is_banned")
          .eq("email", email)
          .maybeSingle();
        if (prof?.is_banned) {
          await supabase.auth.signOut();
          toast.error("This account has been banned.");
          return;
        }
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-10">
      <div className="glass rounded-3xl p-8 shadow-glow">
        <h1 className="font-serif text-4xl">
          {mode === "signin" ? <>Welcome <span className="silver-text italic">back</span></> : <>Join <span className="silver-text italic">Rankers Edge</span></>}
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          {mode === "signin" ? "Optional — Rankers Edge works without an account too." : "Free forever. Optional. No email verification."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-input/60 rounded-xl px-4 py-3 outline-none border border-border focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            className="w-full bg-input/60 rounded-xl px-4 py-3 outline-none border border-border focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground font-medium shadow-glow disabled:opacity-60"
          >
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}