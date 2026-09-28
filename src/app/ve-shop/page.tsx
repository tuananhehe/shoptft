import React from "react";
import type { Metadata } from "next";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTAbout } from "@/components/tft-about";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";

export const metadata: Metadata = {
  title: "Về ShopTFTMobile | Tuấn Thái Bình",
  description:
    "Giới thiệu ShopTFTMobile, người vận hành, cách hỗ trợ khách hàng và thông tin dịch vụ.",
  alternates: {
    canonical: "https://www.shoptftmobile.net/ve-shop",
  },
  openGraph: {
    title: "Về ShopTFTMobile | Tuấn Thái Bình",
    description:
      "Giới thiệu ShopTFTMobile, người vận hành, cách hỗ trợ khách hàng và thông tin dịch vụ.",
    url: "https://www.shoptftmobile.net/ve-shop",
    siteName: "ShopTFTMobile",
    locale: "vi_VN",
    type: "website",
  },
};

export default function VeShopPage() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#09090b] text-white selection:bg-white selection:text-black flex flex-col justify-between relative">
      <TFTNavbar />
      <TFTAbout />
      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
