import Link from "next/link";
import { formatDate } from "@/lib/format";
import { readingTime } from "@/lib/posts";
import { htmlToText } from "@/lib/html";
import { site } from "@/lib/site";

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
  featured?: boolean;
};

export default function PostCard({ post, featured = false }: Props) {
  const date = formatDate(post.publishedAt ?? post.createdAt);
  const mins = readingTime(htmlToText(post.content));

  if (featured) {
    return (
      <article className="group grid items-center gap-8 border-b-4 border-black pb-10 md:grid-cols-2">
        <Link href={`/posts/${post.slug}`} className="order-1 md:order-none">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="aspect-[16/10] w-full object-cover"
            />
          ) : (
            <div className="aspect-[16/10] w-full bg-gray-100" />
          )}
        </Link>
        <Link href={`/posts/${post.slug}`} className="flex flex-col gap-3">
          <span className="kicker">{date}</span>
          <h2 className="font-display text-3xl uppercase leading-[1.05] tracking-tight group-hover:text-[var(--accent)] sm:text-4xl lg:text-5xl">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="font-serif text-lg leading-relaxed text-muted">
              {post.excerpt}
            </p>
          )}
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
            By {site.author} · {mins} min read
          </span>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link href={`/posts/${post.slug}`} className="flex flex-col gap-3">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="aspect-[3/2] w-full object-cover"
          />
        ) : (
          <div className="aspect-[3/2] w-full bg-gray-100" />
        )}
        <span className="kicker">{date}</span>
        <h2 className="font-display text-xl uppercase leading-[1.1] tracking-tight group-hover:text-[var(--accent)]">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="line-clamp-3 font-serif leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
          By {site.author} · {mins} min read
        </span>
      </Link>
    </article>
  );
}
