import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Free AI summarization using Ollama (self-hosted) or fallback to extractive summary
export async function POST(request: Request) {
  try {
    const { title, content, source } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Check if Ollama is available (self-hosted free AI)
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    
    try {
      // Try Ollama for AI summarization
      const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "llama3.2",
          prompt: `Summarize the following article in 2-3 sentences. Keep it informative and capture the key points:\n\nTitle: ${title}\n\nContent: ${content.slice(0, 2000)}`,
          stream: false,
        }),
      });

      if (ollamaResponse.ok) {
        const data = await ollamaResponse.json();
        return NextResponse.json({
          success: true,
          summary: data.response,
          method: "ai",
          source,
        });
      }
    } catch {
      // Ollama not available, continue to fallback
    }

    // Fallback: Extractive summarization (extract key sentences)
    const summary = extractiveSummary(content, 3);
    
    return NextResponse.json({
      success: true,
      summary,
      method: "extractive",
      source,
    });
  } catch (error) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: "Failed to summarize content" },
      { status: 500 }
    );
  }
}

// Extractive summarization - extracts key sentences from content
function extractiveSummary(content: string, numSentences: number = 3): string {
  // Clean HTML and get plain text
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split into sentences
  const sentences = plainText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

  if (sentences.length === 0) {
    return plainText.slice(0, 300) + "...";
  }

  // Score sentences by position and length (simple heuristic)
  const scoredSentences = sentences.map((sentence, index) => {
    const score =
      (index === 0 ? 2 : 1) + // Prefer first sentence
      Math.min(sentence.length / 100, 1) + // Prefer medium length
      (sentence.length > 50 ? 1 : 0); // Must have meaningful content
    return { sentence, score, index };
  });

  // Get top sentences and sort by original order
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence);

  return topSentences.join(". ") + ".";
}

// Rewrite content for original writing style (simpler version)
export async function rewriteContent(
  title: string,
  content: string
): Promise<string> {
  // Check if Ollama is available
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

  try {
    const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.2",
        prompt: `Rewrite the following article in your own words. Make it original while keeping the key information. Write in a clear, engaging style:\n\nTitle: ${title}\n\nContent: ${content.slice(0, 3000)}`,
        stream: false,
      }),
    });

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      return data.response;
    }
  } catch {
    // Ollama not available
  }

  // Fallback: Return summarized version
  return extractiveSummary(content, 5);
}