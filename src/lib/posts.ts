import { prisma } from "@/lib/prisma";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function uniqueSlug(
  title: string,
  ignoreId?: string,
): Promise<string> {
  const base = slugify(title) || "post";
  let slug = base;
  let n = 1;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPublishedPostsByCategory(category: string) {
  return prisma.post.findMany({
    where: { published: true, category },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function searchPublishedPosts(query: string) {
  const q = query.trim();
  if (!q) return [];
  return prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { content: { contains: q } },
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function getRelatedPosts(
  slug: string,
  category: string | null,
  take = 3,
) {
  if (category) {
    const sameCategory = await prisma.post.findMany({
      where: { published: true, category, slug: { not: slug } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take,
    });
    if (sameCategory.length >= take) return sameCategory;

    const fillers = await prisma.post.findMany({
      where: {
        published: true,
        slug: { not: slug },
        id: { notIn: sameCategory.map((p) => p.id) },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: take - sameCategory.length,
    });
    return [...sameCategory, ...fillers];
  }

  return prisma.post.findMany({
    where: { published: true, slug: { not: slug } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
  });
}
