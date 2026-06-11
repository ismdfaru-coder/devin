import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
            <Link href="/" className="text-xl font-bold tracking-tight">
              {site.name}
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
              <Link
                href="/#subscribe"
                className="rounded-full bg-[var(--accent)] px-4 py-1.5 font-medium text-white hover:opacity-90"
              >
                Subscribe
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-5 py-8 text-center text-sm text-muted">
            <p>
              © {new Date().getFullYear()} {site.author}. All rights reserved.
            </p>
            <p>
              Built with Next.js ·{" "}
              <Link href="/login" className="hover:text-foreground">
                Author login
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
