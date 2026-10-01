"use client";

import React from "react";
import Link from "next/link";
import { PROFILE_INFO } from "@/data/tft-data";
import { OFFICIAL_BRAND } from "@/utils/brand-constants";
import { analytics } from "@/utils/analytics";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  UserCheck,
  ChevronRight,
  Clock,
  Phone,
  Globe,
  Share2,
} from "lucide-react";

export const TFTAbout: React.FC = () => {
  const trustMetrics = [
    {
      value: "1.134 ĐNG",
      label: "Mốc rank cao nhất",
      desc: "Từng đạt mức Rank Thách Đấu tại máy chủ Việt Nam.",
    },
    {
      value: "30.000.000đ",
      label: "Bảo hiểm giao dịch",
      desc: "Ký quỹ đảm bảo uy tín và xác minh danh tính trên Checkscam.vn.",
      link: PROFILE_INFO.checkscamUrl,
      linkLabel: "Xem xác minh",
    },
    {
      value: "Zalo",
      label: "Hỗ trợ & bàn giao",
      desc: "Trao đổi thông tin, giải đáp và bàn giao trực tiếp 1-1 bởi chủ shop.",
    },
  ];

  const milestones = [
    {
      period: "Giai đoạn đầu",
      title: "Gắn bó cùng ĐTCL",
      desc: "Đồng hành cùng Đấu Trường Chân Lý từ những mùa đầu, tích lũy kiến thức meta chuyên sâu và trải nghiệm đa dạng hệ thống tướng tí nị.",
    },
    {
      period: "Phát triển cộng đồng",
      title: "Chinh phục Thách Đấu",
      desc: "Chinh phục mức rank Thách Đấu 1.134 ĐNG máy chủ Việt Nam, kết nối và hỗ trợ anh em cờ thủ đam mê leo rank.",
    },
    {
      period: "Phát triển ShopTFTMobile",
      title: "Hệ thống kho acc minh bạch",
      desc: "Hoàn thiện hệ thống kho tài khoản VIP & Clone, ký quỹ bảo hiểm 30M trên Checkscam và duy trì quy trình bàn giao thủ công qua Zalo.",
    },
  ];

  const principles = [
    {
      title: "Thông tin rõ ràng",
      desc: "Hiển thị chi tiết Pet, Sân Đấu, gói giá và trạng thái còn acc hay đang thuê trước khi khách lựa chọn.",
    },
    {
      title: "Hỗ trợ trực tiếp",
      desc: "Trao đổi trực tiếp qua Zalo với chủ shop khi cần tư vấn tài khoản, cách đăng nhập hoặc hướng dẫn an toàn.",
    },
    {
      title: "Trách nhiệm dịch vụ",
      desc: "Thông tin tài khoản được kiểm tra trước khi bàn giao và luôn sẵn sàng hỗ trợ xử lý nếu phát sinh sự cố.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Tìm & chọn acc",
      desc: "Duyệt kho VIP hoặc Clone theo Pet, Sân Đấu và mức giá phù hợp với nhu cầu.",
    },
    {
      step: "02",
      title: "Gửi mã acc qua Zalo",
      desc: "Nhắn mã số tài khoản (MS) cho ShopTFTMobile để kiểm tra tình trạng còn acc và nhận hỗ trợ.",
    },
    {
      step: "03",
      title: "Xác nhận & thanh toán",
      desc: "Thống nhất thời lượng thuê và thực hiện giao dịch theo hướng dẫn an toàn.",
    },
    {
      step: "04",
      title: "Nhận bàn giao trực tiếp",
      desc: "Shop trực tiếp gửi thông tin đăng nhập và hỗ trợ bạn vào game nhanh chóng qua Zalo.",
    },
  ];

  return (
    <div className="w-full bg-[#09090b] text-white">
      {/* 1. INTRO / SHOP IDENTITY */}
      <section className="pt-8 sm:pt-12 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {/* Breadcrumb linking back to homepage for brand entity clarity */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-2 flex-wrap"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-medium">Về ShopTFTMobile</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-[0.08em]">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>VỀ SHOP</span>
          </div>

          <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[46px] leading-tight tracking-[-0.03em] text-white">
            Về ShopTFTMobile
          </h1>

          <p className="text-zinc-300 text-base sm:text-lg font-medium max-w-xl mx-auto">
            Hệ thống hỗ trợ tìm & thuê acc TFT/ĐTCL vận hành bởi Tuấn Thái Bình TFT.
          </p>

          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
            ShopTFTMobile là điểm đến tìm và trải nghiệm các tài khoản Đấu Trường Chân Lý theo Pet Chibi và Sân Đấu mong muốn. Thông tin tài khoản minh bạch, hỗ trợ trực tiếp 1-1 qua Zalo trong khung giờ cố định 11:00 - 24:00 hàng ngày.
          </p>
        </div>
      </section>

      {/* 2. OWNER BLOCK */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        <div className="max-w-3xl mx-auto">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#121214] border border-white/[0.08] flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/15 flex-shrink-0 bg-white/5">
              <img
                src={PROFILE_INFO.avatarUrl}
                alt={PROFILE_INFO.realName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  <UserCheck className="w-3 h-3 text-zinc-400" />
                  <span>NGƯỜI VẬN HÀNH</span>
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                  {PROFILE_INFO.realName}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Tuấn Thái Bình TFT • ShopTFTMobile • {PROFILE_INFO.role}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-300">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  <span>5+ năm gắn bó ĐTCL</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  <span>Từng đạt Thách Đấu</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                  <span>Hỗ trợ trực tiếp Zalo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. REAL TRUST FACTS */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              THÔNG TIN XÁC THỰC
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
              Cam Kết & Bằng Chứng Uy Tín
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trustMetrics.map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#121214] border border-white/[0.08] hover:border-white/15 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {item.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-zinc-300 mt-1">
                    {item.label}
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {item.link && (
                  <div className="pt-4 mt-4 border-t border-white/[0.06]">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-zinc-300 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{item.linkLabel}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. JOURNEY (SIMPLIFIED VERTICAL TIMELINE) */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              QUÁ TRÌNH PHÁT TRIỂN
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
              Hành Trình Gắn Bó ĐTCL
            </h2>
          </div>

          <div className="space-y-6 relative pl-6 sm:pl-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full bg-[#181818] border border-white/20 flex items-center justify-center text-[10px] font-mono text-zinc-300">
                  {idx + 1}
                </span>

                <div className="p-4 sm:p-5 rounded-xl bg-[#121214] border border-white/[0.06] hover:border-white/15 transition-colors">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    {m.period}
                  </span>
                  <h3 className="font-heading text-base font-semibold text-white mt-0.5">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed font-normal">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SERVICE PRINCIPLES */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              TIÊU CHUẨN HOẠT ĐỘNG
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
              Nguyên Tắc Dịch Vụ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {principles.map((p, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#121214] border border-white/[0.08] hover:border-white/15 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 text-white flex items-center justify-center mb-3 text-xs font-mono font-bold">
                  0{idx + 1}
                </div>
                <h3 className="font-heading text-base font-semibold text-white">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW SHOPTFTMOBILE WORKS */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              HƯỚNG DẪN
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
              Quy Trình Hoạt Động
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((st) => (
              <div
                key={st.step}
                className="p-4 sm:p-5 rounded-2xl bg-[#121214] border border-white/[0.06] hover:border-white/15 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 text-white font-mono font-bold text-xs flex items-center justify-center mb-2.5">
                  {st.step}
                </div>
                <h3 className="font-heading text-sm sm:text-base font-semibold text-white">
                  {st.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-normal">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs sm:text-sm text-zinc-400">
            <span>Tìm hiểu chi tiết về </span>
            <Link href="/thue-acc-tft-dtcl" className="text-amber-400 hover:underline font-medium">
              Dịch vụ Thuê Acc TFT - ĐTCL
            </Link>
            <span>, xem </span>
            <Link href="/huong-dan" className="text-amber-400 hover:underline font-medium">
              Hướng Dẫn Dịch Vụ
            </Link>
            <span> hoặc khám phá </span>
            <Link href="/blog" className="text-amber-400 hover:underline font-medium">
              Cẩm Nang Blog TFT
            </Link>
            <span>.</span>
          </div>
        </div>
      </section>

      {/* 6.5 OFFICIAL CONTACT & TRUST CHANNELS */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
              KÊNH LIÊN HỆ CHÍNH THỨC
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
              Hệ Thống Kênh & Cộng Đồng
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-lg mx-auto">
              Chỉ giao dịch và trao đổi qua các kênh chính chủ bên dưới để đảm bảo an toàn tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Hotline & Zalo Cá Nhân</h4>
                  <p className="text-xs text-zinc-400">{OFFICIAL_BRAND.phoneZalo}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tư vấn chọn acc, kiểm tra trạng thái và bàn giao mật khẩu 1-1 trực tiếp bởi chủ shop.
              </p>
              <div className="pt-2">
                <a
                  href={OFFICIAL_BRAND.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <span>Mở Zalo chat</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Giờ Hỗ Trợ Khách Hàng</h4>
                  <p className="text-xs text-zinc-400">{OFFICIAL_BRAND.supportHours}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Hỗ trợ phản hồi nhanh chóng trong khung giờ cố định mỗi ngày, cam kết có mặt khi khách cần.
              </p>
              <div className="pt-2">
                <span className="text-xs text-zinc-500 font-mono">11:00 - 24:00 (Thứ 2 - CN)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#121214] border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Website & Domain Chính Thức</h4>
                  <p className="text-xs text-zinc-400">{OFFICIAL_BRAND.officialDomain}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Trang web chính thức duy nhất, có chứng chỉ SSL bảo mật và liên kết ký quỹ Checkscam.
              </p>
              <div className="pt-2">
                <a
                  href={OFFICIAL_BRAND.checkscamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tra cứu bảo hiểm 30M</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Social Community Channels */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[#121214] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Kênh Mạng Xã Hội Chính Thức</h4>
                <p className="text-xs text-zinc-400">Tham gia để xem highlight, cập nhật acc mới và giáo án</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {OFFICIAL_BRAND.socialChannels.map((c) => (
                <a
                  key={c.platform}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>{c.label}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Trải Nghiệm Acc TFT Đẳng Cấp Ngay Hôm Nay
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-md mx-auto leading-relaxed">
            Duyệt kho tài khoản đang có sẵn hoặc liên hệ trực tiếp qua Zalo để được tư vấn nhanh chóng.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm transition-all active:scale-98 inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>Xem kho acc</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="px-5 py-2.5 sm:py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs sm:text-sm transition-all inline-flex items-center gap-1.5"
            >
              <span>Trang chủ</span>
            </Link>

            <Link
              href="/thue-acc-tft-dtcl"
              className="px-5 py-2.5 sm:py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs sm:text-sm transition-all inline-flex items-center gap-1.5"
            >
              <span>Dịch vụ thuê</span>
            </Link>

            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.trackClickZalo({ source: "about" })}
              className="px-6 py-2.5 sm:py-3 rounded-xl bg-[#141416] hover:bg-[#1a1a1c] text-white border border-white/15 hover:border-white/30 font-medium text-xs sm:text-sm transition-all active:scale-98 inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Liên hệ Zalo</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
