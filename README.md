# My Blog — a personal, single-author publication

A self-hosted blog in the spirit of Medium / Blogspot, but **single-author**:
only you (the site owner) can write and publish posts. Visitors can read posts,
**subscribe by email**, and **share posts on social media**.

Built with Next.js (App Router) + TypeScript + Tailwind CSS + Prisma.

## Features

- **Public blog** — clean, Medium-style reading layout with a home feed, About
  page, and per-post pages (`/posts/[slug]`).
- **Author-only admin** — password-protected `/admin` dashboard to create, edit,
  publish/unpublish, and delete posts. Includes a Markdown editor with live
  preview. No public sign-up — you are the only author.
- **Email subscriptions** — readers subscribe with their email. When you publish
  a new post, every subscriber is emailed a notification with a link to read it.
  Each email includes a one-click unsubscribe link.
- **Social sharing** — share buttons on every post (X/Twitter, Facebook,
  LinkedIn, WhatsApp, email, copy link), plus Open Graph / Twitter Card metadata.

## Tech stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Next.js 16 (App Router, Server Actions) |
| Language       | TypeScript                              |
| Styling        | Tailwind CSS v4                         |
| Database / ORM | SQLite + Prisma (swap to Postgres easily) |
| Email          | [Resend](https://resend.com) (optional) |
| Auth           | Signed session cookie (single admin)    |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy and edit)
cp .env.example .env
#   - set ADMIN_PASSWORD (your login password)
#   - set AUTH_SECRET (a long random string)
#   - set NEXT_PUBLIC_SITE_NAME / AUTHOR_NAME / SITE_URL for branding
#   - (optional) set RESEND_API_KEY + EMAIL_FROM to actually send emails

# 3. Create the database
npm run db:migrate      # applies migrations
npm run db:seed         # optional: adds sample posts

# 4. Run it
npm run dev             # http://localhost:3000
```

Log in to write posts at **/login** using `ADMIN_PASSWORD`, then go to
**/admin**.

## Environment variables

See `.env.example`. Key ones:

- `DATABASE_URL` — database connection (SQLite by default).
- `ADMIN_PASSWORD` — the password you log in with. For production prefer
  `ADMIN_PASSWORD_HASH` (a bcrypt hash) and leave `ADMIN_PASSWORD` unset.
- `AUTH_SECRET` — secret used to sign the session cookie. Use a long random
  string.
- `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_DESCRIPTION`,
  `NEXT_PUBLIC_AUTHOR_NAME`, `NEXT_PUBLIC_SITE_URL` — branding.
- `RESEND_API_KEY`, `EMAIL_FROM` — email delivery. **Without these, new-post
  notifications are logged to the server console instead of being emailed**, so
  the app still works end-to-end in development.

## Email notifications

When a post transitions to published for the first time, all subscribers are
emailed. Subscribing also sends a welcome email. Configure a verified sending
domain in Resend and set `EMAIL_FROM` accordingly (the default
`onboarding@resend.dev` is for testing only).

## Deploying

This deploys well on any Node host (Vercel, Railway, Render, Fly, a VPS, etc.).

- For SQLite you need a persistent disk; on serverless platforms like Vercel,
  switch `datasource db { provider = "postgresql" }` in `prisma/schema.prisma`
  and point `DATABASE_URL` at a hosted Postgres (e.g. Neon, Supabase).
- Run `npm run db:deploy` to apply migrations in production.
- Set all environment variables in your host's dashboard.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — lint
- `npm run db:migrate` / `db:deploy` / `db:seed` / `db:studio` — database tasks
