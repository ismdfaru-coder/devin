import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { deletePost, unpublishPost } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [posts, subscriberCount] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.subscriber.count(),
  ]);

  const publishedCount = posts.filter((p) => p.published).length;

  return (
    <div>
      <div className="mb-8 grid grid-cols-3 gap-4">
        <Stat label="Posts" value={posts.length} />
        <Stat label="Published" value={publishedCount} />
        <Stat label="Subscribers" value={subscriberCount} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Your posts</h2>
        <Link
          href="/admin/new"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="py-12 text-center text-muted">
          No posts yet. Write your first one!
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="block truncate font-medium hover:underline"
                >
                  {post.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  {post.published ? (
                    <span className="text-green-600">Published</span>
                  ) : (
                    <span className="text-amber-600">Draft</span>
                  )}{" "}
                  · {formatDate(post.publishedAt ?? post.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm">
                {post.published && (
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="rounded-md border border-border px-3 py-1.5 hover:bg-gray-50"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="rounded-md border border-border px-3 py-1.5 hover:bg-gray-50"
                >
                  Edit
                </Link>
                {post.published && (
                  <form action={unpublishPost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-border px-3 py-1.5 hover:bg-gray-50"
                    >
                      Unpublish
                    </button>
                  </form>
                )}
                <form action={deletePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <ConfirmSubmit
                    message={`Delete "${post.title}"? This cannot be undone.`}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </ConfirmSubmit>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
