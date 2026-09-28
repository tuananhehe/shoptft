"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getVipAndCloneAccounts,
  updateAccountApi,
  formatRentalExpiry,
  toLocalDatetimeInputString,
} from "@/utils/supabase/accounts-service";
import toast from "react-hot-toast";
import {
  Gamepad2,
  Receipt,
  DollarSign,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Users,
  Copy,
  ChevronRight,
  Plus,
  Calendar,
  X,
} from "lucide-react";
import {
  OrderItem,
  getOrders,
  createOrder,
  updateOrder,
  getRentalTimeRemaining,
  formatOrderDateTime,
} from "@/utils/orders-service";
import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart";

export interface DashboardAccountItem {
  id: string;
  category: "VIP" | "CLONE";
  code: string;
  title: string;
  thumbnail: string;
  status: "AVAILABLE" | "RENTED";
  rentedUntil?: string | null;
  rank?: string;
  hourlyPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
  periodPrice?: number;
  accountValue?: number;
  price?: number;
  mainChibi?: string;
  mainArena?: string;
}

export default function AdminDashboardPage() {
  const [accounts, setAccounts] = useState<DashboardAccountItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [incompleteMembersCount, setIncompleteMembersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Cho Thuê / Gia Hạn Nhanh
  const [rentModalAccount, setRentModalAccount] = useState<DashboardAccountItem | null>(null);
  const [quickHours, setQuickHours] = useState<number>(2);
  const [customEndTime, setCustomEndTime] = useState<string>("");
  const [isSubmittingRental, setIsSubmittingRental] = useState(false);

  const loadData = async (showToastNotice = false) => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const headers: Record<string, string> = token ? { "x-admin-token": token } : {};

      const [{ vipAccounts, cloneAccounts }, ordersRes, usersRes] = await Promise.all([
        getVipAndCloneAccounts(),
        getOrders(),
        fetch("/api/admin/users", { headers })
          .then((r) => r.json())
          .catch(() => ({ success: false, data: [] })),
      ]);

      if (ordersRes && ordersRes.success) {
        setOrders(ordersRes.data || []);
      }

      if (usersRes && usersRes.success && Array.isArray(usersRes.data)) {
        setMembersCount(usersRes.data.length);
        const incomplete = usersRes.data.filter((u: any) => !u.zalo || !u.full_name).length;
        setIncompleteMembersCount(incomplete);
      }

      const unifiedList: DashboardAccountItem[] = [
        ...(vipAccounts || []).map((v) => ({
          id: String(v.id),
          category: "VIP" as const,
          code: v.code,
          title: v.title || `${v.mainChibi || "Tí Nị VIP"} - ${v.rank || "Thách Đấu"}`,
          thumbnail: v.thumbnail || "/avatar.jpg",
          status: (v.status || "AVAILABLE").toUpperCase() as "AVAILABLE" | "RENTED",
          rentedUntil: v.rentedUntil || null,
          rank: v.rank || "THÁCH ĐẤU",
          hourlyPrice: Number(v.hourlyPrice) || 15000,
          dailyPrice: Number(v.dailyPrice) || 60000,
          accountValue: Number(v.accountValue) || 850000,
          price: Number(v.accountValue) || 850000,
          mainChibi: v.mainChibi || "",
          mainArena: v.mainArena || "",
        })),
        ...(cloneAccounts || []).map((c) => ({
          id: String(c.id),
          category: "CLONE" as const,
          code: c.code,
          title: c.title || `Acc Clone ${c.rankBadge || "Unranked"}`,
          thumbnail: c.thumbnail || "/avatar.jpg",
          status: (c.status || "AVAILABLE").toUpperCase() as "AVAILABLE" | "RENTED",
          rentedUntil: c.rentedUntil || null,
          rank: c.rankBadge || "UNRANKED",
          monthlyPrice: Number(c.monthlyPrice) || Number(c.periodPrice) || Number(c.price) || 150000,
          periodPrice: Number(c.periodPrice) || 150000,
          accountValue: Number(c.price) || 150000,
          price: Number(c.price) || 150000,
        })),
      ];

      setAccounts(unifiedList);
      if (showToastNotice) toast.success("Đã làm mới dữ liệu hệ thống!");
    } catch (err: any) {
      console.error("Lỗi tải dữ liệu dashboard:", err);
      toast.error("Không thể tải dữ liệu dashboard!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tính toán KPI thực tế từ dữ liệu
  const vipCount = useMemo(() => accounts.filter((a) => a.category === "VIP").length, [accounts]);
  const cloneCount = useMemo(() => accounts.filter((a) => a.category === "CLONE").length, [accounts]);
  const rentedAccounts = useMemo(() => accounts.filter((a) => a.status === "RENTED"), [accounts]);
  const availableAccounts = useMemo(() => accounts.filter((a) => a.status === "AVAILABLE"), [accounts]);

  const todayOrders = useMemo(() => {
    const today = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    return orders.filter((o) => {
      const created = o.createdAt || "";
      return created.startsWith(todayStr);
    });
  }, [orders]);

  const todayRevenue = useMemo(() => {
    return todayOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  }, [todayOrders]);

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => (o.status as string) === "PENDING" || o.status === "EXPIRED");
  }, [orders]);

  // Các tài khoản đang thuê sắp hết hạn trong vòng 24 giờ
  const expiringRentals = useMemo(() => {
    const now = new Date().getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return rentedAccounts
      .filter((a) => {
        if (!a.rentedUntil) return false;
        const expiry = new Date(a.rentedUntil).getTime();
        const diff = expiry - now;
        return diff > 0 && diff <= oneDayMs;
      })
      .sort((a, b) => new Date(a.rentedUntil!).getTime() - new Date(b.rentedUntil!).getTime());
  }, [rentedAccounts]);

  // Hoạt động gần đây: lấy 8 đơn hàng mới nhất
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8);
  }, [orders]);

  // Xử lý gửi cho thuê nhanh / gia hạn
  const handleConfirmQuickRental = async () => {
    if (!rentModalAccount) return;
    setIsSubmittingRental(true);

    try {
      let targetEndTime: string;
      if (customEndTime) {
        targetEndTime = new Date(customEndTime).toISOString();
      } else {
        const now = new Date();
        const baseTime =
          rentModalAccount.rentedUntil && new Date(rentModalAccount.rentedUntil) > now
            ? new Date(rentModalAccount.rentedUntil)
            : now;
        baseTime.setHours(baseTime.getHours() + quickHours);
        targetEndTime = baseTime.toISOString();
      }

      const res = await updateAccountApi({
        code: rentModalAccount.code,
        status: "RENTED",
        rented_until: targetEndTime,
      });

      if (!res.success) {
        toast.error(res.error || "Lỗi cập nhật trạng thái thuê!");
        return;
      }

      // Tạo đơn hàng lưu lịch sử
      await createOrder({
        type: rentModalAccount.category || "VIP",
        accountCode: rentModalAccount.code,
        accountTitle: rentModalAccount.title,
        customer: "Khách Thuê Nhanh (Admin)",
        phoneZalo: "0352867283",
        package: `Thuê Nhanh (${quickHours}h)`,
        durationHours: quickHours,
        amount: (rentModalAccount.hourlyPrice || 15000) * quickHours,
        status: "RENTING",
        source: "ADMIN",
        startedAt: new Date().toISOString(),
        expiresAt: targetEndTime,
        accountLogin: "tft_" + rentModalAccount.code.toLowerCase().replace(/[^a-z0-9]/g, ""),
        accountPass: "TuanTFT@8888",
      });

      toast.success(`Đã cập nhật cho thuê ${rentModalAccount.code}!`);
      setRentModalAccount(null);
      setCustomEndTime("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi xử lý!");
    } finally {
      setIsSubmittingRental(false);
    }
  };

  const handleReturnAccount = async (acc: DashboardAccountItem) => {
    if (!confirm(`Xác nhận thu hồi tài khoản ${acc.code} về trạng thái SẴN SÀNG?`)) return;

    try {
      const res = await updateAccountApi({
        code: acc.code,
        status: "AVAILABLE",
        rented_until: null,
      });

      if (res.success) {
        toast.success(`Đã thu hồi tài khoản ${acc.code}!`);
        loadData();
      } else {
        toast.error(res.error || "Không thể thu hồi tài khoản!");
      }
    } catch {
      toast.error("Lỗi khi kết nối máy chủ!");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#111111] tracking-tight">
            Tổng quan
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Theo dõi tình trạng kho, thuê và doanh thu hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] hover:bg-gray-50 text-xs font-medium text-[#111111] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gray-500" : ""}`} />
            <span>Làm mới</span>
          </button>

          <Link
            href="/admin/accounts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] hover:bg-black text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm tài khoản</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS (6 COMPACT SAAS CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Tổng kho */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            Tổng tài khoản
          </span>
          <div className="my-2">
            <span className="font-heading font-bold text-2xl text-[#111111]">
              {accounts.length}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {vipCount} VIP • {cloneCount} Clone
          </p>
        </div>

        {/* Card 2: Đang cho thuê */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            Đang cho thuê
          </span>
          <div className="my-2">
            <span className="font-heading font-bold text-2xl text-amber-600">
              {rentedAccounts.length}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {accounts.length > 0 ? Math.round((rentedAccounts.length / accounts.length) * 100) : 0}% tổng kho
          </p>
        </div>

        {/* Card 3: Sẵn sàng */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            Sẵn sàng
          </span>
          <div className="my-2">
            <span className="font-heading font-bold text-2xl text-emerald-600">
              {availableAccounts.length}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {accounts.length > 0 ? Math.round((availableAccounts.length / accounts.length) * 100) : 0}% tổng kho
          </p>
        </div>

        {/* Card 4: Doanh thu hôm nay */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            Doanh thu hôm nay
          </span>
          <div className="my-2">
            <span className="font-heading font-bold text-xl sm:text-2xl text-[#111111]">
              {todayRevenue >= 1000000
                ? `${(todayRevenue / 1000000).toFixed(1)}M`
                : todayRevenue >= 1000
                ? `${(todayRevenue / 1000).toFixed(0)}k`
                : `${todayRevenue}đ`}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {todayOrders.length} giao dịch trong ngày
          </p>
        </div>

        {/* Card 5: Giao dịch chờ xử lý */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            Chờ xử lý
          </span>
          <div className="my-2">
            <span className={`font-heading font-bold text-2xl ${pendingOrders.length > 0 ? "text-red-600" : "text-[#111111]"}`}>
              {pendingOrders.length}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {pendingOrders.length > 0 ? "Cần kiểm tra ngay" : "Đã xử lý xong"}
          </p>
        </div>

        {/* Card 6: Khách hàng */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider block">
            Khách hàng
          </span>
          <div className="my-2">
            <span className="font-heading font-bold text-2xl text-[#111111]">
              {membersCount}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {incompleteMembersCount > 0 ? `${incompleteMembersCount} chưa đủ Zalo` : "Thành viên lưu trữ"}
          </p>
        </div>
      </div>

      {/* 3. VIỆC CẦN XỬ LÝ (ACTION REQUIRED) */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h3 className="font-heading font-bold text-sm text-[#111111]">
              Việc cần xử lý
            </h3>
          </div>
          <span className="text-xs text-[#6B7280]">
            {expiringRentals.length + pendingOrders.length + (incompleteMembersCount > 0 ? 1 : 0)} mục cần chú ý
          </span>
        </div>

        {expiringRentals.length === 0 && pendingOrders.length === 0 && incompleteMembersCount === 0 ? (
          <div className="py-4 text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tất cả tài khoản và giao dịch đang hoạt động ổn định.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {/* Mục 1: Acc sắp hết hạn */}
            {expiringRentals.slice(0, 3).map((acc) => (
              <div
                key={acc.code}
                className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-amber-900">{acc.code}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-mono">
                      {formatRentalExpiry(acc.rentedUntil)?.shortCountdown || "Sắp hết hạn"}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 truncate mt-0.5">{acc.title}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setRentModalAccount(acc);
                      setQuickHours(2);
                    }}
                    className="px-2 py-1 bg-white hover:bg-gray-100 border border-amber-300 rounded text-[11px] font-semibold text-amber-900 cursor-pointer shadow-2xs"
                  >
                    Gia hạn
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReturnAccount(acc)}
                    className="px-2 py-1 bg-amber-700 hover:bg-amber-800 rounded text-[11px] font-semibold text-white cursor-pointer"
                  >
                    Thu hồi
                  </button>
                </div>
              </div>
            ))}

            {/* Mục 2: Đơn hàng chờ xử lý */}
            {pendingOrders.slice(0, 2).map((order) => (
              <div
                key={order.id}
                className="p-3 rounded-lg border border-red-200 bg-red-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-red-900">{order.id}</span>
                    <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.2 rounded font-medium">
                      Chờ thanh toán
                    </span>
                  </div>
                  <p className="text-[11px] text-red-800 truncate mt-0.5">
                    {order.customer} • {order.accountTitle}
                  </p>
                </div>

                <Link
                  href="/admin/orders"
                  className="px-2.5 py-1 bg-[#111111] hover:bg-black rounded text-[11px] font-semibold text-white flex-shrink-0"
                >
                  Xử lý
                </Link>
              </div>
            ))}

            {/* Mục 3: Thành viên thiếu Zalo */}
            {incompleteMembersCount > 0 && (
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <span className="font-semibold text-blue-900">
                    {incompleteMembersCount} thành viên chưa đủ Zalo
                  </span>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Cập nhật số Zalo để tiện liên hệ bàn giao tài khoản.
                  </p>
                </div>
                <Link
                  href="/admin/users"
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 border border-blue-300 rounded text-[11px] font-semibold text-blue-900 flex-shrink-0"
                >
                  Xem
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. DOANH THU (CLEAN REVENUE CHART) */}
      <AdminRevenueChart orders={orders} />

      {/* 5. HOẠT ĐỘNG GẦN ĐÂY (RECENT ACTIVITY TABLE) */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#111111]">
              Hoạt động gần đây
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Giao dịch và nhật ký thuê tài khoản mới nhất.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#111111] hover:text-black flex items-center gap-1"
          >
            <span>Xem tất cả giao dịch</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7280]">
            Chưa có hoạt động giao dịch nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#F7F7F8] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Mã Đơn / MS</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Gói dịch vụ</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-[#6B7280] whitespace-nowrap font-mono text-[11px]">
                      {formatOrderDateTime(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-[#111111]">{order.id}</div>
                      <div className="text-[11px] text-[#6B7280] font-mono">{order.accountCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#111111]">{order.customer}</div>
                      {order.phoneZalo && (
                        <div className="text-[11px] text-[#6B7280] font-mono">{order.phoneZalo}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[#6B7280]">
                      {order.package || order.accountTitle}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold font-mono text-[#111111]">
                      {order.amount ? `${Number(order.amount).toLocaleString("vi-VN")}đ` : "—"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.status === "RENTING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : order.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {order.status === "RENTING"
                          ? "Đang thuê"
                          : order.status === "COMPLETED"
                          ? "Hoàn tất"
                          : "Chờ xử lý"}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <Link
                        href="/admin/orders"
                        className="text-xs font-semibold text-[#111111] hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. MODAL GIA HẠN / CHO THUÊ NHANH */}
      {rentModalAccount && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-700" />
                <h3 className="font-heading font-bold text-sm text-[#111111]">
                  Gia hạn / Cho thuê nhanh
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRentModalAccount(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
              <img
                src={rentModalAccount.thumbnail}
                alt={rentModalAccount.code}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
              <div className="min-w-0">
                <span className="font-bold text-xs text-[#111111]">{rentModalAccount.code}</span>
                <p className="text-xs text-[#6B7280] truncate">{rentModalAccount.title}</p>
                <p className="text-[11px] font-mono text-amber-700 mt-0.5">
                  {formatRentalExpiry(rentModalAccount.rentedUntil)?.shortCountdown || "Đang cho thuê"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#111111] block">
                Chọn gói thời gian thuê thêm:
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[1, 2, 4, 12, 24, 72].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setQuickHours(h);
                      setCustomEndTime("");
                    }}
                    className={`py-2 rounded-lg border text-center font-semibold cursor-pointer transition-colors ${
                      quickHours === h && !customEndTime
                        ? "bg-[#111111] text-white border-[#111111]"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    +{h >= 24 ? `${h / 24} ngày` : `${h}h`}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] text-[#6B7280] block mb-1">
                  Hoặc chọn mốc thời gian kết thúc cụ thể:
                </label>
                <input
                  type="datetime-local"
                  value={customEndTime}
                  onChange={(e) => setCustomEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-[#111111] focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRentModalAccount(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmQuickRental}
                disabled={isSubmittingRental}
                className="px-4 py-2 bg-[#111111] hover:bg-black text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {isSubmittingRental ? "Đang xử lý..." : "Xác nhận gia hạn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
