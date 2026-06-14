"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/format";

type Post = {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  publishedAt: string | null;
  category: string | null;
};

export default function SearchWithAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.posts || []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/posts/${results[selectedIndex].slug}`);
        setShowDropdown(false);
        setQuery("");
      } else if (query) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setShowDropdown(false);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search posts..."
          className="w-full rounded-lg border border-border bg-white px-4 py-2 pl-10 pr-4 text-sm focus:border-[var(--accent)] focus:outline-none dark:bg-gray-900"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
        </svg>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--accent)]" />
          </div>
        )}
      </div>

      {showDropdown && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-white shadow-lg dark:bg-gray-900">
          {results.length > 0 ? (
            <>
              {results.slice(0, 6).map((post, index) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  onClick={() => {
                    setShowDropdown(false);
                    setQuery("");
                  }}
                  className={`block px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    index === selectedIndex ? "bg-gray-50 dark:bg-gray-800" : ""
                  }`}
                >
                  <p className="font-medium">{post.title}</p>
                  {post.excerpt && (
                    <p className="mt-1 text-xs text-muted line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    {post.category && <span className="uppercase">{post.category} · </span>}
                    {formatDate(post.publishedAt || "")}
                  </p>
                </Link>
              ))}
              {results.length > 6 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setShowDropdown(false)}
                  className="block border-t border-border px-4 py-3 text-center text-sm text-[var(--accent)] hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  See all {results.length} results →
                </Link>
              )}
            </>
          ) : !loading ? (
            <div className="px-4 py-6 text-center text-muted">
              <p className="text-sm">No posts found for "{query}"</p>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setShowDropdown(false)}
                className="mt-2 inline-block text-sm text-[var(--accent)] hover:underline"
              >
                View all search results →
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}