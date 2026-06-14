import { site } from "@/lib/site";

export type AdType = "banner" | "rectangle" | "sidebar" | "in-article";

export interface AdConfig {
  enabled: boolean;
  adClient?: string;      // e.g., "ca-pub-xxxxx" for Google AdSense
  adSlot?: string;        // The ad unit ID
  customCode?: string;    // Custom HTML/JS for other ad networks
}

export const ads = {
  header: {
    enabled: process.env.NEXT_PUBLIC_AD_HEADER_ENABLED === "true",
    adClient: process.env.NEXT_PUBLIC_AD_HEADER_CLIENT || "",
    adSlot: process.env.NEXT_PUBLIC_AD_HEADER_SLOT || "",
  } as AdConfig,
  
  inArticle: {
    enabled: process.env.NEXT_PUBLIC_AD_INARTICLE_ENABLED === "true",
    adClient: process.env.NEXT_PUBLIC_AD_INARTICLE_CLIENT || "",
    adSlot: process.env.NEXT_PUBLIC_AD_INARTICLE_SLOT || "",
    afterParagraph: parseInt(process.env.NEXT_PUBLIC_AD_INARTICLE_AFTER || "3"),
  } as AdConfig & { afterParagraph: number },
  
  footer: {
    enabled: process.env.NEXT_PUBLIC_AD_FOOTER_ENABLED === "true",
    adClient: process.env.NEXT_PUBLIC_AD_FOOTER_CLIENT || "",
    adSlot: process.env.NEXT_PUBLIC_AD_FOOTER_SLOT || "",
  } as AdConfig,
  
  sidebar: {
    enabled: process.env.NEXT_PUBLIC_AD_SIDEBAR_ENABLED === "true",
    adClient: process.env.NEXT_PUBLIC_AD_SIDEBAR_CLIENT || "",
    adSlot: process.env.NEXT_PUBLIC_AD_SIDEBAR_SLOT || "",
  } as AdConfig,
};

export const siteUrl = site.url;
