"use client";

import React from "react";
import Link from "next/link";
import { TFT_RENTAL_ACCOUNTS, PROFILE_INFO } from "@/data/tft-data";
import {
  TrendingUp,
  Users,
  Gamepad2,
  Receipt,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Zap,
  Plus,
} from "lucide-react";

export default function AdminDashboardPage() {
  const totalAccounts = TFT_RENTAL_ACCOUNTS.length;
  const availableAccounts = TFT_RENTAL_ACCOUNTS.filter(
    (a) => a.status === "AVAILABLE"
  ).length;
  const rentedAccounts = TFT_RENTAL_ACCOUNTS.filter(
    (a) => a.status === "RENTED"
  ).length;

  const recentOrders = [
    {
      id: "ORD-9821",
      customer: "Nguyễn Hoàng Long",
      account: "MS: 8899 - Ahri Tinh Quái",
      package: "2 Giờ Trải Nghiệm",
      amount: "49.000đ",
      status: "COMPLETED",
      statusLabel: "Đã Bàn Giao",
      time: "15 phút trước",
    },
    {
      id: "ORD-8842",
      customer: "Trần Minh Đức",
      account: "MS: 6632 - Aatrox Sát Thần",
      package: "Thuê 7 Ngày (1 Tuần)",
      amount: "164.000đ",
      status: "RENTING",
      statusLabel: "Đang Thuê",
      time: "1 giờ trước",
    },
    {
      id: "ORD-7719",
      customer: "Lê Quốc Bảo",
      account: "Coaching 1-1 Bắt Meta",
      package: "Gói 2 Buổi (180 Phút)",
      amount: "300.000đ",
      status: "COMPLETED",
      statusLabel: "Đã Hoàn Thành",
      time: "3 giờ trước",
    },
    {
      id: "ORD-6620",
      customer: "Hoàng Yến Vy",
      account: "MS: 7721 - Gwen Búp Bê",
      package: "2 Giờ Trải Nghiệm",
      amount: "43.000đ",
      status: "COMPLETED",
      statusLabel: "Đã Bàn Giao",
      time: "Hôm qua lúc 21:40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-orange-600/15 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chào mừng trở lại, {PROFILE_INFO.realName}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hệ Thống ShopTFT Mobile Đang Hoạt Động Tốt
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl font-normal leading-relaxed">
            Hiện tại đang có <strong>{rentedAccounts} tài khoản</strong> có khách thuê và{" "}
            <strong>{availableAccounts} tài khoản</strong> sẵn sàng bàn giao tự động.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 flex-shrink-0">
          <Link
            href="/admin/accounts"
            className="px-5 py-3 bg-white hover:bg-slate-50 text-orange-700 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Quản Lý Kho Acc</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doanh Thu Hôm Nay
            </span>
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              856.000đ
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18.4%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lượt Thuê Tháng Này
            </span>
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              342 Lượt
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +12.5%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tỷ Lệ Lấp Đầy Kho
            </span>
            <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Gamepad2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {Math.round((rentedAccounts / totalAccounts) * 100)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {rentedAccounts}/{totalAccounts} Acc
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quỹ Bảo Hiểm Checkscam
            </span>
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-700 font-mono">
              30.000.000đ
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Bảo Chứng
            </span>
          </div>
        </div>
      </div>

      {/* 3. RECENT ORDERS & QUICK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Đơn Hàng Mới Nhất */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Đơn Hàng Gần Đây
              </h3>
              <span className="text-xs text-slate-500 font-normal">
                Các đơn thuê acc và kéo rank phát sinh qua Zalo
              </span>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Xem Tất Cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      {ord.id}
                    </span>
                    <strong className="text-slate-800 font-bold">
                      {ord.customer}
                    </strong>
                  </div>
                  <p className="text-slate-500">
                    {ord.account} • <span className="text-orange-600 font-semibold">{ord.package}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="font-mono font-bold text-red-600 text-sm">
                    {ord.amount}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                      ord.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ord.statusLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Hoạt Động & Lối Tắt Nhanh */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Lối Tắt Thao Tác
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/accounts"
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-orange-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Gamepad2 className="w-4 h-4 text-orange-600" />
                  <span>Quản Lý Kho Acc ({totalAccounts} Acc)</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/admin/orders"
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-orange-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Quản Lý Đơn Hàng</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/admin/settings"
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-orange-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Cài Đặt Zalo & Hotline</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-orange-400">
                Gợi Ý Tối Ưu Doanh Thu
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Các acc có Tướng Tí Nị Ahri & Sân Đấu Đổi Nhạc có tỷ lệ thuê cao nhất vào khung giờ 20h - 24h. Hãy luôn sẵn sàng trực Zalo để bàn giao trong 30s!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
