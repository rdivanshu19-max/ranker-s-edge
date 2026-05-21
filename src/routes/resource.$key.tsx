import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getResource } from "@/lib/resources";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { logActivity } from "@/lib/activity.functions";

export const Route = createFileRoute("/resource/$key")({
  component: ResourcePage,
});

function ResourcePage() {
  const { key } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const resource = getResource(key);
  const [loaded, setLoaded] = useState(false);
  const log = useServerFn(logActivity);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: `/resource/${key}` } });
  }, [loading, user, key, navigate]);

  useEffect(() => {
    if (user && resource) {
      log({ data: { resource_key: resource.key, path: resource.url } }).catch(() => {});
    }
  }, [user, resource, log]);

  if (!resource) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-serif text-4xl">Resource not found</h1>
        <Link to="/resources" className="text-primary mt-4 inline-block">← Back to resources</Link>
      </div>
    );
  }

  if (loading || !user) {
    return <div className="text-center text-muted-foreground py-20">Loading…</div>;
  }

  return (
    <div className="fixed inset-0 top-0 bg-background z-40 flex flex-col">
      {/* Branded top bar — masks the source */}
      <div className="glass border-b border-border flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/resources" className="size-9 rounded-full glass grid place-items-center hover:bg-accent/40">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="size-8 rounded-full bg-gradient-to-br from-primary to-fuchsia-500 grid place-items-center text-primary-foreground font-bold text-xs">
            TR
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{resource.title}</div>
            <div className="text-xs text-muted-foreground truncate">{resource.category}</div>
          </div>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ExternalLink className="size-3.5" /> Open
        </a>
      </div>
      <div className="relative flex-1 bg-background">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
            Loading resource…
          </div>
        )}
        <iframe
          src={resource.url}
          title={resource.title}
          onLoad={() => setLoaded(true)}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}