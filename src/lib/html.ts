import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "hr",
  "span",
  "div",
  "iframe",
];

const ALLOWED_IFRAME_HOSTNAMES = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
];

/**
 * Sanitizes post HTML produced by the editor (or pasted) before rendering.
 * The author is trusted, but we still strip scripts/styles/unknown attributes
 * so a bad paste can never inject markup that breaks the page.
 */
export function sanitizePostHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "class"],
      iframe: [
        "src",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "frameborder",
        "title",
        "class",
      ],
      div: ["class", "data-youtube-video"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
    allowIframeRelativeUrls: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer nofollow",
        },
      }),
    },
  });
}

/** Strips all HTML, returning collapsed plain text. */
export function htmlToText(html: string): string {
  const text = sanitizeHtmlLib(html, { allowedTags: [], allowedAttributes: {} });
  return text.replace(/\s+/g, " ").trim();
}
