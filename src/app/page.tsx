import React from "react";
import type { Metadata } from "next";
import { HomePageView } from "./home-page-view";
import { getNewestVipAccountsServer } from "@/utils/supabase/accounts-service";
import { getSeoConfig } from "@/utils/seo-service";

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSeoConfig();
  const pageSeo = seoConfig.pages["/"] || {
    title: "Thuê Acc TFT - ĐTCL | ShopTFTMobile - Tuấn Thái Bình TFT",
    description:
      "Tìm acc TFT/ĐTCL theo Pet, Chibi và Sân Đấu tại ShopTFTMobile. Xem kho acc và liên hệ Tuấn Thái Bình TFT để được hỗ trợ trực tiếp.",
    canonical: "https://www.shoptftmobile.net",
  };

  const canonicalUrl = pageSeo.canonical || seoConfig.global.canonicalOrigin || "https://www.shoptftmobile.net";
  const ogImg = pageSeo.ogImage || seoConfig.global.defaultOgImage || "/banner-seo.jpg";

  return {
    title: {
      absolute: pageSeo.title,
    },
    description: pageSeo.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageSeo.ogTitle || pageSeo.title,
      description: pageSeo.ogDescription || pageSeo.description,
      url: canonicalUrl,
      siteName: seoConfig.global.siteName || "ShopTFTMobile",
      images: [
        {
          url: ogImg.startsWith("http") ? ogImg : `${seoConfig.global.canonicalOrigin}${ogImg}`,
          width: 1200,
          height: 630,
          alt: "ShopTFTMobile - Tuấn Thái Bình TFT",
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    robots: pageSeo.robots || { index: true, follow: true },
  };
}

const homeFaqs = [
  {
    q: "Thuê acc như thế nào?",
    a: "Bạn chỉ cần duyệt kho acc trên website, chọn tài khoản ưng ý và bấm 'Thuê qua Zalo'. Admin sẽ trao đổi, xác nhận gói thuê và hướng dẫn bạn giao dịch trực tiếp.",
  },
  {
    q: "Nhận acc bằng cách nào?",
    a: "Sau khi thống nhất gói thuê, ShopTFTMobile sẽ bàn giao thông tin đăng nhập trực tiếp qua tin nhắn Zalo và đồng hành hướng dẫn bạn đăng nhập an toàn vào game.",
  },
  {
    q: "Acc đang thuê có chọn được không?",
    a: "Khi tài khoản hiển thị nhãn 'ĐANG THUÊ', bạn có thể xem thời gian hết hạn dự kiến và nhắn Zalo để đặt trước, hoặc duyệt các tài khoản tương tự đang 'CÒN ACC' có sẵn trong kho.",
  },
  {
    q: "Bảo hiểm giao dịch 30M là gì?",
    a: "ShopTFTMobile ký quỹ bảo hiểm 30.000.000đ được xác minh minh bạch trên hệ thống Checkscam.vn, đảm bảo uy tín và quyền lợi tuyệt đối cho khách hàng trong suốt thời gian sử dụng dịch vụ.",
  },
  {
    q: "Member (tài khoản thành viên) dùng để làm gì?",
    a: "Tài khoản thành viên được shop cấp riêng cho khách hàng thân thiết để tích lũy cấp bậc VIP, nhận chiết khấu tự động và lưu thông tin chăm sóc khách hàng. Website không mở đăng ký công khai.",
  },
  {
    q: "Liên hệ hỗ trợ ở đâu?",
    a: "ShopTFTMobile hỗ trợ 1-1 trực tiếp qua số Hotline & Zalo chính thức: 0352.867.283. Bạn có thể nhắn tin để được tư vấn bất kỳ lúc nào.",
  },
];

export default async function HomePage() {
  const initialNewAccounts = await getNewestVipAccountsServer(4);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://www.shoptftmobile.net/#faq",
    mainEntity: homeFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePageView initialNewAccounts={initialNewAccounts} />
    </>
  );
}
