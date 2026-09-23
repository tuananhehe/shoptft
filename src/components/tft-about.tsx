"use client";

import React, { useState, useEffect } from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  Trophy,
  ShieldCheck,
  UserCheck,
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  Users,
  Headset,
  Award,
  Lock,
} from "lucide-react";
import {
  CommunityChannelItem,
  getChannels,
  getPlatformMeta,
} from "@/utils/channels-service";

const DEFAULT_COMMUNITY_CHANNELS: CommunityChannelItem[] = [
  {
    id: "tiktok",
    platform: "tiktok",
    title: "Kênh TikTok ShopTFT Mobile",
    subtitle: "Xem highlight & test acc VIP",
    badge: "45K+ Followers",
    link: PROFILE_INFO.tiktokUrl,
    buttonText: "Xem TikTok",
    isActive: true,
    order: 1,
  },
  {
    id: "zalo",
    platform: "zalo",
    title: "Nhóm Zalo Trao Đổi Acc",
    subtitle: "Giao lưu, mua bán & hỗ trợ 24/7",
    badge: "1,000+ Thành viên",
    link: PROFILE_INFO.zaloGroupUrl,
    buttonText: "Tham Gia Zalo",
    isActive: true,
    order: 2,
  },
  {
    id: "discord",
    platform: "discord",
    title: "Cộng Đồng Discord Game",
    subtitle: "Voice chat, tìm đồng đội leo rank",
    badge: "850+ Online",
    link: PROFILE_INFO.discordUrl,
    buttonText: "Vào Discord",
    isActive: true,
    order: 3,
  },
  {
    id: "fb-group",
    platform: "facebook",
    title: "Hội Cờ Thủ ĐTCL Việt Nam",
    subtitle: "Chia sẻ giáo án meta, chia sẻ kinh nghiệm",
    badge: "12K+ Cờ thủ",
    link: PROFILE_INFO.facebookGroupUrl,
    buttonText: "Gia Nhập Nhóm",
    isActive: true,
    order: 4,
  },
];

