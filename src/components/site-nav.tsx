import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function SiteNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(96vw,1200px)]">
      <nav className="glass rounded-full px-3 sm:px-5 py-2 flex items-center justify-between shadow-card">
        <Link to="/" className="flex items-center gap-2 pl-1">
          <div className="size-8 rounded-full bg-gradient-to-br from-primary to-fuchsia-500 grid place-items-center text-primary-foreground font-bold text-sm shadow-glow">
            TR
          </div>
          <span className="font-semibold tracking-tight hidden sm:inline">
            Test <span className="text-primary">Rankers</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link
            to="/resources"
            className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/40 transition"
            activeProps={{ className: "px-3 py-1.5 rounded-full text-foreground bg-accent/60" }}
          >
            Study Resources
          </Link>
          <Link
            to="/pricing"
            className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/40 transition hidden sm:inline-block"
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/40 transition"
          >
            About
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-full text-primary hover:bg-primary/10 transition flex items-center gap-1"
            >
              <Shield className="size-3.5" /> Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
              className="ml-1 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/40 transition flex items-center gap-1"
              aria-label="Sign out"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-1 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground font-medium shadow-glow"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-gradient-to-br from-primary to-fuchsia-500" />
          <span>
            Test <span className="text-primary font-medium">Rankers</span> · Built by aspirants, for aspirants
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <a href="mailto:studyspacerankers@gmail.com" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}