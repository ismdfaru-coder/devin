import Link from "next/link";
import { site } from "@/lib/site";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-3xl px-6 py-4">
      <ol className="flex items-center gap-2 text-sm text-muted">
        <li>
          <Link href="/" className="hover:text-[var(--accent)]">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-[var(--border)]">/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-[var(--accent)]">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}