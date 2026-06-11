import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostBody from "@/components/PostBody";
import ShareButtons from "@/components/ShareButtons";
import SubscribeForm from "@/components/SubscribeForm";
import { getPostBySlug, readingTime } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { htmlToText } from "@/lib/html";
import { site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.published) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `${site.url}/posts/${post.slug}`,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.published) notFound();

  const url = `${site.url}/posts/${post.slug}`;

  return (
    <article className="py-12">
      <header className="mx-auto max-w-3xl px-6 text-center">
        <p className="kicker">
          {formatDate(post.publishedAt ?? post.createdAt)}
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-[1.05] tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mx-auto mt-5 max-w-2xl font-serif text-xl leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
          <span>By {site.author}</span>
          <span>·</span>
          <span>{readingTime(htmlToText(post.content))} min read</span>
        </div>
      </header>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          className="mx-auto my-10 aspect-[2/1] w-full max-w-5xl object-cover"
        />
      )}

      <div className="mx-auto mt-8 max-w-2xl px-6">
        <PostBody html={post.content} />

        <div className="mt-12 border-t border-border pt-6">
          <ShareButtons url={url} title={post.title} />
        </div>

        <div className="mt-12 border-y-4 border-black bg-black px-8 py-10 text-center text-white">
          <p className="kicker">Newsletter</p>
          <h2 className="mt-2 font-display text-2xl uppercase tracking-tight">
            Enjoyed this post?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-gray-300">
            Subscribe to get new posts from {site.author} by email.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <SubscribeForm />
          </div>
        </div>
      </div>
    </article>
  );
}
