import { NextResponse } from "next/server";
import { TECH_FEEDS } from "@/lib/feeds";
import { fetchAllFeeds, generateExcerpt } from "@/lib/rss";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const source = searchParams.get("source");
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    // Filter feeds if specified
    let feeds = TECH_FEEDS;
    if (category) {
      feeds = feeds.filter((f) => f.category.toLowerCase() === category.toLowerCase());
    }
    if (source) {
      feeds = feeds.filter((f) => f.name.toLowerCase().includes(source.toLowerCase()));
    }

    // Fetch from all filtered feeds
    const items = await fetchAllFeeds(feeds, 3);

    // Format response
    const formattedItems = items.slice(0, limit).map((item) => ({
      title: item.title,
      link: item.link,
      excerpt: generateExcerpt(item.description, 150),
      pubDate: item.pubDate,
      source: item.source,
      category: item.category,
    }));

    return NextResponse.json({
      success: true,
      count: formattedItems.length,
      feeds: feeds.map((f) => f.name),
      items: formattedItems,
    });
  } catch (error) {
    console.error("Feed aggregation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}