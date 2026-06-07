// Supabase Edge Function — runs on Supabase, has LOVABLE_API_KEY automatically.
// Frontend on Vercel calls this directly, so no Vercel env vars needed.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Rankers AI, the personal JEE tutor inside Rankers Edge.

FORMATTING RULES — follow strictly:
- Clean markdown, blank line between paragraphs.
- **bold** for key terms and final answers.
- Numbered lists (1. 2. 3.) for steps, with a blank line between steps.
- Bullet points (-) for properties or cases.
- ### headings for major sections.
- ALL math in LaTeX: inline $...$, block $$...$$ on its own line.
- Never use emojis. Never casual language. No "Sure!" or "Great question!" openers.
- End multi-step solutions with a "### Key Insight" section.

Solve JEE Mains/Advanced problems with rigorous step-by-step reasoning. Be concise but complete.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI is not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    const safe = (Array.isArray(messages) ? messages : []).slice(-40).filter(
      (m: { role?: string; content?: string }) =>
        m && typeof m.content === "string" && m.content.length > 0 && m.content.length < 8000,
    );
    if (safe.length === 0) {
      return new Response(JSON.stringify({ error: "Empty messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        temperature: 0.25,
        max_tokens: 1400,
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safe],
      }),
    });

    if (upstream.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit hit. Try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (upstream.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text().catch(() => "");
      console.error("AI gateway error", upstream.status, t);
      return new Response(JSON.stringify({ error: "AI service error." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (e) {
    console.error("chat error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});