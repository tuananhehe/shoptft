"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { reportError } from "@/utils/error-monitor";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { route: "global_error", component: "GlobalError" });
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 selection:bg-white selection:text-black font-sans">
        <div className="max-w-md w-full bg-[#121214] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Gián đoạn hệ thống
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Trang web gặp sự cố kết nối. Vui lòng tải lại trang.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full h-10 px-5 rounded-xl bg-white hover:bg-zinc-200 active:scale-98 text-black font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tải lại trang</span>
          </button>
        </div>
      </body>
    </html>
  );
}
