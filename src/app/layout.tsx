import type { Metadata } from "next";
import {
  Archivo,
  Archivo_Black,
  Source_Serif_4,
  Geist_Mono,
} from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { site } from "@/lib/site";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
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
      className={`${archivo.variable} ${archivoBlack.variable} ${sourceSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 bg-black text-white">
          <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3">
            <nav className="flex items-center gap-5 text-[0.7rem] font-bold uppercase tracking-[0.18em]">
              <Link href="/" className="hover:text-[var(--accent)]">
                Home
              </Link>
              <Link href="/about" className="hover:text-[var(--accent)]">
                About
              </Link>
            </nav>
            <Link
              href="/"
              className="text-center font-display text-2xl uppercase leading-none tracking-tight sm:text-3xl"
            >
              {site.name}
            </Link>
            <div className="flex justify-end">
              <Link
                href="/#subscribe"
                className="bg-[var(--accent)] px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white hover:opacity-90"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 border-t-4 border-black bg-black text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-12 text-center">
            <Link
              href="/"
              className="font-display text-3xl uppercase tracking-tight"
            >
              {site.name}
            </Link>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gray-400">
              {site.description}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              © {new Date().getFullYear()} {site.author}. All rights reserved. ·{" "}
              <Link href="/login" className="hover:text-white">
                Author login
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
