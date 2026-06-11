import Link from "next/link";
import { formatDate } from "@/lib/format";
import { readingTime } from "@/lib/posts";

type Props = {
  post: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    publishedAt: Date | null;
    createdAt: Date;
  };
};

export default function PostCard({ post }: Props) {
  return (
    <article className="group border-b border-border py-8">
      <Link href={`/posts/${post.slug}`} className="flex flex-col gap-3">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="mb-1 aspect-[2/1] w-full rounded-lg object-cover"
          />
        )}
        <h2 className="text-2xl font-bold tracking-tight group-hover:underline">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-base leading-relaxed text-gray-600">
            {post.excerpt}
          </p>
        )}
        <p className="text-sm text-muted">
          {formatDate(post.publishedAt ?? post.createdAt)} ·{" "}
          {readingTime(post.content)} min read
        </p>
      </Link>
    </article>
  );
}
