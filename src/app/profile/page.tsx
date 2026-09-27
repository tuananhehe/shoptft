"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/user-auth-context";
import { PROFILE_INFO } from "@/data/tft-data";
import toast from "react-hot-toast";
import {
  User,
  ShieldCheck,
  MessageCircle,
  Save,
  LogOut,
  ChevronLeft,
  Loader2,
  Calendar,
  Gamepad2,
  ExternalLink,
} from "lucide-react";

export default function MemberProfilePage() {
  const router = useRouter();
  const { user, updateProfile, logout, isLoading } = useUserAuth();

  const [fullName, setFullName] = useState("");
  const [zalo, setZalo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }

    if (user) {
      if (user.requiresProfileCompletion) {
        router.replace("/profile/complete");
        return;
      }
      setFullName(user.full_name || "");
      setZalo(user.zalo || "");
    }
  }, [user, isLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedZalo = zalo.trim();

    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Vui lòng nhập Họ và tên (tối thiểu 2 ký tự).");
      return;
    }

    if (!trimmedZalo || trimmedZalo.length < 6) {
      toast.error("Vui lòng nhập số Zalo / SĐT hợp lệ.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Đang lưu thay đổi...");

    const res = await updateProfile(trimmedName, trimmedZalo);
    setIsSaving(false);

    if (res.success) {
      toast.success("Đã cập nhật thông tin.", { id: toastId });
    } else {
      toast.error(res.message || "Cập nhật thất bại.", { id: toastId });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-white/[0.08] bg-[#0C0C0D]/95 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="text-xs text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 transition-colors"
            >
              Kho Acc
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#121212] border border-white/[0.08] shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/[0.08]">
            <div>
              <h1 className="font-heading font-bold text-2xl tracking-tight text-white">
                Hồ sơ thành viên
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Quản lý thông tin liên hệ nhận tài khoản qua Zalo
              </p>
            </div>
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-300 hover:text-white transition-all"
              title="Hỗ trợ Zalo"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Zalo</span>
            </a>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Username (Readonly) */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Tài khoản
              </label>
              <input
                type="text"
                value={`@${user.username}`}
                disabled
                className="w-full h-11 px-3.5 rounded-xl bg-[#181818] border border-white/[0.05] text-zinc-400 text-sm font-mono cursor-not-allowed"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Tài khoản do Admin tạo và cấp quyền truy cập.
              </span>
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Trạng thái
              </label>
              <div className="w-full h-11 px-3.5 rounded-xl bg-[#181818] border border-white/[0.05] flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-xs">Đang hoạt động (ACTIVE)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold uppercase">
                  Hợp lệ
                </span>
              </div>
            </div>

            {/* Họ và tên (Editable) */}
            <div>
              <label
                htmlFor="user-fullname"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Họ và tên
              </label>
              <input
                id="user-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên..."
                required
                className="w-full h-11 px-3.5 rounded-xl bg-[#181818] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Zalo (Editable) */}
            <div>
              <label
                htmlFor="user-zalo"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Số Zalo liên hệ
              </label>
              <div className="relative">
                <input
                  id="user-zalo"
                  type="text"
                  value={zalo}
                  onChange={(e) => setZalo(e.target.value)}
                  placeholder="Số điện thoại Zalo..."
                  required
                  className="w-full h-11 px-3.5 pl-10 rounded-xl bg-[#181818] border border-white/[0.08] text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-white/30 transition-colors"
                />
                <MessageCircle className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Admin sử dụng số Zalo này để hỗ trợ bàn giao tài khoản.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                <span>Bảo mật hệ thống</span>
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 h-11 bg-white hover:bg-zinc-200 active:scale-98 text-black font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] p-4 text-center">
        <p className="text-[11px] text-zinc-600">
          ShopTFT Mobile • Hỗ trợ bàn giao acc thủ công qua Zalo 24/7
        </p>
      </footer>
    </div>
  );
}
