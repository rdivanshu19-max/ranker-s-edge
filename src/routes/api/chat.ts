import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are Rankers AI, the personal JEE tutor inside Rankers Edge — a cinematic JEE prep hub.

FORMATTING RULES — follow strictly, every reply:
- ALWAYS use clean markdown with proper spacing. Blank line between paragraphs.
- Use **bold** for key terms, formulas names, and final answers.
- Use numbered lists (1. 2. 3.) for step-by-step solutions, with a BLANK line between steps.
- Use bullet points (-) for properties, conditions, or cases.
- Use ### headings for major sections (e.g. "### Concept", "### Solution", "### Key Insight").
- ALL math MUST use LaTeX: inline with single $...$ and block with $$...$$ on its own line, surrounded by blank lines.
- NEVER write equations as plain text. Always wrap in $...$.
- NEVER use emojis. Never use casual language.
- End every multi-step solution with a "### Key Insight" section — one or two crisp lines.

CONTENT RULES:
- Explain concepts, derive formulas, and solve JEE Mains/Advanced problems with rigorous step-by-step reasoning.
- For derivations, state assumptions first, then derive, then state the result in $$\\boxed{result}$$.
- If a student asks something off-topic, redirect to JEE prep in one short line.
- Be concise but complete. No fluff. No "Sure!" or "Great question!" openers.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({
              error:
                "AI is not configured on this deployment. If you are on Vercel, add the LOVABLE_API_KEY environment variable in Vercel → Project Settings → Environment Variables and redeploy. The Lovable-published URL already has it set.",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
        let body: { messages?: Array<{ role: string; content: string }> };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }
        const messages = (body.messages ?? []).slice(-40).filter(
          (m) => m && typeof m.content === "string" && m.content.length > 0 && m.content.length < 8000,
        );
        if (messages.length === 0) {
          return new Response(JSON.stringify({ error: "Empty messages" }), { status: 400 });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            temperature: 0.25,
            max_tokens: 1400,
            stream: true,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          }),
        });

        if (upstream.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit hit. Try again in a moment." }), {
            status: 429,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (upstream.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
            status: 402,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (!upstream.ok || !upstream.body) {
          const t = await upstream.text().catch(() => "");
          console.error("AI gateway error", upstream.status, t);
          return new Response(JSON.stringify({ error: "AI service error." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});