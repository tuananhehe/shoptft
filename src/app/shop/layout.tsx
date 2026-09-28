import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Kho Acc TFT | ShopTFTMobile",
  },
  description: "Khám phá kho tài khoản TFT VIP và Clone, tìm theo Pet, Chibi, Sân Đấu, mức giá và trạng thái.",
  alternates: {
    canonical: "https://shoptftmobile.net/shop",
  },
  openGraph: {
    title: "Kho Acc TFT | ShopTFTMobile",
    description: "Khám phá kho tài khoản TFT VIP và Clone, tìm theo Pet, Chibi, Sân Đấu, mức giá và trạng thái.",
    url: "https://shoptftmobile.net/shop",
    siteName: "ShopTFTMobile",
    images: [
      {
        url: "https://shoptftmobile.net/banner-seo.jpg",
        width: 1200,
        height: 630,
        alt: "Kho Acc TFT - ShopTFTMobile",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
