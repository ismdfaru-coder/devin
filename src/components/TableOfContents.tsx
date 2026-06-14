"use client";

import { useEffect, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

export default function TableOfContents({ html }: { html: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const elements = tempDiv.querySelectorAll("h2, h3");
    const found: Heading[] = [];

    elements.forEach((el, i) => {
      const text = el.textContent || "";
      if (!el.id) {
        el.id = `heading-${i}`;
      }
      found.push({
        id: el.id,
        text,
        level: parseInt(el.tagName.replace("H", "")),
      });
    });

    setHeadings(found);
  }, [html]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <nav className="mb-8 border border-border p-4">
      <p className="kicker mb-3">Table of Contents</p>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li
            key={id}
            style={{ paddingLeft: level === 3 ? "1rem" : "0" }}
          >
            <a
              href={`#${id}`}
              className={`block text-sm transition-colors ${
                activeId === id
                  ? "text-[var(--accent)] font-medium"
                  : "text-muted hover:text-[var(--accent)]"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}