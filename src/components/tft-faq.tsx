"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { PROFILE_INFO } from "@/utils/profile-info";
import { analytics } from "@/utils/analytics";
import { Reveal } from "@/components/reveal";

interface FAQItem {
  q: string;
  a: string | React.ReactNode;
}

const FAQS_LIST: FAQItem[] = [
  {
    q: "Thuê acc TFT như thế nào?",
    a: (
      <span>
        Bạn chỉ cần duyệt kho acc trên website, chọn tài khoản ưng ý theo Linh Thú hoặc Sân Đấu và bấm liên hệ Zalo. Chủ shop Tuấn Thái Bình sẽ tư vấn trực tiếp, xác nhận gói thuê và hướng dẫn bạn giao dịch. Xem chi tiết tại{" "}
        <a href="/thue-acc-tft-dtcl" className="text-amber-400 hover:underline font-medium">
          Dịch vụ Thuê Acc TFT - ĐTCL
        </a>
        .
      </span>
    ),
  },
  {
    q: "VIP và Clone khác nhau ra sao?",
    a: "Acc VIP là dòng tài khoản cao cấp sở hữu nhiều tướng Tí Nị Thần Thoại đồ hiệu, hiệu ứng kết liễu và Sân Đấu đổi nhạc EDM độc quyền dành cho anh em thích trải nghiệm. Acc Clone là tài khoản phụ giá tốt, rank sạch sẽ, phù hợp cho nhu cầu duo leo rank cùng bạn bè hoặc test giáo án mới.",
  },
  {
    q: "Acc đang thuê có chọn được không?",
    a: "Khi tài khoản hiển thị nhãn 'ĐANG THUÊ', bạn có thể xem thời gian hết hạn dự kiến và nhắn Zalo để đặt lịch trước, hoặc duyệt các tài khoản tương tự đang hiển thị 'CÒN ACC' có sẵn trong kho.",
  },
  {
    q: "Bàn giao tài khoản bằng cách nào?",
    a: "Sau khi thống nhất gói thuê, chủ shop Tuấn Thái Bình sẽ trực tiếp bàn giao thông tin đăng nhập Riot ID qua tin nhắn Zalo 1-1 và đồng hành hướng dẫn bạn đăng nhập an toàn vào game trên cả PC lẫn điện thoại (TFT Mobile).",
  },
  {
    q: "Có hướng dẫn đổi thông tin Riot không?",
    a: (
      <span>
        Có. Đối với các gói thuê dài hạn hoặc tài khoản có hỗ trợ đổi thông tin, shop có bài viết hướng dẫn chi tiết từng bước đổi mật khẩu, email và bật bảo mật 2FA tại{" "}
        <a href="/huong-dan/doi-thong-tin-acc-riot" className="text-amber-400 hover:underline font-medium">
          Hướng dẫn đổi thông tin Riot
        </a>{" "}
        hoặc xem trang tổng hợp{" "}
        <a href="/huong-dan" className="text-amber-400 hover:underline font-medium">
          Hướng Dẫn Dịch Vụ
        </a>
        .
      </span>
    ),
  },
  {
    q: "Khi cần hỗ trợ liên hệ ở đâu?",
    a: `ShopTFTMobile hỗ trợ trực tiếp 1-1 qua số Hotline & Zalo chính thức: ${PROFILE_INFO.phoneZalo}. Bạn có thể nhắn tin cho Tuấn Thái Bình để được tư vấn bất kỳ lúc nào.`,
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
    <section
      id="faq"
      style={{ contentVisibility: "auto", containIntrinsicSize: "400px" }}
      className="py-12 sm:py-16 bg-[#09090b] text-white border-b border-white/[0.08]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs font-semibold uppercase tracking-[0.08em] mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>HỎI ĐÁP</span>
            </div>

          <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.02em] text-white leading-tight">
            Câu Hỏi Khi Thuê Acc TFT - ĐTCL
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-lg mx-auto leading-relaxed">
            Giải đáp các thắc mắc phổ biến về quy trình thuê, bàn giao và tài khoản thành viên.
          </p>
        </div>
        </Reveal>

        {/* FAQ Accordion List */}
        <Reveal delay={80}>
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
        </Reveal>
      </div>
    </section>
  );
};
