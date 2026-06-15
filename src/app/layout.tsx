import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { site, footerLinks } from "@/lib/site";
import SocialLinks from "@/components/SocialLinks";
import { categories } from "@/lib/categories";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: {
    types: {
      "application/rss+xml": `${site.url}/rss.xml`,
    },
  },
  openGraph: {
    title: site.name,
    description: site.description,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 bg-black text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-4">
              <MobileMenu />
              <Link
                href="/"
                className="font-display text-2xl uppercase leading-none tracking-tight sm:text-3xl"
              >
                {site.name}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/search"
                aria-label="Search"
                className="hover:text-[var(--accent)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
                </svg>
              </Link>
              <Link
                href="/#subscribe"
                className="bg-[var(--accent)] px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white hover:opacity-90"
              >
                Subscribe
              </Link>
            </div>
          </div>
          <nav className="border-t border-white/15 hidden lg:block">
            <div className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-6 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link href="/" className="shrink-0 hover:text-[var(--accent)]">
                Latest
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="shrink-0 whitespace-nowrap text-gray-300 hover:text-[var(--accent)]"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 border-t-4 border-black bg-black text-white">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-1">
                <Link
                  href="/"
                  className="font-display text-3xl uppercase tracking-tight"
                >
                  {site.name}
                </Link>
                <p className="mt-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {site.description}
                </p>
                <SocialLinks className="mt-5" />
              </div>

              <div>
                <h3 className="kicker text-gray-400">Sections</h3>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/category/${c.slug}`}
                        className="hover:text-white"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="kicker text-gray-400">Explore</h3>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  {footerLinks.explore.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="kicker text-gray-400">Legal</h3>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  {footerLinks.legal.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="kicker text-gray-400">Newsletter</h3>
                <p className="mt-4 text-sm text-gray-300">
                  Get new posts in your inbox.
                </p>
                <Link
                  href="/#subscribe"
                  className="mt-4 inline-block bg-[var(--accent)] px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white hover:opacity-90"
                >
                  Subscribe
                </Link>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/15 pt-6 text-xs text-gray-500 sm:flex-row">
              <p>
                © {new Date().getFullYear()} {site.author}. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="/rss.xml" className="hover:text-white">
                  RSS
                </a>
                <Link href="/login" className="hover:text-white">
                  Author login
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
