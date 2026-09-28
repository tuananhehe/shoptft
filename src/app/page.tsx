import React from "react";
import type { Metadata } from "next";
import { HomePageView } from "./home-page-view";

export const metadata: Metadata = {
  title: {
    absolute: "ShopTFTMobile - Kho Acc TFT, Pet, Chibi & Sân Đấu",
  },
  description: "Tìm tài khoản TFT theo Pet, Chibi, Sân Đấu và nhu cầu sử dụng tại ShopTFTMobile. Hỗ trợ trực tiếp và bàn giao qua Zalo.",
  alternates: {
    canonical: "https://shoptftmobile.net",
  },
  openGraph: {
    title: "ShopTFTMobile - Kho Acc TFT, Pet, Chibi & Sân Đấu",
    description: "Tìm tài khoản TFT theo Pet, Chibi, Sân Đấu và nhu cầu sử dụng tại ShopTFTMobile. Hỗ trợ trực tiếp và bàn giao qua Zalo.",
    url: "https://shoptftmobile.net",
    siteName: "ShopTFTMobile",
    images: [
      {
        url: "https://shoptftmobile.net/banner-seo.jpg",
        width: 1200,
        height: 630,
        alt: "ShopTFTMobile - Kho Acc TFT, Pet, Chibi & Sân Đấu",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default function HomePage() {
  return <HomePageView />;
}
