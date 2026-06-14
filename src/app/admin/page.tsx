import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { deletePost, unpublishPost } from "./actions";
import AdminSettings from "./AdminSettings";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [posts, subscriberCount] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.subscriber.count(),
  ]);

  const publishedCount = posts.filter((p) => p.published).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-muted">Manage your blog</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="text-sm text-muted hover:text-[var(--accent)]"
        >
          View Site →
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total Posts" value={posts.length} />
        <Stat label="Published" value={publishedCount} />
        <Stat label="Drafts" value={posts.length - publishedCount} />
        <Stat label="Subscribers" value={subscriberCount} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Link
          href="/admin/new"
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 font-medium text-white hover:opacity-90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
        <Link
          href="/admin/aggregator"
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:opacity-90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Auto Feed
        </Link>
        <Link
          href="/admin/autopost"
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:opacity-90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Auto-Post
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </div>

      {/* Posts Section */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Your Posts</h2>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-border p-12 text-center">
          <p className="text-muted">No posts yet.</p>
          <Link
            href="/admin/new"
            className="mt-4 inline-block text-[var(--accent)] hover:underline"
          >
            Write your first post →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="block truncate font-medium hover:underline"
                >
                  {post.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      post.published
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                  {post.category && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                      {post.category}
                    </span>
                  )}
                  <span>·</span>
                  <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {post.published && (
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="rounded-md border border-border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="rounded-md border border-border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  Edit
                </Link>
                {post.published && (
                  <form action={unpublishPost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      Unpublish
                    </button>
                  </form>
                )}
                <form action={deletePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <ConfirmSubmit
                    message={`Delete "${post.title}"?`}
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
