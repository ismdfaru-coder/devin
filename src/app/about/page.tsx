import type { Metadata } from "next";
import SubscribeForm from "@/components/SubscribeForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.author}`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">About</h1>
      <div className="prose mt-8">
        <p>
          Hi, I&apos;m {site.author}. Welcome to {site.name} — my personal space
          to share thoughts, stories, and ideas.
        </p>
        <p>
          This is a single-author publication: every post here is written by me.
          If you&apos;d like to follow along, subscribe below and you&apos;ll get
          new posts delivered to your inbox.
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-bold">Subscribe</h2>
        <p className="mx-auto mt-2 max-w-md text-gray-600">
          Never miss a post.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
}
