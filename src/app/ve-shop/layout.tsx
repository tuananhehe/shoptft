import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Về ShopTFTMobile | Tuấn Thái Bình",
  },
  description: "Giới thiệu hệ thống ShopTFTMobile - Nền tảng duyệt và thuê tài khoản ĐTCL uy tín, bảo hiểm 30M Checkscam bởi cựu Thách Đấu Tuấn Thái Bình.",
  alternates: {
    canonical: "https://shoptftmobile.net/ve-shop",
  },
  openGraph: {
    title: "Về ShopTFTMobile | Tuấn Thái Bình",
    description: "Giới thiệu hệ thống ShopTFTMobile - Nền tảng duyệt và thuê tài khoản ĐTCL uy tín, bảo hiểm 30M Checkscam bởi cựu Thách Đấu Tuấn Thái Bình.",
    url: "https://shoptftmobile.net/ve-shop",
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
