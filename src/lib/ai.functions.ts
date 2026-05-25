import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(8000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `You are Rankers AI, the personal JEE tutor inside Rankers Edge — a cinematic JEE prep hub.

FORMATTING RULES — follow strictly, every reply:
- ALWAYS use clean markdown with proper spacing. Blank line between paragraphs.
- Use **bold** for key terms, formulas names, and final answers.
- Use numbered lists (1. 2. 3.) for step-by-step solutions, with a BLANK line between steps.
- Use bullet points (-) for properties, conditions, or cases.
- Use ### headings for major sections (e.g. "### Concept", "### Solution", "### Key Insight").
- ALL math MUST use LaTeX: inline with single $...$ and block with $$...$$ on its own line, surrounded by blank lines.
- NEVER write equations as plain text like "x^2 + 2x = 0" — always wrap in $...$ → $x^2 + 2x = 0$.
- NEVER use emojis. Never use casual language.
- End every multi-step solution with a "### Key Insight" section — one or two crisp lines.

CONTENT RULES:
- Explain concepts, derive formulas, and solve JEE Mains/Advanced problems with rigorous step-by-step reasoning.
- For derivations, state assumptions first, then derive, then state the result in a boxed-equivalent block: $$\\boxed{result}$$
- If a student asks something off-topic, redirect to JEE prep in one short line.
- Be concise but complete. No fluff. No "Sure!" or "Great question!" openers.`;

export const askTutor = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...data.messages,
        ],
      }),
    });

    if (res.status === 429) {
      return { ok: false as const, error: "Rate limit hit. Try again in a moment." };
    }
    if (res.status === 402) {
      return { ok: false as const, error: "AI credits exhausted. Please top up." };
    }
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error", res.status, t);
      return { ok: false as const, error: "AI service error." };
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return { ok: true as const, content };
  });