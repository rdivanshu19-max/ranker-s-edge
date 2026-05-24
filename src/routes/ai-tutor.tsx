import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Send, Brain } from "lucide-react";
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
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-1">
        {messages.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-muted-foreground text-sm">
            Start by asking a concept, problem, or derivation.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-gradient-to-r from-primary to-fuchsia-500 text-primary-foreground" : "glass"}`}>
              <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-pre:bg-secondary/60">
                <ReactMarkdown>{m.content}</ReactMarkdown>
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
    </div>
  );
}