"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  getVipAndCloneAccounts,
  updateAccountApi,
  formatRentalExpiry,
  toLocalDatetimeInputString,
  AccountDbRow,
} from "@/utils/supabase/accounts-service";
import toast from "react-hot-toast";
import {
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
  Flame,
  AlertTriangle,
  Wallet,
  Search,
  RefreshCw,
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Crown,
} from "lucide-react";
import { OrderItem, getOrders, createOrder, updateOrder } from "@/utils/orders-service";
import ProfitAnalyticsChart from "@/components/admin/ProfitAnalyticsChart";

export interface DashboardAccountItem {
  id: string;
  category: "VIP" | "CLONE";
  code: string;
  title: string;
  thumbnail: string;
  status: "AVAILABLE" | "RENTED";
  rentedUntil?: string | null;
  rank?: string;
  rankBadge?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "VIP" | "CLONE">("ALL");

  // Modal Cho Thuê / Gia Hạn Nhanh
  const [rentModalAccount, setRentModalAccount] = useState<DashboardAccountItem | null>(null);
  const [quickHours, setQuickHours] = useState<number>(2);
  const [customEndTime, setCustomEndTime] = useState<string>("");
  const [isSubmittingRental, setIsSubmittingRental] = useState(false);

  // 1. TẢI DỮ LIỆU TÀI KHOẢN & ĐƠN HÀNG TỪ DATABASE
  const loadAccounts = async (showToastNotice = false) => {
    setIsLoading(true);
    try {
      const [{ vipAccounts, cloneAccounts }, ordersRes] = await Promise.all([
        getVipAndCloneAccounts(),
        getOrders(),
      ]);

      if (ordersRes && ordersRes.success) {
        setOrders(ordersRes.data || []);
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
          rankBadge: c.rankBadge || "UNRANKED",
          monthlyPrice: Number(c.monthlyPrice) || Number(c.periodPrice) || Number(c.price) || 150000,
          periodPrice: Number(c.periodPrice) || 150000,
          accountValue: Number(c.price) || 150000,
          price: Number(c.price) || 150000,
        })),
      ];

      setAccounts(unifiedList);
      if (showToastNotice) {
        toast.success("✅ Đã làm mới số liệu kho & đơn hàng!");
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách tài khoản:", err);
      toast.error("Không thể tải danh sách tài khoản từ cơ sở dữ liệu!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // 2. TÍNH TOÁN CÁC CHỈ SỐ THỐNG KÊ THỰC TẾ
  const stats = useMemo(() => {
    const total = accounts.length;
    const vipCount = accounts.filter((a) => a.category === "VIP").length;
    const cloneCount = accounts.filter((a) => a.category === "CLONE").length;
    const available = accounts.filter((a) => a.status === "AVAILABLE").length;
    const rented = accounts.filter((a) => a.status === "RENTED").length;

    // Vốn tài khoản còn trong kho (các acc AVAILABLE)
    const availableValue = accounts
      .filter((a) => a.status === "AVAILABLE")
      .reduce((sum, a) => {
        if (a.category === "VIP") {
          return sum + (Number(a.accountValue) || Number(a.price) || 850000);
        }
        return sum + (Number(a.monthlyPrice) || Number(a.periodPrice) || Number(a.price) || 150000);
      }, 0);

    // Tổng định giá toàn bộ kho tài khoản
    const totalValue = accounts.reduce((sum, a) => {
      if (a.category === "VIP") {
        return sum + (Number(a.accountValue) || Number(a.price) || 850000);
      }
      return sum + (Number(a.monthlyPrice) || Number(a.periodPrice) || Number(a.price) || 150000);
    }, 0);

    // Tỷ lệ cho thuê (Lấp đầy)
    const fillRate = total > 0 ? Math.round((rented / total) * 100) : 0;

    // Danh sách tài khoản đang thuê
    const rentedList = accounts.filter((a) => a.status === "RENTED");

    // Tài khoản sắp hết giờ thuê (dưới 24h hoặc đã quá hạn)
    const nowMs = Date.now();
    const expiringList = rentedList.filter((a) => {
      if (!a.rentedUntil) return false;
      const expiryMs = new Date(a.rentedUntil).getTime();
      return isNaN(expiryMs) || expiryMs <= nowMs + 24 * 60 * 60 * 1000;
    });

    return {
      total,
      vipCount,
      cloneCount,
      available,
      rented,
      availableValue,
      totalValue,
      fillRate,
      rentedList,
      expiringCount: expiringList.length,
    };
  }, [accounts]);

  // Danh sách các acc đang được cho thuê trong kho để đồng bộ biểu đồ lợi nhuận
  const extraRentedAccounts = useMemo(() => {
    return stats.rentedList.map((a) => {
      let amount = 60000;
      if (a.category === "VIP") {
        amount = Number(a.hourlyPrice) ? Number(a.hourlyPrice) * 4 : 60000;
      } else {
        amount = Number(a.monthlyPrice) || Number(a.periodPrice) || 210000;
      }
      return {
        category: a.category,
        amount,
        profit: amount,
        title: a.title,
      };
    });
  }, [stats.rentedList]);

  // 3. THAO TÁC HOÀN THÀNH ĐƠN & THU HỒI ACC VỀ KHO (TÍNH LÃI VÀO DOANH THU)
  const handleCompleteOrder = async (account: DashboardAccountItem) => {
    const toastId = toast.loading(`Đang chốt hoàn thành đơn [${account.code}]...`);
    try {
      // 1. Cập nhật trạng thái tài khoản về AVAILABLE trên Supabase
      const res = await updateAccountApi({
        id: account.id,
        status: "AVAILABLE",
        rented_until: null,
      });

      if (!res.success) {
        throw new Error(res.error || "Không thể cập nhật trạng thái tài khoản!");
      }

      // 2. Tìm đơn hàng tương ứng trong hệ thống đơn hoặc tạo mới để chốt lãi
      const matchedOrder = orders.find(
        (o) => o.accountCode === account.code && o.status === "RENTING"
      );

      if (matchedOrder) {
        // Cập nhật đơn hàng hiện có sang COMPLETED
        await updateOrder(matchedOrder.id, {
          status: "COMPLETED",
          notes: `${matchedOrder.notes || ""}\n[${new Date().toLocaleTimeString("vi-VN")}] Hoàn thành đơn & thu hồi acc về kho.`.trim(),
        });
        setOrders((prev) =>
          prev.map((o) => (o.id === matchedOrder.id ? { ...o, status: "COMPLETED" } : o))
        );
      } else {
        // Tự động sinh đơn hoàn thành với giá gói chính xác để ghi nhận lãi
        let amount = 60000;
        let packageName = "Gói 24 Giờ (1 Ngày VIP)";
        if (account.category === "VIP") {
          amount = account.dailyPrice || (account.hourlyPrice ? account.hourlyPrice * 4 : 60000);
          packageName = "Gói Trải Nghiệm VIP";
        } else {
          amount = account.monthlyPrice || account.periodPrice || 210000;
          packageName = "Gói Thuê Acc Clone";
        }

        const createRes = await createOrder({
          type: account.category,
          customer: "Khách Thuê Zalo",
          phoneZalo: "0352.867.283",
          accountCode: account.code,
          accountTitle: account.title,
          package: packageName,
          amount,
          status: "COMPLETED",
          createdBy: "ADMIN",
          source: "ADMIN",
          accountLogin: `tft_${account.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          accountPass: "TuanTFT@Shop",
          notes: "Đơn hoàn thành trực tiếp từ trang Quản trị tổng quan.",
        });

        if (createRes.success && createRes.data) {
          setOrders((prev) => [createRes.data!, ...prev]);
        }
      }

      // 3. Cập nhật state local danh sách tài khoản
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id ? { ...a, status: "AVAILABLE", rentedUntil: null } : a
        )
      );

      toast.success(`✅ Đã hoàn thành đơn & thu hồi acc [${account.code}] về kho sẵn sàng!`, {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`, { id: toastId });
    }
  };

  // 4. MỞ MODAL CHO THUÊ / GIA HẠN NHANH
  const openRentModal = (account: DashboardAccountItem) => {
    setRentModalAccount(account);
    const initialHours = 2;
    setQuickHours(initialHours);

    // Mặc định thời gian kết thúc = bây giờ + initialHours
    const d = new Date(Date.now() + initialHours * 60 * 60 * 1000);
    setCustomEndTime(toLocalDatetimeInputString(d));
  };

  // Chọn số giờ thuê mẫu nhanh
  const handleSelectQuickHours = (hours: number) => {
    setQuickHours(hours);
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    setCustomEndTime(toLocalDatetimeInputString(d));
  };

  // 5. LƯU THỜI GIAN CHO THUÊ / GIA HẠN
  const handleSaveRentalDuration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentModalAccount) return;

    if (!customEndTime) {
      toast.error("Vui lòng chọn thời gian trả tài khoản!");
      return;
    }

    const targetDate = new Date(customEndTime);
    if (isNaN(targetDate.getTime())) {
      toast.error("Thời gian không hợp lệ!");
      return;
    }

    setIsSubmittingRental(true);
    const toastId = toast.loading(`Đang lưu thời gian thuê acc [${rentModalAccount.code}]...`);

    try {
      const isoString = targetDate.toISOString();
      const res = await updateAccountApi({
        id: rentModalAccount.id,
        status: "RENTED",
        rented_until: isoString,
      });

      if (!res.success) {
        throw new Error(res.error || "Không thể cập nhật thời gian thuê!");
      }

      // Cập nhật state local
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === rentModalAccount.id
            ? { ...a, status: "RENTED", rentedUntil: isoString }
            : a
        )
      );

      toast.success(`✅ Đã thiết lập cho thuê acc [${rentModalAccount.code}] thành công!`, {
        id: toastId,
      });
      setRentModalAccount(null);
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`, { id: toastId });
    } finally {
      setIsSubmittingRental(false);
    }
  };

  // Sao chép thông tin tài khoản cho khách Zalo
  const handleCopyAccountInfo = (account: DashboardAccountItem) => {
    const text = `[THÔNG TIN ACC SHOP TFT]\n- Mã Acc: ${account.code}\n- Tên Acc: ${account.title}\n- Loại: ${account.category === "VIP" ? "Kho VIP" : "Kho Clone"}\n- Trạng Thái: ${account.status === "RENTED" ? "Đang Thuê" : "Sẵn Sàng"}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Đã sao chép thông tin acc [${account.code}]!`);
    });
  };

  // Danh sách tài khoản sẵn sàng đã được lọc
  const filteredAvailableAccounts = useMemo(() => {
    return accounts
      .filter((a) => a.status === "AVAILABLE")
      .filter((a) => {
        if (categoryFilter === "VIP" && a.category !== "VIP") return false;
        if (categoryFilter === "CLONE" && a.category !== "CLONE") return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          return (
            a.code.toLowerCase().includes(q) ||
            a.title.toLowerCase().includes(q) ||
            (a.mainChibi && a.mainChibi.toLowerCase().includes(q))
          );
        }
        return true;
      });
  }, [accounts, categoryFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER & TỔNG QUAN HỆ THỐNG */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl shadow-orange-600/15 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tổng Quan Hệ Thống Kho Acc • {PROFILE_INFO.realName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-gaming">
            Hệ Thống Kho Acc ĐTCL Đang Hoạt Động Tốt
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl font-normal leading-relaxed">
            Hiện tại đang có <strong className="font-bold text-white underline">{stats.rented} tài khoản</strong> đang cho khách thuê và{" "}
            <strong className="font-bold text-white underline">{stats.available} tài khoản</strong> sẵn sàng bàn giao trong kho.
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10 flex-shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => loadAccounts(true)}
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
            title="Tải lại dữ liệu mới nhất từ cơ sở dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Làm Mới</span>
          </button>

          <Link
            href="/admin/accounts"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-orange-700 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2 cursor-pointer font-gaming"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Quản Lý Chi Tiết Kho Acc ➔</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS GRID: 4 THẺ THỐNG KÊ DỮ LIỆU THỰC TẾ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Tổng Kho Tài Khoản */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-gaming">
              Tổng Kho Tài Khoản
            </span>
            <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Gamepad2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {stats.total} Acc
            </span>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
              {stats.vipCount} VIP • {stats.cloneCount} Clone
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">
            Tổng định giá kho: <strong className="font-mono text-slate-700 font-bold">{stats.totalValue.toLocaleString("vi-VN")}đ</strong>
          </p>
        </div>

        {/* Card 2: Đang Cho Thuê */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-gaming">
              Đang Cho Thuê
            </span>
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-orange-600 font-mono">
              {stats.rented} Acc
            </span>
            <span className="text-xs text-orange-700 bg-orange-50 border border-orange-200 font-bold px-2 py-0.5 rounded-md font-mono">
              Lấp đầy {stats.fillRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">
            {stats.rented > 0 ? "Đang có khách giữ pass chơi game" : "Hiện tại kho đang trống chưa cho thuê"}
          </p>
        </div>

        {/* Card 3: Vốn Acc Còn Trong Kho */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-gaming">
              Vốn Acc Sẵn Sàng
            </span>
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {stats.availableValue.toLocaleString("vi-VN")}đ
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
              {stats.available} SẴN SÀNG
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">
            Tổng giá trị acc chưa cho thuê trong kho
          </p>
        </div>

        {/* Card 4: Acc Cần Thu Hồi / Sắp Hết Hạn */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-gaming">
              Sắp Hết Giờ / Thu Hồi
            </span>
            <span className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <Hourglass className="w-4 h-4 text-rose-600" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {stats.expiringCount} Acc
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              stats.expiringCount > 0 ? "bg-rose-100 text-rose-700 font-mono" : "bg-slate-100 text-slate-600"
            }`}>
              {stats.expiringCount > 0 ? "Cần Đổi Pass" : "An Toàn"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">
            Hết hạn trong 24h hoặc cần thu hồi
          </p>
        </div>

      </div>

      {/* 2.5. BIỂU ĐỒ LỢI NHUẬN & DOANH THU SHOP (PROFIT ANALYTICS CHART) */}
      <ProfitAnalyticsChart
        orders={orders}
        extraRentedAccounts={extraRentedAccounts}
      />

      {/* 3. KHỐI DANH SÁCH: CÁC TÀI KHOẢN ĐANG ĐƯỢC CHO THUÊ (RENTED LIVE TABLE) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-extrabold text-slate-900 text-base font-gaming uppercase tracking-tight">
                Danh Sách Tài Khoản Đang Cho Thuê ({stats.rentedList.length} Acc)
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Theo dõi thời gian khách trả acc, đếm ngược thời gian và nút 1 chạm hoàn thành đơn chốt lãi / gia hạn tài khoản.
            </p>
          </div>

          <Link
            href="/admin/accounts"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Đến Trang Quản Lý Kho</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.rentedList.length === 0 ? (
          <div className="py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">Tất Cả Tài Khoản Đang Sẵn Sàng</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hiện tại không có tài khoản nào đang được cho thuê. Khi có khách đặt thuê qua Zalo, hãy bấm nút <strong>"Cho Thuê Nhanh"</strong> ở bảng bên dưới.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {stats.rentedList.map((account) => {
              const expiryInfo = formatRentalExpiry(account.rentedUntil);

              return (
                <div
                  key={account.id}
                  className="py-3.5 px-3 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs group"
                >
                  {/* Cột 1: Thông tin Acc */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={account.thumbnail}
                      alt={account.code}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/avatar.jpg";
                      }}
                    />

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-black/80 text-white font-mono font-bold text-[10px]">
                          {account.code}
                        </span>

                        {account.category === "VIP" ? (
                          <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-extrabold text-[10px] border border-orange-200">
                            KHO VIP
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-extrabold text-[10px] border border-purple-200">
                            KHO CLONE
                          </span>
                        )}

                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {account.category === "VIP" ? account.rank : account.rankBadge}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {account.title}
                      </h4>

                      {account.mainArena && (
                        <p className="text-[10px] text-slate-500 truncate">
                          🏟️ {account.mainArena}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cột 2: Thời hạn thuê & Đếm ngược */}
                  <div className="flex flex-col justify-center min-w-[200px] bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Hạn Trả Acc:</span>
                      <strong className="text-slate-900 font-mono font-bold">
                        {expiryInfo ? expiryInfo.expiryFormatted : "Chưa thiết lập"}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400">Thời gian còn lại:</span>
                      {expiryInfo ? (
                        <span
                          className={`text-[11px] font-mono font-black ${
                            !expiryInfo.isInfinite && expiryInfo.remainingSec === 0
                              ? "text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded"
                              : "text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded"
                          }`}
                        >
                          {!expiryInfo.isInfinite && expiryInfo.remainingSec === 0
                            ? "⚠️ Quá Hạn Thuê"
                            : `⏳ ${expiryInfo.shortCountdown}`}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Đang thuê không thời hạn</span>
                      )}
                    </div>
                  </div>

                  {/* Cột 3: Nút Thao Tác Nhanh */}
                  <div className="flex items-center gap-1.5 justify-end flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyAccountInfo(account)}
                      title="Sao chép mã acc"
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-xs cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openRentModal(account)}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Gia Hạn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCompleteOrder(account)}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:shadow-emerald-600/20 active:scale-95 cursor-pointer"
                      title="Chốt hoàn thành đơn, ghi nhận lãi vào doanh thu và thu hồi acc về kho"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hoàn Thành Đơn</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. KHỐI DANH SÁCH: TÀI KHOẢN SẴN SÀNG CHO THUÊ (AVAILABLE ACCOUNTS PREVIEW) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-slate-900 text-base font-gaming uppercase tracking-tight">
                Kho Tài Khoản Sẵn Sàng Bàn Giao ({filteredAvailableAccounts.length} Acc)
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Chọn nhanh tài khoản để gán giờ thuê cho khách phát sinh từ Zalo / Hotline.
            </p>
          </div>

          {/* Bộ lọc nhanh */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã acc, tên tí nị..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 w-48 sm:w-56"
              />
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  categoryFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("VIP")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  categoryFilter === "VIP" ? "bg-white text-orange-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Kho VIP
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("CLONE")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  categoryFilter === "CLONE" ? "bg-white text-purple-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Kho Clone
              </button>
            </div>
          </div>
        </div>

        {filteredAvailableAccounts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Không tìm thấy tài khoản sẵn sàng nào phù hợp với từ khóa tìm kiếm.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAvailableAccounts.slice(0, 9).map((account) => (
              <div
                key={account.id}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between bg-white space-y-3 group"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={account.thumbnail}
                    alt={account.code}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/avatar.jpg";
                    }}
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-black/80 text-white font-mono font-bold text-[9px]">
                        {account.code}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                        SẴN SÀNG
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 font-mono">
                        {account.category === "VIP" ? account.rank : account.rankBadge}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs truncate">
                      {account.title}
                    </h4>

                    <div className="flex items-baseline gap-1 text-[11px]">
                      <span className="font-mono font-bold text-red-600">
                        {account.category === "VIP"
                          ? `${(account.hourlyPrice || 15000).toLocaleString("vi-VN")}đ/h`
                          : `${(account.monthlyPrice || 150000).toLocaleString("vi-VN")}đ/vô cực`}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        • Vốn {(account.accountValue || 850000).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleCopyAccountInfo(account)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
                    title="Sao chép thông tin"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openRentModal(account)}
                    className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Cho Thuê Nhanh</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAvailableAccounts.length > 9 && (
          <div className="pt-2 text-center">
            <Link
              href="/admin/accounts"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors py-2 px-4 rounded-xl border border-slate-200 hover:border-orange-300 bg-slate-50"
            >
              <span>Xem Thêm {filteredAvailableAccounts.length - 9} Tài Khoản Khác Trong Kho ➔</span>
            </Link>
          </div>
        )}
      </div>

      {/* 5. MODAL: THIẾT LẬP THỜI GIAN CHO THUÊ / GIA HẠN NHANH */}
      {rentModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {rentModalAccount.status === "RENTED" ? "Gia Hạn Thời Gian Thuê" : "Thiết Lập Cho Thuê Nhanh"}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    Mã Acc: {rentModalAccount.code} • {rentModalAccount.category === "VIP" ? "Kho VIP" : "Kho Clone"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRentModalAccount(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRentalDuration} className="space-y-4 text-xs">
              {/* Thông tin Acc tóm tắt */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <img
                  src={rentModalAccount.thumbnail}
                  alt={rentModalAccount.code}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 truncate">{rentModalAccount.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {rentModalAccount.category === "VIP"
                      ? `${rentModalAccount.hourlyPrice?.toLocaleString("vi-VN")}đ/giờ`
                      : `${rentModalAccount.monthlyPrice?.toLocaleString("vi-VN")}đ/tháng`}
                  </span>
                </div>
              </div>

              {/* Phím bấm nhanh số giờ */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  ⚡ Chọn Nhanh Gói Thời Gian:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "2 Giờ", hours: 2 },
                    { label: "4 Giờ", hours: 4 },
                    { label: "10 Giờ (Đêm)", hours: 10 },
                    { label: "24 Giờ", hours: 24 },
                    { label: "3 Ngày", hours: 72 },
                    { label: "7 Ngày (1T)", hours: 168 },
                    { label: "30 Ngày", hours: 720 },
                    { label: "Vô Cực (1N)", hours: 8760 },
                  ].map((p) => (
                    <button
                      key={p.hours}
                      type="button"
                      onClick={() => handleSelectQuickHours(p.hours)}
                      className={`py-2 px-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer text-center ${
                        quickHours === p.hours
                          ? "bg-orange-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chọn chính xác ngày giờ trả acc */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block flex items-center justify-between">
                  <span>Thời Điểm Hết Hạn Trả Acc:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Giờ Việt Nam (GMT+7)</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={customEndTime}
                  onChange={(e) => {
                    setCustomEndTime(e.target.value);
                    setQuickHours(0);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-bold"
                />
              </div>

              {/* Nút hành động */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRentModalAccount(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRental}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/20"
                >
                  {isSubmittingRental ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Xác Nhận Cho Thuê</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
