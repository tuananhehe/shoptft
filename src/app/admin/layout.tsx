"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PROFILE_INFO } from "@/data/tft-data";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Gamepad2,
  Receipt,
  Settings,
  Globe,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Loader2,
  Lock,
  Users,
  Layout,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Nếu đang ở trang login thì render trực tiếp không cần bọc layout
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    async function checkAuth() {
      try {
        const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
        const res = await fetch("/api/admin/auth", {
          headers: localToken ? { "x-admin-token": localToken } : {},
        });
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace("/admin/login");
        }
      } catch {
        setIsAuthenticated(false);
        router.replace("/admin/login");
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    const toastId = toast.loading("Đang đăng xuất...");
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("shoptft_admin_token");
      }
      await fetch("/api/admin/auth", { method: "DELETE" });
      toast.success("Đã đăng xuất thành công!", { id: toastId });
      setIsAuthenticated(false);
      router.replace("/admin/login");
    } catch {
      toast.error("Lỗi khi đăng xuất!", { id: toastId });
    }
  };

  // Trang đăng nhập render độc lập
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Đang kiểm tra quyền truy cập
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white space-y-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-300 font-mono font-bold">Đang xác thực quyền Quản Trị...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      title: "Tổng Quan",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      title: "Trang Chủ (CMS)",
      href: "/admin/homepage",
      icon: Layout,
      active: pathname.startsWith("/admin/homepage"),
      badge: "Giao Diện",
    },
    {
      title: "Quản Lý Kho Acc",
      href: "/admin/accounts",
      icon: Gamepad2,
      active: pathname.startsWith("/admin/accounts"),
      badge: "8 Acc",
    },
    {
      title: "Kênh Truyền Thông",
      href: "/admin/channels",
      icon: Users,
      active: pathname.startsWith("/admin/channels"),
      badge: "Hệ Sinh Thái",
    },
    {
      title: "Đơn Hàng",
      href: "/admin/orders",
      icon: Receipt,
      active: pathname.startsWith("/admin/orders"),
      badge: "3 Mới",
    },
    {
      title: "Cài Đặt",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  // Lấy tiêu đề trang từ URL hiện tại
  const getPageTitle = () => {
    if (pathname === "/admin") return "Tổng Quan Hệ Thống";
    if (pathname.startsWith("/admin/homepage")) return "Quản Lý & Tự Setup Trang Chủ";
    if (pathname.startsWith("/admin/accounts")) return "Quản Lý Kho Acc TFT";
    if (pathname.startsWith("/admin/channels")) return "Hệ Sinh Thái & Kênh Truyền Thông";
    if (pathname.startsWith("/admin/orders")) return "Quản Lý Đơn Hàng";
    if (pathname.startsWith("/admin/settings")) return "Cài Đặt Hệ Thống";
    return "Admin Dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* ============================================================ */}
      {/* 1. SIDEBAR (CỘT TRÁI)                                        */}
      {/* ============================================================ */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out h-screen ${
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header / Logo */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-3 group"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <div className="w-10 h-10 rounded-xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm flex-shrink-0">
                <img
                  src={PROFILE_INFO.avatarUrl}
                  alt="ShopTFT Admin Logo"
                  className="w-full h-full rounded-[10px] object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm text-slate-900 tracking-tight">
                    ShopTFT Admin
                  </h1>
                  <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-orange-200 uppercase">
                    v1.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  Portal Quản Trị Tự Động
                </p>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Profile Box */}
          <div className="p-4 mx-3 my-3 bg-gradient-to-br from-slate-50 to-orange-50/40 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="relative">
              <img
                src={PROFILE_INFO.avatarUrl}
                alt="Tuấn Thái Bình"
                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-slate-900 truncate">
                {PROFILE_INFO.realName}
              </h4>
              <span className="text-[10px] font-semibold text-orange-600 block">
                Cựu Thách Đấu // Admin
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-3 py-2 flex-1 space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Menu Quản Trị
            </span>
            <nav className="space-y-1 pt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      item.active
                        ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          item.active ? "text-white" : "text-slate-400"
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer: Về Trang Chủ & Quỹ Bảo Hiểm */}
          <div className="p-3 border-t border-slate-100 space-y-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-[11px]">Bảo Hiểm 30M</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Checkscam
              </span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-orange-600" />
                <span>Xem Website Khách</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Đăng Xuất Quản Trị</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CONTENT WRAPPER & HEADER                              */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/admin" className="hover:text-orange-600 transition-colors">
                Admin
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hệ Thống Online</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-600" />
            </button>

            {/* Admin Avatar & Dropdown */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={PROFILE_INFO.avatarUrl}
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <span className="hidden md:inline-block text-xs font-bold text-slate-900">
                Tuấn Thái Bình
              </span>
              <button
                type="button"
                onClick={handleLogout}
                title="Đăng xuất khỏi Quản Trị"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
