export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "InfoThink",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Read, Learn, Change",
  author: process.env.NEXT_PUBLIC_AUTHOR_NAME || "The Author",
  authorBio: process.env.NEXT_PUBLIC_AUTHOR_BIO || "Writer, thinker, and explorer of ideas. Sharing insights on technology, life, and everything in between.",
  authorImage: process.env.NEXT_PUBLIC_AUTHOR_IMAGE || "",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  social: {
    x: process.env.NEXT_PUBLIC_SOCIAL_X || "",
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "",
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "",
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "",
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "",
  },
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const footerLinks = {
  explore: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/#subscribe", label: "Newsletter" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Use" },
  ],
};
