"use client";

import React, { useState } from "react";
import { FAQS } from "@/data/tft-data";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export const TFTFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-[#F8FAFC] text-slate-900 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
            <span>Câu Hỏi Thường Gặp</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            HỎI ĐÁP & HƯỚNG DẪN THUÊ ACC
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal">
            Giải đáp chi tiết các thắc mắc về quy trình nhận acc, bảo mật và chính sách đền bù.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-orange-600 transition-colors"
              >
                <span className="text-sm sm:text-base font-bold">{faq.q}</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                  {openIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-orange-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {openIndex === idx && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TFTFAQ = TFTFaq;
