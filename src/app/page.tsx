import Link from "next/link";
import PostCard from "@/components/PostCard";
import SubscribeForm from "@/components/SubscribeForm";
import { getPublishedPosts } from "@/lib/posts";
import { site } from "@/lib/site";
import { categories } from "@/lib/categories";

// Render at request time so newly published posts appear immediately and a
// transient database error during deploy can never fail the build.
export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPublishedPosts();
  const [featured, ...rest] = posts;
  const latest = rest.slice(0, 6);

  const byCategory = categories
    .map((c) => ({
      ...c,
      items: posts.filter((p) => p.category === c.slug).slice(0, 3),
    }))
    .filter((c) => c.items.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="border-b border-border py-5 text-center">
        <p className="font-display text-sm uppercase tracking-[0.35em] text-[var(--accent)] sm:text-base">
          {site.description}
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="py-24 text-center text-muted">
          No posts published yet. Check back soon!
        </p>
      ) : (
        <>
          <section className="py-10">
            <PostCard post={featured} featured />
          </section>

          {latest.length > 0 && (
            <section className="pb-12">
              <SectionHeader title="Latest" />
              <div className="grid gap-x-8 gap-y-12 pt-8 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {byCategory.map((c) => (
            <section key={c.slug} className="pb-12">
              <SectionHeader title={c.label} href={`/category/${c.slug}`} />
              <div className="grid gap-x-8 gap-y-12 pt-8 sm:grid-cols-2 lg:grid-cols-3">
                {c.items.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      <section
        id="subscribe"
        className="my-16 border-y-4 border-black bg-black px-8 py-12 text-center text-white"
      >
        <p className="kicker">Newsletter</p>
        <h2 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl">
          Subscribe to {site.name}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-gray-300">
          Get new posts delivered straight to your inbox. No spam, unsubscribe
          anytime.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <SubscribeForm />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-end justify-between border-t-4 border-black pt-3">
      <h2 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--accent)] hover:underline"
        >
          View all
        </Link>
      )}
    </div>
  );
}
