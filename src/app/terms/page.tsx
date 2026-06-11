import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms for using ${site.name}`,
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="kicker">Legal</p>
      <h1 className="mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
        Terms of Use
      </h1>
      <div className="prose mt-8">
        <p>
          By accessing {site.name}, you agree to these terms. Please read them
          carefully.
        </p>
        <h2>Content</h2>
        <p>
          All articles, images, and other content on this site are created by
          {" "}
          {site.author} unless otherwise noted, and are protected by copyright.
          You may read and share links to posts freely, but you may not
          republish the content in full without permission.
        </p>
        <h2>Acceptable use</h2>
        <p>
          You agree not to misuse the site, attempt to gain unauthorized access,
          or disrupt its normal operation.
        </p>
        <h2>Newsletter</h2>
        <p>
          When you subscribe, you consent to receive emails about new posts. You
          can unsubscribe at any time.
        </p>
        <h2>Disclaimer</h2>
        <p>
          Content is provided for informational purposes only and is offered
          &quot;as is&quot; without warranties of any kind. {site.name} is not
          liable for any decisions made based on the content.
        </p>
        <h2>Changes</h2>
        <p>
          These terms may be updated from time to time. Continued use of the site
          means you accept any revisions.
        </p>
      </div>
    </div>
  );
}
