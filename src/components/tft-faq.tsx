"use client";

import React, { useState, useMemo } from "react";
import { FAQS, PROFILE_INFO, FAQItem } from "@/data/tft-data";
import { FAQConfigItem } from "@/utils/homepage-service";
import {
  HelpCircle,
  ChevronDown,
  Search,
  MessageCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  Lock,
  Swords,
  CreditCard,
} from "lucide-react";

interface TFTFaqProps {
  customFaqs?: FAQConfigItem[];
}

export const TFTFaq: React.FC<TFTFaqProps> = ({ customFaqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const displayFaqs = customFaqs && customFaqs.length > 0 ? customFaqs : FAQS;

  const categories = [
    { id: "ALL", label: "Tất Cả Câu Hỏi", icon: HelpCircle },
    { id: "THUE_ACC", label: "Thuê Acc & Bàn Giao", icon: Zap },
    { id: "BAO_MAT", label: "Bảo Mật & Đổi Pass", icon: Lock },
    { id: "CAY_RANK", label: "Cày Rank & Coaching", icon: Swords },
    { id: "THANH_TOAN", label: "Thanh Toán & Quỹ 30M", icon: CreditCard },
  ];

  // Lọc câu hỏi theo Danh mục và Ô tìm kiếm
  const filteredFaqs = useMemo(() => {
    return displayFaqs.filter((faq) => {
      const matchCategory =
        selectedCategory === "ALL" || faq.category === selectedCategory;
      const matchQuery =
        searchQuery.trim() === "" ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [displayFaqs, selectedCategory, searchQuery]);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-[#F8FAFC] text-slate-900 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
            <span>Trung Tâm Trợ Giúp & FAQ</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            HỎI ĐÁP & HƯỚNG DẪN THUÊ ACC TFT
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal">
            Giải đáp chi tiết và minh bạch tất cả các thắc mắc về quy trình nhận acc, bảo hành và chính sách cam kết tại Shop Tuấn Thái Bình.
          </p>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="space-y-4 mb-10">
          {/* Ô Tìm Kiếm Nhanh */}
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh: đổi pass, hoàn tiền, cọc, mobile..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setOpenIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                      : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 shadow-sm ${
                    isOpen
                      ? "border-orange-500 ring-2 ring-orange-500/10 shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full p-5 sm:p-5.5 text-left flex items-center justify-between gap-4 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      {faq.badge && (
                        <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 font-bold text-[10px] uppercase flex-shrink-0">
                          {faq.badge}
                        </span>
                      )}
                      <span className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? "text-orange-600" : "text-slate-900 group-hover:text-orange-600"}`}>
                        {faq.q}
                      </span>
                    </div>

                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      isOpen ? "bg-orange-600 text-white rotate-180" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-0 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100/80 font-normal">
                      <div className="pt-3.5 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
              Không tìm thấy câu hỏi phù hợp với từ khóa "<strong>{searchQuery}</strong>". Bạn hãy nhắn tin trực tiếp để shop giải đáp nhé!
            </div>
          )}
        </div>

        {/* Need More Help Card (CTA) */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-600/15 relative overflow-hidden">
          <div className="space-y-1.5 text-center sm:text-left z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-200 flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hỗ Trợ Trực Tuyến 24/7</span>
            </span>
            <h3 className="text-lg sm:text-xl font-black">
              Bạn vẫn còn câu hỏi thắc mắc khác?
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 font-normal max-w-md">
              Nhắn tin trực tiếp qua Zalo của Tuấn Thái Bình để được giải đáp thắc mắc và tư vấn chọn acc trong 30 giây!
            </p>
          </div>

          <a
            href={PROFILE_INFO.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white hover:bg-slate-50 text-orange-700 hover:text-orange-800 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 flex items-center gap-2 flex-shrink-0 z-10 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-orange-600" />
            <span>Chat Zalo: {PROFILE_INFO.phoneZalo}</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export const TFTFAQ = TFTFaq;
