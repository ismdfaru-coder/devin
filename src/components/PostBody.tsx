import { sanitizePostHtml } from "@/lib/html";

export default function PostBody({ html }: { html: string }) {
  const sanitized = sanitizePostHtml(html);
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
