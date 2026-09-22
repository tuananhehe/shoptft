import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white selection:bg-orange-500 selection:text-white">
      {/* Main Loader Content */}
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        {/* Animated Brand Spinner */}
        <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />

        {/* Text Tiêu Đề */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            ShopTFT
          </div>
          <p className="text-slate-300 font-medium text-xs tracking-wide">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    </div>
  );
}
