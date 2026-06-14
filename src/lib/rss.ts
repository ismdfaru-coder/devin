import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "InfoThink RSS Aggregator/1.0",
  },
});

export interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
  content?: string;
}

export interface FeedResult {
  feedName: string;
  items: FeedItem[];
  success: boolean;
  error?: string;
}

export async function fetchFeed(
  url: string,
  feedName: string,
  category: string
): Promise<FeedResult> {
  try {
    const feed = await parser.parseURL(url);
    const items: FeedItem[] = (feed.items || [])
      .slice(0, 10) // Limit items per feed
      .map((item) => ({
        title: item.title || "Untitled",
        link: item.link || "",
        description: item.contentSnippet || item.content || item.summary || "",
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: feedName,
        category: category,
        content: item.content || item.contentSnippet || "",
      }));

    return {
      feedName,
      items,
      success: true,
    };
  } catch (error) {
    return {
      feedName,
      items: [],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchAllFeeds(
  feeds: Array<{ name: string; url: string; category: string }>,
  limitPerFeed = 5
): Promise<FeedItem[]> {
  const allItems: FeedItem[] = [];

  // Fetch feeds in parallel (limited to avoid rate limits)
  const batchSize = 5;
  for (let i = 0; i < feeds.length; i += batchSize) {
    const batch = feeds.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((feed) => fetchFeed(feed.url, feed.name, feed.category))
    );

    for (const result of results) {
      if (result.success) {
        allItems.push(...result.items.slice(0, limitPerFeed));
      }
    }

    // Small delay between batches to avoid rate limits
    if (i + batchSize < feeds.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Sort by date (newest first)
  allItems.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return allItems;
}

// Clean HTML content for display
export function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

// Generate excerpt from content
export function generateExcerpt(content: string, maxLength = 200): string {
  const cleaned = cleanHtml(content);
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}