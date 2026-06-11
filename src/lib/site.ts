export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "InfoThink",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Read, Learn, Change",
  author: process.env.NEXT_PUBLIC_AUTHOR_NAME || "The Author",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
};
