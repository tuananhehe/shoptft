import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { PROFILE_INFO } from "@/data/tft-data";
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
  Lock,
  Clock,
  ExternalLink,
  Award,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "Thuê Acc TFT - Thuê Acc ĐTCL | ShopTFTMobile",
  },
  description:
    "Dịch vụ thuê acc TFT, thuê acc ĐTCL chính chủ Tuấn Thái Bình. Đầy đủ acc VIP Tí Nị, acc Clone cày rank, Sân Đấu Thần Thoại. Bàn giao 1-1 nhanh chóng qua Zalo.",
  alternates: {
    canonical: "https://www.shoptftmobile.net/thue-acc-tft-dtcl",
  },
  openGraph: {
    title: "Thuê Acc TFT - Thuê Acc ĐTCL | ShopTFTMobile",
    description:
      "Dịch vụ thuê acc TFT, thuê acc ĐTCL chính chủ Tuấn Thái Bình. Đầy đủ acc VIP Tí Nị, acc Clone cày rank, Sân Đấu Thần Thoại. Bàn giao 1-1 nhanh chóng qua Zalo.",
    url: "https://www.shoptftmobile.net/thue-acc-tft-dtcl",
    siteName: "ShopTFTMobile",
    images: [
      {
        url: "https://www.shoptftmobile.net/banner-seo.jpg",
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
    title: "Thuê Acc TFT - Thuê Acc ĐTCL | ShopTFTMobile",
    description:
      "Dịch vụ thuê acc TFT, thuê acc ĐTCL chính chủ Tuấn Thái Bình TFT. Bàn giao 1-1 trực tiếp qua Zalo.",
    images: ["https://www.shoptftmobile.net/banner-seo.jpg"],
  },
};

const faqs = [
  {
    q: "Thuê acc TFT - ĐTCL tại ShopTFTMobile có uy tín và an toàn không?",
    a: "Hệ thống ShopTFTMobile được vận hành trực tiếp bởi Tuấn Thái Bình (cựu Thách Đấu ĐTCL 1.134 ĐNG). Shop cam kết thông tin tài khoản minh bạch, có quỹ bảo hiểm xác minh 30.000.000đ tại Checkscam.vn và hỗ trợ bàn giao tài khoản 1-1 qua Zalo chính chủ.",
  },
  {
    q: "Tôi có thể chơi tài khoản trên cả PC và điện thoại (TFT Mobile) không?",
    a: "Hoàn toàn được. Toàn bộ tài khoản tại ShopTFTMobile đều sử dụng Riot ID chuẩn máy chủ VNG / Riot Games Việt Nam, đăng nhập mượt mà trên cả client Liên Minh Huyền Thoại PC và app TFT Mobile trên điện thoại iOS / Android.",
  },
  {
    q: "Sau khi thuê, tôi có được đổi mật khẩu và bảo mật tài khoản không?",
    a: "Đối với các gói thuê theo ngày hoặc gói có hỗ trợ đổi thông tin, khách hàng được quyền đổi mật khẩu hoặc gắn email cá nhân để đảm bảo riêng tư tuyệt đối trong suốt thời gian thuê. Shop có bài viết hướng dẫn chi tiết từng bước đổi thông tin Riot an toàn.",
  },
  {
    q: "Quy trình thanh toán và nhận acc diễn ra như thế nào?",
    a: "Sau khi chọn được acc ưng ý tại Kho Acc (/shop), bạn chỉ cần liên hệ Zalo Tuấn Thái Bình (0352.867.283). Chủ shop sẽ xác nhận trạng thái tài khoản còn trống, hướng dẫn thanh toán ngân hàng chính chủ và gửi thông tin đăng nhập trực tiếp chỉ trong 1-3 phút.",
  },
  {
    q: "Nếu tài khoản gặp sự cố đăng nhập thì được xử lý ra sao?",
    a: "Tuấn Thái Bình trực tiếp bảo hành và hỗ trợ kỹ thuật trong suốt thời gian thuê. Nếu tài khoản gặp sự cố do máy chủ hoặc lỗi kỹ thuật khách quan, shop sẽ đổi ngay tài khoản tương đương hoặc bù giờ thuê tương ứng.",
  },
];

export default function ThueAccTftLandingPage() {
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
            "name": "Dịch vụ Thuê Acc TFT - ĐTCL",
            "item": "https://www.shoptftmobile.net/thue-acc-tft-dtcl",
          },
        ],
      },
      {
        "@type": "Service",
        "name": "Dịch vụ Thuê Acc TFT - ĐTCL Uy Tín",
        "provider": {
          "@type": "Organization",
          "name": "ShopTFTMobile",
          "url": "https://www.shoptftmobile.net",
        },
        "description":
          "Dịch vụ cho thuê tài khoản Đấu Trường Chân Lý (TFT Mobile & PC) uy tín bởi Tuấn Thái Bình TFT.",
        "areaServed": "VN",
        "offers": {
          "@type": "Offer",
          "priceCurrency": "VND",
          "price": "3000",
          "url": "https://www.shoptftmobile.net/shop",
        },
      },
      {
        "@type": "FAQPage",
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
          <span className="text-zinc-200 font-medium">Dịch vụ Thuê Acc TFT - ĐTCL</span>
        </nav>

        {/* 1. Hero Section */}
        <section className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-black/80 p-6 sm:p-10 lg:p-12 overflow-hidden mb-12 sm:mb-16">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold tracking-wider text-amber-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ Thống Thuê Acc TFT & ĐTCL // Tuấn Thái Bình</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-white leading-tight">
              Thuê Acc TFT - ĐTCL
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Trải nghiệm ngay những bộ sưu tập Linh Thú Tí Nị Thần Thoại đỉnh cao (Ahri, Yasuo, Gwen, Lee Sin...), Sân Đấu Đổi Nhạc EDM sống động và các tài khoản rank cao mà không cần đầu tư số tiền lớn để mở rương. Thông tin tài khoản chuẩn xác, bàn giao 1-1 trực tiếp và hỗ trợ bảo hành trọn thời gian thuê.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 group"
              >
                <Gamepad2 className="w-4 h-4 text-zinc-950" />
                <span>Xem Kho Acc TFT</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href={PROFILE_INFO.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold text-sm hover:bg-blue-600/30 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span>Nhận Tư Vấn Zalo Trực Tiếp</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. Key Trust Signals */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white mb-1">Cựu Thách Đấu 1.134 ĐNG</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kinh nghiệm 5+ năm gắn bó ĐTCL máy chủ Việt Nam, tư vấn đội hình và cách chơi tận tâm.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white mb-1">Quỹ Bảo Hiểm 30.000.000đ</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Đã xác minh danh tính và ký quỹ đảm bảo uy tín giao dịch tại hệ thống Checkscam.vn.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.06] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white mb-1">Bàn Giao Trực Tiếp 1-1</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Giao dịch minh bạch, bàn giao nhanh trong 1-3 phút qua Zalo Tuấn Thái Bình (0352.867.283).
              </p>
            </div>
          </div>
        </section>

        {/* 3. Phân Loại Tài Khoản: VIP vs Clone */}
        <section className="mb-12 sm:mb-16 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Phân Loại Tài Khoản Tại ShopTFTMobile
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Lựa chọn loại tài khoản phù hợp với sở thích trải nghiệm đồ hiệu hoặc mục tiêu leo rank cùng bạn bè.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VIP Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-amber-500/20 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    Acc VIP Thần Thoại
                  </span>
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Trải Nghiệm Đồ Hiệu & Sân Đấu Độc Quyền</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Dành cho anh em đam mê hiệu ứng kết liễu đỉnh cao từ các tướng Tí Nị Thần Thoại đắt giá nhất và sàn đấu đổi nhạc nền theo diễn biến ván đấu.
                </p>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Sở hữu Tí Nị Thần Thoại (Ahri Chiêu Hồn, Yasuo Kiếm Sư Bão Kiếm, Gwen...)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Sân đấu Đổi Nhạc EDM, Sân Đấu Huyền Thoại biến đổi sàn</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Hỗ trợ các gói thuê giờ, thuê ngày hoặc theo tuần linh hoạt</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-zinc-400">Đầy đủ hiệu ứng cao cấp</span>
                <Link
                  href="/shop?type=vip"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <span>Xem danh sách Acc VIP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Clone Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-blue-500/20 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs uppercase tracking-wider">
                    Acc Clone Cày Rank
                  </span>
                  <Layers className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Giá Sinh Viên, Sẵn Mốc Rank Mong Muốn</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Lựa chọn tối ưu ngân sách để cày rank cùng bạn bè, test đội hình meta mới hoặc luyện tập chiến thuật mà không lo ảnh hưởng đến rank acc chính.
                </p>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Chi phí siêu tiết kiệm, tối ưu cho thời gian thuê dài</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Mốc rank đa dạng từ Sắt/Vàng đến Kim Cương/Cao Thủ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Tài khoản trắng thông tin, sẵn sàng vào trận ngay</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs text-zinc-400">Chi phí tiết kiệm nhất</span>
                <Link
                  href="/shop?type=clone"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  <span>Xem danh sách Acc Clone</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Quy Trình Thuê 4 Bước */}
        <section className="mb-12 sm:mb-16 rounded-2xl bg-zinc-900/40 border border-white/[0.06] p-6 sm:p-8 space-y-6">
          <div className="space-y-1 text-center max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Quy Trình Thuê Acc TFT - ĐTCL Nhanh Gọn
            </h2>
            <p className="text-xs text-zinc-400">
              Quy trình chuẩn hóa 4 bước giúp bạn nhận acc nhanh chóng và an toàn tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/[0.05] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Chọn Acc Yêu Thích</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Truy cập <Link href="/shop" className="text-amber-400 underline">Kho Acc</Link>, lọc theo Pet, Sân Đấu, loại acc và chọn mã số acc (MS).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-white/[0.05] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                2
              </div>
              <h4 className="font-bold text-sm text-white">Liên Hệ Zalo Shop</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Gửi mã acc qua Zalo Tuấn Thái Bình (0352.867.283) để kiểm tra tình trạng còn trống và chốt gói thuê.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-white/[0.05] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Nhận Bàn Giao 1-1</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nhận thông tin đăng nhập Riot ID trực tiếp từ chủ shop, hướng dẫn đăng nhập PC & TFT Mobile.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-white/[0.05] space-y-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                4
              </div>
              <h4 className="font-bold text-sm text-white">Bảo Mật & Trải Nghiệm</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Đổi thông tin mật khẩu theo <Link href="/huong-dan/doi-thong-tin-acc-riot" className="text-amber-400 underline">Hướng dẫn Riot</Link> và thoải mái leo rank.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Câu Hỏi Thường Gặp (Real FAQ) */}
        <section className="mb-12 sm:mb-16 space-y-6">
          <div className="space-y-1 text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Giải Đáp Thắc Mắc</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Câu Hỏi Thường Gặp Khi Thuê Acc TFT
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-2"
              >
                <h3 className="font-bold text-sm sm:text-base text-zinc-100 flex items-start gap-2.5">
                  <span className="text-amber-400 font-bold">Q{idx + 1}.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Liên Kết Nội Bộ Hữu Ích & Bottom CTA */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-black border border-white/[0.08] text-center space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Sẵn Sàng Trải Nghiệm Trận Đấu Đỉnh Cao?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Xem ngay danh sách tài khoản còn trống hôm nay tại ShopTFTMobile hoặc kết nối Zalo Tuấn Thái Bình để được hỗ trợ trực tiếp.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/shop"
              className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-colors"
            >
              Khám Phá Kho Acc
            </Link>
            <Link
              href="/ve-shop"
              className="px-5 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-medium text-xs sm:text-sm hover:bg-zinc-700 transition-colors"
            >
              Tìm Hiểu Về Shop
            </Link>
            <Link
              href="/huong-dan/doi-thong-tin-acc-riot"
              className="px-5 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-medium text-xs sm:text-sm hover:bg-zinc-700 transition-colors"
            >
              Hướng Dẫn Đổi Thông Tin
            </Link>
          </div>
        </section>
      </main>

      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
