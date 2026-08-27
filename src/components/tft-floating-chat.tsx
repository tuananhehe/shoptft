"use client";

import React from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { MessageCircle } from "lucide-react";

export const TFTFloatingChat: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 md:right-8 md:bottom-8 z-50 flex items-center">
      {/* Tooltip Hover (Chỉ hiển thị trên Desktop) */}
      <span className="hidden sm:inline-block mr-3 px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-xl shadow-xl border border-slate-700/80 pointer-events-none transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
        💬 Chat Zalo 24/7 ({PROFILE_INFO.phoneZalo})
      </span>

      {/* Bong Bóng Nổi Tròn Hoàn Hảo */}
      <a
        href={PROFILE_INFO.zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nhắn tin Zalo với Tuấn Thái Bình"
        className="group relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-blue-500 hover:from-sky-600 hover:to-blue-700 text-white shadow-xl shadow-blue-600/35 hover:shadow-2xl hover:shadow-blue-600/50 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Vòng tròn tỏa sóng Radar Ping */}
        <span className="absolute -inset-1 rounded-full bg-blue-500 opacity-40 animate-ping pointer-events-none" />

        {/* Chấm Xanh Trạng Thái Online */}
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />

        {/* Icon Zalo Message Trắng */}
        <div className="relative z-10 flex items-center justify-center">
          <MessageCircle className="w-7 h-7 text-white fill-white/20 transition-transform group-hover:rotate-12" />
        </div>
      </a>
    </div>
  );
};
