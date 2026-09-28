"use client";

import React, { useState, useEffect } from "react";
import { getReviewsApi, CustomerReviewItem } from "@/utils/reviews-service";
import { ReviewModal } from "@/components/review-modal";
import {
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  MessageCircle,
} from "lucide-react";

const getCustomerInitial = (name: string): string => {
  const clean = name.replace(/\([^)]*\)/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "T";
  const lastName = words[words.length - 1];
  return lastName.charAt(0).toUpperCase();
};

export const TFTReviews: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [liveReviews, setLiveReviews] = useState<CustomerReviewItem[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const fetchReviews = async () => {
    try {
      const res = await getReviewsApi(false);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setLiveReviews(res.data);
      }
    } catch {
      // Giữ danh sách hiện tại nếu lỗi mạng
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const categories = [
    { id: "ALL", label: "Tất Cả" },
    { id: "THUE_ACC", label: "Thuê Acc TFT" },
    { id: "CAY_THUE", label: "Cày Rank" },
    { id: "COACHING", label: "Coaching" },
  ];

  const filteredReviews = liveReviews.filter((rev) => {
    if (selectedCategory === "ALL") return true;
    return rev.category === selectedCategory;
  });

  const totalPages = Math.ceil(filteredReviews.length / 3) || 1;
  const currentReviews = filteredReviews.slice(page * 3, (page + 1) * 3);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setPage(0);
  };

  return (
    <section id="reviews" className="py-12 sm:py-16 lg:py-20 bg-[#09090b] text-white border-b border-white/[0.08] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
            Ý KIẾN KHÁCH HÀNG
          </span>

          <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-white leading-tight">
            Khách Hàng Nói Gì Về ShopTFTMobile
          </h2>

          <p className="text-zinc-400 text-xs sm:text-sm font-normal leading-relaxed">
            Trải nghiệm thực tế từ người chơi đã thuê tài khoản và sử dụng dịch vụ tại ShopTFTMobile.
          </p>

          {/* Action Bar */}
          <div className="pt-3 flex items-center justify-center">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-zinc-300" />
              <span>Gửi Đánh Giá & Góp Ý</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-white text-[#09090b] font-semibold shadow-sm"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Reviews 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {currentReviews.map((rev) => {
            const initial = getCustomerInitial(rev.customerName);

            return (
              <div
                key={rev.id}
                className="bg-[#121214] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Header: Avatar + Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-white font-heading font-bold text-sm flex items-center justify-center flex-shrink-0">
                      <span>{initial}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-bold text-white text-xs sm:text-sm truncate">
                        {rev.customerName}
                      </p>
                      <span className="text-[11px] text-zinc-400 font-normal truncate block">
                        {rev.accountBought || "Thuê tài khoản"}
                      </span>
                    </div>
                  </div>

                  {/* Stars (Rendered only from real review rating) */}
                  {rev.rating && Number(rev.rating) > 0 && (
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(Math.min(5, Math.max(1, Number(rev.rating))))].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal mb-3">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Admin Reply Box */}
                  {rev.adminReply && (
                    <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs mb-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-medium">
                        <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Phản hồi từ ShopTFTMobile:</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">{rev.adminReply}</p>
                    </div>
                  )}
                </div>

                {/* Footer Card */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>{rev.date || "Gần đây"}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-sans font-medium text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Đã xác nhận</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              aria-label="Trang trước"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-zinc-300 border border-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-400 font-mono">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              aria-label="Trang tiếp theo"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:pointer-events-none text-zinc-300 border border-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={fetchReviews}
      />
    </section>
  );
};
