"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PROFILE_INFO } from "@/data/tft-data";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Gamepad2,
  CalendarDays,
  Users,
  MonitorSmartphone,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Loader2,
  ChevronRight,
  Globe,
  BookOpen,
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

  // Login page renders independently without admin layout shell
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

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Authentication check loading
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex flex-col items-center justify-center p-4 text-gray-900">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
          </div>
          <p className="text-xs text-gray-600 font-medium">Đang xác thực quyền Quản Trị...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navGroups = [
    {
      title: "TỔNG QUAN",
      items: [
        {
          title: "Tổng quan",
          href: "/admin",
          icon: LayoutDashboard,
          active: pathname === "/admin",
        },
      ],
    },
    {
      title: "VẬN HÀNH",
      items: [
        {
          title: "Kho Acc",
          href: "/admin/accounts",
          icon: Gamepad2,
          active: pathname.startsWith("/admin/accounts"),
        },
        {
          title: "Lượt Thuê",
          href: "/admin/rentals",
          icon: CalendarDays,
          active: pathname.startsWith("/admin/rentals"),
        },
      ],
    },
    {
      title: "KHÁCH HÀNG",
      items: [
        {
          title: "Khách Hàng",
          href: "/admin/customers",
          icon: Users,
          active: pathname.startsWith("/admin/users") || pathname.startsWith("/admin/customers"),
        },
      ],
    },
    {
      title: "NỘI DUNG",
      items: [
        {
          title: "CMS Website",
          href: "/admin/homepage",
          icon: MonitorSmartphone,
          active:
            pathname.startsWith("/admin/homepage") ||
            pathname.startsWith("/admin/cms") ||
            pathname.startsWith("/admin/channels"),
        },
        {
          title: "Bài Viết / Blog",
          href: "/admin/blog",
          icon: BookOpen,
          active: pathname.startsWith("/admin/blog"),
        },
        {
          title: "SEO Website",
          href: "/admin/seo",
          icon: Globe,
          active: pathname.startsWith("/admin/seo"),
        },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        {
          title: "Cài Đặt",
          href: "/admin/settings",
          icon: Settings,
          active: pathname.startsWith("/admin/settings"),
        },
      ],
    },
  ];

  const getPageTitle = () => {
    if (pathname === "/admin") return "Tổng quan";
    if (pathname.startsWith("/admin/accounts")) return "Kho Acc";
    if (pathname.startsWith("/admin/rentals")) return "Lượt Thuê";
    if (pathname.startsWith("/admin/orders")) return "Lượt Thuê (Legacy)";
    if (pathname.startsWith("/admin/users")) return "Khách Hàng";
    if (pathname.startsWith("/admin/customers")) return "Khách Hàng";
    if (pathname.startsWith("/admin/homepage")) return "CMS Website";
    if (pathname.startsWith("/admin/cms")) return "CMS Website";
    if (pathname.startsWith("/admin/channels")) return "CMS Website";
    if (pathname.startsWith("/admin/blog")) return "Quản lý Blog";
    if (pathname.startsWith("/admin/seo")) return "Quản lý SEO";
    if (pathname.startsWith("/admin/surveys")) return "Phản Hồi & Khảo Sát";
    if (pathname.startsWith("/admin/settings")) return "Cài Đặt";
    return "Quản trị";
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#111111] flex font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ============================================================ */}
      {/* 1. SIDEBAR (CỘT TRÁI: 240px, TRẮNG, MINIMAL)                */}
      {/* ============================================================ */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-60 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-200 ease-in-out h-screen flex-shrink-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="h-15 px-5 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 group"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
                TFT
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-sm text-[#111111] leading-tight tracking-tight">
                  ShopTFT Admin
                </span>
                <span className="text-[10px] text-[#6B7280] font-medium leading-none mt-0.5">
                  Quản trị vận hành
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items grouped */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        item.active
                          ? "bg-gray-100 text-[#111111] font-semibold"
                          : "text-[#6B7280] hover:text-[#111111] hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          item.active ? "text-[#111111]" : "text-[#6B7280]"
                        }`}
                      />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom Sidebar: View Website & Admin Identity */}
          <div className="p-3 border-t border-[#E5E7EB] bg-white space-y-2 flex-shrink-0">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#111111] hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem website</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </Link>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={PROFILE_INFO.avatarUrl}
                  alt={PROFILE_INFO.realName}
                  className="w-7 h-7 rounded-full object-cover border border-gray-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111111] truncate leading-tight">
                    {PROFILE_INFO.realName}
                  </p>
                  <p className="text-[10px] text-[#6B7280] leading-none mt-0.5">Admin</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN AREA (TOPBAR + CONTENT)                              */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar: 60px */}
        <header className="h-15 bg-white border-b border-[#E5E7EB] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B7280] hidden sm:inline">Admin</span>
              <span className="text-[#6B7280] hidden sm:inline">/</span>
              <h2 className="font-heading font-bold text-sm text-[#111111] truncate">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Status Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hệ thống sẵn sàng</span>
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#111111] px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span>Xem trang chủ</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Scrollable Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#F7F7F8]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
