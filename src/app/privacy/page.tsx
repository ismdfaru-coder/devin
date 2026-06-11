import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles your data`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="kicker">Legal</p>
      <h1 className="mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
        Privacy Policy
      </h1>
      <div className="prose mt-8">
        <p>
          {site.name} respects your privacy. This policy explains what
          information is collected and how it is used.
        </p>
        <h2>What we collect</h2>
        <p>
          If you subscribe to the newsletter, we store the email address you
          provide so we can send you new posts. We do not collect any other
          personal information, and we never sell or share your email with third
          parties.
        </p>
        <h2>How we use it</h2>
        <p>
          Your email address is used solely to deliver a welcome message and
          notifications when new posts are published. Every email includes a
          one-click unsubscribe link.
        </p>
        <h2>Cookies</h2>
        <p>
          The public site does not use tracking cookies. A secure session cookie
          is only set for the author when logging in to the admin area.
        </p>
        <h2>Your choices</h2>
        <p>
          You can unsubscribe at any time using the link in any email. To request
          removal of your data, simply unsubscribe and your address is deleted
          from the list.
        </p>
      </div>
    </div>
  );
}
