import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoUrl from "/rankers-edge-logo.png?url";

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
      <nav className="liquid-glass rounded-full px-3 sm:px-5 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 pl-1">
          <img src={logoUrl} alt="Rankers Edge" className="size-9 object-contain" />
          <span className="font-serif text-xl tracking-tight hidden sm:inline">
            Rankers <span className="silver-text">Edge</span>
            <sup className="text-[10px] ml-0.5 text-muted-foreground">®</sup>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link
            to="/resources"
            className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition"
            activeProps={{ className: "px-3 py-1.5 rounded-full text-foreground" }}
          >
            Resources
          </Link>
          <Link
            to="/ai-tutor"
            className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition hidden sm:inline-block"
          >
            AI Tutor
          </Link>
          <Link
            to="/about"
            className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition"
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
              className="ml-1 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition flex items-center gap-1"
              aria-label="Sign out"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="liquid-glass ml-1 px-4 py-1.5 rounded-full text-foreground text-sm hover:scale-[1.03] transition"
            >
              Begin Journey
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/60 py-10 relative z-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="" className="size-7 object-contain" />
          <span>
            Rankers <span className="silver-text font-medium">Edge</span> · Built by aspirants, for aspirants
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/resources" className="hover:text-foreground">Resources</Link>
          <Link to="/ai-tutor" className="hover:text-foreground">AI Tutor</Link>
          <a href="mailto:studyspacerankers@gmail.com" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}