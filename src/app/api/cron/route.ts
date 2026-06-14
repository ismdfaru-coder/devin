import { NextResponse } from "next/server";
import { TECH_FEEDS } from "@/lib/feeds";
import { fetchAllFeeds } from "@/lib/rss";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

// Vercel Cron - Runs every day at 8 AM UTC
export async function GET(request: Request) {
  // Verify cron secret (optional security measure)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if auto-post is enabled
    const settingsRecord = await prisma.settings.findFirst({
      where: { key: "autopost" },
    });

    let enabled = false;
    let postsPerDay = 3;
    let autoPublish = false;
    let ollamaEnabled = false;

    if (settingsRecord) {
      const settings = JSON.parse(settingsRecord.value);
      enabled = settings.enabled || false;
      postsPerDay = settings.postsPerDay || 3;
      autoPublish = settings.autoPublish || false;
      ollamaEnabled = settings.ollamaEnabled || false;
    }

    if (!enabled) {
      return NextResponse.json({
        success: true,
        message: "Auto-post is disabled. No articles generated.",
        generated: 0,
      });
    }

    // Fetch trending content
    const highPriorityFeeds = TECH_FEEDS.filter(f => f.priority === "high");
    const items = await fetchAllFeeds(highPriorityFeeds, 10);

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
      return { ...item, score: recencyScore * 0.6 + authorityScore * 0.4 };
    });

    scoredItems.sort((a, b) => b.score - a.score);
    const topItems = scoredItems.slice(0, postsPerDay);

    // Generate articles
    const results = [];
    for (const item of topItems) {
      try {
        const slug = await uniqueSlug(slugify(item.title));
        const content = `
<h2>Introduction</h2>
<p>${item.description}</p>
<h2>Key Insights</h2>
<p>This development represents an important shift in the technology landscape. Industry experts are closely watching how this story unfolds.</p>
<h2>What This Means</h2>
<p>The implications of this news extend beyond immediate stakeholders. Understanding the broader context helps make sense of its significance.</p>
<h2>Looking Ahead</h2>
<p>As the situation develops, we'll continue to provide updates. Stay informed about the latest developments in this space.</p>
<h2>Sources</h2>
<ul><li><a href="${item.link}" target="_blank" rel="noopener">${item.title} - ${item.source}</a></li></ul>
`;
        
        const post = await prisma.post.create({
          data: {
            title: item.title,
            slug,
            content,
            excerpt: item.description.slice(0, 200),
            category: item.category.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-"),
            published: autoPublish,
            coverImage: `https://source.unsplash.com/featured/1200x630/?${encodeURIComponent(item.source)}`,
            publishedAt: autoPublish ? new Date() : null,
          },
        });

        results.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
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
        postsPerDay,
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