import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import ShareButtons from "@/components/ShareButtons";
import SubscribeForm from "@/components/SubscribeForm";
import { getPostBySlug, readingTime } from "@/lib/posts";
import { formatDate } from "@/lib/format";
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
    <article className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
        {post.title}
      </h1>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted">
        <span>{site.author}</span>
        <span>·</span>
        <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
        <span>·</span>
        <span>{readingTime(post.content)} min read</span>
      </div>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt={post.title}
          className="my-8 aspect-[2/1] w-full rounded-xl object-cover"
        />
      )}

      <div className="mt-8">
        <Markdown>{post.content}</Markdown>
      </div>

      <div className="mt-12 border-t border-border pt-6">
        <ShareButtons url={url} title={post.title} />
      </div>

      <div className="mt-12 rounded-2xl bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-bold">Enjoyed this post?</h2>
        <p className="mx-auto mt-2 max-w-md text-gray-600">
          Subscribe to get new posts from {site.author} by email.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <SubscribeForm />
        </div>
      </div>
    </article>
  );
}
