import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const posts = [
  {
    title: "Welcome to my blog",
    excerpt:
      "This is my personal corner of the internet — here's what you can expect to find.",
    content: `Welcome! 👋

This is my **personal blog**, where I share thoughts, stories, and ideas. It's a single-author publication — every post here is written by me.

## What to expect

- Long-form essays on topics I care about
- Short notes and updates
- The occasional tutorial

## Stay in the loop

If you enjoy what you read, **subscribe** with your email and you'll get new posts delivered straight to your inbox. You can also share any post on social media using the buttons at the bottom of each article.

Thanks for stopping by!`,
    published: true,
    daysAgo: 2,
  },
  {
    title: "Why I started writing",
    excerpt:
      "A few reasons I decided to put my thoughts into words and publish them.",
    content: `I've always believed that **writing is thinking**. When I try to explain an idea clearly, I discover the gaps in my own understanding.

> The palest ink is better than the best memory.

Here are three reasons I started this blog:

1. To clarify my own thinking
2. To document what I learn
3. To connect with people who care about the same things

If any of that resonates with you, I'd love for you to follow along.`,
    published: true,
    daysAgo: 1,
  },
  {
    title: "A draft I'm still working on",
    excerpt: "This one isn't ready yet — only I can see it.",
    content: `This is a draft. It won't appear on the public site until I publish it.`,
    published: false,
    daysAgo: 0,
  },
];

async function main() {
  for (const p of posts) {
    const publishedAt = p.published
      ? new Date(Date.now() - p.daysAgo * 86400000)
      : null;
    await prisma.post.upsert({
      where: { slug: slugify(p.title) },
      update: {},
      create: {
        title: p.title,
        slug: slugify(p.title),
        excerpt: p.excerpt,
        content: p.content,
        published: p.published,
        publishedAt,
      },
    });
  }
  console.log("Seeded sample posts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
