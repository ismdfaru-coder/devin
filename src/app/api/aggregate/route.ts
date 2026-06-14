import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TECH_FEEDS } from "@/lib/feeds";
import { fetchAllFeeds, generateExcerpt, cleanHtml } from "@/lib/rss";
import { slugify, uniqueSlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

// POST - Aggregate content and create draft post
export async function POST(request: Request) {
  try {
    const { 
      feedUrl, 
      itemIndex, 
      action = "create_draft" 
    } = await request.json();

    if (action === "fetch_latest") {
      // Fetch latest from all feeds
      const items = await fetchAllFeeds(TECH_FEEDS, 5);
      return NextResponse.json({
        success: true,
        count: items.length,
        items: items.slice(0, 20).map((item) => ({
          title: item.title,
          link: item.link,
          excerpt: generateExcerpt(item.description, 200),
          pubDate: item.pubDate,
          source: item.source,
          category: item.category,
        })),
      });
    }

    if (action === "create_draft" && feedUrl && itemIndex !== undefined) {
      // Find the feed
      const feed = TECH_FEEDS.find(f => f.url === feedUrl);
      if (!feed) {
        return NextResponse.json({ error: "Feed not found" }, { status: 404 });
      }

      // Fetch from this specific feed
      const { fetchFeed } = await import("@/lib/rss");
      const result = await fetchFeed(feed.url, feed.name, feed.category);
      
      if (!result.success || !result.items[itemIndex]) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      const item = result.items[itemIndex];
      const slug = await uniqueSlug(slugify(item.title));
      const content = `<p>Source: <a href="${item.link}" target="_blank" rel="noopener">${item.source}</a></p>
<p>${cleanHtml(item.description)}</p>
<p><a href="${item.link}">Read original article on ${item.source}</a></p>`;

      // Create draft post
      const post = await prisma.post.create({
        data: {
          title: item.title,
          slug,
          content,
          excerpt: generateExcerpt(item.description, 200),
          category: feed.category.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-"),
          published: false, // Draft by default
          coverImage: "",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Draft created successfully",
        postId: post.id,
        slug: post.slug,
        editUrl: `/admin/edit/${post.id}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Aggregation error:", error);
    return NextResponse.json(
      { error: "Failed to aggregate content" },
      { status: 500 }
    );
  }
}

// GET - Get feed sources overview
export async function GET() {
  const feedsByCategory = TECH_FEEDS.reduce((acc, feed) => {
    if (!acc[feed.category]) {
      acc[feed.category] = [];
    }
    acc[feed.category].push({
      name: feed.name,
      url: feed.url,
      type: feed.type,
    });
    return acc;
  }, {} as Record<string, Array<{ name: string; url: string; type: string }>>);

  return NextResponse.json({
    success: true,
    totalFeeds: TECH_FEEDS.length,
    categories: Object.keys(feedsByCategory),
    feedsByCategory,
  });
}