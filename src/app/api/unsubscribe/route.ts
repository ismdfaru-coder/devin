import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(inner: string): Response {
  const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Unsubscribe — ${escapeHtml(site.name)}</title>
  <style>body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#fff;color:#1a1a1a}.card{max-width:420px;text-align:center;padding:2rem}a{color:#111827}button{background:#111827;color:#fff;border:none;border-radius:8px;padding:12px 20px;font-size:15px;cursor:pointer}</style>
  </head><body><div class="card"><h1>${escapeHtml(site.name)}</h1>${inner}<p style="margin-top:24px"><a href="${site.url}">← Back to the blog</a></p></div></body></html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// GET renders a confirmation form. It does NOT mutate state, so link
// prefetchers / email scanners can't accidentally unsubscribe anyone.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return shell("<p>Invalid unsubscribe link.</p>");

  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubToken: token },
  });
  if (!subscriber) {
    return shell("<p>This link is invalid or you've already unsubscribed.</p>");
  }

  return shell(
    `<p>Unsubscribe <strong>${escapeHtml(subscriber.email)}</strong> from new-post emails?</p>
     <form method="post"><input type="hidden" name="token" value="${escapeHtml(token)}"/><button type="submit">Unsubscribe</button></form>`,
  );
}

// POST performs the actual deletion.
export async function POST(request: Request) {
  let token = new URL(request.url).searchParams.get("token");
  if (!token) {
    try {
      const form = await request.formData();
      const value = form.get("token");
      if (typeof value === "string") token = value;
    } catch {
      // ignore
    }
  }
  if (!token) return shell("<p>Invalid unsubscribe link.</p>");

  const subscriber = await prisma.subscriber.findUnique({
    where: { unsubToken: token },
  });
  if (!subscriber) {
    return shell("<p>This link is invalid or you've already unsubscribed.</p>");
  }

  await prisma.subscriber.delete({ where: { id: subscriber.id } });
  return shell("<p>You've been unsubscribed. Sorry to see you go!</p>");
}

export const dynamic = "force-dynamic";
