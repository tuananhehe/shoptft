"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserAuth } from "@/context/user-auth-context";
import { PROFILE_INFO } from "@/data/tft-data";
import toast from "react-hot-toast";
import {
  Lock,
  User,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { user, login, isLoading } = useUserAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Nếu đã đăng nhập rồi:
  useEffect(() => {
    if (!isLoading && user) {
      if (user.requiresProfileCompletion) {
        router.replace("/profile/complete");
      } else {
        router.replace(redirectUrl);
      }
    }
  }, [user, isLoading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Đang xác thực tài khoản...");

    const res = await login(trimmedUser, password);
    setIsSubmitting(false);

    if (!res.success) {
      toast.dismiss(toastId);
      setErrorMessage(res.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      return;
    }

    toast.success("Đăng nhập thành công!", { id: toastId });

    if (res.requiresProfileCompletion) {
      router.replace("/profile/complete");
    } else {
      router.replace(redirectUrl);
    }
  };

  const zaloContactMsg = encodeURIComponent(
    "Chào ShopTFTMobile, mình muốn liên hệ để được cấp tài khoản thành viên trên website."
  );
  const zaloUrl = `${PROFILE_INFO.zaloUrl}?text=${zaloContactMsg}`;

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header Bar */}
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
            HỆ THỐNG THÀNH VIÊN
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto px-4 py-8 sm:py-12">
        <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient backdrop */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Header Title */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              ĐĂNG NHẬP THÀNH VIÊN
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Tài khoản được cấp trực tiếp bởi ShopTFTMobile.
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
                htmlFor="username"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản được cấp..."
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full h-11 px-3.5 pl-10 rounded-xl bg-[#181818] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  required
                  className="w-full h-11 px-3.5 pl-10 rounded-xl bg-[#181818] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-2 bg-white hover:bg-zinc-200 active:scale-98 text-black font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Contact shop note (No self-registration) */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Bạn chưa có tài khoản?
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Liên hệ ShopTFTMobile để được cấp tài khoản thành viên.
            </p>

            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] text-zinc-200 hover:text-white text-xs font-medium transition-all"
            >
              <MessageCircle className="w-4 h-4 text-zinc-400" />
              <span>Liên Hệ Zalo Nhận Tài Khoản</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 text-center border-t border-white/[0.08]">
        <p className="text-[11px] text-zinc-600">
          ShopTFT Mobile • Hỗ trợ bảo mật Riot Games & TFT
        </p>
      </div>
    </div>
  );
}
