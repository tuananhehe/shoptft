"use client";

import React, { useState } from "react";
import { CUSTOMER_REVIEWS, ReviewItem } from "@/data/tft-data";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const TFTReviews: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeProof, setActiveProof] = useState<ReviewItem | null>(null);
  const [page, setPage] = useState(0);

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
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-4">
                  "{rev.comment}"
                </p>
              </div>

              {/* Footer with Proof Thumbnail */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">{rev.date}</span>

                {/* Clickable Proof Image */}
                <button
                  onClick={() => setActiveProof(rev)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors shadow-sm"
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

      {/* Proof Lightbox Modal */}
      {activeProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setActiveProof(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Xác Thực Giao Dịch Thành Công
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-0.5">
                {activeProof.customerName} - {activeProof.accountBought}
              </h3>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${activeProof.proofImage})` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
              <span>Mã GD: {activeProof.transactionCode}</span>
              <span className="text-emerald-600 font-bold">✓ Đã đối soát Checkscam</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
