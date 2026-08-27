"use client";

import React from "react";
import { SERVICE_PACKAGES, PROFILE_INFO } from "@/data/tft-data";
import { Swords, Check, MessageCircle, Zap, ShieldCheck } from "lucide-react";

export const TFTServices: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5 text-orange-600" />
            <span>Dịch Vụ Gaming Chuyên Nghiệp</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            CÀY THUÊ RANK & COACHING 1-1 ĐTCL
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal">
            Nâng tầm trình độ, phá vỡ giới hạn elo cùng cựu tuyển thủ Cựu Thách Đấu Việt Nam. Bảo mật tuyệt đối danh tính.
          </p>
        </div>

        {/* 3 Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {SERVICE_PACKAGES.map((srv) => (
            <div
              key={srv.id}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                srv.popular
                  ? "bg-white border-2 border-orange-500 shadow-xl shadow-orange-600/10 -translate-y-1"
                  : "bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {srv.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-orange-600 text-white text-[10px] font-black tracking-wider uppercase shadow-md">
                  GÓI ĐƯỢC ĐẶT NHIỀU NHẤT
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                    {srv.badge}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {srv.title}
                  </h3>
                </div>

                <div className="py-2 border-y border-slate-100">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {srv.price}
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600">
                  {srv.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <a
                  href={PROFILE_INFO.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    srv.popular
                      ? "bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white shadow-md shadow-orange-700/20 hover:scale-[1.02]"
                      : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Tư Vấn Zalo Ngay</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
