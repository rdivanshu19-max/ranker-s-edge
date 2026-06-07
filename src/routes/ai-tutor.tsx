import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Send, Brain, Sparkles } from "lucide-react";
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
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(q);
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState<"rankers" | "deep">("rankers");
  const sentInitial = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    trackActivity("ai-tutor", "/ai-tutor");
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const streamReply = async (history: Msg[], attempt = 0): Promise<void> => {
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        },
      );
      if (!resp.ok || !resp.body) {
        let msg = "AI service error.";
        try {
          const j = await resp.json();
          if (j?.error) msg = j.error;
        } catch {/* ignore */}
        if ((resp.status >= 500 || resp.status === 429) && attempt < 2) {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
          return streamReply(history, attempt + 1);
        }
        throw new Error(msg);
      }

      // Open assistant bubble
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistant = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta) {
              assistant += delta;
              setMessages((prev) => {
                const next = prev.slice();
                next[next.length - 1] = { role: "assistant", content: assistant };
                return next;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      if (!assistant) {
        setMessages((prev) => prev.slice(0, -1));
        throw new Error("Empty response. Try again.");
      }
    } finally {
      abortRef.current = null;
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      await streamReply(next);
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
        <div className="flex-1 glass rounded-3xl overflow-hidden border border-border/40 relative">
          <iframe
            src="https://www.acrolly.com/ai-teacher/chapters"
            title="Deep Mentor"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
          />
          {/* Mask Acrolly's own back/nav chrome so only our Rankers Edge back button is visible */}
          <div className="pointer-events-auto absolute top-0 left-0 h-14 w-32 bg-background/95 backdrop-blur-md flex items-center pl-3 text-xs text-muted-foreground select-none">
            <span className="silver-text font-medium">Rankers Edge</span>
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