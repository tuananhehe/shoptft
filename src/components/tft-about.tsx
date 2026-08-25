"use client";

import React from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { Trophy, ShieldCheck, UserCheck, HeartHandshake, CheckCircle2, ArrowRight, ExternalLink, Users, Sparkles } from "lucide-react";

// Official Brand SVG Logos
const TikTokLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.12z" />
  </svg>
);

const ZaloLogo = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 4C12.954 4 4 12.059 4 22c0 5.748 3.01 10.864 7.747 14.204-.33 2.502-1.397 5.704-3.568 8.01a1 1 0 0 0 .977 1.637c4.68-.696 8.548-2.613 10.742-4.004A22.25 22.25 0 0 0 24 42c11.046 0 20-8.059 20-18S35.046 4 24 4z"
      fill="currentColor"
      fillOpacity="0.15"
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
      subtitle: "Xem highlight & test acc VIP",
      badge: "45K+ Followers",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
      iconBg: "bg-rose-50 text-rose-600 border-rose-200",
      buttonText: "Xem TikTok ➔",
      buttonStyle: "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200",
      icon: <TikTokLogo />,
      link: PROFILE_INFO.tiktokUrl,
    },
    {
      id: "zalo",
      title: "Nhóm Zalo Trao Đổi Acc",
      subtitle: "Giao lưu, mua bán & hỗ trợ 24/7",
      badge: "1,000+ Thành viên",
      badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
      iconBg: "bg-sky-50 text-sky-600 border-sky-200",
      buttonText: "Tham Gia Zalo ➔",
      buttonStyle: "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200",
      icon: <ZaloLogo />,
      link: PROFILE_INFO.zaloGroupUrl,
    },
    {
      id: "discord",
      title: "Cộng Đồng Discord Game",
      subtitle: "Voice chat, tìm đồng đội leo rank",
      badge: "850+ Online",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
      buttonText: "Vào Discord ➔",
      buttonStyle: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200",
      icon: <DiscordLogo />,
      link: PROFILE_INFO.discordUrl,
    },
    {
      id: "fb-group",
      title: "Hội Cờ Thủ ĐTCL Việt Nam",
      subtitle: "Chia sẻ giáo án meta, chia sẻ kinh nghiệm",
      badge: "12K+ Cờ thủ",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
      iconBg: "bg-blue-50 text-blue-600 border-blue-200",
      buttonText: "Gia Nhập Nhóm ➔",
      buttonStyle: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200",
      icon: <FacebookGroupLogo />,
      link: PROFILE_INFO.facebookGroupUrl,
    },
  ];

  return (
    <section id="about" className="py-20 bg-[#F8FAFC] text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-orange-600" />
            <span>Hồ Sơ Cá Nhân & Thương Hiệu</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            VỀ BẢN THÂN TUẤN THÁI BÌNH
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal">
            "Mình là Tuấn Thái Bình, một người con sinh ra từ quê lúa Thái Bình. Xuất phát điểm từ đam mê cờ thủ leo Top Thách Đấu, nay mình xây dựng hệ thống ShopTFT Mobile đồng hành uy tín cùng hàng nghìn anh em Đấu Trường Chân Lý trên toàn quốc."
          </p>
        </div>

        {/* 2 Main Story Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Card 1: Journey */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Hành Trình 5+ Năm ĐTCL</h3>
                <span className="text-xs text-slate-500 font-normal">Từ kỳ thủ đam mê đến hệ thống phân phối uy tín</span>
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex gap-4 border-l-2 border-orange-200 pl-4 relative py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 absolute -left-[6px] top-2" />
                  <div>
                    <span className="text-xs font-black text-orange-600 font-mono block">{m.season}</span>
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-0.5">{m.achievement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Philosophy & Safety */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Triết Lý Kinh Doanh</h3>
                  <span className="text-xs text-slate-500 font-normal">An toàn - Rõ ràng - Trách nhiệm đến cùng</span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">100% Trắng Thông Tin:</strong>
                    Tất cả tài khoản mua bán đều được kiểm tra kỹ lưỡng, hỗ trợ đổi mail và cài đặt bảo mật chính chủ ngay sau khi giao dịch.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Bảo Hiểm 30.000.000đ Checkscam:</strong>
                    Ký quỹ bảo hiểm trên hệ thống phòng chống lừa đảo Checkscam.vn, cam kết đền bù 100% nếu có tranh chấp tài khoản.
                  </div>
                </div>
              </div>
            </div>

            {/* Checkscam Link */}
            <div className="pt-6 mt-6 border-t border-slate-100">
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Xem Hồ Sơ Bảo Hiểm Checkscam.vn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* 4 Community Cards Grid */}
        <div className="pt-4">
          <div className="text-center mb-6">
            <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span>Hệ Sinh Thái & Kênh Truyền Thông Chính Thức</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Tham gia cộng đồng để nhận thông báo acc mới, chia sẻ giáo án meta và hỗ trợ nhanh nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {communityChannels.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`w-12 h-12 rounded-xl p-2.5 flex items-center justify-center border ${item.iconBg}`}>
                      {item.icon}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeBg}`}>
                      {item.badge}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed mb-4">
                    {item.subtitle}
                  </p>
                </div>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${item.buttonStyle}`}
                >
                  <span>{item.buttonText}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
