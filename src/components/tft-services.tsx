"use client";

import React from "react";
import { SERVICE_PACKAGES, PROFILE_INFO } from "@/data/tft-data";
import { Swords, Check, MessageCircle, Zap } from "lucide-react";

export const TFTServices: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-[#0E1422] text-[#F9FAFB] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#F59E0B] text-xs font-bold uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5" />
            <span>Dịch Vụ Gaming Chuyên Nghiệp</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-50">
            CÀY THUÊ RANK &{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              COACHING 1-1
            </span>
          </h2>
          <p className="text-gray-400 font-light text-sm sm:text-base">
            Nâng tầm trình độ, phá vỡ giới hạn elo cùng cựu tuyển thủ Cựu Thách Đấu Việt Nam. Bảo mật tuyệt đối danh tính.
          </p>
        </div>

        {/* 3 Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICE_PACKAGES.map((srv) => (
            <div
              key={srv.id}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                srv.popular
                  ? "bg-gradient-to-b from-[#1F2937] to-[#111827] border-2 border-amber-500 shadow-[0_0_35px_rgba(255,107,0,0.25)] md:-translate-y-2"
                  : "bg-[#111827] border border-white/10 hover:border-white/20 hover:-translate-y-1 shadow-lg"
              }`}
            >
              {srv.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#F59E0B] text-white text-[11px] font-black uppercase tracking-wider shadow-lg">
                  GÓI ĐƯỢC CHỌN NHIỀU NHẤT
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#F59E0B] uppercase tracking-widest block mb-1">
                    {srv.badge}
                  </span>
                  <h3 className="text-xl font-bold text-gray-50 leading-snug">{srv.title}</h3>
                  <div className="text-2xl font-black text-white mt-3 font-mono">
                    {srv.price}
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-6">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                    Quyền Lợi & Cam Kết:
                  </span>
                  <ul className="space-y-2.5 text-xs text-gray-300 font-light">
                    {srv.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <a
                  href={`https://zalo.me/0352867283?text=${encodeURIComponent(
                    `Chào Tuấn, mình muốn tư vấn dịch vụ: ${srv.title}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-12 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    srv.popular
                      ? "bg-gradient-to-r from-[#FF6B00] to-[#F59E0B] hover:from-[#e55f00] hover:to-[#d98200] text-white shadow-lg hover:scale-105 font-extrabold"
                      : "bg-[#1F2937] hover:bg-[#374151] text-gray-200 border border-white/10 hover:scale-105"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Đăng Ký Tư Vấn Ngay</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
