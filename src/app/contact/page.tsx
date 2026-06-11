import type { Metadata } from "next";
import SocialLinks from "@/components/SocialLinks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.author}`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="kicker">Contact</p>
      <h1 className="mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
        Get in touch
      </h1>
      <div className="prose mt-8">
        <p>
          Have a question, a story idea, or just want to say hello? I&apos;d
          love to hear from you.
        </p>
        {site.email ? (
          <p>
            Email me at{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        ) : (
          <p>
            The fastest way to reach me is through the social channels below, or
            by subscribing to the newsletter and replying to any post.
          </p>
        )}
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <h2 className="kicker">Follow</h2>
        <SocialLinks className="mt-4 [&_a]:text-foreground [&_a:hover]:text-[var(--accent)]" />
      </div>
    </div>
  );
}
