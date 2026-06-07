import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getResource } from "@/lib/resources";
import { trackActivity } from "@/lib/activity.functions";

export const Route = createFileRoute("/resource/$key")({
  head: ({ params }) => {
    const r = getResource(params.key);
    const title = r ? `${r.title} — Rankers Edge` : "Resource — Rankers Edge";
    const desc = r?.description ?? "JEE study resource on Rankers Edge.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `/resource/${params.key}` }],
    };
  },
  component: ResourcePage,
});

function ResourcePage() {
  const { key } = Route.useParams();
  const resource = getResource(key);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (resource) trackActivity(resource.key, resource.url);
  }, [resource]);

  if (!resource) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="font-serif text-4xl">Resource not found</h1>
        <Link to="/resources" className="text-primary mt-4 inline-block">← Back to resources</Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-0 bg-background z-40 flex flex-col">
      {/* Branded top bar — masks the source, no overlap because RootComponent hides SiteNav on this route */}
      <div className="liquid-glass flex items-center justify-between px-4 py-3 gap-3 border-b border-border/40">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/resources" className="size-9 rounded-full liquid-glass grid place-items-center">
            <ArrowLeft className="size-4" />
          </Link>
          <img src="/rankers-edge-logo.png" alt="" className="size-8 object-contain" />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{resource.title}</div>
            <div className="text-xs text-muted-foreground truncate">{resource.category}</div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 hidden sm:inline">
          powered by Rankers Edge
        </span>
      </div>
      <div className="relative flex-1 bg-background">
        {!loaded && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-background">
            <div className="flex flex-col items-center gap-3">
              <div className="size-10 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Loading {resource.title}…</div>
            </div>
          </div>
        )}
        <iframe
          src={resource.url}
          title={resource.title}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full border-0 transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          referrerPolicy="no-referrer"
        />
        {/* Hide third-party top-left nav chrome (e.g. back button) so only our branded back stays */}
        <div className="pointer-events-auto absolute top-0 left-0 h-12 w-28 bg-background/95 backdrop-blur-md z-20" aria-hidden />
      </div>
    </div>
  );
}