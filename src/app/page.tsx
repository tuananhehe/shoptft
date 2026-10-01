import React from "react";
import type { Metadata } from "next";
import { HomePageView } from "./home-page-view";
import { getNewestVipAccountsServer } from "@/utils/supabase/accounts-service";
import { getSeoConfig } from "@/utils/seo-service";
import { getBlogPosts } from "@/utils/blog-service";

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSeoConfig();
  const pageSeo = seoConfig.pages["/"] || {
    title: "Thuê Acc TFT - ĐTCL | Pet, Chibi & Sân Đấu | ShopTFTMobile",
    description:
      "Thuê acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP hoặc Clone. Xem trạng thái acc, giá thuê và thông tin rõ ràng tại ShopTFTMobile, hỗ trợ trực tiếp qua Zalo.",
    canonical: "https://www.shoptftmobile.net/",
  };

  const canonicalUrl = pageSeo.canonical || "https://www.shoptftmobile.net/";
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
    twitter: {
      card: "summary_large_image",
      title: pageSeo.ogTitle || pageSeo.title,
      description: pageSeo.ogDescription || pageSeo.description,
      images: [ogImg.startsWith("http") ? ogImg : `${seoConfig.global.canonicalOrigin}${ogImg}`],
    },
    robots: pageSeo.robots || { index: true, follow: true },
  };
}

const homeFaqs = [
  {
    q: "Thuê acc TFT như thế nào?",
    a: "Bạn chỉ cần duyệt kho acc trên website, chọn tài khoản ưng ý theo Linh Thú hoặc Sân Đấu và bấm liên hệ Zalo. Chủ shop Tuấn Thái Bình sẽ tư vấn trực tiếp, xác nhận gói thuê và hướng dẫn bạn giao dịch.",
  },
  {
    q: "VIP và Clone khác nhau ra sao?",
    a: "Acc VIP là dòng tài khoản cao cấp sở hữu nhiều tướng Tí Nị Thần Thoại đồ hiệu, hiệu ứng kết liễu và Sân Đấu đổi nhạc EDM độc quyền dành cho anh em thích trải nghiệm. Acc Clone là tài khoản phụ giá tốt, rank sạch sẽ, phù hợp cho nhu cầu duo leo rank cùng bạn bè hoặc test giáo án mới.",
  },
  {
    q: "Acc đang thuê có chọn được không?",
    a: "Khi tài khoản hiển thị nhãn 'ĐANG THUÊ', bạn có thể xem thời gian hết hạn dự kiến và nhắn Zalo để đặt lịch trước, hoặc duyệt các tài khoản tương tự đang hiển thị 'CÒN ACC' có sẵn trong kho.",
  },
  {
    q: "Bàn giao tài khoản bằng cách nào?",
    a: "Sau khi thống nhất gói thuê, chủ shop Tuấn Thái Bình sẽ trực tiếp bàn giao thông tin đăng nhập Riot ID qua tin nhắn Zalo 1-1 và đồng hành hướng dẫn bạn đăng nhập an toàn vào game trên cả PC lẫn điện thoại (TFT Mobile).",
  },
  {
    q: "Có hướng dẫn đổi thông tin Riot không?",
    a: "Có. Đối với các gói thuê dài hạn hoặc tài khoản có hỗ trợ đổi thông tin, shop có bài viết hướng dẫn chi tiết từng bước đổi mật khẩu, email và bật bảo mật 2FA tại Hướng dẫn đổi thông tin Riot hoặc xem trang tổng hợp Hướng Dẫn Dịch Vụ.",
  },
  {
    q: "Khi cần hỗ trợ liên hệ ở đâu?",
    a: "ShopTFTMobile hỗ trợ trực tiếp 1-1 qua số Hotline & Zalo chính thức: 0352.867.283. Bạn có thể nhắn tin cho Tuấn Thái Bình để được tư vấn bất kỳ lúc nào.",
  },
];

export default async function HomePage() {
  const [initialNewAccounts, publishedPosts] = await Promise.all([
    getNewestVipAccountsServer(4),
    getBlogPosts({ status: "published" }),
  ]);

  const recentBlogPosts = publishedPosts.slice(0, 3);

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
      <HomePageView
        initialNewAccounts={initialNewAccounts}
        initialBlogPosts={recentBlogPosts}
      />
    </>
  );
}
