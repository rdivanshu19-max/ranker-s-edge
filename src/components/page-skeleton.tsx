import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 animate-in fade-in duration-300">
      <div className="text-center space-y-4">
        <Skeleton className="h-5 w-32 mx-auto rounded-full bg-foreground/5" />
        <Skeleton className="h-14 w-3/4 mx-auto rounded-2xl bg-foreground/5" />
        <Skeleton className="h-4 w-2/3 mx-auto rounded-full bg-foreground/5" />
        <Skeleton className="h-4 w-1/2 mx-auto rounded-full bg-foreground/5" />
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="liquid-glass rounded-3xl p-6 space-y-3">
            <Skeleton className="h-4 w-16 rounded-full bg-foreground/10" />
            <Skeleton className="h-6 w-3/4 rounded-lg bg-foreground/10" />
            <Skeleton className="h-3 w-full rounded-full bg-foreground/5" />
            <Skeleton className="h-3 w-5/6 rounded-full bg-foreground/5" />
          </div>
        ))}
      </div>
    </div>
  );
}