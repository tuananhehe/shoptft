"use client";

import React from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  ShieldCheck,
  Phone,
  MessageCircle,
  ExternalLink,
  ArrowUp,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react";

export const TFTFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 relative border-t border-slate-800">
      {/* Top Accent Gradient */}
      <div className="h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Brand Info */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-md flex-shrink-0">
                <img
                  src={PROFILE_INFO.avatarUrl}
                  alt="Tuấn Thái Bình - Admin Shop Thuê Acc TFT ĐTCL"
                  className="w-full h-full rounded-[14px] object-cover"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">
                  {PROFILE_INFO.realName} ({PROFILE_INFO.brandName})
                </h4>
                <span className="text-xs text-orange-400 font-semibold">{PROFILE_INFO.role}</span>
              </div>
            </div>

            <p className="text-slate-400 font-normal leading-relaxed max-w-md text-xs sm:text-sm">
              Shop Acc TFT Chính Chủ Uy Tín, cung cấp các acc Tướng Tí Nị VIP, Sân đấu thần thoại đổi nhạc và dịch vụ cày rank an toàn, bảo mật tuyệt đối.
            </p>

            {/* Checkscam badge in footer */}
            <div className="pt-1">
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo Hiểm 30.000.000đ Checkscam.vn</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Col 3: Quy Trình Thuê Nhanh (Thay thế Khung chuyển khoản) */}
          <div className="space-y-3.5">
            <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span>QUY TRÌNH THUÊ NHANH</span>
            </h5>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-slate-900 font-black text-[10px] flex items-center justify-center">1</span>
                  <span>Chọn acc & gói thuê</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed pl-5.5">
                  Tự do chọn thời gian chơi theo nhu cầu (2h, 7 ngày, 30 ngày, thuê lâu dài).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-orange-500 text-slate-900 font-black text-[10px] flex items-center justify-center">2</span>
                  <span>Gửi đơn qua Zalo</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed pl-5.5">
                  Hệ thống tự động sao chép mã đơn và mở khung chat Zalo với shop.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-900 font-black text-[10px] flex items-center justify-center">3</span>
                  <span>Nhận acc & Pass 30s</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed pl-5.5">
                  Shop gửi STK riêng và bàn giao tài khoản ngay lập tức.
                </p>
              </div>
            </div>
          </div>

          {/* Col 4: Kênh Hỗ Trợ 24/7 */}
          <div className="space-y-3.5">
            <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>KÊNH HỖ TRỢ 24/7</span>
            </h5>

            {/* Dòng trạng thái Online */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>🟢 Đang Online Sẵn Sàng Bàn Giao Acc</span>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={PROFILE_INFO.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-sky-500/40 text-slate-200 transition-colors text-xs shadow-sm group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span>Zalo: <strong>{PROFILE_INFO.phoneZalo}</strong></span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              </a>

              <a
                href={`tel:${PROFILE_INFO.phoneZalo.replace(/\./g, "")}`}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-orange-500/40 text-slate-200 transition-colors text-xs shadow-sm group"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span>Hotline: <strong>{PROFILE_INFO.phoneZalo}</strong></span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 {PROFILE_INFO.brandName} - Tuấn Thái Bình TFT. All rights reserved.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 shadow-sm"
          >
            <span>Lên đầu trang</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
