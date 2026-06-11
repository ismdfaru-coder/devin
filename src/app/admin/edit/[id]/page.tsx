import { notFound } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Params) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-6 text-sm font-medium text-muted">Edit post</h1>
      <PostEditor
        post={{
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          category: post.category,
          published: post.published,
        }}
      />
    </div>
  );
}
