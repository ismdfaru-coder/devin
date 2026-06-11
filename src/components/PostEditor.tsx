"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { savePost } from "@/app/admin/actions";

type Props = {
  post?: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    coverImage: string | null;
    published: boolean;
  };
};

export default function PostEditor({ post }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <form action={savePost} className="flex flex-col gap-5">
      {post?.id && <input type="hidden" name="id" value={post.id} />}

      <input
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        required
        className="w-full border-none bg-transparent text-3xl font-bold outline-none placeholder:text-gray-300"
      />

      <input
        name="coverImage"
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
        placeholder="Cover image URL (optional)"
        className="w-full rounded-lg border border-border px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
      />

      <div>
        <div className="mb-2 flex gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`px-4 py-2 text-sm font-medium ${
              tab === "write"
                ? "border-b-2 border-[var(--accent)]"
                : "text-muted"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`px-4 py-2 text-sm font-medium ${
              tab === "preview"
                ? "border-b-2 border-[var(--accent)]"
                : "text-muted"
            }`}
          >
            Preview
          </button>
        </div>

        {tab === "write" ? (
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post in Markdown…"
            rows={20}
            className="w-full rounded-lg border border-border p-4 font-mono text-sm leading-relaxed outline-none focus:border-[var(--accent)]"
          />
        ) : (
          <div className="min-h-[20rem] rounded-lg border border-border p-4">
            {content.trim() ? (
              <div className="prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted">Nothing to preview yet.</p>
            )}
            {/* keep content in the form when previewing */}
            <input type="hidden" name="content" value={content} />
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Excerpt{" "}
          <span className="font-normal text-muted">
            (optional — auto-generated if blank)
          </span>
        </label>
        <textarea
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="A short summary shown on the home page and in emails."
          className="w-full rounded-lg border border-border p-3 text-sm outline-none focus:border-[var(--accent)]"
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          name="intent"
          value="publish"
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 font-medium text-white hover:opacity-90"
        >
          {post?.published ? "Update & keep published" : "Publish"}
        </button>
        <button
          type="submit"
          name="intent"
          value="draft"
          className="rounded-lg border border-border px-6 py-2.5 font-medium hover:bg-gray-50"
        >
          Save as draft
        </button>
      </div>
    </form>
  );
}
