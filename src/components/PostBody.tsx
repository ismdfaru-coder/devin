import { sanitizePostHtml } from "@/lib/html";

export default function PostBody({ html }: { html: string }) {
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: sanitizePostHtml(html) }}
    />
  );
}
