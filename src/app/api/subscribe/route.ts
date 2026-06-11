import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    const body = await request.json();
    email = body?.email;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const normalized = email.trim().toLowerCase();

  const existing = await prisma.subscriber.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    return NextResponse.json({ message: "You're already subscribed!" });
  }

  const subscriber = await prisma.subscriber.create({
    data: { email: normalized },
  });

  const latestPost = await prisma.post.findFirst({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true, excerpt: true },
  });

  await sendWelcomeEmail(subscriber, latestPost);

  return NextResponse.json({ message: "You're subscribed! 🎉" });
}
