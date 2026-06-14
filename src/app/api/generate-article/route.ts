import { NextResponse } from "next/server";
import { TECH_FEEDS } from "@/lib/feeds";
import { fetchAllFeeds, generateExcerpt, cleanHtml } from "@/lib/rss";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/posts";
import { detectCategory } from "@/lib/feeds";

export const dynamic = "force-dynamic";

// Validate image URL
function validateImageUrl(url: string): boolean {
  if (!url) return false;
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
  const hasValidExtension = validExtensions.some(ext => url.toLowerCase().includes(ext));
  const hasImageParams = url.includes('unsplash.com/photos') || url.includes('source.unsplash.com');
  return hasValidExtension || hasImageParams;
}

// Get valid image URL for article
async function getValidImage(query: string, source: string = "unsplash"): Promise<string> {
  // Try Unsplash first
  if (source === "unsplash" || source === "all") {
    const unsplashUrl = `https://source.unsplash.com/featured/1200x630/?${encodeURIComponent(query)}`;
    try {
      const res = await fetch(unsplashUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (res.ok && validateImageUrl(res.url || unsplashUrl)) {
        return res.url || unsplashUrl;
      }
    } catch {}
  }
  
  // Fallback to a reliable placeholder
  return `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop`;
}

// AI Article Generator - Creates ORIGINAL articles
export async function POST(request: Request) {
  try {
    const { 
      topic,
      sourceItems = [],
      category,
      useAI = false,
      autoPublish = false,
      imageQuery,
    } = await request.json();

    // Detect category if not provided
    const detectedCategory = detectCategory(topic, "");
    const finalCategory = category || detectedCategory;

    // Generate article
    let article;
    if (useAI) {
      article = await generateWithAI(topic, sourceItems);
    } else {
      article = await generateTemplateArticle(topic, sourceItems);
    }

    // Get valid image
    const coverImage = await getValidImage(imageQuery || topic);

    // Generate unique slug
    const slug = await uniqueSlug(slugify(article.title));

    // Create post in database
    const post = await prisma.post.create({
      data: {
        title: article.title,
        slug,
        content: article.content,
        excerpt: article.excerpt,
        category: finalCategory.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-"),
        published: autoPublish,
        coverImage,
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
        coverImage: post.coverImage,
      },
      message: autoPublish ? "Published!" : "Draft created!",
    });

  } catch (error) {
    console.error("Article generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate article" },
      { status: 500 }
    );
  }
}

// Generate article using HuggingFace Inference API (Free)
async function generateWithAI(topic: string, sourceItems: any[]) {
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  
  const contextSummary = sourceItems
    .slice(0, 3)
    .map((item, i) => `Source ${i + 1}: ${item.title}`)
    .join("\n");

  const prompt = `Write a short, engaging tech blog article about: ${topic}

Context from trending news: ${contextSummary}

Write in a conversational tone with:
- An engaging title
- Introduction paragraph
- 3 key points
- Conclusion
- Keep it under 400 words

Format as JSON:
{
  "title": "Your title here",
  "excerpt": "150 char summary",
  "content": "Full article HTML with <p> and <h2> tags"
}`;

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
            inputs: prompt,
            parameters: { max_new_tokens: 500 },
          }),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
        
        // Try to parse JSON from response
        try {
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const article = JSON.parse(jsonMatch[0]);
            return {
              title: article.title || topic,
              excerpt: article.excerpt || generateExcerpt(topic, 150),
              content: article.content || `<p>${topic}</p>`,
            };
          }
        } catch {}
      }
    } catch (error) {
      console.log("HuggingFace not available, using template");
    }
  }

  // Fallback to template
  return generateTemplateArticle(topic, sourceItems);
}

// Template-based original article generation
async function generateTemplateArticle(topic: string, sourceItems: any[]) {
  const topic_lower = topic.toLowerCase();
  
  // Generate title variations
  const titlePrefixes = [
    "Understanding",
    "The Rise of",
    "Why",
    "How",
    "A Deep Dive into",
    "What You Need to Know About",
  ];
  const prefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
  const title = `${prefix} ${topic}`;

  // Get source attribution
  const sourcesList = sourceItems.length > 0 
    ? sourceItems.slice(0, 3).map(item => `<li><a href="${item.link}" target="_blank">${item.title}</a> - ${item.source}</li>`).join('')
    : '';

  const content = `
<h2>Introduction</h2>
<p>${topic} has become a significant topic in the technology landscape. In this article, we'll explore what this means for businesses, developers, and consumers alike.</p>

<h2>Key Developments</h2>
<p>The latest developments show important trends that are shaping the industry:</p>
<ul>
<li>Increased adoption across multiple sectors</li>
<li>Growing investment from major companies</li>
<li>Improved accessibility for users of all levels</li>
<li>Enhanced integration with existing systems</li>
</ul>

<h2>What This Means for You</h2>
<p>Whether you're a business owner, developer, or casual user, these developments have implications that affect how we work and interact with technology. Understanding the broader context helps make informed decisions.</p>

<h2>Looking Ahead</h2>
<p>As we continue through 2026, expect to see more innovations in this space. Organizations that stay informed and adapt quickly will be best positioned to leverage these advancements.</p>

<h2>Conclusion</h2>
<p>${topic} represents an important development in technology. Stay informed, experiment with new approaches, and don't hesitate to explore how these trends might benefit your work or daily life.</p>

${sourcesList ? `<h2>Sources</h2><ul>${sourcesList}</ul>` : ''}
`;

  return {
    title,
    excerpt: generateExcerpt(topic, 150),
    content,
  };
}

// GET - Get trending topics from feeds
export async function GET() {
  try {
    // Fetch from all feeds
    const items = await fetchAllFeeds(TECH_FEEDS, 5);

    // Score and rank
    const now = Date.now();
    const scoredItems = items.map(item => ({
      ...item,
      score: calculateTrendScore(item, now),
      detectedCategory: detectCategory(item.title, item.description),
    }));

    scoredItems.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      trendingTopics: scoredItems.slice(0, 15).map(item => ({
        title: item.title,
        link: item.link,
        source: item.source,
        category: item.category,
        detectedCategory: item.detectedCategory,
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

// Calculate trend score
function calculateTrendScore(item: any, now: number): number {
  const pubDate = new Date(item.pubDate).getTime();
  const hoursOld = (now - pubDate) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - hoursOld * 2);
  
  const authorityScores: Record<string, number> = {
    'TechCrunch': 90, 'The Verge': 85, 'Wired': 88,
    'Ars Technica': 82, 'MIT Technology Review': 85,
    'Dev.to': 75, 'CNET': 80, 'TechRadar': 78,
  };
  const authorityScore = authorityScores[item.source] || 60;
  
  const trendingKeywords = ['ai', 'chatgpt', 'gemini', 'apple', 'microsoft', 'google', 'meta', 'openai', 'tesla', 'startup'];
  const keywordBoost = trendingKeywords.some(k => item.title.toLowerCase().includes(k)) ? 20 : 0;
  
  return recencyScore * 0.5 + authorityScore * 0.3 + keywordBoost;
}