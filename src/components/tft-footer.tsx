"use client";

import React from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { ShieldCheck, MessageCircle, ArrowUp, ExternalLink, Video, MessagesSquare, Users } from "lucide-react";

export const TFTFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="bg-[#070B12] border-t border-white/10 text-gray-400 text-xs font-light">
        <div className="h-[2px] bg-gradient-to-r from-[#FF6B00] via-[#F59E0B] to-[#10B981] w-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            {/* Col 1 */}
            <div className="space-y-4 sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr from-[#FF6B00] via-[#F59E0B] to-[#10B981] shadow-[0_0_15px_rgba(255,107,0,0.3)] flex-shrink-0">
                  <div
                    className="w-full h-full rounded-2xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${PROFILE_INFO.avatarUrl})` }}
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-100 text-base">{PROFILE_INFO.realName} ({PROFILE_INFO.brandName})</h4>
                  <span className="text-[11px] text-[#F59E0B] font-semibold">{PROFILE_INFO.role}</span>
                </div>
              </div>

              <p className="text-gray-400 font-light leading-relaxed max-w-md">
                Shop Acc TFT Chính Chủ Uy Tín, cung cấp các acc Tướng Tí Nị VIP, Sân đấu thần thoại đổi nhạc và dịch vụ cày rank an toàn, bảo hành trọn đời.
              </p>

              {/* Checkscam badge in footer (Emerald #10B981) */}
              <div className="pt-1">
                <a
                  href={PROFILE_INFO.checkscamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-bold hover:bg-[#10B981]/20 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Quỹ Cọc Bảo Hiểm 30.000.000đ Checkscam.vn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Social Channels */}
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={PROFILE_INFO.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>TikTok</span>
                </a>

                <a
                  href={PROFILE_INFO.zaloGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hội Nhóm Zalo</span>
                </a>

                <a
                  href={PROFILE_INFO.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                >
                  <MessagesSquare className="w-3.5 h-3.5" />
                  <span>Discord</span>
                </a>

                <a
                  href={PROFILE_INFO.facebookGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Group Cờ Thủ</span>
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                Danh Mục Nhanh
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#hero" className="hover:text-[#F59E0B] transition-colors">
                    Trang Chủ
                  </a>
                </li>
                <li>
                  <a href="#shop" className="hover:text-[#F59E0B] transition-colors">
                    Kho Acc ĐTCL VIP
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-[#F59E0B] transition-colors">
                    Về {PROFILE_INFO.realName}
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#F59E0B] transition-colors">
                    Cày Thuê & Coaching
                  </a>
                </li>
                <li>
                  <a href="#reviews" className="hover:text-[#F59E0B] transition-colors">
                    Đánh Giá Khách Hàng
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                Cam Kết Bảo Mật
              </h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Quỹ bảo hiểm Checkscam 30M</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Bảo hành hoàn tiền 100%</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Email sạch đổi được ngay</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Giao dịch nhanh 2-5 phút</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2026 {PROFILE_INFO.brandName} - {PROFILE_INFO.realName}. All rights reserved.</p>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] border border-white/10 hover:border-amber-500 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <span>Về Đầu Trang</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Action Button (Standard Zalo Ghost/Glow) */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href={PROFILE_INFO.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-[#0084FF] text-white flex items-center justify-center shadow-[0_0_25px_rgba(0,132,255,0.6)] transition-all hover:scale-110 animate-bounce"
          title="Chat Zalo trực tiếp 24/7"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>
    </>
  );
};
