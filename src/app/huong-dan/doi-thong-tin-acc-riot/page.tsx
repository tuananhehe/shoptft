import React from "react";
import type { Metadata } from "next";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { GuideRiotClientView } from "./guide-riot-client-view";

export const metadata: Metadata = {
  title: {
    absolute: "Hướng Dẫn Đổi Thông Tin Acc Riot An Toàn | ShopTFTMobile",
  },
  description:
    "Hướng dẫn chi tiết cách đổi mật khẩu, email và thông tin tài khoản Riot sau khi nhận acc tại ShopTFTMobile. Hướng dẫn trực quan từng bước, bảo mật tuyệt đối.",
  alternates: {
    canonical: "https://www.shoptftmobile.net/huong-dan/doi-thong-tin-acc-riot",
  },
  openGraph: {
    title: "Hướng Dẫn Đổi Thông Tin Acc Riot An Toàn | ShopTFTMobile",
    description:
      "Hướng dẫn chi tiết cách đổi mật khẩu, email và thông tin tài khoản Riot sau khi nhận acc tại ShopTFTMobile. Hướng dẫn trực quan từng bước, bảo mật tuyệt đối.",
    url: "https://www.shoptftmobile.net/huong-dan/doi-thong-tin-acc-riot",
    siteName: "ShopTFTMobile",
    locale: "vi_VN",
    type: "article",
    images: [
      {
        url: "https://www.shoptftmobile.net/banner-seo.jpg",
        width: 1200,
        height: 630,
        alt: "Hướng Dẫn Đổi Thông Tin Acc Riot An Toàn ShopTFTMobile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hướng dẫn đổi thông tin acc Riot | ShopTFTMobile",
    description:
      "Hướng dẫn chi tiết cách đổi mật khẩu, email và thông tin tài khoản Riot sau khi nhận acc tại ShopTFTMobile.",
    images: ["https://www.shoptftmobile.net/banner-seo.jpg"],
  },
};

export default function GuideRiotPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Trang chủ",
            "item": "https://www.shoptftmobile.net",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Hướng Dẫn",
            "item": "https://www.shoptftmobile.net/huong-dan",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Hướng Dẫn Đổi Thông Tin Acc Riot",
            "item": "https://www.shoptftmobile.net/huong-dan/doi-thong-tin-acc-riot",
          },
        ],
      },
      {
        "@type": "HowTo",
        "name": "Hướng dẫn đổi thông tin tài khoản Riot Games",
        "description": "Cách đổi mật khẩu, email chính chủ và bật bảo mật 2 lớp cho tài khoản Riot Games.",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Đăng nhập tài khoản Riot Games",
            "text": "Truy cập account.riotgames.com và đăng nhập với thông tin tài khoản do Shop cấp.",
            "url": "https://www.shoptftmobile.net/huong-dan/doi-thong-tin-acc-riot#buoc-1-dang-nhap"
          },
          {
            "@type": "HowToStep",
            "name": "Đổi Email chính chủ",
            "text": "Nhập địa chỉ Email cá nhân của bạn, bấm Lưu & Xác minh, sau đó mở hòm thư bấm Verify Email.",
            "url": "https://www.shoptftmobile.net/huong-dan/doi-thong-tin-acc-riot#buoc-2-doi-email"
          },
          {
            "@type": "HowToStep",
            "name": "Đổi mật khẩu mới",
            "text": "Nhập mật khẩu hiện tại và tạo mật khẩu mới an toàn, sau đó bấm Lưu thay đổi.",
            "url": "https://www.shoptftmobile.net/huong-dan/doi-thong-tin-acc-riot#buoc-3-doi-mat-khau"
          },
          {
            "@type": "HowToStep",
            "name": "Kiểm tra Quản lý tài khoản",
            "text": "Vào phần cài đặt Riot Account để kiểm tra thông tin và đổi Riot ID miễn phí.",
            "url": "https://www.shoptftmobile.net/huong-dan/doi-thong-tin-acc-riot#buoc-4-cai-dat-tai-khoan"
          },
          {
            "@type": "HowToStep",
            "name": "Bật xác thực 2 lớp 2FA",
            "text": "Kích hoạt bảo vệ hai yếu tố để nhận mã OTP về email mỗi khi đăng nhập thiết bị mới.",
            "url": "https://www.shoptftmobile.net/huong-dan/doi-thong-tin-acc-riot#buoc-5-kiem-tra-bao-mat"
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#09090b] text-white selection:bg-white selection:text-black flex flex-col justify-between relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TFTNavbar />
      <GuideRiotClientView />
      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
