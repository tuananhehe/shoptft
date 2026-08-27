import React from "react";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white relative overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Background Soft Glow Rings */}
      <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20 animate-pulse" />
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20 animate-pulse" />

      {/* Main Loader Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-4">
        {/* Animated Brand Spinner */}
        <div className="relative flex items-center justify-center">
          {/* Spinner Vòng Tròn Màu Cam */}
          <div className="w-14 h-14 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          
          {/* Logo Dot Inner Glow */}
          <div className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 opacity-80 animate-ping" />
          <div className="absolute w-4 h-4 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
        </div>

        {/* Text Tiêu Đề & Nhấp Nháy Pulse */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ShopTFT Mobile</span>
          </div>
          <p className="text-slate-300 font-semibold text-sm tracking-wide animate-pulse">
            Tuấn Thái Bình TFT • Đang tải dữ liệu...
          </p>
        </div>
      </div>
    </div>
  );
}
