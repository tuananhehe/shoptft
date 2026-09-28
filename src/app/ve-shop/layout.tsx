import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Về ShopTFTMobile | Tuấn Thái Bình",
  },
  description: "Giới thiệu ShopTFTMobile, người vận hành, cách hỗ trợ khách hàng và thông tin dịch vụ.",
  alternates: {
    canonical: "https://www.shoptftmobile.net/ve-shop",
  },
  openGraph: {
    title: "Về ShopTFTMobile | Tuấn Thái Bình",
    description: "Giới thiệu ShopTFTMobile, người vận hành, cách hỗ trợ khách hàng và thông tin dịch vụ.",
    url: "https://www.shoptftmobile.net/ve-shop",
    siteName: "ShopTFTMobile",
    locale: "vi_VN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function VeShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
