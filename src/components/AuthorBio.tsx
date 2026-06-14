import SocialLinks from "@/components/SocialLinks";
import { site } from "@/lib/site";

export default function AuthorBio() {
  return (
    <div className="mt-12 flex flex-col gap-4 border border-border p-6 sm:flex-row sm:items-center">
      <div className="shrink-0">
        {site.authorImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.authorImage}
            alt={site.author}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black font-display text-2xl uppercase text-white">
            {site.author.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className="kicker">Written by</p>
        <p className="mt-1 font-display text-xl uppercase tracking-tight">
          {site.author}
        </p>
        <p className="mt-2 font-serif text-muted leading-relaxed">
          {site.authorBio}
        </p>
        <SocialLinks className="mt-3" />
      </div>
    </div>
  );
}
