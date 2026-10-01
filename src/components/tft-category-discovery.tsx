import React from "react";
import Link from "next/link";
import { Sparkles, Gamepad2, Crown, Layers, Clock, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

const categories = [
  {
    title: "Pet / Chibi",
    desc: "Tìm acc có pet & chibi yêu thích",
    href: "/shop?focus=pet",
    Icon: Sparkles,
  },
  {
    title: "Sân Đấu",
    desc: "Khám phá sân đấu đổi nhạc EDM",
    href: "/shop?focus=arena",
    Icon: Gamepad2,
  },
  {
    title: "VIP",
    desc: "Kho acc VIP thuê theo giờ",
    href: "/shop?type=vip",
    Icon: Crown,
  },
  {
    title: "Clone",
    desc: "Acc clone / smurf sở hữu",
    href: "/shop?type=clone",
    Icon: Layers,
  },
  {
    title: "Acc Mới",
    desc: "Các tài khoản vừa cập nhật",
    href: "/shop?sort=newest",
    Icon: Clock,
  },
];

export const TFTCategoryDiscovery = () => (
  <section
    style={{ contentVisibility: "auto", containIntrinsicSize: "360px" }}
    className="bg-[#090909] py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]"
  >
    <div className="max-w-7xl mx-auto">
      <Reveal>
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">
            DANH MỤC
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.02em] text-white leading-tight mt-1.5">
            Tìm Acc TFT Theo Nhu Cầu
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl font-normal leading-relaxed">
            Lọc nhanh tài khoản phù hợp với sở thích và phong cách chơi của bạn.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((cat, idx) => (
          <Reveal key={cat.title} delay={idx * 40}>
            <Link
              href={cat.href}
              className="group flex flex-col justify-between p-4 rounded-2xl bg-[#141414] hover:bg-[#18181b] border border-white/[0.08] hover:border-white/20 transition-all duration-200 ease-out hover:-translate-y-[2px] cursor-pointer h-full"
            >
            <div>
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:scale-105 transition-all mb-3">
                <cat.Icon className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-white block">
                {cat.title}
              </span>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                {cat.desc}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition-colors">
              <span className="text-[11px] font-medium">Khám phá</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
