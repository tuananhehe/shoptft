"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/user-auth-context";
import toast from "react-hot-toast";
import {
  UserCheck,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, completeProfile, isLoading } = useUserAuth();

  const [fullName, setFullName] = useState("");
  const [zalo, setZalo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }

    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.zalo) setZalo(user.zalo);

      // Nếu đã hoàn tất đầy đủ rồi thì không cần ở lại trang này
      if (
        user.full_name &&
        user.full_name.trim().length >= 2 &&
        user.zalo &&
        user.zalo.trim().length >= 6 &&
        !user.requiresProfileCompletion
      ) {
        router.replace("/profile");
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = fullName.trim();
    const trimmedZalo = zalo.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Vui lòng nhập Họ và tên (tối thiểu 2 ký tự).");
      return;
    }

    if (!trimmedZalo || trimmedZalo.length < 6) {
      setErrorMessage("Vui lòng nhập số điện thoại hoặc Zalo hợp lệ.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Đang lưu thông tin...");

    const res = await completeProfile(trimmedName, trimmedZalo);
    setIsSubmitting(false);

    if (!res.success) {
      toast.dismiss(toastId);
      setErrorMessage(res.message || "Cập nhật thất bại. Vui lòng thử lại.");
      return;
    }

    toast.success("Đã hoàn tất hồ sơ thành viên!", { id: toastId });
    router.replace("/profile");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-white/[0.08]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-mono text-zinc-400">
            BƯỚC BẮT BUỘC
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle top line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Heading */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-white">
              Hoàn tất thông tin
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Vui lòng bổ sung thông tin để ShopTFTMobile hỗ trợ bạn thuận tiện hơn.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username-display"
                className="block text-xs font-medium text-zinc-400 mb-1.5"
              >
                Tài khoản thành viên
              </label>
              <input
                id="username-display"
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full h-11 px-3.5 rounded-xl bg-[#161616] border border-white/[0.05] text-zinc-400 text-sm font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="full-name"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Họ và tên <span className="text-rose-400">*</span>
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A..."
                required
                className="w-full h-11 px-3.5 rounded-xl bg-[#181818] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="zalo-contact"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Zalo <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="zalo-contact"
                  type="text"
                  value={zalo}
                  onChange={(e) => setZalo(e.target.value)}
                  placeholder="Ví dụ: 0352867283 hoặc Zalo ID..."
                  required
                  className="w-full h-11 px-3.5 pl-10 rounded-xl bg-[#181818] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
                <MessageCircle className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                Dùng để ShopTFTMobile liên hệ hỗ trợ và bàn giao thông tin qua Zalo.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-4 bg-white hover:bg-zinc-200 active:scale-98 text-black font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Hoàn tất</span>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-center gap-2 text-zinc-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Thông tin được bảo mật nội bộ tại ShopTFTMobile.</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center border-t border-white/[0.08]">
        <p className="text-[11px] text-zinc-600">
          ShopTFT Mobile • Hỗ trợ bảo mật Riot Games & TFT
        </p>
      </div>
    </div>
  );
}
