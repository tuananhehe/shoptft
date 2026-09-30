"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";
import { reportError } from "@/utils/error-monitor";
import { PROFILE_INFO } from "@/data/tft-data";

export default function GuideError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { route: "/huong-dan", component: "GuideError" });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#121214] border border-white/[0.08] rounded-2xl p-6 sm:p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
            Không tải được nội dung hướng dẫn
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            Trang hướng dẫn gặp sự cố tạm thời. Bạn có thể bấm Thử lại hoặc nhắn tin trực tiếp qua Zalo để được hỗ trợ.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto h-10 px-5 rounded-xl bg-white hover:bg-zinc-200 active:scale-98 text-black font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>

          <a
            href={PROFILE_INFO.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-98 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hỗ trợ Zalo</span>
          </a>
        </div>
      </div>
    </div>
  );
}
