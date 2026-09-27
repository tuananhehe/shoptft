import React from "react";
import { MessageCircle } from "lucide-react";
import { PROFILE_INFO } from "@/utils/profile-info";

const steps = [
  {
    step: "01",
    title: "Tìm acc",
    desc: "Tìm theo Pet, Chibi hoặc Sân Đấu.",
  },
  {
    step: "02",
    title: "Chọn acc",
    desc: "Xem thông tin, giá và trạng thái.",
  },
  {
    step: "03",
    title: "Liên hệ Zalo",
    desc: "Gửi mã acc cho ShopTFTMobile.",
  },
  {
    step: "04",
    title: "Nhận acc",
    desc: "Thanh toán và nhận thông tin tài khoản trực tiếp từ shop.",
  },
];

export const TFTRentalProcess = () => (
  <section className="bg-[#090909] py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 sm:mb-12 text-center">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
          HƯỚNG DẪN
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.02em] text-white leading-tight mt-1.5">
          Quy Trình Thuê Acc
        </h2>
        <p className="text-zinc-400 text-sm mt-1 max-w-lg mx-auto font-normal leading-relaxed">
          Quy trình đơn giản, bảo mật và hỗ trợ trực tiếp từ chủ shop.
        </p>
      </div>

      {/* Desktop Process line 01 -------- 02 -------- 03 -------- 04 */}
      <div className="hidden md:grid md:grid-cols-4 gap-6 relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[1px] bg-white/[0.1] -z-0" />

        {steps.map((item) => (
          <div key={item.step} className="flex flex-col items-center text-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#141414] border border-white/[0.15] text-white font-mono font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
              {item.step}
            </div>
            <h3 className="font-heading text-base font-semibold text-white mb-1">
              {item.title}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-[200px]">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="md:hidden space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/[0.1]">
        {steps.map((item) => (
          <div key={item.step} className="relative">
            <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#141414] border border-white/[0.2] flex items-center justify-center text-[9px] font-mono text-white">
              {item.step.replace(/^0/, "")}
            </span>
            <h3 className="text-sm font-semibold text-white">
              {item.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
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
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.15] hover:border-white/30 text-xs sm:text-sm font-medium transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-zinc-300" />
          <span>Liên hệ Zalo ({PROFILE_INFO.phoneZalo})</span>
        </a>
      </div>
    </div>
  </section>
);
