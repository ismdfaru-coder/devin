import type { Metadata } from "next";
import SubscribeForm from "@/components/SubscribeForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.author}`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="kicker">About</p>
      <h1 className="mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
        {site.name}
      </h1>
      <div className="prose mt-8">
        <p>
          Hi, I&apos;m {site.author}. Welcome to {site.name} — my corner of the
          web to read, learn, and change. I write about the things I&apos;m
          thinking through, building, and learning.
        </p>
        <p>
          This is a single-author publication: every post here is written by me.
          If you&apos;d like to follow along, subscribe below and you&apos;ll get
          new posts delivered to your inbox.
        </p>
      </div>

      <div className="mt-12 border-y-4 border-black bg-black px-8 py-10 text-center text-white">
        <p className="kicker">Newsletter</p>
        <h2 className="mt-2 font-display text-2xl uppercase tracking-tight">
          Subscribe
        </h2>
        <p className="mx-auto mt-2 max-w-md text-gray-300">
          Never miss a post.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
}
