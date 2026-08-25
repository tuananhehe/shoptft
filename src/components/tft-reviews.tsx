"use client";

import React, { useState } from "react";
import { CUSTOMER_REVIEWS, ReviewItem, PROFILE_INFO } from "@/data/tft-data";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Image as ImageIcon,
  X,
  ExternalLink,
  ChevronRight,
  Award,
  Filter,
} from "lucide-react";

const REVIEW_CATEGORIES = [
  { id: "ALL", label: "TẤT CẢ (1,850+)" },
  { id: "MUA_ACC", label: "MUA ACC VIP" },
  { id: "CAY_THUE", label: "CÀY THUÊ RANK" },
  { id: "COACHING", label: "COACHING 1-1" },
];

export const TFTReviews: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedProof, setSelectedProof] = useState<ReviewItem | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const filteredReviews = CUSTOMER_REVIEWS.filter((rev) => {
    if (activeCategory === "ALL") return true;
    return rev.category === activeCategory;
  });

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 3);

  return (
    <section id="reviews" className="py-24 bg-[#0A0E17] text-[#F9FAFB] border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Giao Dịch Thật • Bảo Hiểm 30M Checkscam</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-50">
            ĐÁNH GIÁ & <span className="text-[#10B981]">CHỨNG THỰC UY TÍN</span>
          </h2>
          <p className="text-gray-400 font-light text-sm sm:text-base">
            Hình ảnh bill ngân hàng, tin nhắn bàn giao tài khoản và nhận xét thực tế từ cộng đồng cờ thủ TFT.
          </p>
        </div>

        {/* 1. OVERALL RATING SUMMARY BAR */}
        <div className="bg-[#111827]/90 border border-white/10 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Big Score (4 cols) */}
            <div className="lg:col-span-4 text-center lg:text-left lg:border-r border-white/10 lg:pr-8 space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="text-5xl sm:text-6xl font-black text-[#F59E0B] font-mono tracking-tight">
                  4.9
                </span>
                <div>
                  <div className="flex items-center gap-1 text-[#F59E0B]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#F59E0B]" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-medium block mt-1">
                    Điểm đánh giá trung bình
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-light">
                Dựa trên <strong className="text-gray-100 font-bold">1,850+ lượt giao dịch thực tế</strong> được xác thực tại hệ thống {PROFILE_INFO.brandName}.
              </p>
            </div>

            {/* Star Distribution Bars (5 cols) */}
            <div className="lg:col-span-5 space-y-2 text-xs">
              {/* 5 Stars */}
              <div className="flex items-center gap-3">
                <span className="w-12 text-gray-400 font-mono">5 Sao</span>
                <div className="flex-1 h-2.5 bg-[#0A0E17] rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-[#FF6B00] to-[#F59E0B] rounded-full w-[96%]" />
                </div>
                <span className="w-10 text-right text-gray-300 font-mono font-bold">96%</span>
              </div>

              {/* 4 Stars */}
              <div className="flex items-center gap-3">
                <span className="w-12 text-gray-400 font-mono">4 Sao</span>
                <div className="flex-1 h-2.5 bg-[#0A0E17] rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-amber-500 rounded-full w-[4%]" />
                </div>
                <span className="w-10 text-right text-gray-300 font-mono font-bold">4%</span>
              </div>

              {/* 3 Stars */}
              <div className="flex items-center gap-3 text-gray-500">
                <span className="w-12 font-mono">3 Sao</span>
                <div className="flex-1 h-2.5 bg-[#0A0E17] rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gray-700 rounded-full w-[0%]" />
                </div>
                <span className="w-10 text-right font-mono">0%</span>
              </div>
            </div>

            {/* Quick Guarantees (3 cols - Emerald #10B981) */}
            <div className="lg:col-span-3 bg-[#0A0E17] border border-white/5 p-4 rounded-xl space-y-2 text-xs text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[#10B981] font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>99.9% Đề Xuất Shop</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[#10B981] font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>100% Ảnh Bill Có Thật</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[#10B981] font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Bảo Hiểm Checkscam 30M</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FILTER TAGS */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Phân Loại:</span>
            </span>
            {REVIEW_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-[#FF6B00] to-[#F59E0B] text-white shadow-[0_0_15px_rgba(255,107,0,0.35)]"
                    : "bg-[#111827] text-gray-400 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-400">
            Hiển thị <strong className="text-gray-100 font-mono">{displayedReviews.length}</strong> / {filteredReviews.length} phản hồi tuyển chọn
          </div>
        </div>

        {/* 3. REVIEW CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#111827]/90 border border-white/10 hover:border-[#10B981]/40 p-6 sm:p-7 rounded-2xl flex flex-col justify-between h-full space-y-6 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-[0_12px_35px_rgba(0,0,0,0.6)] group"
            >
              {/* Card Top */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[#F59E0B]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F59E0B]" />
                    ))}
                    <span className="text-[11px] text-gray-500 ml-2 font-mono">{rev.date}</span>
                  </div>

                  {/* Emerald Verified Tag */}
                  <span className="px-2.5 py-1 rounded-md bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{rev.verifiedTag}</span>
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed italic">
                  "{rev.comment}"
                </p>

                {/* Proof Screenshot Thumbnail */}
                <div className="pt-2">
                  <div
                    onClick={() => setSelectedProof(rev)}
                    className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#0A0E17] border border-white/10 group/proof cursor-pointer"
                  >
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover/proof:scale-105"
                      style={{ backgroundImage: `url(${rev.proofImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-between p-3" />

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white">
                      <span className="text-[10px] font-mono text-gray-300 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>Mã GD: {rev.transactionCode}</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#F59E0B] group-hover/proof:underline flex items-center gap-0.5">
                        <span>Phóng to</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Always Aligned */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full bg-[#1F2937] border border-white/10 bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${rev.avatar})` }}
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-100 flex items-center gap-1">
                      <span>{rev.customerName}</span>
                    </div>
                    <div className="text-[11px] text-[#F59E0B] font-semibold">
                      {rev.accountBought}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0A0E17] border border-white/10 text-gray-400 font-mono">
                  {rev.categoryLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 4. EXPAND MORE REVIEWS BUTTON */}
        {!showAllReviews && filteredReviews.length > 3 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAllReviews(true)}
              className="h-12 px-7 rounded-xl bg-[#111827] hover:bg-[#1F2937] border border-white/10 hover:border-amber-500 text-gray-200 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md hover:scale-105"
            >
              <span>Xem Thêm {filteredReviews.length - 3}+ Đánh Giá & Ảnh Bill Khác</span>
              <ChevronRight className="w-4 h-4 text-[#F59E0B]" />
            </button>
          </div>
        )}

        {/* 5. ASSURANCE BANNER */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-[#111827]/70 border border-white/10 hover:border-emerald-500/40 transition-colors flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-gray-50 flex items-center justify-center md:justify-start gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Bạn cần xem thêm bill chuyển khoản hoặc kiểm tra uy tín trực tiếp?</span>
            </h4>
            <p className="text-xs text-gray-400 font-light">
              Tuấn sẵn sàng gửi lịch sử giao dịch ngân hàng, ảnh bill bank và call Discord/Zalo đối chứng 24/7.
            </p>
          </div>

          <a
            href={PROFILE_INFO.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 px-8 border border-sky-500/50 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 whitespace-nowrap transition-all hover:scale-105"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Nhắn Zalo Check Uy Tín</span>
          </a>
        </div>
      </div>

      {/* 6. PROOF LIGHTBOX MODAL */}
      {selectedProof && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedProof(null)}
        >
          <div
            className="bg-[#111827] border-2 border-amber-500/40 max-w-xl w-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-fadeIn relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-[#0A0E17] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-[#10B981]">
                  {selectedProof.verifiedTag}
                </span>
                <h4 className="text-sm font-bold text-white">
                  Chứng thực: {selectedProof.accountBought}
                </h4>
              </div>

              <button
                onClick={() => setSelectedProof(null)}
                className="w-8 h-8 rounded-lg bg-[#1F2937] border border-white/10 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Large Image Preview */}
            <div className="p-4 bg-[#0A0E17]">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedProof.proofImage})` }}
                />
              </div>
            </div>

            {/* Details Footer */}
            <div className="p-4 bg-[#111827] border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Khách hàng: <strong className="text-white">{selectedProof.customerName}</strong></span>
                <span className="text-gray-400">Mã GD: <strong className="text-[#F59E0B] font-mono">{selectedProof.transactionCode}</strong></span>
              </div>
              <p className="text-xs text-gray-300 font-light italic">
                "{selectedProof.comment}"
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
