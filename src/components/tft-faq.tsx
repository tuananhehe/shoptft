"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { PROFILE_INFO } from "@/utils/profile-info";
import { analytics } from "@/utils/analytics";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS_LIST: FAQItem[] = [
  {
    q: "Thuê acc như thế nào?",
    a: "Bạn chỉ cần duyệt kho acc trên website, chọn tài khoản ưng ý, sau đó bấm nút 'Thuê Ngay' để kết nối trực tiếp với shop qua Zalo và hoàn tất thanh toán.",
  },
  {
    q: "Acc được bàn giao thế nào?",
    a: "Sau khi bạn xác nhận và thanh toán, ShopTFTMobile sẽ bàn giao thông tin đăng nhập trực tiếp và hướng dẫn bạn đăng nhập an toàn qua tin nhắn Zalo.",
  },
  {
    q: "Nếu acc đang được thuê thì sao?",
    a: "Bạn có thể xem thời gian hết hạn dự kiến của tài khoản, bấm xem các acc tương tự trong kho, hoặc nhắn Zalo cho shop để đặt lịch giữ acc ngay khi có sẵn.",
  },
  {
    q: "Tài khoản thành viên dùng để làm gì?",
    a: "Tài khoản thành viên giúp bạn lưu trữ thông tin liên hệ Zalo, xem lịch sử giao dịch và nhận các ưu đãi khách hàng thân thiết từ ShopTFTMobile.",
  },
  {
    q: "Làm sao có tài khoản thành viên?",
    a: "Tài khoản thành viên được ShopTFTMobile cấp trực tiếp. Website không mở đăng ký công khai nhằm đảm bảo tính bảo mật và quản lý khách hàng uy tín.",
  },
  {
    q: "Shop hỗ trợ qua đâu?",
    a: `ShopTFTMobile hỗ trợ khách hàng trực tiếp và nhanh chóng qua Zalo chính thức (${PROFILE_INFO.phoneZalo}). Bạn có thể liên hệ bất kỳ lúc nào để được giải đáp.`,
  },
];

interface TFTFaqProps {
  customFaqs?: FAQItem[];
}

export const TFTFaq: React.FC<TFTFaqProps> = ({ customFaqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = customFaqs && customFaqs.length > 0 ? customFaqs : FAQS_LIST;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-[#09090b] text-white border-b border-white/[0.08]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-[0.08em] mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>HỎI ĐÁP</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.02em] text-white leading-tight">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-lg mx-auto leading-relaxed">
            Giải đáp các thắc mắc phổ biến về quy trình thuê, bàn giao và tài khoản thành viên.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#121214] border border-white/[0.08] hover:border-white/15 transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="font-heading font-semibold text-sm sm:text-base text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04]">
                    <div className="pt-2">{faq.a}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support CTA */}
        <div className="mt-8 text-center">
          <a
            href={PROFILE_INFO.zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.trackClickZalo({ source: "faq" })}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Chưa tìm thấy câu trả lời? Nhắn tin qua Zalo cho shop →</span>
          </a>
        </div>
      </div>
    </section>
  );
};
