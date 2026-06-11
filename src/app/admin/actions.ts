"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { uniqueSlug } from "@/lib/posts";
import { sendNewPostEmails } from "@/lib/email";
import { htmlToText } from "@/lib/html";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

function excerptFrom(content: string, provided: string): string {
  if (provided.trim()) return provided.trim().slice(0, 280);
  return htmlToText(content).slice(0, 200);
}

export async function savePost(formData: FormData): Promise<void> {
  await requireAuth();

  const id = (formData.get("id") as string) || "";
  const title = ((formData.get("title") as string) || "").trim();
  const content = (formData.get("content") as string) || "";
  const excerptInput = (formData.get("excerpt") as string) || "";
  const coverImage = ((formData.get("coverImage") as string) || "").trim();
  const category = ((formData.get("category") as string) || "").trim();
  const intent = (formData.get("intent") as string) || "draft"; // "publish" | "draft"

  if (!title) {
    throw new Error("Title is required.");
  }

  const excerpt = excerptFrom(content, excerptInput);
  const publish = intent === "publish";

  if (id) {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) throw new Error("Post not found.");

    const wasPublished = existing.published;
    const slug = await uniqueSlug(title, id);

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage: coverImage || null,
        category: category || null,
        published: publish,
        publishedAt: publish
          ? (existing.publishedAt ?? new Date())
          : existing.publishedAt,
      },
    });

    // Notify subscribers only the first time a post is ever published.
    // publishedAt is preserved across unpublish, so it flags prior publication.
    if (publish && !wasPublished && !existing.publishedAt) {
      await notifySubscribers(updated);
    }

    revalidatePath("/");
    revalidatePath(`/posts/${updated.slug}`);
    if (updated.category) revalidatePath(`/category/${updated.category}`);
    if (existing.category && existing.category !== updated.category) {
      revalidatePath(`/category/${existing.category}`);
    }
    revalidatePath("/admin");
  } else {
    const slug = await uniqueSlug(title);
    const created = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage: coverImage || null,
        category: category || null,
        published: publish,
        publishedAt: publish ? new Date() : null,
      },
    });

    if (publish) {
      await notifySubscribers(created);
    }

    revalidatePath("/");
    if (created.category) revalidatePath(`/category/${created.category}`);
    revalidatePath("/admin");
  }

  redirect("/admin");
}

async function notifySubscribers(post: {
  title: string;
  slug: string;
  excerpt: string;
}) {
  const subscribers = await prisma.subscriber.findMany({
    select: { email: true, unsubToken: true },
  });
  await sendNewPostEmails(post, subscribers);
}

export async function deletePost(formData: FormData): Promise<void> {
  await requireAuth();
  const id = formData.get("id") as string;
  if (id) {
    await prisma.post.delete({ where: { id } }).catch(() => {});
    revalidatePath("/");
    revalidatePath("/admin");
  }
  redirect("/admin");
}

export async function unpublishPost(formData: FormData): Promise<void> {
  await requireAuth();
  const id = formData.get("id") as string;
  if (id) {
    const post = await prisma.post.update({
      where: { id },
      data: { published: false },
    });
    revalidatePath("/");
    revalidatePath(`/posts/${post.slug}`);
    revalidatePath("/admin");
  }
  redirect("/admin");
}
