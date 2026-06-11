import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-lg font-bold">
            Dashboard
          </Link>
          <Link
            href="/admin/new"
            className="text-sm text-muted hover:text-foreground"
          >
            New post
          </Link>
          <Link
            href="/"
            target="_blank"
            className="text-sm text-muted hover:text-foreground"
          >
            View site ↗
          </Link>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-muted hover:text-foreground"
          >
            Log out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
