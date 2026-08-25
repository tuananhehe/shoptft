"use client";

import React, { useState } from "react";
import { FAQS } from "@/data/tft-data";
import { HelpCircle, ChevronDown } from "lucide-react";

export const TFTFAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-[#0E1422] text-[#F9FAFB] border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="space-y-3 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Giải Đáp Thắc Mắc</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-50">
            CÂU HỎI THƯỜNG GẶP (FAQ)
          </h2>
          <p className="text-gray-400 font-light text-sm max-w-xl mx-auto">
            Những thông tin quan trọng bạn cần biết trước và sau khi mua tài khoản tại Shop.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-amber-500/40"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-100 hover:text-[#F59E0B] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-[#F59E0B]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-gray-300 font-light leading-relaxed border-t border-white/5 pt-4 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
