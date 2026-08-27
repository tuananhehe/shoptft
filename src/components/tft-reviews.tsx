"use client";

import React, { useState } from "react";
import { CUSTOMER_REVIEWS } from "@/data/tft-data";
import {
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Bảng màu Pastel Gaming cho Avatar chữ cái
const AVATAR_COLOR_PALETTES = [
  "bg-orange-100 text-orange-600 border-orange-200",
  "bg-blue-100 text-blue-600 border-blue-200",
  "bg-emerald-100 text-emerald-600 border-emerald-200",
  "bg-purple-100 text-purple-600 border-purple-200",
  "bg-rose-100 text-rose-600 border-rose-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-indigo-100 text-indigo-600 border-indigo-200",
  "bg-teal-100 text-teal-600 border-teal-200",
];

// Hàm lấy chữ cái đầu tiên của tên khách hàng
const getCustomerInitial = (name: string): string => {
  const clean = name.replace(/\([^)]*\)/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "T";
  const lastName = words[words.length - 1];
  return lastName.charAt(0).toUpperCase();
};

// Hàm lấy màu ngẫu nhiên theo index
const getAvatarColor = (name: string, index: number): string => {
  return AVATAR_COLOR_PALETTES[index % AVATAR_COLOR_PALETTES.length];
};

export const TFTReviews: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
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
            Hơn 4,500+ lượt thuê tài khoản và 1,850+ giao dịch thành công. Phản hồi thực tế từ cộng đồng cờ thủ ĐTCL.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
          {currentReviews.map((rev, index) => {
            const initial = getCustomerInitial(rev.customerName);
            const colorClass = getAvatarColor(rev.customerName, index);

            return (
              <div
                key={rev.id}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all shadow-sm group"
              >
                <div>
                  {/* Header với AVATAR DẠNG CHỮ CÁI (Letter/Initials Avatar) */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center font-black text-base sm:text-lg flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${colorClass}`}
                    >
                      <span>{initial}</span>
                    </div>

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

                {/* Footer Card: Giữ lại phần hiển thị thời gian nằm gọn gàng góc trái */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-start text-xs text-slate-400 font-normal">
                  <span>{rev.date}</span>
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
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-600 font-mono">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
