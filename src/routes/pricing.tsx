import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Pricing — Test Rankers" }, { name: "description", content: "Free forever. No paywalls, ever." }] }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 text-center">
      <span className="inline-flex px-3 py-1 rounded-full glass text-xs">Pricing</span>
      <h1 className="font-serif text-5xl mt-5">Free <span className="text-gradient italic">forever</span>.</h1>
      <p className="mt-4 text-muted-foreground">No paywalls. No upsells. Built by an aspirant, for aspirants.</p>
      <div className="glass rounded-3xl p-8 mt-10 text-left shadow-glow">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-6xl">₹0</span>
          <span className="text-muted-foreground">/ forever</span>
        </div>
        <ul className="mt-6 space-y-2 text-sm">
          {["All 8 study resources", "Infinity Maths bank", "JEE Mains + Advanced PYQs", "Chapter mocks + full mocks", "AI tutor (Lovable AI)", "No ads, no tracking"].map((f) => (
            <li key={f} className="flex items-center gap-2"><Check className="size-4 text-primary" /> {f}</li>
          ))}
        </ul>
        <Link to="/login" className="mt-6 inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground font-medium">Get started free</Link>
      </div>
    </div>
  );
}