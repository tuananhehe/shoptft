"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-8 shadow-sm space-y-5 text-center">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-rose-600" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Lỗi trang Admin
          </h2>
          <p className="text-xs text-slate-500">
            Đã xảy ra lỗi khi tải trang quản trị.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
            <p className="text-[11px] font-mono text-rose-700 break-all">
              {error.message}
            </p>
            {error?.digest && (
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <button
          onClick={reset}
          className="w-full py-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    </div>
  );
}
