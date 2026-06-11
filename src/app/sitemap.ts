import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { categories } from "@/lib/categories";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/search",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${site.url}/category/${c.slug}`,
    lastModified: new Date(),
  }));

  const postRoutes = posts.map((post) => ({
    url: `${site.url}/posts/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
