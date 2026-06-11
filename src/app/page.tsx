import PostCard from "@/components/PostCard";
import SubscribeForm from "@/components/SubscribeForm";
import { getPublishedPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default async function Home() {
  const posts = await getPublishedPosts();
  const [featured, ...rest] = posts;

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

          {rest.length > 0 && (
            <section className="grid gap-x-8 gap-y-12 pb-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </section>
          )}
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
