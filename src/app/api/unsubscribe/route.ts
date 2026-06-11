import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";

function page(message: string): Response {
  const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Unsubscribe — ${site.name}</title>
  <style>body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#fff;color:#1a1a1a}.card{max-width:420px;text-align:center;padding:2rem}a{color:#111827}</style>
  </head><body><div class="card"><h1>${site.name}</h1><p>${message}</p><p><a href="${site.url}">← Back to the blog</a></p></div></body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return page("Invalid unsubscribe link.");

  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubToken: token },
  });
  if (!subscriber) {
    return page("This link is invalid or you've already unsubscribed.");
  }

  await prisma.subscriber.delete({ where: { id: subscriber.id } });
  return page("You've been unsubscribed. Sorry to see you go!");
}

export async function POST(request: Request) {
  return GET(request);
}

export const dynamic = "force-dynamic";
