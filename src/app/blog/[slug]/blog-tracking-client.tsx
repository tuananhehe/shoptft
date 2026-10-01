"use client";

import React, { useEffect } from "react";
import { analytics } from "@/utils/analytics";

interface BlogTrackingClientProps {
  slug: string;
  category: string;
}

export const BlogTrackingClient: React.FC<BlogTrackingClientProps> = ({
  slug,
  category,
}) => {
  useEffect(() => {
    // 1. Track article view
    analytics.trackBlogArticleView(slug, category);

    // 2. Delegate internal link clicks within article
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      const linkText = target.innerText?.trim() || "";

      // Internal link click
      if (href.startsWith("/") || href.includes("shoptftmobile.net")) {
        analytics.trackBlogInternalLinkClick(slug, href, linkText);

        if (href.startsWith("/shop")) {
          analytics.trackBlogToShop(slug, href);
        } else if (href.startsWith("/huong-dan")) {
          analytics.trackBlogToGuide(slug, href);
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [slug, category]);

  return null;
};
