export type Category = {
  slug: string;
  label: string;
};

export const categories: Category[] = [
  // Main categories
  { slug: "tech", label: "Tech" },
  { slug: "ai", label: "AI" },
  { slug: "programming", label: "Programming" },
  { slug: "gadgets", label: "Gadgets" },
  { slug: "cybersecurity", label: "Cybersecurity" },
  { slug: "startups", label: "Startups" },
  { slug: "science", label: "Science" },
  { slug: "software", label: "Software" },
  { slug: "best-picks", label: "Best Picks" },
  // Legacy categories
  { slug: "health", label: "Health" },
  { slug: "home-garden", label: "Home & Garden" },
  { slug: "comparisons", label: "Comparisons" },
  { slug: "hacks", label: "Hacks" },
  { slug: "competitors", label: "Competitors" },
];

export function categoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function categoryLabel(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return categoryBySlug(slug)?.label ?? null;
}
