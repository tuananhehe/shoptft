"use client";

import React, { useState, useEffect } from "react";
import { CUSTOMER_REVIEWS, ReviewItem } from "@/data/tft-data";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Sparkles,
  Receipt,
  ExternalLink,
} from "lucide-react";

export const TFTReviews: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeProof, setActiveProof] = useState<ReviewItem | null>(null);
  const [page, setPage] = useState(0);

  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveProof(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const categories = [
    { id: "ALL", label: "Tất Cả Đánh Giá" },
    { id: "THUE_ACC", label: "Thuê Acc TFT" },
    { id: "CAY_THUE", label: "Cày Thuê Rank" },
    { id: "COACHING", label: "Coaching 1-1" },
  ];

  const filteredReviews = CUSTOMER_REVIEWS.filter((rev) => {
    if (selectedCategory === "ALL") return true;
    return rev.category === selectedCategory;
  });

  const totalPages = Math.ceil(filteredReviews.length / 3);
  const currentReviews = filteredReviews.slice(page * 3, (page + 1) * 3);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setPage(0);
  };

  return (
    <section id="reviews" className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Đánh Giá Thực Tế Từ Khách Hàng</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            MINH BẠCH & UY TÍN
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal">
            Hơn 4,500+ lượt thuê tài khoản và 1,850+ giao dịch thành công. Kèm ảnh chụp màn hình bill và phản hồi Zalo thực tế.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Reviews 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {currentReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all shadow-sm group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl bg-cover bg-center border border-slate-200 flex-shrink-0"
                    style={{ backgroundImage: `url(${rev.avatar})` }}
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{rev.customerName}</h4>
                    <span className="text-[11px] text-slate-500 font-normal">{rev.accountBought}</span>
                  </div>
                </div>

                {/* Stars & Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{rev.verifiedTag}</span>
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mb-4">
                  "{rev.comment}"
                </p>
              </div>

              {/* Footer with Proof Button */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">{rev.date}</span>

                {/* Clickable Proof Button */}
                <button
                  onClick={() => setActiveProof(rev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-orange-50 hover:border-orange-300 text-slate-700 hover:text-orange-600 text-[11px] font-semibold border border-slate-200 transition-colors shadow-sm cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-600" />
                  <span>Xem ảnh bill</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 border border-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-600 font-mono">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 border border-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL LIGHTBOX XEM ẢNH BILL PHÓNG TO SẮC NÉT                 */}
      {/* ============================================================ */}
      {activeProof && (
        <div
          onClick={() => setActiveProof(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 sm:p-6 relative shadow-2xl space-y-4 animate-scaleUp overflow-hidden"
          >
            {/* Top Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 uppercase tracking-wider flex items-center gap-1">
                    <Receipt className="w-3 h-3 text-orange-600" />
                    <span>Minh Chứng Giao Dịch Thật</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                    ✓ ĐÃ XÁC THỰC
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mt-1.5">
                  {activeProof.customerName}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {activeProof.accountBought}
                </p>
              </div>

              {/* Nút đóng */}
              <button
                onClick={() => setActiveProof(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ảnh bill phóng to 16:9 sắc nét */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${activeProof.proofImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-semibold bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  {activeProof.verifiedTag}
                </span>
              </div>
            </div>

            {/* Nhận xét của khách */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 italic">
              "{activeProof.comment}"
            </div>

            {/* Footer Bill info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-mono">
              <span>Mã GD: <strong className="text-slate-800">{activeProof.transactionCode}</strong> • {activeProof.date}</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Bảo hiểm 30M Checkscam</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
