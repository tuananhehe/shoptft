import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  ShieldAlert,
  KeyRound,
  FileText,
  Gamepad2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  BookOpen,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "Hướng Dẫn Dịch Vụ TFT & Riot Games | ShopTFTMobile",
  },
  description:
    "Tổng hợp hướng dẫn đổi thông tin tài khoản Riot Games, bảo mật 2 lớp và quy trình thuê acc TFT an toàn tại ShopTFTMobile - Tuấn Thái Bình TFT.",
  alternates: {
    canonical: "https://www.shoptftmobile.net/huong-dan",
  },
  openGraph: {
    title: "Hướng Dẫn Dịch Vụ TFT & Riot Games | ShopTFTMobile",
    description:
      "Tổng hợp hướng dẫn đổi thông tin tài khoản Riot Games, bảo mật 2 lớp và quy trình thuê acc TFT an toàn tại ShopTFTMobile.",
    url: "https://www.shoptftmobile.net/huong-dan",
    siteName: "ShopTFTMobile",
    images: [
      {
        url: "https://www.shoptftmobile.net/banner-seo.jpg",
        width: 1200,
        height: 630,
        alt: "Hướng Dẫn Dịch Vụ TFT - ShopTFTMobile",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hướng Dẫn Dịch Vụ TFT & Riot Games | ShopTFTMobile",
    description:
      "Tổng hợp hướng dẫn đổi thông tin tài khoản Riot Games, bảo mật 2 lớp và quy trình thuê acc TFT an toàn.",
    images: ["https://www.shoptftmobile.net/banner-seo.jpg"],
  },
};

export default function HuongDanHubPage() {
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
            "name": "Hướng Dẫn Dịch Vụ",
            "item": "https://www.shoptftmobile.net/huong-dan",
          },
        ],
      },
    ],
  };

  const guides = [
    {
      title: "Hướng dẫn đổi thông tin acc Riot an toàn",
      desc: "Chi tiết từng bước đổi mật khẩu, thay đổi email chính chủ và bật xác thực 2FA cho tài khoản Riot Games sau khi nhận acc.",
      link: "/huong-dan/doi-thong-tin-acc-riot",
      badge: "Bảo Mật Riot",
      icon: KeyRound,
      color: "amber",
    },
    {
      title: "Quy trình thuê acc & bàn giao 1-1",
      desc: "Tìm hiểu các bước chọn acc trên website, liên hệ Zalo xác nhận và nhận thông tin đăng nhập trực tiếp từ Tuấn Thái Bình.",
      link: "/thue-acc-tft-dtcl",
      badge: "Dịch Vụ Thuê",
      icon: ShieldCheck,
      color: "emerald",
    },
    {
      title: "Cẩm nang giáo án TFT Mùa 18 & Meta Leo Rank",
      desc: "Khám phá các đội hình mạnh nhất meta hiện tại, cách quản lý kinh tế và hướng dẫn xây dựng đội hình chuẩn Thách Đấu.",
      link: "/blog",
      badge: "Kiến Thức Cờ",
      icon: BookOpen,
      color: "blue",
    },
    {
      title: "Tra cứu & chọn acc theo Linh Thú Tí Nị",
      desc: "Xem toàn bộ kho tài khoản VIP & Clone đang có sẵn, lọc theo tướng Tí Nị, Sân Đấu và mức giá phù hợp với nhu cầu.",
      link: "/shop",
      badge: "Kho Acc",
      icon: Gamepad2,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TFTNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6 sm:mb-8 flex-wrap"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium">Hướng Dẫn Dịch Vụ</span>
        </nav>

        {/* Hero */}
        <section className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-black/80 p-6 sm:p-10 lg:p-12 overflow-hidden mb-12 sm:mb-16">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold tracking-wider text-amber-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cẩm Nang & Tài Liệu Hướng Dẫn</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-white leading-tight">
              Hướng Dẫn Dịch Vụ TFT & Riot Games
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Tổng hợp hướng dẫn bảo mật tài khoản Riot Games, quy trình nhận bàn giao tài khoản ĐTCL 1-1 và các lưu ý an toàn khi trải nghiệm dịch vụ tại ShopTFTMobile.
            </p>
          </div>
        </section>

        {/* Guide Cards Grid */}
        <section className="mb-12 sm:mb-16 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Tài Liệu Hướng Dẫn Chi Tiết
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Chọn nội dung bạn cần hỗ trợ để xem hướng dẫn trực quan từng bước
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((g, idx) => {
              const IconComp = g.icon;
              return (
                <Link
                  key={idx}
                  href={g.link}
                  className="p-6 rounded-2xl bg-zinc-900/80 border border-white/[0.08] hover:border-amber-500/30 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300 font-bold text-xs uppercase tracking-wider">
                        {g.badge}
                      </span>
                      <IconComp className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                      {g.desc}
                    </p>
                  </div>
                  <div className="pt-5 flex items-center gap-2 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>Xem hướng dẫn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Security Notes */}
        <section className="mb-12 sm:mb-16 p-6 sm:p-8 rounded-2xl bg-zinc-900/50 border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>Lưu Ý Bảo Mật Quan Trọng Khi Nhận Acc</span>
          </div>
          <ul className="text-xs sm:text-sm text-zinc-300 space-y-2.5 leading-relaxed pl-1">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong>Kiểm tra Riot ID:</strong> Luôn kiểm tra đúng Riot ID và khu vực máy chủ Việt Nam (VNG) trước khi bắt đầu trận đấu.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong>Không chia sẻ mã xác minh:</strong> ShopTFTMobile tuyệt đối không bao giờ yêu cầu khách hàng gửi mã OTP hay mã xác thực cá nhân.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong>Hỗ trợ trực tiếp:</strong> Khi cần hỗ trợ kỹ thuật hoặc thắc mắc gói thuê, nhắn tin trực tiếp qua Zalo Tuấn Thái Bình ({PROFILE_INFO.phoneZalo}).
              </span>
            </li>
          </ul>
        </section>

        {/* Bottom CTA */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-black border border-white/[0.08] text-center space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Cần Tư Vấn Trực Tiếp Cùng Chủ Shop?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Kết nối Zalo Tuấn Thái Bình để được hỗ trợ kiểm tra tài khoản còn trống và hướng dẫn trải nghiệm.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/shop"
              className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-colors"
            >
              Xem Kho Acc TFT
            </Link>
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold text-xs sm:text-sm hover:bg-blue-600/30 transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span>Nhắn Zalo Tuấn Thái Bình</span>
            </a>
          </div>
        </section>
      </main>

      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
