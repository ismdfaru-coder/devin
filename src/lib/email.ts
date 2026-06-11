import { site } from "@/lib/site";

type Post = {
  title: string;
  slug: string;
  excerpt: string;
};

type Subscriber = {
  email: string;
  unsubToken: string;
};

function postEmailHtml(post: Post, sub: Subscriber): string {
  const postUrl = `${site.url}/posts/${post.slug}`;
  const unsubUrl = `${site.url}/api/unsubscribe?token=${sub.unsubToken}`;
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
    <p style="color:#6b7280;font-size:13px;margin:0 0 8px">New post from ${site.name}</p>
    <h1 style="font-size:24px;line-height:1.3;margin:0 0 12px">${post.title}</h1>
    <p style="font-size:16px;line-height:1.6;color:#374151;margin:0 0 24px">${post.excerpt || ""}</p>
    <a href="${postUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:15px">Read the full post</a>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px" />
    <p style="font-size:12px;color:#9ca3af;line-height:1.5">
      You're receiving this because you subscribed to ${site.name}.<br/>
      <a href="${unsubUrl}" style="color:#9ca3af">Unsubscribe</a>
    </p>
  </div>`;
}

/**
 * Sends a new-post notification to every subscriber.
 * Falls back to logging when RESEND_API_KEY is not configured.
 */
export async function sendNewPostEmails(
  post: Post,
  subscribers: Subscriber[],
): Promise<{ sent: number; skipped: boolean }> {
  if (subscribers.length === 0) return { sent: 0, skipped: false };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || `${site.name} <onboarding@resend.dev>`;

  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY not set. Would notify ${subscribers.length} subscriber(s) about "${post.title}".`,
    );
    return { sent: 0, skipped: true };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  let sent = 0;
  for (const sub of subscribers) {
    try {
      await resend.emails.send({
        from,
        to: sub.email,
        subject: post.title,
        html: postEmailHtml(post, sub),
      });
      sent++;
    } catch (err) {
      console.error(`[email] Failed to send to ${sub.email}:`, err);
    }
  }
  return { sent, skipped: false };
}

export async function sendWelcomeEmail(sub: Subscriber): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] (welcome) ${sub.email} subscribed to ${site.name}.`);
    return;
  }
  const from = process.env.EMAIL_FROM || `${site.name} <onboarding@resend.dev>`;
  const unsubUrl = `${site.url}/api/unsubscribe?token=${sub.unsubToken}`;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: sub.email,
      subject: `You're subscribed to ${site.name}`,
      html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h1 style="font-size:22px;margin:0 0 12px">Thanks for subscribing 🎉</h1>
        <p style="font-size:16px;line-height:1.6;color:#374151">You'll get an email whenever ${site.author} publishes a new post on ${site.name}.</p>
        <p style="font-size:12px;color:#9ca3af;margin-top:24px"><a href="${unsubUrl}" style="color:#9ca3af">Unsubscribe</a></p>
      </div>`,
    });
  } catch (err) {
    console.error(`[email] Failed to send welcome email:`, err);
  }
}
