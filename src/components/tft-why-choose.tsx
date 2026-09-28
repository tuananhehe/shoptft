import React from "react";
import { Reveal } from "@/components/reveal";

const stats = [
  { value: "30M", label: "Bảo hiểm giao dịch" },
  { value: "5+ năm", label: "Đồng hành cùng ĐTCL" },
  { value: "Zalo", label: "Bàn giao trực tiếp" },
  { value: "1-1", label: "Hỗ trợ cùng chủ shop" },
];

export const TFTWhyChoose = () => (
  <section
    style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}
    className="bg-[#090909] py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]"
  >
    <div className="max-w-7xl mx-auto">
      <Reveal>
        <div className="mb-6 sm:mb-8 text-center">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
            UY TÍN & CAM KẾT
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.02em] text-white leading-tight mt-1.5">
            Tại Sao Chọn ShopTFTMobile
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] max-w-5xl mx-auto">
          {stats.map((s, idx) => (
            <div
              key={s.label}
              className={`flex flex-col items-center text-center px-4 ${
                idx > 1 ? "pt-6 sm:pt-0" : ""
              }`}
            >
              <span className="font-heading text-2xl sm:text-3xl lg:text-[38px] font-bold tracking-tight text-white">
                {s.value}
              </span>
              <span className="text-xs sm:text-sm text-zinc-400 mt-1.5 font-normal">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  </section>
);
