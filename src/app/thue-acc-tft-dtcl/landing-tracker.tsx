"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { analytics } from "@/utils/analytics";

export const LandingViewTracker: React.FC = () => {
  useEffect(() => {
    analytics.trackLandingView();
  }, []);

  return null;
};

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  trackingType: "shop" | "guide" | "zalo";
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export const TrackedLandingLink: React.FC<TrackedLinkProps> = ({
  href,
  trackingType,
  children,
  className,
  target,
  rel,
  onClick,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (trackingType === "shop") {
      analytics.trackLandingToShop(href);
    } else if (trackingType === "guide") {
      analytics.trackLandingToGuide(href);
    } else if (trackingType === "zalo") {
      analytics.trackLandingClickZalo("commercial_landing");
    }
    if (onClick) onClick(e);
  };

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={className}
        target={target}
        rel={rel}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </Link>
  );
};
