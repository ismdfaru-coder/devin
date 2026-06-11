export type Category = {
  slug: string;
  label: string;
};

export const categories: Category[] = [
  { slug: "tech", label: "Tech" },
  { slug: "best-picks", label: "Best Picks" },
  { slug: "health", label: "Health" },
  { slug: "home-garden", label: "Home & Garden" },
  { slug: "comparisons", label: "Comparisons" },
  { slug: "hacks", label: "Hacks" },
  { slug: "ai", label: "AI" },
  { slug: "competitors", label: "Competitors" },
  { slug: "best", label: "Best" },
];

export function categoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function categoryLabel(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return categoryBySlug(slug)?.label ?? null;
}
