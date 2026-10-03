import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { PROFILE_INFO } from "@/data/tft-data";
import { getSeoConfig } from "@/utils/seo-service";
import { getNewestVipAccountsServer } from "@/utils/shop-inventory-service";
import { LandingViewTracker, TrackedLandingLink } from "./landing-tracker";

// Bật on-demand ISR cho Landing page trên Vercel với 60s fallback TTL
export const revalidate = 60;
import {
  ShieldCheck,
  Sparkles,
  Gamepad2,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Trophy,
  Layers,
  Crown,
  Clock,
  ExternalLink,
  Award,
  Zap,
  Tag,
  AlertCircle,
  KeyRound,
  Coins,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSeoConfig();
  const pageSeo = seoConfig.pages["/thue-acc-tft-dtcl"] || {
    title: "Thuê Acc TFT - ĐTCL Uy Tín: Pet, Chibi & Sân Đấu | ShopTFTMobile",
    description:
      "Dịch vụ cho thuê acc TFT/ĐTCL theo Pet, Chibi, Sân Đấu, VIP hoặc Clone tại ShopTFTMobile. Bảng giá minh bạch, giao nhận tức thì, hỗ trợ trực tiếp 1-1 qua Zalo Tuấn Thái Bình.",
    canonical: "https://www.shoptftmobile.net/thue-acc-tft-dtcl",
  };

  const canonicalUrl = pageSeo.canonical || "https://www.shoptftmobile.net/thue-acc-tft-dtcl";
  const ogImg = pageSeo.ogImage || seoConfig.global.defaultOgImage || "/banner-seo.jpg";
  const absOgImage = ogImg.startsWith("http") ? ogImg : `https://www.shoptftmobile.net${ogImg.startsWith("/") ? "" : "/"}${ogImg}`;

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
          url: absOgImage,
          width: 1200,
          height: 630,
          alt: "Thuê Acc TFT - ĐTCL ShopTFTMobile Tuấn Thái Bình",
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageSeo.ogTitle || pageSeo.title,
      description: pageSeo.ogDescription || pageSeo.description,
      images: [absOgImage],
    },
    robots: pageSeo.robots || { index: true, follow: true },
  };
}

const faqs = [
  {
    q: "Thuê acc TFT như thế nào?",
    a: "Bạn chỉ cần truy cập Kho Acc trên website, chọn tài khoản ưng ý theo Linh Thú Tí Nị hoặc Sân Đấu, xem trạng thái 'CÒN ACC' và nhấn nhắn tin Zalo Tuấn Thái Bình (0352.867.283). Chủ shop sẽ xác nhận, thống nhất gói thuê và trực tiếp bàn giao thông tin đăng nhập 1-1.",
  },
  {
    q: "VIP và Clone khác nhau gì?",
    a: "Acc VIP là dòng tài khoản đồ hiệu cao cấp sở hữu nhiều tướng Tí Nị Thần Thoại đắt giá và Sân Đấu đổi nhạc EDM độc quyền dành cho anh em thích trải nghiệm thị giác. Acc Clone là dòng tài khoản phụ giá sinh viên, có sẵn mốc rank sạch sẽ, phù hợp để duo cùng bạn bè hoặc test giáo án mới mà không ảnh hưởng rank nick chính.",
  },
  {
    q: "Acc đang thuê có thuê tiếp được không?",
    a: "Khi tài khoản hiển thị nhãn 'ĐANG THUÊ', tài khoản đó đang có khách trải nghiệm. Bạn có thể xem thời gian hết hạn dự kiến để nhắn Zalo đặt lịch trước, hoặc duyệt các tài khoản tương tự đang hiển thị 'CÒN ACC' có sẵn trong kho.",
  },
  {
    q: "Có thể tìm acc theo Pet/Chibi không?",
    a: "Có. Bạn có thể bấm vào bộ lọc Pet/Chibi tại /shop?focus=pet hoặc nhập trực tiếp tên Linh Thú mong muốn (như Ahri, Yasuo, Gwen, Lee Sin...) vào thanh tìm kiếm trên trang chủ hoặc kho acc.",
  },
  {
    q: "Có thể tìm theo Sân Đấu không?",
    a: "Có. Shop hỗ trợ bộ lọc chuyên biệt cho Sân Đấu tại /shop?focus=arena giúp bạn nhanh chóng tìm ra các tài khoản có Sân Đấu Thần Thoại đổi nhạc EDM hoặc biến đổi hoạt ảnh sàn đấu độc quyền.",
  },
  {
    q: "Bàn giao acc bằng cách nào?",
    a: "Sau khi thống nhất gói thuê, chủ shop Tuấn Thái Bình sẽ trực tiếp bàn giao thông tin đăng nhập Riot ID qua tin nhắn Zalo 1-1 và đồng hành hướng dẫn bạn đăng nhập an toàn vào game trên cả PC (client LMHT) lẫn điện thoại (TFT Mobile).",
  },
  {
    q: "Khi gặp lỗi cần liên hệ đâu?",
    a: "Bạn nhắn tin trực tiếp qua Hotline & Zalo chính thức của shop: 0352.867.283. Tuấn Thái Bình trực tiếp bảo hành và giải quyết kỹ thuật 1-1 nhanh chóng trong suốt thời gian bạn sử dụng tài khoản.",
  },
];

