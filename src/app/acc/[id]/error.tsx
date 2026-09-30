"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ShoppingBag, ArrowLeft } from "lucide-react";
import { reportError } from "@/utils/error-monitor";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { route: "/acc/[id]", component: "ProductDetailError" });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 selection:bg-white selection:text-black">
      <div className="max-w-md w-full bg-[#121214] border border-white/[0.08] rounded-2xl p-6 sm:p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
            Không tải được thông tin tài khoản
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            Hệ thống gặp lỗi kết nối khi lấy dữ liệu tài khoản này. Đây không phải lỗi do tài khoản bị xóa, bạn có thể thử tải lại.
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

          <Link
            href="/shop"
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-98 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Xem kho acc</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
