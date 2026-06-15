"use client";

import Link from "next/link";
import { categories } from "@/lib/categories";

interface PostSidebarProps {
  title: string;
  category: string;
}

export default function PostSidebar({ title, category }: PostSidebarProps) {
  const relatedCategories = categories.filter(c => c.slug !== category).slice(0, 8);
  
  const tableOfContents = generateTOC(title);

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 space-y-8">
        {/* Table of Contents */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
            Quick Navigation
          </h3>
          <div className="space-y-2">
            {tableOfContents.map((item, idx) => (
              <a
                key={idx}
                href={`#${item.id}`}
                className="block text-sm text-[var(--accent)] hover:underline"
              >
                {item.text}
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
            Explore Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-[var(--accent)] hover:text-white dark:bg-gray-800"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Share Section */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
            Share This Article
          </h3>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-black hover:text-white dark:bg-gray-800"
            >
              𝕏 Post
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-blue-600 hover:text-white dark:bg-gray-800"
            >
              in Share
            </a>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="rounded-lg bg-black p-4 text-white">
          <h3 className="mb-2 font-display text-lg uppercase">Stay Updated</h3>
          <p className="mb-3 text-xs text-gray-300">
            Get the latest posts delivered to your inbox.
          </p>
          <Link
            href="/#subscribe"
            className="block w-full rounded bg-[var(--accent)] py-2 text-center text-xs font-bold uppercase tracking-wider hover:opacity-90"
          >
            Subscribe
          </Link>
        </div>

        {/* Trending Topics */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            Trending Now
          </h3>
          <div className="space-y-3">
            {relatedCategories.slice(0, 4).map((cat, idx) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group flex items-start gap-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-bold text-muted group-hover:bg-[var(--accent)] group-hover:text-white">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium group-hover:text-[var(--accent)]">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Generate simple TOC from title
function generateTOC(title: string) {
  const sections = [
    { id: "introduction", text: "Introduction" },
    { id: "key-points", text: "Key Points" },
    { id: "details", text: "Details" },
    { id: "conclusion", text: "Conclusion" },
  ];
  
  // Customize based on title keywords
  if (title.toLowerCase().includes("how")) {
    sections[1] = { id: "steps", text: "Steps" };
  }
  if (title.toLowerCase().includes("best") || title.toLowerCase().includes("top")) {
    sections[1] = { id: "top-picks", text: "Top Picks" };
  }
  
  return sections;
}