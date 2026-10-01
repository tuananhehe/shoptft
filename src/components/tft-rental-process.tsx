"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { PROFILE_INFO } from "@/utils/profile-info";
import { analytics } from "@/utils/analytics";
import { Reveal } from "@/components/reveal";

const steps = [
  {
    step: "1",
    title: "Chọn acc",
    desc: "Tìm acc theo Pet, Chibi hoặc Sân Đấu mong muốn tại Kho Acc.",
  },
  {
    step: "2",
    title: "Chọn gói thuê",
    desc: "Kiểm tra chi tiết Linh Thú, Sân Đấu, trạng thái còn acc và mức giá phù hợp.",
  },
  {
    step: "3",
    title: "Liên hệ Zalo",
    desc: "Gửi mã số tài khoản qua Zalo để chủ shop Tuấn Thái Bình hỗ trợ trực tiếp.",
  },
  {
    step: "4",
    title: "Admin xác nhận & bàn giao",
    desc: "Xác nhận gói thuê, bàn giao thông tin đăng nhập và hỗ trợ 1-1.",
  },
];

export const TFTRentalProcess = () => (
  <section
    id="huong-dan"
    style={{ contentVisibility: "auto", containIntrinsicSize: "360px" }}
    className="scroll-mt-14 sm:scroll-mt-20 bg-[#090909] py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]"
  >
    <div className="max-w-6xl mx-auto">
      <Reveal>
        <div className="mb-8 sm:mb-12 text-center">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
            HƯỚNG DẪN
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.02em] text-white leading-tight mt-1.5">
            Cách Thuê Acc TFT tại ShopTFTMobile
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-lg mx-auto font-normal leading-relaxed">
            4 bước đơn giản, minh bạch và hỗ trợ trực tiếp 1-1 qua Zalo từ chủ shop.
          </p>
        </div>
      </Reveal>

      {/* Single Responsive Process Block (No duplicate DOM trees) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative">
        {steps.map((item) => (
          <div
            key={item.step}
            className="flex flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center p-5 rounded-2xl bg-[#121214] border border-white/[0.08] relative hover:border-white/15 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#18181b] border border-white/15 text-white font-mono font-bold text-sm flex items-center justify-center mb-3 shadow-xs">
              {item.step}
            </div>
            <h3 className="font-heading text-sm sm:text-base font-semibold text-white mb-1.5">
              {item.title}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Zalo CTA Button at end of process */}
      <div className="mt-8 sm:mt-10 text-center">
        <a
          href={PROFILE_INFO.zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analytics.trackClickZalo({ source: "rental_process" })}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.15] hover:border-white/30 text-xs sm:text-sm font-medium transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-zinc-300" />
          <span>Liên hệ Zalo ({PROFILE_INFO.phoneZalo})</span>
        </a>
      </div>
    </div>
  </section>
);
