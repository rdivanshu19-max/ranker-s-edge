import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Send, Brain, ExternalLink, Sparkles } from "lucide-react";
import { askTutor } from "@/lib/ai.functions";
import { trackActivity } from "@/lib/activity.functions";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/ai-tutor")({
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "" }),
  head: () => ({
    meta: [
      { title: "AI Tutor — Rankers Edge" },
      { name: "description", content: "Ask any JEE concept, problem or derivation — instant, step-by-step explanations." },
      { property: "og:title", content: "AI Tutor — Rankers Edge" },
      { property: "og:description", content: "JEE-grade answers, instantly." },
    ],
    links: [{ rel: "canonical", href: "/ai-tutor" }],
  }),
  component: AITutor,
});

function AITutor() {
  const { q } = Route.useSearch();
  const ask = useServerFn(askTutor);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(q);
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<"rankers" | "deep">("rankers");
  const sentInitial = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackActivity("ai-tutor", "/ai-tutor");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await ask({ data: { messages: next } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setMessages([...next, { role: "assistant", content: res.content }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (q && !sentInitial.current) {
      sentInitial.current = true;
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 flex flex-col h-[calc(100vh-7rem)]">
      <div className="text-center mb-4">
        <span className="liquid-glass rounded-full px-3 py-1 text-xs inline-flex items-center gap-1.5">
          <Brain className="size-3" /> AI Tutor
        </span>
        <h1 className="font-serif text-4xl mt-3">Ask anything — <em className="not-italic silver-text">JEE-grade</em> answers.</h1>
        {/* Provider toggle */}
        <div className="mt-5 inline-flex liquid-glass rounded-full p-1 text-xs">
          <button
            onClick={() => setProvider("rankers")}
            className={`px-4 py-1.5 rounded-full transition ${provider === "rankers" ? "bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground" : "text-muted-foreground"}`}
          >
            <Sparkles className="inline size-3 mr-1" /> Rankers AI · Quick Solve
          </button>
          <button
            onClick={() => setProvider("deep")}
            className={`px-4 py-1.5 rounded-full transition ${provider === "deep" ? "bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground" : "text-muted-foreground"}`}
          >
            <Brain className="inline size-3 mr-1" /> Deep Mentor · Notes & Talk
          </button>
        </div>
        <p className="text-xs text-muted-foreground/70 mt-2 max-w-md mx-auto">
          {provider === "rankers"
            ? "Fast, math-rendered step-by-step answers. Best for problems and derivations."
            : "Chapter-aware long-form mentor with voice and topic notes. Opens in a focused workspace."}
        </p>
      </div>
      {provider === "deep" ? (
        <div className="flex-1 grid place-items-center">
          <div className="glass rounded-3xl p-8 max-w-md text-center">
            <Brain className="size-10 mx-auto text-primary" />
            <h2 className="font-serif text-2xl mt-3">Deep Mentor Workspace</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Topic-wise notes, long-form explanations and voice walkthroughs — built for deep dives, not quick lookups.
            </p>
            <a
              href="https://www.acrolly.com/ai-teacher/chapters"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground text-sm"
            >
              Enter Deep Mentor <ExternalLink className="size-3.5" />
            </a>
            <button
              onClick={() => setProvider("rankers")}
              className="block mt-3 mx-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Or stay with Rankers AI for quick math →
            </button>
          </div>
        </div>
      ) : (
      <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-1">
        {messages.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-muted-foreground text-sm">
            Ask a concept, problem, or derivation. Math renders live — try <code className="px-1.5 py-0.5 rounded bg-secondary/60">Solve $\\int x^2 e^x dx$</code>.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-2xl px-5 py-4 ${m.role === "user" ? "bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground" : "glass"}`}>
              <div className="tutor-md text-[15px] leading-7">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3 text-sm text-muted-foreground">Thinking…</div>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-4 glass rounded-2xl p-2 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a JEE concept, problem, or derivation…"
          className="flex-1 bg-transparent outline-none px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground text-sm flex items-center gap-1 disabled:opacity-60"
        >
          <Send className="size-3.5" /> Send
        </button>
      </form>
      </>
      )}
    </div>
  );
}