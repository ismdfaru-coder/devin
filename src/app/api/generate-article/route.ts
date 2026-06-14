import { NextResponse } from "next/server";
import { TECH_FEEDS } from "@/lib/feeds";
import { fetchAllFeeds, generateExcerpt, cleanHtml } from "@/lib/rss";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

// AI Article Generator - Creates ORIGINAL articles, not rewrites
export async function POST(request: Request) {
  try {
    const { 
      topic,           // Topic/trend to write about
      sourceItems,     // Array of RSS items for context
      category,        // Category to post under
      useAI = false,  // Use Ollama for generation
      autoPublish = false,
    } = await request.json();

    // Generate article using AI or template-based
    let article;

    if (useAI) {
      article = await generateWithAI(topic, sourceItems);
    } else {
      article = await generateTemplateArticle(topic, sourceItems);
    }

    // Find or create category
    const categorySlug = category?.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-") || "tech";
    
    // Generate unique slug
    const slug = await uniqueSlug(slugify(article.title));

    // Create post in database
    const post = await prisma.post.create({
      data: {
        title: article.title,
        slug,
        content: article.content,
        excerpt: article.excerpt,
        category: categorySlug,
        published: autoPublish,
        coverImage: article.coverImage || "",
        publishedAt: autoPublish ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      article: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        published: post.published,
      },
      message: autoPublish ? "Article published!" : "Draft created!",
    });

  } catch (error) {
    console.error("Article generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate article" },
      { status: 500 }
    );
  }
}

// Generate article using Ollama AI
async function generateWithAI(topic: string, sourceItems: any[]) {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  
  const contextSummary = sourceItems
    .slice(0, 5)
    .map((item, i) => `Source ${i + 1}: ${item.title} - ${item.description?.slice(0, 200)}`)
    .join("\n\n");

  const prompt = `You are a professional tech blogger writing original articles.

TOPIC: ${topic}

CONTEXT FROM RSS FEEDS (for inspiration only - DO NOT COPY):
${contextSummary}

REQUIREMENTS:
1. Write an ORIGINAL article - your own insights, analysis, and explanations
2. DO NOT copy or paraphrase content from sources
3. Include your own analysis, opinions, and predictions
4. Make it educational and valuable
5. Structure with clear headings
6. SEO optimized title and meta description
7. Include a "Sources" section at the end with links to original articles

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "SEO optimized title",
  "excerpt": "150 char summary",
  "content": "Full HTML article content with <h2>, <p>, <ul> tags",
  "coverImage": "relevant image URL from Unsplash/Pexels"
}

Write now:`;

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.2",
        prompt,
        stream: false,
        format: "json",
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (response.ok) {
      const data = await response.json();
      const article = JSON.parse(data.response);
      
      return {
        title: article.title || topic,
        excerpt: article.excerpt || generateExcerpt(topic, 150),
        content: article.content || `<p>${topic}</p>`,
        coverImage: article.coverImage || await getRelatedImage(topic),
      };
    }
  } catch (error) {
    console.log("Ollama not available, using template generation");
  }

  // Fallback to template-based generation
  return generateTemplateArticle(topic, sourceItems);
}

// Template-based original article generation
async function generateTemplateArticle(topic: string, sourceItems: any[]) {
  const topic_lower = topic.toLowerCase();
  
  // Generate original title
  const titleVariations = [
    `${topic}: What You Need to Know in 2026`,
    `Understanding ${topic} - A Comprehensive Guide`,
    `The Rise of ${topic}: Key Insights and Analysis`,
    `Why ${topic} Matters Now More Than Ever`,
    `A Deep Dive into ${topic}`,
  ];
  const title = titleVariations[Math.floor(Math.random() * titleVariations.length)];

  // Generate original content structure
  const content = `
<h2>Introduction</h2>
<p>${topic} has become one of the most talked-about topics in technology today. In this comprehensive guide, we'll explore what ${topic} means for the industry and what it means for you.</p>

<h2>What is ${topic}?</h2>
<p>At its core, ${topic} represents a significant shift in how we approach technology. Whether you're a seasoned professional or just getting started, understanding ${topic} is crucial in today's rapidly evolving digital landscape.</p>

<h2>Key Trends and Developments</h2>
<p>The latest developments in ${topic} show several important trends:</p>
<ul>
<li>Increased adoption across industries</li>
<li>Improved accessibility for businesses of all sizes</li>
<li>Integration with existing workflows</li>
<li>Enhanced focus on user experience</li>
</ul>

<h2>Why This Matters</h2>
<p>Understanding ${topic} is essential because it affects how we work, communicate, and solve problems. The implications extend far beyond the tech industry, touching nearly every aspect of modern life.</p>

<h2>Looking Ahead</h2>
<p>As we move through 2026, ${topic} will continue to evolve. Organizations that stay informed and adapt quickly will be best positioned to leverage its benefits.</p>

<h2>Conclusion</h2>
<p>${topic} represents an important development in the tech world. Stay informed, experiment with new approaches, and don't be afraid to adapt your strategies as the landscape continues to change.</p>

<h2>Sources</h2>
<ul>
${sourceItems.slice(0, 5).map(item => 
  `<li><a href="${item.link}" target="_blank" rel="noopener">${item.title}</a> - ${item.source}</li>`
).join('\n')}
</ul>
`;

  // Get related image
  const coverImage = await getRelatedImage(topic);

  return {
    title,
    excerpt: generateExcerpt(topic, 150),
    content,
    coverImage,
  };
}

// Get related image from free sources
async function getRelatedImage(query: string): Promise<string> {
  // Use Unsplash Source for free images
  const unsplashQuery = query.split(' ').slice(0, 2).join('+');
  return `https://source.unsplash.com/featured/1200x630/?${unsplashQuery}`;
}

// GET - Get trending topics from feeds
export async function GET() {
  try {
    // Fetch latest from high-priority feeds
    const highPriorityFeeds = TECH_FEEDS.filter(f => f.priority === "high");
    const items = await fetchAllFeeds(highPriorityFeeds, 10);

    // Score and rank by recency
    const now = Date.now();
    const scoredItems = items.map(item => ({
      ...item,
      score: calculateTrendScore(item, now),
    }));

    // Sort by score
    scoredItems.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      trendingTopics: scoredItems.slice(0, 10).map(item => ({
        title: item.title,
        link: item.link,
        source: item.source,
        category: item.category,
        score: item.score,
        pubDate: item.pubDate,
      })),
    });
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}

// Calculate trend score based on recency and relevance
function calculateTrendScore(item: any, now: number): number {
  const pubDate = new Date(item.pubDate).getTime();
  const hoursOld = (now - pubDate) / (1000 * 60 * 60);
  
  // Recency score (newer = higher)
  const recencyScore = Math.max(0, 100 - hoursOld * 2);
  
  // Source authority score
  const authorityScores: Record<string, number> = {
    'TechCrunch': 90,
    'The Verge': 85,
    'Wired': 88,
    'Ars Technica': 82,
    'MIT Technology Review': 85,
    'Dev.to': 75,
    'Towards Data Science': 78,
    'CNET': 80,
    'TechRadar': 78,
  };
  const authorityScore = authorityScores[item.source] || 60;
  
  // Keyword boost for trending topics
  const trendingKeywords = ['ai', 'chatgpt', 'gemini', 'apple', 'microsoft', 'google', 'meta', 'openai', 'tesla', 'startup'];
  const keywordBoost = trendingKeywords.some(k => item.title.toLowerCase().includes(k)) ? 20 : 0;
  
  return recencyScore * 0.5 + authorityScore * 0.3 + keywordBoost;
}