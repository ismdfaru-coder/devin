import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { getPublishedPostsByCategory } from "@/lib/posts";
import { categories, categoryBySlug } from "@/lib/categories";
import { site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

// Query categories at request time so published posts show up without a
// rebuild and a transient database error can never fail the deploy.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) return { title: "Not found" };
  return {
    title: category.label,
    description: `${category.label} stories from ${site.name}.`,
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const posts = await getPublishedPostsByCategory(category.slug);

  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="border-b-4 border-black py-10">
        <p className="kicker">Section</p>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl">
          {category.label}
        </h1>
      </section>

      {posts.length === 0 ? (
        <p className="py-24 text-center text-muted">
          No posts in {category.label} yet. Check back soon!
        </p>
      ) : (
        <section className="grid gap-x-8 gap-y-12 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      )}
    </div>
  );
}
