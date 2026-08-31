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
  Sparkles,
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
    buttonText: "Xem TikTok ➔",
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
    buttonText: "Tham Gia Zalo ➔",
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
    buttonText: "Vào Discord ➔",
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
    buttonText: "Gia Nhập Nhóm ➔",
    isActive: true,
    order: 4,
  },
];

export const TFTAbout: React.FC = () => {
  const [channels, setChannels] = useState<CommunityChannelItem[]>(DEFAULT_COMMUNITY_CHANNELS);

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
    { season: "MÙA 1 - 3", achievement: "Bắt đầu gắn bó cùng Đấu Trường Chân Lý, đạt mốc Kim Cương & Cao Thủ đầu tiên." },
    { season: "MÙA 4 - 8", achievement: "Chinh phục Top 10 Thách Đấu máy chủ Việt Nam, thành lập hội nhóm cờ thủ và mở dịch vụ coaching bắt Meta." },
    { season: "MÙA 9 - 11", achievement: "Đạt mốc 1,000+ giao dịch thành công, phân phối tài khoản Tướng Tí Nị & Sân Đấu Thần Thoại uy tín hàng đầu." },
    { season: "MÙA 12 - 13 (HIỆN TẠI)", achievement: "Duy trì vị thế Cựu Thách Đấu Việt Nam // 1.134 ĐNG, đóng Quỹ Bảo Hiểm 30M Checkscam.vn, phục vụ 1,850+ anh em game thủ." },
  ];

  const commitments = [
    {
      title: "Tài Khoản An Toàn 100%",
      desc: "Cam kết tài khoản bảo mật tuyệt đối, không bị văng game hay tranh chấp khi đang chơi. Bàn giao full thông tin cho các gói thuê lâu dài.",
      icon: <Lock className="w-4 h-4 text-emerald-600" />,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Bảo Hiểm 30.000.000đ Checkscam",
      desc: "Ký quỹ đảm bảo uy tín, cam kết đền bù 100% giá trị nếu xảy ra bất kỳ tranh chấp tài khoản.",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Bảo Hành Suốt Thời Gian Thuê",
      desc: "Chịu trách nhiệm 100% các vấn đề phát sinh. Hỗ trợ 1 ĐỔI 1 ngay lập tức nếu tài khoản gặp lỗi đăng nhập hoặc sự cố bất khả kháng.",
      icon: <Award className="w-4 h-4 text-orange-600" />,
      badgeColor: "bg-orange-100 text-orange-700",
    },
    {
      title: "Hỗ Trợ Kỹ Thuật 24/7",
      desc: "Sẵn sàng giải đáp xoay bài meta, mẹo leo rank và xử lý sự cố đăng nhập tức thì.",
      icon: <Headset className="w-4 h-4 text-sky-600" />,
      badgeColor: "bg-sky-100 text-sky-700",
    },
  ];

  return (
    <section id="about" className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. SECTION HEADER: Cập nhật Tiêu đề & Subtitle trích dẫn */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-orange-600" />
            <span>Hồ Sơ Cá Nhân & Thương Hiệu</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-snug">
            VỀ BẢN THÂN{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
              VŨ TUẤN ANH (TUẤN THÁI BÌNH)
            </span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
            "Mình là Vũ Tuấn Anh, một người con sinh ra từ quê lúa Thái Bình. Xuất phát điểm từ đam mê cờ thủ leo Top Thách Đấu, nay mình xây dựng hệ thống ShopTFT Mobile đồng hành uy tín cùng hàng nghìn anh em Đấu Trường Chân Lý trên toàn quốc."
          </p>
        </div>

        {/* 2. LAYOUT WRAPPER: grid-cols-1 lg:grid-cols-2 gap-8 items-stretch (2 cột bằng nhau tuyệt đối) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12">
          
          {/* CỘT TRÁI: HÀNH TRÌNH ĐTCL (Đường line dọc màu cam/xám) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Hành Trình 5+ Năm ĐTCL</h3>
                  <span className="text-xs text-slate-500 font-normal">Từ kỳ thủ đam mê đến hệ thống phân phối uy tín</span>
                </div>
              </div>

              {/* Relative Vertical Timeline with Continuous Gradient Line */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[2px] before:bg-gradient-to-b before:from-orange-500 before:via-amber-400 before:to-slate-200">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative group">
                    {/* Glowing Bullet Dot */}
                    <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-orange-500 absolute -left-[23px] top-3.5 group-hover:scale-125 transition-transform shadow-sm" />
                    
                    {/* Milestone Card Box */}
                    <div className="bg-slate-50/80 hover:bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-100/90 transition-colors shadow-sm">
                      <span className="text-xs font-black text-orange-600 font-mono uppercase tracking-wider block">
                        {m.season}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed mt-1">
                        {m.achievement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TRIẾT LÝ & 4 CAM KẾT (Cân bằng chiều cao) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Triết Lý & Cam Kết Dịch Vụ</h3>
                  <span className="text-xs text-slate-500 font-normal">An toàn - Rõ ràng - Trách nhiệm đến cùng</span>
                </div>
              </div>

              {/* 4 Thẻ Cam Kết */}
              <div className="space-y-3">
                {commitments.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-100/90 flex items-start gap-3 transition-colors shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/70 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      {c.icon}
                    </div>
                    <div>
                      <strong className="text-slate-900 text-xs sm:text-sm font-bold block">
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
            <div className="pt-5 mt-5 border-t border-slate-100">
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 border border-emerald-500 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>XEM HỒ SƠ BẢO HIỂM CHECKSCAM.VN ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3. COMMUNITY CHANNELS (4 Card Cộng Đồng) */}
        <div className="pt-2">
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
            {channels.map((item) => {
              const meta = getPlatformMeta(item.platform);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all shadow-sm group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`w-12 h-12 rounded-xl p-2.5 flex items-center justify-center border ${meta.iconBg}`}>
                        {meta.icon}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
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
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${meta.buttonStyle}`}
                  >
                    <span>{item.buttonText}</span>
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
