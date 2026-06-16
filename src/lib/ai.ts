import { generateObject, generateText } from "ai";
import { z } from "zod";

// Default model served zero-config through the Vercel AI Gateway.
const ARTICLE_MODEL = process.env.AI_ARTICLE_MODEL || "openai/gpt-5-mini";
const RESEARCH_MODEL = process.env.AI_RESEARCH_MODEL || "openai/gpt-5-mini";

export function aiEnabled(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

export type GeneratedArticle = {
  title: string;
  excerpt: string;
  content: string; // HTML
};

const articleSchema = z.object({
  title: z.string().describe("An original, engaging, non-clickbait headline"),
  excerpt: z.string().describe("A concise 140-160 character summary"),
  body: z
    .array(
      z.object({
        heading: z.string().describe("Section heading"),
        paragraphs: z
          .array(z.string())
          .describe("2-4 substantial paragraphs for this section"),
        bullets: z
          .array(z.string())
          .optional()
          .describe("Optional list of key points"),
      }),
    )
    .min(4)
    .describe("The article body, broken into 4-7 sections"),
});

type SourceItem = {
  title?: string;
  link?: string;
  source?: string;
  description?: string;
};

function sectionsToHtml(
  body: z.infer<typeof articleSchema>["body"],
  sources: SourceItem[],
): string {
  const parts: string[] = [];
  for (const section of body) {
    parts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
    for (const p of section.paragraphs) {
      parts.push(`<p>${escapeHtml(p)}</p>`);
    }
    if (section.bullets && section.bullets.length > 0) {
      parts.push(
        `<ul>${section.bullets
          .map((b) => `<li>${escapeHtml(b)}</li>`)
          .join("")}</ul>`,
      );
    }
  }

  const validSources = sources.filter((s) => s.link && s.title);
  if (validSources.length > 0) {
    parts.push("<h2>Sources</h2>");
    parts.push(
      `<ul>${validSources
        .slice(0, 6)
        .map(
          (s) =>
            `<li><a href="${escapeHtml(s.link!)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              s.title!,
            )}</a>${s.source ? ` &mdash; ${escapeHtml(s.source)}` : ""}</li>`,
        )
        .join("")}</ul>`,
    );
  }
  return parts.join("\n");
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Generate an original, long-form article rewritten by AI so it is not a copy
 * of any source. Sources are used only as research context and credited at the
 * bottom. Falls back to throwing so the caller can use a template instead.
 */
export async function generateArticleWithAI(
  topic: string,
  sources: SourceItem[],
  category: string,
): Promise<GeneratedArticle> {
  if (!aiEnabled()) {
    throw new Error("AI gateway not configured");
  }

  const context = sources
    .slice(0, 5)
    .map(
      (s, i) =>
        `Reference ${i + 1}: ${s.title ?? "Untitled"}${
          s.source ? ` (${s.source})` : ""
        }${s.description ? ` - ${stripTags(s.description).slice(0, 400)}` : ""}`,
    )
    .join("\n");

  const { object } = await generateObject({
    model: ARTICLE_MODEL,
    schema: articleSchema,
    system:
      "You are an experienced technology journalist. You write ORIGINAL, " +
      "well-researched, plagiarism-free articles in your own words. You never " +
      "copy sentences from sources; you synthesize and explain. Write in clear, " +
      "engaging, accurate prose suitable for a tech news blog. Aim for roughly " +
      "700-1000 words across the sections.",
    prompt:
      `Write an original long-form article about the topic: "${topic}".\n\n` +
      `Category: ${category}.\n\n` +
      `Use the following recent reporting ONLY as background research. Do not ` +
      `copy any wording from it — rewrite everything in your own words and add ` +
      `useful context, analysis, and implications.\n\n${context || "(no extra context)"}`,
  });

  return {
    title: object.title.trim(),
    excerpt: object.excerpt.trim().slice(0, 200),
    content: sectionsToHtml(object.body, sources),
  };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ----------------------- Research synthesis -----------------------

export type ResearchPaper = {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  venue: string | null;
  citationCount: number;
  url: string | null;
  abstract: string | null;
};

const synthesisSchema = z.object({
  answer: z
    .string()
    .describe("A concise 2-3 sentence evidence-based answer to the question"),
  consensus: z
    .enum(["yes", "no", "mixed", "unclear"])
    .describe("Overall direction of the evidence"),
  keyTakeaways: z
    .array(z.string())
    .min(2)
    .describe("3-5 bullet point takeaways grounded in the papers"),
  highlights: z
    .array(
      z.object({
        paperId: z.string().describe("The id of the cited paper"),
        claim: z.string().describe("What this paper found, in plain language"),
      }),
    )
    .describe("Per-paper findings relevant to the question"),
});

export type ResearchSynthesis = z.infer<typeof synthesisSchema>;

export async function synthesizeResearch(
  question: string,
  papers: ResearchPaper[],
): Promise<ResearchSynthesis | null> {
  if (!aiEnabled() || papers.length === 0) return null;

  const context = papers
    .map(
      (p) =>
        `[id:${p.id}] "${p.title}" (${p.year ?? "n.d."}, cited ${p.citationCount}x). ` +
        `Abstract: ${p.abstract ? p.abstract.slice(0, 600) : "not available"}`,
    )
    .join("\n\n");

  try {
    const { object } = await generateObject({
      model: RESEARCH_MODEL,
      schema: synthesisSchema,
      system:
        "You are a careful research assistant. You summarize scientific " +
        "literature accurately and only make claims supported by the provided " +
        "papers. Never invent findings. Cite papers by their id.",
      prompt:
        `Research question: "${question}".\n\n` +
        `Here are the most relevant papers:\n\n${context}\n\n` +
        `Synthesize an evidence-based answer. For highlights, only use the ` +
        `provided paper ids.`,
    });
    return object;
  } catch {
    return null;
  }
}

export async function quickAnswer(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: RESEARCH_MODEL,
    prompt,
  });
  return text;
}
