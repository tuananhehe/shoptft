import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Gamepad2, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const TFTSeoSupportBlock: React.FC = () => {
  return (
    <section className="bg-[#090909] py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="rounded-2xl sm:rounded-3xl bg-[#121214] border border-white/[0.08] p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>DỊCH VỤ THUÊ ACC TFT & ĐTCL</span>
                </div>

                <h2 className="font-heading text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-white leading-snug">
                  Trải Nghiệm Linh Thú Đồ Hiệu & Leo Rank Cùng ShopTFTMobile
                </h2>

                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-normal">
                  ShopTFTMobile là hệ thống kết nối và cung cấp dịch vụ thuê tài khoản ĐTCL (TFT Mobile & PC) uy tín, vận hành trực tiếp bởi cựu Thách Đấu Tuấn Thái Bình. Chúng tôi giúp bạn thỏa sức trải nghiệm những bộ sưu tập Linh Thú Tí Nị Thần Thoại đắt giá (Ahri, Yasuo, Gwen...) và Sân Đấu đổi nhạc EDM sống động mà không cần đầu tư số tiền lớn. Toàn bộ kho acc được phân định rõ ràng giữa dòng Acc VIP đồ hiệu và Acc Clone giá tốt, hỗ trợ kiểm tra chi tiết trước khi thuê. Mọi giao dịch và thông tin đăng nhập đều được bàn giao trực tiếp 1-1 qua Zalo nhằm đảm bảo sự minh bạch và an toàn tuyệt đối.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium">
                  <Link
                    href="/thue-acc-tft-dtcl"
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors font-semibold"
                  >
                    <span>Xem chi tiết Dịch Vụ Thuê Acc TFT - ĐTCL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <span className="text-zinc-600 hidden sm:inline">•</span>

                  <Link
                    href="/huong-dan"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Hướng Dẫn Dịch Vụ & Bảo Mật Riot
                  </Link>
                </div>
              </div>

              <div className="flex-shrink-0 self-start md:self-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs sm:text-sm transition-all shadow-sm group"
                >
                  <Gamepad2 className="w-4 h-4 text-zinc-950" />
                  <span>Duyệt Kho Acc</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
