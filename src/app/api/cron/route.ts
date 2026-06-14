import { NextResponse } from "next/server";
import { TECH_FEEDS } from "@/lib/feeds";
import { fetchAllFeeds } from "@/lib/rss";
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

// Get valid image URL
async function getValidImage(query: string): Promise<string> {
  const unsplashUrl = `https://source.unsplash.com/featured/1200x630/?${encodeURIComponent(query)}`;
  try {
    const res = await fetch(unsplashUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    if (res.ok && validateImageUrl(res.url || unsplashUrl)) {
      return res.url || unsplashUrl;
    }
  } catch {}
  return `https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop`;
}

// Vercel Cron - Runs every day at 8 AM UTC
export async function GET(request: Request) {
  try {
    // Check if auto-post is enabled
    const settingsRecord = await prisma.settings.findFirst({
      where: { key: "autopost" },
    });

    let enabled = false;
    let postsPerRun = 3;
    let autoPublish = false;

    if (settingsRecord) {
      const settings = JSON.parse(settingsRecord.value);
      enabled = settings.enabled || false;
      postsPerRun = settings.postsPerRun || settings.postsPerDay || 3;
      autoPublish = settings.autoPublish || false;
    }

    if (!enabled) {
      return NextResponse.json({
        success: true,
        message: "Auto-post is disabled. No articles generated.",
        generated: 0,
      });
    }

    // Fetch from all feeds (no priority filter - use all sources)
    const items = await fetchAllFeeds(TECH_FEEDS, 5);

    // Score and rank
    const now = Date.now();
    const scoredItems = items.map(item => {
      const pubDate = new Date(item.pubDate).getTime();
      const hoursOld = (now - pubDate) / (1000 * 60 * 60);
      const recencyScore = Math.max(0, 100 - hoursOld * 2);
      const authorityScores: Record<string, number> = {
        'TechCrunch': 90, 'The Verge': 85, 'Wired': 88,
        'Ars Technica': 82, 'MIT Technology Review': 85,
        'Dev.to': 75, 'CNET': 80, 'TechRadar': 78,
      };
      const authorityScore = authorityScores[item.source] || 60;
      // Auto-detect category
      const detectedCategory = detectCategory(item.title, item.description);
      return { 
        ...item, 
        score: recencyScore * 0.6 + authorityScore * 0.4,
        detectedCategory 
      };
    });

    scoredItems.sort((a, b) => b.score - a.score);
    const topItems = scoredItems.slice(0, postsPerRun);

    // Generate articles
    const results = [];
    for (const item of topItems) {
      try {
        const slug = await uniqueSlug(slugify(item.title));
        const category = item.detectedCategory.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
        const coverImage = await getValidImage(item.title);
        
        const content = `
<h2>Introduction</h2>
<p>${item.description || item.title}</p>
<h2>Key Developments</h2>
<p>This story represents an important development in the technology landscape. Industry watchers are closely monitoring how this situation unfolds and what it means for the future.</p>
<h2>What This Means</h2>
<p>The implications extend beyond immediate stakeholders. Whether you're a business leader, developer, or technology enthusiast, understanding the broader context helps make sense of its significance.</p>
<h2>Looking Ahead</h2>
<p>As we continue through 2026, expect more developments in this space. Organizations that stay informed will be best positioned to adapt and leverage new opportunities.</p>
<h2>Sources</h2>
<ul><li><a href="${item.link}" target="_blank" rel="noopener">${item.title} - ${item.source}</a></li></ul>
`;
        
        const post = await prisma.post.create({
          data: {
            title: item.title,
            slug,
            content,
            excerpt: (item.description || item.title).slice(0, 200),
            category,
            published: autoPublish,
            coverImage,
            publishedAt: autoPublish ? new Date() : null,
          },
        });

        results.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          category: post.category,
          published: post.published,
        });
      } catch (error) {
        console.error(`Failed to create post for: ${item.title}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${results.length} articles`,
      generated: results.length,
      articles: results,
      settings: {
        autoPublish,
        postsPerRun,
      },
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run cron job" },
      { status: 500 }
    );
  }
}