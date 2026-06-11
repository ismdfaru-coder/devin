"use client";

import { useState } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import { savePost } from "@/app/admin/actions";
import { categories } from "@/lib/categories";

type Props = {
  post?: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    coverImage: string | null;
    category: string | null;
    published: boolean;
  };
};

export default function PostEditor({ post }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [category, setCategory] = useState(post?.category ?? "");

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
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-border px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
        >
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <RichTextEditor initialHTML={content} onChange={setContent} />
        <input type="hidden" name="content" value={content} />
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
