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

// Public-facing reads should never crash a page. If the database is briefly
// unreachable or a table isn't migrated yet, degrade to an empty result so the
// page renders an empty state instead of returning a 500.
async function safeRead<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[v0] posts.${label} read failed:`, error);
    return fallback;
  }
}

export async function getPublishedPosts() {
  return safeRead(
    "getPublishedPosts",
    () =>
      prisma.post.findMany({
        where: { published: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    [],
  );
}

export async function getPublishedPostsByCategory(category: string) {
  return safeRead(
    "getPublishedPostsByCategory",
    () =>
      prisma.post.findMany({
        where: { published: true, category },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      }),
    [],
  );
}

export async function getPostBySlug(slug: string) {
  return safeRead(
    "getPostBySlug",
    () => prisma.post.findUnique({ where: { slug } }),
    null,
  );
}

export async function searchPublishedPosts(query: string) {
  const q = query.trim();
  if (!q) return [];
  return safeRead(
    "searchPublishedPosts",
    () =>
      prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 50,
      }),
    [],
  );
}

export async function getRelatedPosts(
  slug: string,
  category: string | null,
  take = 3,
) {
  return safeRead(
    "getRelatedPosts",
    async () => {
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
    },
    [],
  );
}
