"use client";

import { useState } from "react";

type Props = {
  url: string;
  title: string;
};

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${enc(`${title} ${url}`)}`,
    },
    {
      name: "Email",
      href: `mailto:?subject=${enc(title)}&body=${enc(url)}`,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-muted">Share:</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:bg-gray-50"
        >
          {l.name}
        </a>
      ))}
      <button
        onClick={copy}
        className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:bg-gray-50"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