export default async function ThueAccTftLandingPage() {
  const recentAccounts = await getNewestVipAccountsServer(4);

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
            "name": "Thuê Acc TFT - ĐTCL",
            "item": "https://www.shoptftmobile.net/thue-acc-tft-dtcl",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.shoptftmobile.net/thue-acc-tft-dtcl#faq",
        "mainEntity": faqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      <LandingViewTracker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TFTNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16">
        {/* Breadcrumb (Semantic Navigation) */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-zinc-400 flex-wrap"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium">Thuê Acc TFT - ĐTCL</span>
        </nav>

        {/* 1. Hero Section (Compact & Purposeful) */}
        <section className="relative rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#121214] p-6 sm:p-8 lg:p-10 overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] sm:text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span>DỊCH VỤ THUÊ ACC TFT & ĐTCL // TUẤN THÁI BÌNH</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-white leading-tight">
              Thuê Acc TFT - ĐTCL Theo Đúng Nhu Cầu
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal max-w-2xl">
              Tìm acc theo Pet, Chibi, Sân Đấu, loại VIP/Clone và mức giá phù hợp.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <TrackedLandingLink
                href="/shop"
                trackingType="shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <Gamepad2 className="w-4 h-4 text-zinc-950" />
                <span>Xem Kho Acc</span>
                <ArrowRight className="w-4 h-4" />
              </TrackedLandingLink>

              <TrackedLandingLink
                href="/huong-dan"
                trackingType="guide"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 font-medium text-xs sm:text-sm transition-colors"
              >
                <span>Hướng Dẫn</span>
              </TrackedLandingLink>

              <TrackedLandingLink
                href={PROFILE_INFO.zaloUrl}
                trackingType="zalo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs sm:text-sm transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zalo ({PROFILE_INFO.phoneZalo})</span>
              </TrackedLandingLink>
            </div>

            {/* Truthful Trust Strip */}
            <div className="pt-4 mt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-zinc-400 font-normal">
              <span className="inline-flex items-center gap-1 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Bảo hiểm 30M</span>
                <a
                  href={PROFILE_INFO.checkscamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[11px] text-zinc-400 hover:text-white ml-0.5"
                >
                  (Xác minh)
                </a>
              </span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span>Hỗ trợ trực tiếp 1-1</span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span>Bàn giao qua Zalo</span>
            </div>
          </div>
        </section>

        {/* 2. Chọn Acc Theo Nhu Cầu */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              TIÊU CHÍ TÌM KIẾM
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-white">
              Chọn Acc TFT Theo Pet, Chibi & Sân Đấu
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Hệ thống phân loại kho tài khoản rõ ràng giúp bạn dễ dàng chọn đúng acc theo sở thích trải nghiệm hoặc ngân sách cá nhân.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Focus 1: Pet / Chibi */}
            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] flex flex-col justify-between hover:border-white/15 transition-colors">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 font-mono">Tí Nị Thần Thoại</span>
                </div>
                <h3 className="font-heading font-semibold text-base text-white">Pet & Chibi Yêu Thích</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Lọc acc sở hữu các Linh Thú Tí Nị Thần Thoại đồ hiệu (Ahri, Yasuo, Gwen, Lee Sin, Aatrox...) với hoạt ảnh kết liễu độc quyền.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <TrackedLandingLink
                  href="/shop?focus=pet"
                  trackingType="shop"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-zinc-300 transition-colors"
                >
                  <span>Duyệt theo Pet/Chibi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </TrackedLandingLink>
              </div>
            </div>

            {/* Focus 2: Sân Đấu */}
            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] flex flex-col justify-between hover:border-white/15 transition-colors">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 font-mono">Sàn Đấu EDM</span>
                </div>
                <h3 className="font-heading font-semibold text-base text-white">Sân Đấu Thần Thoại</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Trải nghiệm các sàn đấu cao cấp có hiệu ứng biến đổi sàn, tương tác ván đấu và đổi nhạc nền EDM sống động trong từng round.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <TrackedLandingLink
                  href="/shop?focus=arena"
                  trackingType="shop"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-zinc-300 transition-colors"
                >
                  <span>Duyệt theo Sân Đấu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </TrackedLandingLink>
              </div>
            </div>

            {/* Focus 3: VIP vs Clone */}
            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] flex flex-col justify-between hover:border-white/15 transition-colors">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 font-mono">VIP / Clone</span>
                </div>
                <h3 className="font-heading font-semibold text-base text-white">Loại Acc & Ngân Sách</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Lựa chọn dòng Acc VIP để trải nghiệm đồ hiệu hoặc Acc Clone giá tiết kiệm để duo leo rank cùng bạn bè và test meta mùa mới.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center gap-3">
                <TrackedLandingLink
                  href="/shop?type=vip"
                  trackingType="shop"
                  className="inline-flex items-center gap-1 text-xs font-medium text-white hover:text-zinc-300 transition-colors"
                >
                  <span>Acc VIP</span>
                  <ArrowRight className="w-3 h-3" />
                </TrackedLandingLink>
                <span className="text-zinc-600">•</span>
                <TrackedLandingLink
                  href="/shop?type=clone"
                  trackingType="shop"
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  <span>Acc Clone</span>
                  <ArrowRight className="w-3 h-3" />
                </TrackedLandingLink>
              </div>
            </div>
          </div>
        </section>

        {/* 3. VIP vs Clone Comparison */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              SO SÁNH PHÂN LOẠI
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-white">
              Acc VIP và Acc Clone Khác Nhau Thế Nào?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Định nghĩa đúng thực tế hệ thống: Acc VIP phục vụ trải nghiệm đồ hiệu cao cấp, trong khi Acc Clone tối ưu chi phí cày rank.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* VIP Card */}
            <div className="p-6 rounded-2xl bg-[#121214] border border-white/[0.08] relative flex flex-col justify-between hover:border-white/15 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold uppercase text-zinc-200">
                    <Crown className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Kho Acc VIP</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">Trải nghiệm đồ hiệu</span>
                </div>

                <h3 className="text-lg font-bold text-white font-heading">
                  Tài Khoản VIP Thần Thoại & Sân Đấu
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  Dành cho người chơi muốn trải nghiệm trọn vẹn vẻ đẹp của Linh Thú Tí Nị đồ hiệu, hiệu ứng kết liễu mãn nhãn và sàn đấu đổi nhạc EDM mà không cần bỏ ra hàng triệu đồng quay gacha.
                </p>

                <ul className="space-y-2 text-xs text-zinc-300 pt-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <span>Nhiều Tí Nị Thần Thoại đắt giá (Ahri, Yasuo, Gwen, Lee Sin...)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <span>Sở hữu Sân Đấu Thần Thoại đổi nhạc EDM độc quyền</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <span>Lựa chọn gói thuê linh hoạt theo giờ, theo ngày hoặc theo tuần</span>
                  </li>
                </ul>
              </div>

              <div className="pt-5 mt-5 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-zinc-400">Xem danh sách có sẵn</span>
                <TrackedLandingLink
                  href="/shop?type=vip"
                  trackingType="shop"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-zinc-300 transition-colors"
                >
                  <span>Duyệt Kho VIP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </TrackedLandingLink>
              </div>
            </div>

            {/* Clone Card */}
            <div className="p-6 rounded-2xl bg-[#121214] border border-white/[0.08] relative flex flex-col justify-between hover:border-white/15 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold uppercase text-zinc-200">
                    <Layers className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Kho Acc Clone</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">Tối ưu chi phí</span>
                </div>

                <h3 className="text-lg font-bold text-white font-heading">
                  Tài Khoản Phụ Cày Rank & Test Meta
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  Dành cho cờ thủ muốn duo leo rank cùng bạn bè ở các bậc rank khác nhau, thử nghiệm các giáo án chiến thuật mới hoặc leo chuỗi thắng mà không lo tụt điểm rank tài khoản chính.
                </p>

                <ul className="space-y-2 text-xs text-zinc-300 pt-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <span>Chi phí siêu tiết kiệm, tối ưu cho nhu cầu thuê dài ngày</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <span>Mốc rank đa dạng từ Sắt/Vàng đến Kim Cương/Cao Thủ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <span>Tài khoản sạch, trắng thông tin, đăng nhập là chiến ngay</span>
                  </li>
                </ul>
              </div>

              <div className="pt-5 mt-5 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-zinc-400">Xem danh sách có sẵn</span>
                <TrackedLandingLink
                  href="/shop?type=clone"
                  trackingType="shop"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-zinc-300 transition-colors"
                >
                  <span>Duyệt Kho Clone</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </TrackedLandingLink>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Price Explanation */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              MINH BẠCH CHI PHÍ
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Giá Thuê Acc TFT Phụ Thuộc Vào Gì?
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal max-w-3xl">
            Giá thuê tài khoản tại ShopTFTMobile được tính toán minh bạch dựa trên giá trị trang bị thực tế trong tài khoản và thời lượng trải nghiệm của bạn:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-xs font-semibold text-white block mb-1">1. Pet & Chibi Thần Thoại</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Số lượng Tí Nị đồ hiệu giới hạn (Ahri, Yasuo Kiếm Sư...) quyết định giá trị trải nghiệm của tài khoản.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-xs font-semibold text-white block mb-1">2. Sân Đấu Độc Quyền</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Sân Đấu Thần Thoại đổi nhạc EDM hoặc biến đổi sàn có mức đầu tư sưu tầm cao hơn sân cơ bản.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-xs font-semibold text-white block mb-1">3. Khung Thời Gian Thuê</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Gói theo giờ phù hợp chơi nhanh trong ngày; các gói theo ngày hoặc tuần được chiết khấu tiết kiệm hơn.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-xs font-semibold text-white block mb-1">4. Dòng VIP hoặc Clone</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Dòng VIP tập trung hiệu ứng đồ hiệu, trong khi dòng Clone tối ưu chi phí cày rank giá sinh viên.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-zinc-400">
              * Mức giá cụ thể được niêm yết rõ ràng trên từng thẻ sản phẩm trong kho acc theo thời gian thực.
            </span>
            <TrackedLandingLink
              href="/shop"
              trackingType="shop"
              className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-zinc-300 transition-colors"
            >
              <span>Xem giá hiện tại trong Kho Acc</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </TrackedLandingLink>
          </div>
        </section>

        {/* 5. Product Discovery (Recent Accounts) */}
        {recentAccounts && recentAccounts.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
                  CẬP NHẬT KHO ACC
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-white">
                  Acc TFT Mới Cập Nhật
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Một số tài khoản tiêu biểu vừa được bổ sung vào hệ thống hôm nay.
                </p>
              </div>

              <TrackedLandingLink
                href="/shop"
                trackingType="shop"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-white hover:text-zinc-300 transition-colors self-start sm:self-auto"
              >
                <span>Xem toàn bộ Kho Acc →</span>
              </TrackedLandingLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="rounded-2xl bg-[#121214] border border-white/[0.08] hover:border-white/15 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                      <img
                        src={acc.thumbnail || "/banner-seo.jpg"}
                        alt={acc.title || acc.code}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-black/70 text-white border border-white/10">
                        {acc.code}
                      </span>
                      <span
                        className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.status === "RENTED"
                            ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {acc.status === "RENTED" ? "ĐANG THUÊ" : "CÒN ACC"}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-heading font-semibold text-sm text-white line-clamp-1">
                        {acc.title || acc.code}
                      </h3>
                      <div className="text-xs text-zinc-400 space-y-0.5">
                        <p className="line-clamp-1">Pet: {acc.mainChibi || "Đầy đủ Linh Thú"}</p>
                        <p className="line-clamp-1">Sân: {acc.mainArena || "Sân Đấu Thần Thoại"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <TrackedLandingLink
                      href="/shop"
                      trackingType="shop"
                      className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Xem chi tiết tại Kho Acc</span>
                      <ArrowRight className="w-3 h-3" />
                    </TrackedLandingLink>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Rental Process (4 Steps) */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-6">
          <div className="space-y-1 text-center max-w-xl mx-auto">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              QUY TRÌNH MINH BẠCH
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Cách Thuê Acc TFT tại ShopTFTMobile
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              4 bước đơn giản, trực tiếp qua Zalo cùng cựu Thách Đấu Tuấn Thái Bình.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-white/15 text-white font-mono font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-heading font-semibold text-sm text-white">Tìm acc phù hợp</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Truy cập <Link href="/shop" className="text-white underline">Kho Acc</Link>, lọc theo Pet, Chibi hoặc Sân Đấu và chọn mã tài khoản (MS).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-white/15 text-white font-mono font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-heading font-semibold text-sm text-white">Xem trạng thái & gói thuê</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kiểm tra nhãn &quot;CÒN ACC&quot; và lựa chọn thời lượng trải nghiệm theo giờ hoặc theo ngày phù hợp.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-white/15 text-white font-mono font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-heading font-semibold text-sm text-white">Liên hệ Zalo</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nhắn mã acc qua Zalo Tuấn Thái Bình (0352.867.283) để được tư vấn trực tiếp và xác nhận thông tin.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-white/15 text-white font-mono font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h3 className="font-heading font-semibold text-sm text-white">Admin xác nhận & bàn giao</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Chủ shop gửi thông tin đăng nhập Riot ID 1-1, đồng hành hướng dẫn vào game và hỗ trợ suốt thời gian thuê.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Availability (CÒN ACC vs ĐANG THUÊ) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              TRẠNG THÁI TÀI KHOẢN
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              CÒN ACC và ĐANG THUÊ Có Nghĩa Là Gì?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="font-heading font-bold text-sm text-white">Trạng Thái: CÒN ACC</h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Tài khoản hiện đang trống, chưa có khách sử dụng. Bạn có thể nhắn tin Zalo cho chủ shop để nhận bàn giao và vào trận ngay lập tức.
              </p>
              <div className="pt-2">
                <TrackedLandingLink
                  href="/shop"
                  trackingType="shop"
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  <span>Duyệt các acc đang có sẵn</span>
                  <ArrowRight className="w-3 h-3" />
                </TrackedLandingLink>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                <h3 className="font-heading font-bold text-sm text-white">Trạng Thái: ĐANG THUÊ</h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                Tài khoản đang trong phiên trải nghiệm của khách khác. Bạn có thể xem mốc giờ dự kiến trả acc trên thẻ sản phẩm hoặc duyệt các tài khoản tương tự đang còn trong kho.
              </p>
              <div className="pt-2">
                <TrackedLandingLink
                  href="/shop"
                  trackingType="shop"
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  <span>Tìm tài khoản tương đương</span>
                  <ArrowRight className="w-3 h-3" />
                </TrackedLandingLink>
              </div>
            </div>
          </div>
        </section>

        {/* 8. After-Rental Guide */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              HƯỚNG DẪN BẢO MẬT
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Sau Khi Nhận Acc Riot Nên Làm Gì?
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal max-w-3xl">
            Để quá trình trải nghiệm diễn ra suôn sẻ và an toàn, Tuấn Thái Bình khuyến nghị bạn thực hiện 3 bước sau ngay khi nhận thông tin tài khoản:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <span className="text-xs font-semibold text-white block">1. Đăng nhập & kiểm tra</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Đăng nhập Riot Client hoặc TFT Mobile, kiểm tra đúng Linh Thú Tí Nị và Sân Đấu đã chọn.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <span className="text-xs font-semibold text-white block">2. Thực hiện đổi bảo mật</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Đối với gói thuê dài hạn hỗ trợ đổi thông tin, đổi mật khẩu và liên kết email chính chủ theo hướng dẫn.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <span className="text-xs font-semibold text-white block">3. Hỗ trợ khi cần thiết</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nếu gặp mã OTP bảo mật hoặc trục trặc kết nối, nhắn Zalo để được hỗ trợ kỹ thuật trực tiếp.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <TrackedLandingLink
              href="/huong-dan/doi-thong-tin-acc-riot"
              trackingType="guide"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-zinc-300 underline underline-offset-4 transition-colors"
            >
              <span>Xem hướng dẫn đổi thông tin Acc Riot an toàn chi tiết →</span>
            </TrackedLandingLink>
          </div>
        </section>

        {/* 9. Trust & Guarantees */}
        <section className="space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              TRÁCH NHIỆM & UY TÍN
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Hỗ Trợ Khi Thuê Acc
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-sm text-white">Hỗ Trợ Trực Tiếp 1-1</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Vận hành bởi Tuấn Thái Bình (cựu Thách Đấu ĐTCL 1.134 ĐNG), trực tiếp tư vấn và đồng hành giải quyết mọi vướng mắc kỹ thuật.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-heading font-semibold text-sm text-white">Quỹ Bảo Hiểm 30M Checkscam</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Đã hoàn tất xác minh danh tính và đóng quỹ bảo hiểm trách nhiệm giao dịch 30.000.000đ công khai trên Checkscam.vn.
              </p>
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white underline pt-1"
              >
                <span>Kiểm tra hồ sơ xác minh</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-heading font-semibold text-sm text-white">Bàn Giao Qua Zalo Chính Chủ</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Giao dịch minh bạch, hướng dẫn đăng nhập chi tiết qua Zalo 0352.867.283, tuyệt đối không sử dụng kênh trung gian ảo.
              </p>
            </div>
          </div>
        </section>

        {/* 10. FAQ Section (7 Real Questions) */}
        <section id="faq" className="space-y-6">
          <div className="space-y-1 text-center max-w-xl mx-auto">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              HỎI ĐÁP PHỔ BIẾN
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Câu Hỏi Thường Gặp Khi Thuê Acc TFT - ĐTCL
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl bg-[#121214] border border-white/[0.08] space-y-2"
              >
                <h3 className="font-heading font-semibold text-sm sm:text-base text-white flex items-start gap-2.5">
                  <span className="text-zinc-500 font-mono text-xs mt-0.5">Q{idx + 1}.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-6 font-normal">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 11. Internal Links & Bottom CTA */}
        <section className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#121214] border border-white/[0.08] text-center space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Khám Phá Kho Acc TFT Hôm Nay
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Hàng chục tài khoản Tí Nị Thần Thoại và Sân Đấu độc quyền đang có sẵn. Liên hệ Tuấn Thái Bình để được tư vấn chọn acc ưng ý nhất.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <TrackedLandingLink
              href="/shop"
              trackingType="shop"
              className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <span>Xem Kho Acc</span>
            </TrackedLandingLink>

            <TrackedLandingLink
              href={PROFILE_INFO.zaloUrl}
              trackingType="zalo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.12] font-medium text-xs sm:text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Liên Hệ Zalo ({PROFILE_INFO.phoneZalo})</span>
            </TrackedLandingLink>

            <TrackedLandingLink
              href="/huong-dan"
              trackingType="guide"
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] font-medium text-xs sm:text-sm transition-colors"
            >
              <span>Hướng Dẫn Dịch Vụ</span>
            </TrackedLandingLink>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
            <Link href="/ve-shop" className="hover:text-zinc-300 transition-colors">
              Về ShopTFTMobile
            </Link>
            <span>•</span>
            <Link href="/blog" className="hover:text-zinc-300 transition-colors">
              Cẩm Nang & Blog TFT
            </Link>
            <span>•</span>
            <Link href="/huong-dan/doi-thong-tin-acc-riot" className="hover:text-zinc-300 transition-colors">
              Đổi Thông Tin Acc Riot
            </Link>
          </div>
        </section>
      </main>

      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