export const TFTAbout: React.FC = () => {
  const [channels, setChannels] = useState<CommunityChannelItem[]>(DEFAULT_COMMUNITY_CHANNELS);
  const [activeMobileTab, setActiveMobileTab] = useState<"milestones" | "commitments">("milestones");

  useEffect(() => {
    async function loadChannels() {
      try {
        const liveChannels = await getChannels(true);
        if (Array.isArray(liveChannels) && liveChannels.length > 0) {
          setChannels(liveChannels);
        }
      } catch (err) {
        console.warn("Dùng danh sách kênh fallback:", err);
      }
    }
    loadChannels();
  }, []);

  const milestones = [
    {
      season: "MÙA 1 - 3",
      achievement: "Gắn bó cùng Đấu Trường Chân Lý từ những ngày đầu, đạt mốc Kim Cương & Cao Thủ đầu tiên.",
    },
    {
      season: "MÙA 4 - 8",
      achievement: "Chinh phục Top 10 Thách Đấu máy chủ VN, thành lập hội nhóm cờ thủ và mở dịch vụ coaching bắt Meta.",
    },
    {
      season: "MÙA 9 - 11",
      achievement: "Đạt mốc 1,000+ giao dịch thành công, phân phối tài khoản Tướng Tí Nị & Sân Đấu Thần Thoại uy tín hàng đầu.",
    },
    {
      season: "MÙA 12 - 13 (HIỆN TẠI)",
      achievement: "Duy trì vị thế Cựu Thách Đấu 1.134 ĐNG, ký Quỹ Bảo Hiểm 30M Checkscam.vn, phục vụ hơn 1,850+ cờ thủ.",
    },
  ];

  const commitments = [
    {
      title: "Tài Khoản An Toàn 100%",
      desc: "Bảo mật tuyệt đối, không trùng pass, không văng game. Bàn giao full thông tin cho các gói thuê lâu dài.",
      icon: <Lock className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: "Bảo Hiểm 30.000.000đ Checkscam",
      desc: "Ký quỹ đảm bảo uy tín trên Checkscam.vn, cam kết đền bù 100% nếu có bất kỳ rủi ro hay tranh chấp.",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: "Bảo Hành Suốt Thời Gian Thuê",
      desc: "Hỗ trợ 1 ĐỔI 1 ngay lập tức hoặc hoàn tiền 100% nếu tài khoản gặp sự cố bất khả kháng trong lúc thuê.",
      icon: <Award className="w-4 h-4 text-orange-600" />,
    },
    {
      title: "Hỗ Trợ Kỹ Thuật 24/7",
      desc: "Sẵn sàng hỗ trợ đăng nhập, tư vấn xoay bài meta và giải đáp thắc mắc cờ thủ mọi lúc qua Zalo.",
      icon: <Headset className="w-4 h-4 text-sky-600" />,
    },
  ];

  return (
    <section id="about" className="py-6 sm:py-16 bg-white text-slate-900 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-orange-600" />
            <span>Hồ Sơ & Uy Tín Thương Hiệu</span>
          </div>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 font-gaming leading-snug">
            VỀ BẢN THÂN{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
              VŨ TUẤN ANH (TUẤN THÁI BÌNH)
            </span>
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-2xl mx-auto">
            &ldquo;Mình là Vũ Tuấn Anh, một người con sinh ra từ quê lúa Thái Bình. Xuất phát điểm từ đam mê cờ thủ leo Top Thách Đấu, nay mình xây dựng hệ thống ShopTFT Mobile đồng hành uy tín cùng hàng nghìn anh em Đấu Trường Chân Lý trên toàn quốc.&rdquo;
          </p>

          {/* 3 Quick Stat Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto pt-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/70 text-center">
              <span className="text-[10px] text-orange-700 font-bold block uppercase font-gaming">Rank Cao Nhất</span>
              <strong className="text-xs sm:text-sm font-black text-orange-600 font-mono">1.134 ĐNG</strong>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-center">
              <span className="text-[10px] text-emerald-700 font-bold block uppercase font-gaming">Quỹ Bảo Hiểm</span>
              <strong className="text-xs sm:text-sm font-black text-emerald-600 font-mono">30.000.000đ</strong>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/70 text-center">
              <span className="text-[10px] text-sky-700 font-bold block uppercase font-gaming">Cờ Thủ Phục Vụ</span>
              <strong className="text-xs sm:text-sm font-black text-sky-600 font-mono">1,850+ Khách</strong>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* MOBILE VIEW: TAB SELECTOR (HÀNH TRÌNH vs CAM KẾT) ( < md )           */}
        {/* ==================================================================== */}
        <div className="md:hidden mb-8 space-y-3">
          {/* 2-Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveMobileTab("milestones")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-gaming ${
                activeMobileTab === "milestones"
                  ? "bg-white text-orange-600 shadow-sm border border-slate-200/80 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-orange-600" />
              <span>Hành Trình 5+ Năm</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMobileTab("commitments")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-gaming ${
                activeMobileTab === "commitments"
                  ? "bg-white text-emerald-600 shadow-sm border border-slate-200/80 scale-[1.01]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              <span>4 Cam Kết Dịch Vụ</span>
            </button>
          </div>

          {/* Active Tab Content on Mobile */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
            {activeMobileTab === "milestones" ? (
              <div className="space-y-3">
                <div className="relative pl-5 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-orange-500 before:via-amber-400 before:to-slate-200">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="relative">
                      <div className="w-3 h-3 rounded-full bg-white border-2 border-orange-500 absolute -left-[19px] top-2.5 shadow-xs" />
                      <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-black text-orange-600 font-mono uppercase tracking-wider block">
                          {m.season}
                        </span>
                        <p className="text-xs text-slate-700 font-normal leading-relaxed mt-0.5">
                          {m.achievement}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {commitments.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/90 rounded-xl border border-slate-100 flex items-start gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      {c.icon}
                    </div>
                    <div>
                      <strong className="text-slate-900 text-xs font-bold block font-gaming">
                        {c.title}
                      </strong>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-normal mt-0.5">
                        {c.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Checkscam Button at Bottom of Tab */}
            <div className="pt-3.5 mt-3.5 border-t border-slate-100">
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-400/80 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 font-gaming"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xem Hồ Sơ Bảo Hiểm Checkscam ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* DESKTOP VIEW: 2-COLUMN BALANCED LAYOUT ( >= md )                     */}
        {/* ==================================================================== */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch mb-12">
          {/* CỘT TRÁI: HÀNH TRÌNH ĐTCL */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-gaming">Hành Trình 5+ Năm ĐTCL</h3>
                  <span className="text-xs text-slate-500 font-normal">Từ cờ thủ đam mê đến hệ thống dịch vụ uy tín</span>
                </div>
              </div>

              {/* Relative Vertical Timeline with Continuous Gradient Line */}
              <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-orange-500 before:via-amber-400 before:to-slate-200">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative group">
                    <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-orange-500 absolute -left-[23px] top-3 group-hover:scale-125 transition-transform shadow-xs" />
                    <div className="bg-slate-50/80 hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors shadow-xs">
                      <span className="text-xs font-black text-orange-600 font-mono uppercase tracking-wider block">
                        {m.season}
                      </span>
                      <p className="text-xs text-slate-700 font-normal leading-relaxed mt-0.5">
                        {m.achievement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TRIẾT LÝ & 4 CAM KẾT */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-gaming">Triết Lý & Cam Kết Dịch Vụ</h3>
                  <span className="text-xs text-slate-500 font-normal">An toàn - Rõ ràng - Trách nhiệm đến cùng</span>
                </div>
              </div>

              {/* 4 Thẻ Cam Kết */}
              <div className="space-y-2.5">
                {commitments.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 transition-colors shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      {c.icon}
                    </div>
                    <div>
                      <strong className="text-slate-900 text-xs font-bold block font-gaming">
                        {c.title}
                      </strong>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal mt-0.5">
                        {c.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkscam Button at Bottom */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 border border-emerald-400/80 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-sm font-gaming"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Xem Hồ Sơ Bảo Hiểm Checkscam.vn</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              </a>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 3. COMMUNITY CHANNELS: 2x2 GRID ON MOBILE & 4-COL ON DESKTOP        */}
        {/* ==================================================================== */}
        <div className="pt-2">
          <div className="text-center mb-5 sm:mb-6">
            <h3 className="font-extrabold text-base sm:text-xl text-slate-900 flex items-center justify-center gap-2 font-gaming">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              <span>Hệ Sinh Thái & Kênh Truyền Thông Chính Thức</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Tham gia cộng đồng để nhận thông báo acc mới, chia sẻ giáo án meta và hỗ trợ nhanh nhất.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {channels.map((item) => {
              const meta = getPlatformMeta(item.platform);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-md transition-all shadow-xs group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-2 sm:mb-2.5">
                      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl p-2 flex items-center justify-center border ${meta.iconBg}`}>
                        {meta.icon}
                      </div>
                      <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border truncate ${meta.badgeBg}`}>
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5 group-hover:text-orange-600 transition-colors font-gaming line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-normal leading-tight mb-3 line-clamp-2">
                      {item.subtitle}
                    </p>
                  </div>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all active:scale-95 font-gaming ${meta.buttonStyle}`}
                  >
                    <span>{item.buttonText}</span>
                    <ExternalLink className="w-3 h-3 opacity-75" />
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
