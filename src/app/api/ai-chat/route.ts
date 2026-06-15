import { NextResponse } from "next/server";

// Tavily search for getting real sources
async function searchWeb(query: string) {
  const tavilyKey = process.env.TAVILY_API_KEY;
  
  if (tavilyKey) {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tavilyKey}`,
        },
        body: JSON.stringify({
          query,
          search_depth: "basic",
          max_results: 5,
          include_answer: true,
        }),
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          results: data.results || [],
          answer: data.answer,
        };
      }
    } catch (error) {
      console.log("Tavily search failed:", error);
    }
  }
  
  // Fallback with mock data for demo
  return {
    results: [
      { url: "https://en.wikipedia.org/wiki/" + encodeURIComponent(query), title: `Learn more about ${query} on Wikipedia` },
      { url: "https://www.google.com/search?q=" + encodeURIComponent(query), title: `Search for ${query} on Google` },
    ],
    answer: null,
  };
}

// Generate response using AI
async function generateResponse(message: string, sources: any[], aiModel: string) {
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  
  const contextInfo = sources.length > 0
    ? `Context from web sources:\n${sources.slice(0, 3).map((s, i) => `${i + 1}. ${s.title}: ${s.url}`).join("\n")}`
    : "No web sources available.";

  const systemPrompt = `You are an expert blog writer assistant. Answer the user's question in a helpful, informative way.
Format your response with:
- A clear, concise answer
- Use <p>, <h2>, <ul>, <li> tags for formatting
- Keep it conversational and engaging
- Include relevant details from sources when available
- End with a brief explanation for the user`;

  const userPrompt = `User question: ${message}

${contextInfo}

Provide a helpful response formatted in HTML.`;

  // Try HuggingFace if token available
  if (hfToken) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `<|system|>${systemPrompt}</system><|user|>${userPrompt}</user><|assistant|>`,
            parameters: { max_new_tokens: 600 },
          }),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
        
        // Extract just the assistant response
        const assistantMatch = generatedText.match(/<\|assistant\|>([\s\S]*?)(?:<\|<\/assistant>|<\/s>|$)/);
        if (assistantMatch) {
          return assistantMatch[1].trim();
        }
        return generatedText.replace(/<\|[\s\S]*?\|>/g, "").trim();
      }
    } catch (error) {
      console.log("HuggingFace not available:", error);
    }
  }

  // Fallback response without AI
  return `<p>Based on your question about "<strong>${message}</strong>", here are some key points:</p>

<h2>Overview</h2>
<p>This is a topic that many users are interested in. While I gather more specific information, you can explore the sources below for detailed insights.</p>

<h2>Key Takeaways</h2>
<ul>
<li>Research is ongoing in this area</li>
<li>Multiple perspectives exist on this topic</li>
<li>Stay updated with latest developments</li>
</ul>

<p>I'm continuously learning to provide better answers. Check the sources for more detailed information!</p>`;
}

export async function POST(request: Request) {
  try {
    const { message, aiModel = "chatgpt" } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Search the web for sources
    const searchResults = await searchWeb(message);
    
    // Generate AI response
    const response = await generateResponse(
      message,
      searchResults.results,
      aiModel
    );

    return NextResponse.json({
      success: true,
      response,
      sources: searchResults.results.map((r: any) => ({
        title: r.title,
        url: r.url,
      })),
      model: aiModel,
    });

  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate response" },
      { status: 500 }
    );
  }
}