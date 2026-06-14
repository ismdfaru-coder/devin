"use client";

import { useEffect } from "react";
import { AdConfig } from "@/lib/ads";

type Props = {
  config: AdConfig;
  type?: "banner" | "rectangle" | "in-article";
  className?: string;
};

export default function Ad({ config, type = "banner", className = "" }: Props) {
  useEffect(() => {
    if (config.adClient && typeof window !== "undefined" && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("Ad error:", e);
      }
    }
  }, [config]);

  if (!config.enabled || !config.adClient) return null;

  const sizeMap = {
    banner: "728x90",
    rectangle: "300x250",
    "in-article": "300x250",
  };

  return (
    <div className={`my-6 flex justify-center ${className}`}>
      <div className="flex items-center justify-center overflow-hidden rounded-lg border border-border bg-gray-50 p-2 text-center text-xs text-muted">
        {config.adClient && config.adSlot ? (
          <ins
            className="adsbygoogle"
            style={{
              display: "block",
              width: type === "banner" ? "728px" : "300px",
              height: type === "banner" ? "90px" : "250px",
            }}
            data-ad-client={config.adClient}
            data-ad-slot={config.adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : config.customCode ? (
          <div dangerouslySetInnerHTML={{ __html: config.customCode }} />
        ) : (
          <span>Advertisement</span>
        )}
      </div>
    </div>
  );
}

// TypeScript declaration for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}
