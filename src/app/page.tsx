import PostCard from "@/components/PostCard";
import SubscribeForm from "@/components/SubscribeForm";
import { getPublishedPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-3xl px-5">
      <section className="border-b border-border py-14 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          {site.description}
        </p>
      </section>

      <section>
        {posts.length === 0 ? (
          <p className="py-16 text-center text-muted">
            No posts published yet. Check back soon!
          </p>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section
        id="subscribe"
        className="my-12 rounded-2xl bg-gray-50 p-8 text-center"
      >
        <h2 className="text-2xl font-bold">Subscribe to {site.name}</h2>
        <p className="mx-auto mt-2 max-w-md text-gray-600">
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
