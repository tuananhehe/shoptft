"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Check, Copy, CheckCircle2, X, ArrowRight } from "lucide-react";
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
    toast.success("Đã sao chép lại tin nhắn đơn hàng!", { icon: "📋" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmOkiBae = async () => {
    // Đảm bảo sao chép lần cuối vào clipboard
    await copyToClipboard(orderMessage);
    const targetUrl = buildZaloOrderUrl(zaloUrl, orderMessage);
    
    // Đóng popup
    onClose();
    
    // Mở Zalo
    window.open(targetUrl, "_blank");
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scaleIn flex flex-col relative text-slate-900 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 w-full" />

        {/* Close Button Top-Right */}
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center absolute top-4 right-4 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-7 space-y-4 sm:space-y-5 text-center">
          {/* Icon Header */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
          </div>

          {/* Headline */}
          <div className="space-y-1.5 sm:space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">
              Đã tự động sao chép tin nhắn đơn hàng!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto font-medium">
              Nhớ <strong className="text-orange-700">&quot;Dán&quot;</strong> sẵn đoạn copy rồi gửi.
            </p>
          </div>

          {/* Preview Box of Copied Message */}
          <div className="relative p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-1.5 group">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
              <span>Nội dung đã sao chép:</span>
              <button
                type="button"
                onClick={handleManualCopy}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Đã chép lại" : "Chép lại"}</span>
              </button>
            </div>

            <p className="text-xs font-mono text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 max-h-24 sm:max-h-28 overflow-y-auto leading-relaxed whitespace-pre-wrap select-all">
              {orderMessage}
            </p>
          </div>

          {/* CTA Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleConfirmOkiBae}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 active:from-orange-900 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-orange-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-gaming cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span>Oki bae 🚀 (Mở Zalo ngay)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
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
