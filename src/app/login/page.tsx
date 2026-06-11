import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Author login",
  robots: { index: false },
};

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <div className="mx-auto flex max-w-sm flex-col px-5 py-20">
      <h1 className="text-2xl font-bold">Author login</h1>
      <p className="mt-2 text-sm text-muted">
        This area is for the site author only.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  );
}
