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
    content: `<p>Welcome! 👋</p>
<p>This is my <strong>personal blog</strong>, where I share thoughts, stories, and ideas. It's a single-author publication — every post here is written by me.</p>
<h2>What to expect</h2>
<ul><li>Long-form essays on topics I care about</li><li>Short notes and updates</li><li>The occasional tutorial</li></ul>
<h2>Stay in the loop</h2>
<p>If you enjoy what you read, <strong>subscribe</strong> with your email and you'll get new posts delivered straight to your inbox. You can also share any post on social media using the buttons at the bottom of each article.</p>
<p>Thanks for stopping by!</p>`,
    published: true,
    daysAgo: 2,
  },
  {
    title: "Why I started writing",
    excerpt:
      "A few reasons I decided to put my thoughts into words and publish them.",
    content: `<p>I've always believed that <strong>writing is thinking</strong>. When I try to explain an idea clearly, I discover the gaps in my own understanding.</p>
<blockquote><p>The palest ink is better than the best memory.</p></blockquote>
<p>Here are three reasons I started this blog:</p>
<ol><li>To clarify my own thinking</li><li>To document what I learn</li><li>To connect with people who care about the same things</li></ol>
<p>If any of that resonates with you, I'd love for you to follow along.</p>`,
    published: true,
    daysAgo: 1,
  },
  {
    title: "A draft I'm still working on",
    excerpt: "This one isn't ready yet — only I can see it.",
    content: `<p>This is a draft. It won't appear on the public site until I publish it.</p>`,
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
