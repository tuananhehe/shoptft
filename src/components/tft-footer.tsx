"use client";

import React, { useState } from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  ShieldCheck,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Zap,
  ArrowUp,
} from "lucide-react";

export const TFTFooter: React.FC = () => {
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyToClipboard = (text: string, type: "bank" | "phone") => {
    navigator.clipboard.writeText(text);
    if (type === "bank") {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 relative border-t border-slate-800">
      {/* Top Accent Gradient */}
      <div className="h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-md flex-shrink-0">
                <div
                  className="w-full h-full rounded-[14px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${PROFILE_INFO.avatarUrl})` }}
                />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">{PROFILE_INFO.realName} ({PROFILE_INFO.brandName})</h4>
                <span className="text-xs text-orange-400 font-semibold">{PROFILE_INFO.role}</span>
              </div>
            </div>

            <p className="text-slate-400 font-normal leading-relaxed max-w-md text-xs sm:text-sm">
              Shop Acc TFT Chính Chủ Uy Tín, cung cấp các acc Tướng Tí Nị VIP, Sân đấu thần thoại đổi nhạc và dịch vụ cày rank an toàn, bảo hành trọn đời.
            </p>

            {/* Checkscam badge in footer */}
            <div className="pt-1">
              <a
                href={PROFILE_INFO.checkscamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bảo Hiểm 30.000.000đ Checkscam.vn</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Bank Info */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Thông Tin Chuyển Khoản</h5>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Ngân hàng:</span>
                <strong className="text-white">{PROFILE_INFO.bankInfo.bankName}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Số TK:</span>
                <div className="flex items-center gap-1.5 font-mono text-orange-400 font-bold">
                  <span>{PROFILE_INFO.bankInfo.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(PROFILE_INFO.bankInfo.accountNumber.replace(/\./g, ""), "bank")}
                    className="p-1 hover:text-white"
                    title="Sao chép số tài khoản"
                  >
                    {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Chủ TK:</span>
                <strong className="text-white font-mono">{PROFILE_INFO.bankInfo.accountHolder}</strong>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-light">
              * Vui lòng chỉ giao dịch qua đúng số tài khoản chính chủ trên.
            </p>
          </div>

          {/* Col 3: Contact Channels */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Kênh Hỗ Trợ 24/7</h5>
            <div className="space-y-2">
              <a
                href={PROFILE_INFO.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-sky-500/40 text-slate-200 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-sky-400" />
                  <span>Zalo: {PROFILE_INFO.phoneZalo}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href={`tel:${PROFILE_INFO.phoneZalo.replace(/\./g, "")}`}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-orange-500/40 text-slate-200 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span>Hotline: {PROFILE_INFO.phoneZalo}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {PROFILE_INFO.brandName} - Phát triển bởi Tuấn Thái Bình TFT. All rights reserved.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <span>Lên đầu trang</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
