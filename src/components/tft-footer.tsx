"use client";

import React from "react";
import Link from "next/link";
import { PROFILE_INFO } from "@/data/tft-data";
import { analytics } from "@/utils/analytics";
import { ShieldCheck, MessageCircle, ArrowUp } from "lucide-react";

export const TFTFooter: React.FC = () => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}
      className="bg-[#09090b] text-zinc-400 border-t border-white/[0.08] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/[0.06]">
          {/* Col 1: Brand Info (2 cols on md) */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                <img
                  src={PROFILE_INFO.avatarUrl}
                  alt={PROFILE_INFO.realName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-heading font-bold text-white text-sm">
                  {PROFILE_INFO.realName}
                </h4>
                <p className="text-xs text-zinc-400">ShopTFTMobile</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-normal leading-relaxed max-w-sm">
              Hệ thống duyệt và thuê tài khoản TFT/ĐTCL theo Pet, Chibi & Sân Đấu. Bàn giao và hỗ trợ trực tiếp 1-1 qua Zalo bởi Tuấn Thái Bình TFT.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-emerald-400 text-xs font-medium hover:border-emerald-500/40 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bảo hiểm 30M Checkscam</span>
              </a>
              <span className="text-[11px] text-zinc-500 font-mono">
                Domain: shoptftmobile.net
              </span>
            </div>
          </div>

          {/* Col 2: SHOP & BLOG */}
          <div className="space-y-3">
            <h5 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              NỘI DUNG & SHOP
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/ve-shop" className="hover:text-white transition-colors">
                  Về Shop
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/blog/tft-mua-18" className="hover:text-white transition-colors">
                  Cẩm Nang Mùa 18
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: DỊCH VỤ */}
          <div className="space-y-3">
            <h5 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              DỊCH VỤ
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Kho Acc
                </Link>
              </li>
              <li>
                <Link href="/thue-acc-tft-dtcl" className="hover:text-white transition-colors">
                  Thuê Acc TFT - ĐTCL
                </Link>
              </li>
              <li>
                <Link href="/shop?type=vip" className="hover:text-white transition-colors">
                  Kho VIP (Chibi & Sân)
                </Link>
              </li>
              <li>
                <Link href="/shop?type=clone" className="hover:text-white transition-colors">
                  Kho Clone (Sở hữu)
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=newest" className="hover:text-white transition-colors">
                  Acc Mới
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: HỖ TRỢ & THÀNH VIÊN */}
          <div className="space-y-3">
            <h5 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              HỖ TRỢ
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={PROFILE_INFO.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => analytics.trackClickZalo({ source: "footer" })}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span>Zalo ({PROFILE_INFO.phoneZalo})</span>
                </a>
              </li>
              <li>
                <Link href="/huong-dan" className="hover:text-white transition-colors">
                  Hướng Dẫn Dịch Vụ
                </Link>
              </li>
              <li>
                <Link href="/huong-dan/doi-thong-tin-acc-riot" className="hover:text-white transition-colors">
                  Đổi Thông Tin Acc Riot
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li className="pt-2 border-t border-white/[0.04]">
                <Link href="/login" className="text-zinc-300 hover:text-white font-medium">
                  Đăng nhập thành viên →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} ShopTFTMobile • Vận hành bởi Tuấn Thái Bình TFT • Website chính thức: shoptftmobile.net</p>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs"
          >
            <span>Lên đầu trang</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
