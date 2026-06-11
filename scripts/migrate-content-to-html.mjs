// One-off migration: convert existing Markdown post content to HTML.
// Posts created before the rich-text editor stored Markdown; the app now
// renders HTML. Run once per database:
//   DATABASE_URL=... node scripts/migrate-content-to-html.mjs
import { PrismaClient } from "@prisma/client";
import { marked } from "marked";

const prisma = new PrismaClient();

// Heuristic: treat content as already-HTML if it contains block-level tags.
function looksLikeHtml(s) {
  return /<(p|h[1-6]|ul|ol|li|blockquote|pre|img|hr|strong|em|a|br)\b/i.test(s);
}

async function main() {
  const posts = await prisma.post.findMany();
  let converted = 0;
  for (const post of posts) {
    if (!post.content || looksLikeHtml(post.content)) continue;
    const html = marked.parse(post.content, { breaks: true }).trim();
    await prisma.post.update({ where: { id: post.id }, data: { content: html } });
    converted++;
    console.log(`converted: ${post.slug}`);
  }
  console.log(`Done. Converted ${converted}/${posts.length} post(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
