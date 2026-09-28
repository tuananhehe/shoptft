"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Check, Copy, CheckCircle2, X } from "lucide-react";
import { copyToClipboard, buildZaloOrderUrl } from "@/utils/clipboard-helper";
import toast from "react-hot-toast";

interface ZaloRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderMessage: string;
  zaloUrl: string;
}

export const ZaloRedirectModal: React.FC<ZaloRedirectModalProps> = ({
  isOpen,
  onClose,
  orderMessage,
  zaloUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Đóng bằng phím ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleManualCopy = async () => {
    await copyToClipboard(orderMessage);
    setCopied(true);
    toast.success("Đã sao chép lại tin nhắn đơn thuê!", { icon: "📋" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmZalo = async () => {
    await copyToClipboard(orderMessage);
    const targetUrl = buildZaloOrderUrl(zaloUrl, orderMessage);
    onClose();
    window.open(targetUrl, "_blank");
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f11] border border-white/[0.12] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col relative text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top-Right */}
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/10 flex items-center justify-center absolute top-4 right-4 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 space-y-4 text-center">
          {/* Icon Header */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          {/* Headline */}
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
              Đã sao chép nội dung thuê tài khoản!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Khi Zalo mở lên, bạn chỉ cần <strong className="text-white">&quot;Dán&quot;</strong> tin nhắn và gửi để shop bàn giao nhanh nhất.
            </p>
          </div>

          {/* Preview Box of Copied Message */}
          <div className="relative p-3.5 rounded-2xl bg-[#141416] border border-white/[0.08] text-left space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase font-mono">
              <span>Nội dung tin nhắn:</span>
              <button
                type="button"
                onClick={handleManualCopy}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Đã chép lại" : "Chép lại"}</span>
              </button>
            </div>

            <p className="text-xs font-mono text-zinc-300 bg-black/40 p-2.5 rounded-xl border border-white/5 max-h-24 sm:max-h-28 overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
              {orderMessage}
            </p>
          </div>

          {/* CTA Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleConfirmZalo}
              className="w-full py-3 px-6 rounded-xl bg-white hover:bg-zinc-200 text-[#09090b] font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Mở Zalo Nhắn Tin Ngay</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Để mình xem lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (mounted && typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
