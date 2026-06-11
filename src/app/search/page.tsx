import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { searchPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Search",
};

type Params = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Params) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchPublishedPosts(query) : [];

  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="border-b-4 border-black py-10">
        <p className="kicker">Search</p>
        <form action="/search" method="get" className="mt-3 flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Search posts…"
            className="w-full border border-border px-4 py-3 text-lg outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="bg-[var(--accent)] px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white hover:opacity-90"
          >
            Search
          </button>
        </form>
      </section>

      {query === "" ? (
        <p className="py-24 text-center text-muted">
          Type a keyword above to search posts.
        </p>
      ) : results.length === 0 ? (
        <p className="py-24 text-center text-muted">
          No posts found for “{query}”.
        </p>
      ) : (
        <>
          <p className="pt-8 text-sm text-muted">
            {results.length} result{results.length === 1 ? "" : "s"} for “
            {query}”
          </p>
          <section className="grid gap-x-8 gap-y-12 py-8 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
