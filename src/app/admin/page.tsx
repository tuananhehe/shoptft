"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PROFILE_INFO } from "@/data/tft-data";
import { getVipAndCloneAccounts } from "@/utils/supabase/accounts-service";
import toast from "react-hot-toast";
import {
  TrendingUp,
  Gamepad2,
  Receipt,
  DollarSign,
  Hourglass,
  Clock,
  ArrowUpRight,
  Sparkles,
  Zap,
  Copy,
  CheckCircle2,
  RotateCcw,
  Check,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [availableAccounts, setAvailableAccounts] = useState(0);
  const [rentedAccounts, setRentedAccounts] = useState(0);

  useEffect(() => {
    getVipAndCloneAccounts().then(({ vipAccounts, cloneAccounts }) => {
      const all = [...(vipAccounts || []), ...(cloneAccounts || [])];
      setTotalAccounts(all.length);
      setAvailableAccounts(all.filter((a) => a.status === "AVAILABLE").length);
      setRentedAccounts(all.filter((a) => a.status === "RENTED").length);
    });
  }, []);

  const showToast = (msg: string) => {
    toast.success(msg);
  };

  const [recentOrders, setRecentOrders] = useState([
    {
      id: "ORD-9821",
      customer: "Nguyễn Hoàng Long",
      account: "MS: 8899 - Ahri Tinh Quái",
      package: "2 Giờ Trải Nghiệm",
      amount: "49.000đ",
      status: "COMPLETED",
      statusLabel: "Đã Bàn Giao",
      remainingTime: null,
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
      remainingTime: "Còn 1h 20m",
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
      remainingTime: null,
      time: "3 giờ trước",
    },
    {
      id: "ORD-6620",
      customer: "Hoàng Yến Vy",
      account: "MS: 7721 - Gwen Búp Bê",
      package: "2 Giờ Trải Nghiệm",
      amount: "43.000đ",
      status: "RENTING",
      statusLabel: "Đang Thuê",
      remainingTime: "Còn 45m",
      time: "Hôm qua lúc 21:40",
    },
  ]);

  // Copy thông tin đơn hàng
  const handleCopyOrder = (ord: (typeof recentOrders)[0]) => {
    const text = `[ĐƠN HÀNG ${ord.id}] Khách: ${ord.customer} | Acc: ${ord.account} | Gói: ${ord.package} | Tiền: ${ord.amount}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Đã sao chép thông tin đơn ${ord.id}!`);
    });
  };

  // Đánh dấu đã thu hồi acc
  const handleReclaimOrder = (orderId: string) => {
    setRecentOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "COMPLETED",
              statusLabel: "Đã Thu Hồi",
              remainingTime: null,
            }
          : o
      )
    );
    showToast(`Đã xác nhận thu hồi acc cho đơn ${orderId}!`);
  };

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER - TINH CHỈNH PADDING NHỎ GỌN PY-5 SM:PY-6 */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl shadow-orange-600/15 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chào mừng trở lại, {PROFILE_INFO.realName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
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
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-orange-700 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Quản Lý Kho Acc</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS GRID - CARD 4: ACC SẮP HẾT GIỜ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
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
          <p className="text-[11px] text-slate-400 font-normal">Đã bao gồm phí dịch vụ</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
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
          <p className="text-[11px] text-slate-400 font-normal">Tăng trưởng ổn định</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
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
          <p className="text-[11px] text-slate-400 font-normal">{availableAccounts} acc đang chờ khách</p>
        </div>

        {/* Card 4: THAY THÀNH "ACC SẮP HẾT GIỜ" */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Acc Sắp Hết Giờ
            </span>
            <span className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <Hourglass className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 font-mono">
              2 Acc
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
              Cần Lưu Ý
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Sắp thu hồi trong 2 giờ tới
          </p>
        </div>
      </div>

      {/* 3. RECENT ORDERS & QUICK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Đơn Hàng Mới Nhất VỚI HOVER ACTIONS & THỜI GIAN CÒN LẠI */}
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
                className="py-3.5 px-2.5 rounded-xl hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      {ord.id}
                    </span>
                    <strong className="text-slate-800 font-bold truncate">
                      {ord.customer}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-normal">
                      • {ord.time}
                    </span>
                  </div>
                  <p className="text-slate-500 truncate">
                    {ord.account} • <span className="text-orange-600 font-semibold">{ord.package}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                  {/* Giá tiền */}
                  <span className="font-mono font-bold text-red-600 text-sm">
                    {ord.amount}
                  </span>

                  {/* Trạng Thái & Thời Gian Còn Lại */}
                  <div className="flex items-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        ord.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {ord.statusLabel}
                    </span>

                    {/* Bổ sung thời gian còn lại nếu đang thuê */}
                    {ord.remainingTime && (
                      <span className="text-xs text-slate-400 font-medium ml-2 font-mono">
                        ({ord.remainingTime})
                      </span>
                    )}
                  </div>

                  {/* THAO TÁC NHANH (HOVER ACTIONS) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                    {/* Nút Copy */}
                    <button
                      onClick={() => handleCopyOrder(ord)}
                      title="Sao chép thông tin đơn hàng"
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors shadow-sm cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                    </button>

                    {/* Nút Thu hồi acc nếu đang thuê */}
                    {ord.status === "RENTING" && (
                      <button
                        onClick={() => handleReclaimOrder(ord.id)}
                        title="Đánh dấu đã thu hồi acc"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    )}
                  </div>
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
                  <Clock className="w-4 h-4 text-sky-600" />
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
