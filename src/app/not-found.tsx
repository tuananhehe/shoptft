import React from "react";
import Link from "next/link";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export const metadata = {
  title: {
    absolute: "Không tìm thấy trang | ShopTFTMobile",
  },
  description: "Trang bạn đang tìm có thể đã được thay đổi hoặc không còn tồn tại.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      <TFTNavbar />
      <main className="max-w-2xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 text-zinc-400 font-mono text-lg font-bold mx-auto">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight text-white">
            Không tìm thấy trang
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
            Trang bạn đang tìm có thể đã được thay đổi hoặc không còn tồn tại.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-[#09090b] font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/10 font-semibold text-xs sm:text-sm transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Xem kho acc</span>
          </Link>
        </div>
      </main>
      <TFTFooter />
    </div>
  );
}
