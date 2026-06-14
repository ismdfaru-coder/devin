import { NextResponse } from "next/server";
import { searchPublishedPosts } from "@/lib/posts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ posts: [] });
  }

  const posts = await searchPublishedPosts(query);

  return NextResponse.json({
    posts: posts.slice(0, 10).map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      slug: p.slug,
      publishedAt: p.publishedAt?.toISOString() || null,
      category: p.category,
    })),
  });
}