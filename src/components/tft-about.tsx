"use client";

import React from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  ShieldCheck,
  Award,
  Flame,
  HeartHandshake,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

// Official SVG Brand Logos
const TikTokLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.04-1.52 4.83 4.83 0 0 1-.95-3z" />
  </svg>
);

const ZaloLogo = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 4C12.954 4 4 12.059 4 22c0 5.748 3.01 10.864 7.747 14.204-.33 2.502-1.397 5.704-3.568 8.01a1 1 0 0 0 .977 1.637c4.68-.696 8.548-2.613 10.742-4.004A22.25 22.25 0 0 0 24 42c11.046 0 20-8.059 20-18S35.046 4 24 4z"
      fill="currentColor"
      fillOpacity="0.25"
    />
    <path
      d="M13.5 29.5V26.8l8.2-10.5H13.8V13.5h11.8v2.6L17.2 26.8h8.4v2.7H13.5zm14.8 0V13.5h4.1v16h-4.1zm7.8 0V13.5h4V26.5h5.8v3H36.1z"
      fill="currentColor"
    />
  </svg>
);

const DiscordLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const FacebookGroupLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const TFTAbout: React.FC = () => {
  const milestones = [
    { season: "MÙA 1 - 3", achievement: "Bắt đầu gắn bó cùng Đấu Trường Chân Lý, đạt mốc Kim Cương & Cao Thủ đầu tiên." },
    { season: "MÙA 4 - 8", achievement: "Chinh phục Top 10 Thách Đấu máy chủ Việt Nam, thành lập hội nhóm cờ thủ và mở dịch vụ coaching bắt Meta." },
    { season: "MÙA 9 - 11", achievement: "Đạt mốc 1,000+ giao dịch thành công, phân phối tài khoản Tướng Tí Nị & Sân Đấu Thần Thoại uy tín hàng đầu." },
    { season: "MÙA 12 - 13 (HIỆN TẠI)", achievement: "Duy trì vị thế Cựu Thách Đấu Việt Nam // 1.134 ĐNG, đóng Quỹ Bảo Hiểm 30M Checkscam.vn, phục vụ 1,850+ anh em game thủ." },
  ];

  const communityChannels = [
    {
      id: "tiktok",
      title: "Kênh TikTok ShopTFT Mobile",
      desc: "Cập nhật video test acc, chia sẻ giáo án meta độc quyền và highlight trận đấu mãn nhãn.",
      logo: TikTokLogo,
      // Box styles: Neon Rose Glow
      containerBg: "bg-rose-500/10 border-rose-500/30 text-rose-500",
      glowBg: "bg-rose-500/25",
      dropShadow: "drop-shadow-[0_0_14px_rgba(244,63,94,0.45)]",
      hoverBorder: "hover:border-rose-500/60",
      btnText: "Follow TikTok",
      btnColor: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700",
      url: PROFILE_INFO.tiktokUrl,
    },
    {
      id: "zalo-group",
      title: "Hội Nhóm Zalo Giao Lưu",
      desc: "Nhóm trao đổi acc an toàn, thông tin chính chủ, hỗ trợ tư vấn và giao dịch 24/7.",
      logo: ZaloLogo,
      // Box styles: Neon Sky Glow
      containerBg: "bg-sky-500/10 border-sky-500/30 text-sky-400",
      glowBg: "bg-sky-500/25",
      dropShadow: "drop-shadow-[0_0_14px_rgba(56,189,248,0.45)]",
      hoverBorder: "hover:border-sky-500/60",
      btnText: "Tham Gia Zalo",
      btnColor: "bg-[#0084FF] hover:bg-[#0070db]",
      url: PROFILE_INFO.zaloGroupUrl,
    },
    {
      id: "discord",
      title: "Cộng Đồng Discord Game",
      desc: "Giao lưu voice chat, tìm đồng đội leo rank, chia sẻ kinh nghiệm def máu & xoay bài flex.",
      logo: DiscordLogo,
      // Box styles: Neon Indigo Glow
      containerBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
      glowBg: "bg-indigo-500/25",
      dropShadow: "drop-shadow-[0_0_14px_rgba(99,102,241,0.45)]",
      hoverBorder: "hover:border-indigo-500/60",
      btnText: "Vào Discord",
      btnColor: "bg-[#5865F2] hover:bg-[#4752c4]",
      url: PROFILE_INFO.discordUrl,
    },
    {
      id: "fb-group",
      title: "Group Trao Đổi Cờ Thủ",
      desc: "Nơi giải đáp thắc mắc trang bị, Lõi Công Nghệ Hextech và cập nhật phiên bản mới nhất.",
      logo: FacebookGroupLogo,
      // Box styles: Neon Emerald/Cyan Glow
      containerBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      glowBg: "bg-emerald-500/25",
      dropShadow: "drop-shadow-[0_0_14px_rgba(16,185,129,0.45)]",
      hoverBorder: "hover:border-emerald-500/60",
      btnText: "Gia Nhập Group",
      btnColor: "bg-[#1877F2] hover:bg-[#1565c0]",
      url: PROFILE_INFO.facebookGroupUrl,
    },
  ];

  return (
    <section id="about" className="py-24 bg-[#0c0f1a] text-white border-b border-gray-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. SECTION HEADER WITH PERSONALIZED SUB-HEADLINE & CHECKSCAM BADGE */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          {/* Neon Insurance Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href={PROFILE_INFO.checkscamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 hover:bg-green-500/25 border border-green-500/50 text-green-400 text-xs font-extrabold uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse"
            >
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span>🛡️ Đã đóng Quỹ Bảo Hiểm 30.000.000đ tại Checkscam.vn (Bảo chứng 100% Giao Dịch An Toàn)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            VỀ BẢN THÂN <span className="text-[#FF5722]">{PROFILE_INFO.realName}</span>
          </h2>

          {/* Sub-headline: Personalized & Authentic */}
          <p className="text-gray-300 font-light text-sm sm:text-base leading-relaxed bg-[#121726]/60 p-5 rounded-2xl border border-gray-800 text-center sm:text-left">
            "Mình là <strong className="text-white font-bold">{PROFILE_INFO.realName}</strong>, một người con sinh ra từ quê lúa Thái Bình. Xuất phát điểm từ đam mê cờ thủ leo Top Thách Đấu, nay mình xây dựng hệ thống <strong className="text-[#FF5722] font-bold">{PROFILE_INFO.brandName}</strong> đồng hành uy tín cùng hàng nghìn anh em Đấu Trường Chân Lý trên toàn quốc."
          </p>
        </div>

        {/* 2. MILESTONES & CORE PRINCIPLES (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Left: Milestones Timeline */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF5722]" />
              <span>Hành Trình Chinh Phục Thách Đấu Máy Chủ VN</span>
            </h3>

            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-[#121726] border border-gray-800 p-5 rounded-xl hover:border-[#FF5722]/40 transition-colors"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF5722]">
                      {m.season}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">MỐC 0{idx + 1}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 font-light mt-2 leading-relaxed">
                    {m.achievement}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Core Principles & Checkscam Guarantee */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <span>Triết Lý & Bảo Hiểm Checkscam 30.000.000đ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Box 1 */}
              <div className="p-6 bg-[#121726] border border-gray-800 rounded-xl space-y-2 hover:border-[#FF5722]/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#FF5722]/10 flex items-center justify-center text-[#FF5722]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Tài Khoản Sạch 100%</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Chỉ phân phối tài khoản chính chủ, có nguồn gốc rõ ràng, nạp qua cổng VNG/Riot chính thống, nói không với hàng nạp lậu.
                </p>
              </div>

              {/* Box 2: Bảo hiểm Checkscam 30M */}
              <div className="p-6 bg-gradient-to-br from-green-500/10 to-[#121726] border border-green-500/40 rounded-xl space-y-2 hover:border-green-500 transition-colors shadow-lg">
                <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-green-400 text-sm">Bảo Hiểm 30.000.000đ</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  Giao dịch tuyệt đối an toàn với quỹ cọc bảo hiểm 30M trên hệ thống Checkscam.vn uy tín toàn quốc.
                </p>
              </div>

              {/* Box 3 */}
              <div className="p-6 bg-[#121726] border border-gray-800 rounded-xl space-y-2 hover:border-cyan-500/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Tư Vấn Giáo Án Meta</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Sẵn sàng chia sẻ bảng ghép đồ, phân tích Lõi Công Nghệ và hướng dẫn xoay bài flex cho khách mua acc.
                </p>
              </div>

              {/* Box 4 */}
              <div className="p-6 bg-[#121726] border border-amber-500/30 rounded-xl space-y-2 hover:border-amber-500 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Giao Dịch Siêu Tốc</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Quét mã QR tự động từ mọi ngân hàng, bàn giao thông tin đăng nhập và email trong vòng 2 phút.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. KHỐI "HỆ SINH THÁI & KÊNH TRUYỀN THÔNG" (COMMUNITY GRID WITH NEON LOGO CONTAINERS) */}
        <div className="pt-10 border-t border-gray-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0084FF]/10 border border-[#0084FF]/30 text-[#0084FF] text-xs font-bold uppercase tracking-wider">
              <span>🌐 Kênh Chính Thức</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              HỆ SINH THÁI & KÊNH TRUYỀN THÔNG
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 font-light">
              Giao lưu cùng hàng chục nghìn anh em cờ thủ, nhận giáo án leo rank và tham gia các sự kiện tặng acc miễn phí.
            </p>
          </div>

          {/* 4 Cards Grid with Neon Logo Containers & Fluid Hover Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityChannels.map((ch) => {
              const LogoComp = ch.logo;
              return (
                <div
                  key={ch.id}
                  className={`bg-[#121726] border border-gray-800 ${ch.hoverBorder} p-6 sm:p-7 rounded-2xl flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)] group relative overflow-hidden`}
                >
                  {/* Subtle Background Glow on Card Hover */}
                  <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${ch.glowBg} rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none`} />

                  <div className="space-y-4 relative z-10">
                    {/* 2. ICON CONTAINER WITH NEON, GRADIENT & GLOW EFFECT */}
                    <div className="relative inline-block">
                      {/* Ambient Blur Glow behind icon */}
                      <div
                        className={`absolute inset-0 ${ch.glowBg} blur-xl rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300`}
                      />

                      {/* Rounded Box Container */}
                      <div
                        className={`relative w-14 h-14 rounded-2xl border ${ch.containerBg} flex items-center justify-center ${ch.dropShadow} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}
                      >
                        <LogoComp />
                      </div>
                    </div>

                    <h4 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#FF5722] transition-colors leading-snug">
                      {ch.title}
                    </h4>

                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                      {ch.desc}
                    </p>
                  </div>

                  {/* 4. BUTTON WITH SMOOTH HOVER SCALE */}
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative z-10 w-full h-12 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md group-hover:scale-[1.03] ${ch.btnColor}`}
                  >
                    <span>{ch.btnText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
