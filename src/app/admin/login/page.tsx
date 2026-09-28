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
  ArrowLeft,
  AlertTriangle,
  Loader2,
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
        toast.success("Xác thực quản trị viên thành công!");
        setFailedAttempts(0);
        router.replace("/admin");
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutSeconds(60);
          toast.error("Bạn đã nhập sai 5 lần! Hệ thống tạm khóa 60 giây để bảo vệ an toàn.");
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
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-7 h-7 text-slate-800 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Đang kiểm tra phiên quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white font-sans">
      {/* Top Navbar Minimal */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Khu vực quản trị bảo mật</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight font-heading">
                Đăng nhập Quản trị
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Hệ thống vận hành {PROFILE_INFO.brandName}
              </p>
            </div>
          </div>

          {/* Lockout Warning nếu bị khóa */}
          {lockoutSeconds > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-semibold">Tạm khóa form đăng nhập</p>
                <p className="text-[11px] text-rose-600">Vui lòng chờ {lockoutSeconds}s để thử lại.</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block flex items-center justify-between">
                <span>Mật khẩu quản trị</span>
                <span className="text-[10px] text-slate-400 font-mono">Master Key</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading || lockoutSeconds > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all disabled:opacity-50 font-mono"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900 cursor-pointer"
                />
                <span className="text-[11px]">Ghi nhớ (7 ngày)</span>
              </label>

              <span className="text-[10px] text-slate-400 font-mono">256-bit SSL</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bảo hiểm Checkscam: <strong>{PROFILE_INFO.insuranceFund}</strong></span>
        </div>
        <p className="text-[11px] text-slate-400">© 2026 {PROFILE_INFO.brandName} Operations</p>
      </footer>
    </div>
  );
}
