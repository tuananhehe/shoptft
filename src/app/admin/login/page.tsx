"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PROFILE_INFO } from "@/data/tft-data";
import toast from "react-hot-toast";
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
  Sparkles,
  AlertTriangle,
  Loader2,
  Crown,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Chống dò mật khẩu (Brute-force protection)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Kiểm tra nếu đã đăng nhập từ trước -> chuyển thẳng vào /admin
  useEffect(() => {
    async function checkCurrentSession() {
      try {
        const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
        const res = await fetch("/api/admin/auth", {
          headers: localToken ? { "x-admin-token": localToken } : {},
        });
        const data = await res.json();
        if (data.authenticated) {
          router.replace("/admin");
          return;
        }
      } catch (err) {
        // Not authenticated
      } finally {
        setCheckingAuth(false);
      }
    }
    checkCurrentSession();
  }, [router]);

  // Bộ đếm lùi thời gian khóa khi nhập sai quá 5 lần
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutSeconds > 0) {
      toast.error(`Hệ thống đang tạm khóa! Vui lòng thử lại sau ${lockoutSeconds} giây.`);
      return;
    }

    if (!password.trim()) {
      toast.error("Vui lòng nhập mật khẩu quản trị!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: password.trim(),
          remember: rememberMe,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token && typeof window !== "undefined") {
          localStorage.setItem("shoptft_admin_token", data.token);
        }
        toast.success("✅ Xác thực quản trị viên thành công!");
        setFailedAttempts(0);
        router.replace("/admin");
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutSeconds(60);
          toast.error("⚠️ Bạn đã nhập sai 5 lần! Hệ thống tạm khóa 60 giây để bảo vệ an toàn.");
        } else {
          toast.error(data.error || "Mật khẩu quản trị không đúng!");
        }
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối máy chủ! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Đang kiểm tra quyền quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Background Gradients & Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-orange-600/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Minimal */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Về Trang Chủ ShopTFT</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="hidden sm:inline">Hệ Thống Bảo Mật Quản Trị Viên</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-6 relative">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 rounded-full" />

          {/* Logo & Avatar */}
          <div className="text-center space-y-3 pt-2">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-orange-500 via-amber-500 to-emerald-500 shadow-lg shadow-orange-500/20 mx-auto">
                <img
                  src={PROFILE_INFO.avatarUrl}
                  alt="Tuấn Thái Bình Admin"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-slate-950 p-1 rounded-full border border-orange-500/40 shadow-sm">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2 font-gaming">
                <span>{PROFILE_INFO.brandName}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-widest font-mono">
                  ADMIN
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Khu vực quản lý kho acc & đơn hàng của <strong>{PROFILE_INFO.realName}</strong>
              </p>
            </div>
          </div>

          {/* Lockout Warning nếu bị khóa */}
          {lockoutSeconds > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <p className="font-bold">Đã tạm khóa form đăng nhập!</p>
                <p className="text-[11px] text-rose-300/80">Vui lòng chờ {lockoutSeconds}s để tiếp tục thử lại.</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
                <span>Mật Khẩu Quản Trị:</span>
                <span className="text-[10px] text-slate-500 font-mono">Master Password</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading || lockoutSeconds > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị viên..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all disabled:opacity-50 font-mono"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                />
                <span>Ghi nhớ đăng nhập (7 Ngày)</span>
              </label>

              <span className="text-[11px] text-slate-500 font-mono">Bảo mật SSL 256-bit</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:via-amber-500 hover:to-orange-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Xác Thực...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Đăng Nhập Quản Trị</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 border-t border-slate-800/60 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Quỹ bảo hiểm Checkscam: <strong>{PROFILE_INFO.insuranceFund}</strong></span>
        </div>
        <p>© 2026 ShopTFT Mobile // Tuấn Thái Bình - All rights reserved.</p>
      </footer>
    </div>
  );
}
