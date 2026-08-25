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
            CÀY THUÊ RANK & COACHING 1-1
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
                  ? "bg-white border-2 border-orange-500 shadow-xl md:-translate-y-2"
                  : "bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md shadow-sm"
              }`}
            >
              {srv.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                  GÓI ĐƯỢC CHỌN NHIỀU NHẤT
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-1 rounded-md border border-orange-200">
                    {srv.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cam kết bảo mật</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{srv.title}</h3>
                <div className="text-2xl font-black text-red-600 font-mono mb-6">{srv.price}</div>

                <ul className="space-y-3 mb-8">
                  {srv.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={PROFILE_INFO.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                  srv.popular
                    ? "bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white shadow-md hover:shadow-lg"
                    : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300"
                }`}
              >
                <MessageCircle className="w-4 h-4 text-sky-500" />
                <span>Liên Hệ Zalo Đặt Lịch</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
