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
import { getOrders, OrderItem, OrdersStats } from "@/utils/orders-service";
import toast from "react-hot-toast";
import {
  Gamepad2,
  Clock,
  Sparkles,
  Zap,
  Copy,
  CheckCircle2,
  RotateCcw,
  Check,
  Flame,
  Wallet,
  Search,
  RefreshCw,
  X,
  ArrowUpRight,
  TrendingUp,
  Infinity as InfinityIcon,
  Activity,
  Layers,
  Hourglass,
  ArrowRightLeft,
  DollarSign,
  PieChart,
  ShieldAlert,
  Percent,
  Calendar,
  Sun,
  Award,
  Coins,
  Sliders,
  BarChart3,
  Info,
} from "lucide-react";

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
  monthlyPrice?: number;
  periodPrice?: number;
  accountValue?: number;
  price?: number;
  priceDisplayType?: "HOURLY" | "DAILY" | "LONG_TERM" | "CUSTOM" | "AUTO";
  mainChibi?: string;
  mainArena?: string;
  isPermanentRental?: boolean; // Cờ dòng tiền chết: Thuê vĩnh viễn / Vô cực
}

type FlowFilterType = "ALL" | "LIVE" | "DEAD" | "RENTED" | "AVAILABLE" | "EXPIRING";

export default function AdminDashboardPage() {
  const [accounts, setAccounts] = useState<DashboardAccountItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [orderStats, setOrderStats] = useState<OrdersStats>({
    totalRevenue: 0,
    totalOrders: 0,
    rentingOrders: 0,
    completedOrders: 0,
    expiredOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "VIP" | "CLONE">("ALL");
  const [flowFilter, setFlowFilter] = useState<FlowFilterType>("ALL");

  // Bộ lọc & Thiết lập phân tích Lợi Nhuận (Ngày / Tuần / Tháng / Năm & Mặc định lãi 20%)
  const [profitPeriod, setProfitPeriod] = useState<"DAY" | "WEEK" | "MONTH" | "YEAR">("MONTH");
  const [deadProfitRate, setDeadProfitRate] = useState<number>(0.20); // 20% mặc định cho thuê lâu dài / Dòng tiền chết

  // Modal Cho Thuê / Gia Hạn Nhanh
  const [rentModalAccount, setRentModalAccount] = useState<DashboardAccountItem | null>(null);
  const [quickHours, setQuickHours] = useState<number>(2);
  const [customEndTime, setCustomEndTime] = useState<string>("");
  const [isSubmittingRental, setIsSubmittingRental] = useState(false);

  // 1. TẢI DỮ LIỆU TÀI KHOẢN & ĐƠN HÀNG TỪ HỆ THỐNG
  const loadDashboardData = async (showToastNotice = false) => {
    setIsLoading(true);
    try {
      // Tải song song Kho Acc và Đơn Hàng
      const [accRes, orderRes] = await Promise.all([
        getVipAndCloneAccounts(),
        getOrders().catch(() => ({
          success: false,
          data: [],
          stats: { totalRevenue: 0, totalOrders: 0, rentingOrders: 0, completedOrders: 0, expiredOrders: 0 },
        })),
      ]);

      const { vipAccounts, cloneAccounts } = accRes;

      const unifiedList: DashboardAccountItem[] = [
        ...(vipAccounts || []).map((v) => {
          const expInfo = formatRentalExpiry(v.rentedUntil);
          const isPermanent =
            expInfo?.isInfinite ||
            v.priceDisplayType === "LONG_TERM" ||
            (v.rentedUntil ? new Date(v.rentedUntil).getFullYear() >= 2090 : false);

          return {
            id: String(v.id),
            category: "VIP" as const,
            code: v.code,
            title: v.title || `${v.mainChibi || "Tí Nị VIP"} - ${v.rank || "Thách Đấu"}`,
            thumbnail: v.thumbnail || "/avatar.jpg",
            status: (v.status || "AVAILABLE").toUpperCase() as "AVAILABLE" | "RENTED",
            rentedUntil: v.rentedUntil || null,
            rank: v.rank || "THÁCH ĐẤU",
            hourlyPrice: Number(v.hourlyPrice) || 15000,
            accountValue: Number(v.accountValue) || 850000,
            price: Number(v.accountValue) || 850000,
            priceDisplayType: v.priceDisplayType,
            mainChibi: v.mainChibi || "",
            mainArena: v.mainArena || "",
            isPermanentRental: isPermanent,
          };
        }),
        ...(cloneAccounts || []).map((c) => {
          const expInfo = formatRentalExpiry(c.rentedUntil);
          const isPermanent =
            expInfo?.isInfinite ||
            c.periodUnit?.toLowerCase().includes("vĩnh viễn") ||
            (c.rentedUntil ? new Date(c.rentedUntil).getFullYear() >= 2090 : false);

          return {
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
            isPermanentRental: isPermanent,
          };
        }),
      ];

      setAccounts(unifiedList);

      if (orderRes.success) {
        setOrders(orderRes.data || []);
        if (orderRes.stats) setOrderStats(orderRes.stats);
      }

      if (showToastNotice) {
        toast.success("✅ Đã cập nhật số liệu dòng tiền và kho acc mới nhất!");
      }
    } catch (err: any) {
      console.error("Lỗi tải dashboard data:", err);
      toast.error("Không thể tải dữ liệu thống kê từ máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 2. TÍNH TOÁN BỘ CHỈ SỐ TÀI CHÍNH & DÒNG TIỀN (LIVE VS DEAD CASH FLOW)
  const cashFlowStats = useMemo(() => {
    const totalAccounts = accounts.length;
    const nowMs = Date.now();

    // Phân loại tài khoản theo Dòng Tiền
    const liveAccounts = accounts.filter((a) => !a.isPermanentRental);
    const deadAccounts = accounts.filter((a) => a.isPermanentRental);

    // Tính giá trị vốn kho tài khoản
    const liveAccountsValue = liveAccounts.reduce((sum, a) => {
      return sum + (Number(a.accountValue) || Number(a.price) || (a.category === "VIP" ? 850000 : 150000));
    }, 0);

    const deadAccountsValue = deadAccounts.reduce((sum, a) => {
      return sum + (Number(a.accountValue) || Number(a.price) || (a.category === "VIP" ? 850000 : 150000));
    }, 0);

    const totalAccountsValue = liveAccountsValue + deadAccountsValue;

    // Phân loại doanh thu đơn hàng theo Dòng Tiền
    const liveOrdersRevenue = orders
      .filter((o) => o.durationHours !== -1 && !o.package?.toLowerCase().includes("vĩnh viễn") && !o.package?.toLowerCase().includes("vô cực"))
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    const deadOrdersRevenue = orders
      .filter((o) => o.durationHours === -1 || o.package?.toLowerCase().includes("vĩnh viễn") || o.package?.toLowerCase().includes("vô cực"))
      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    const totalOrderRevenue = orderStats.totalRevenue || liveOrdersRevenue + deadOrdersRevenue;

    // DÒNG TIỀN TỔNG (Total System Cash Flow = Vốn Tài Sản + Doanh Thu Phát Sinh)
    const totalLiveFlow = liveAccountsValue + liveOrdersRevenue;
    const totalDeadFlow = deadAccountsValue + deadOrdersRevenue;
    const totalSystemFlow = totalLiveFlow + totalDeadFlow;

    // Tỷ lệ % phân bổ
    const livePercent = totalSystemFlow > 0 ? Math.round((totalLiveFlow / totalSystemFlow) * 100) : 100;
    const deadPercent = totalSystemFlow > 0 ? 100 - livePercent : 0;

    // Thống kê trạng thái tài khoản
    const liveRented = liveAccounts.filter((a) => a.status === "RENTED").length;
    const liveAvailable = liveAccounts.filter((a) => a.status === "AVAILABLE").length;
    const deadRented = deadAccounts.filter((a) => a.status === "RENTED").length;
    const deadAvailable = deadAccounts.filter((a) => a.status === "AVAILABLE").length;

    // Danh sách tài khoản đang thuê
    const rentedList = accounts.filter((a) => a.status === "RENTED");

    // Danh sách tài khoản sắp hết hạn thuê (dưới 24h hoặc đã quá hạn, không tính acc vô cực)
    const expiringList = rentedList.filter((a) => {
      if (a.isPermanentRental || !a.rentedUntil) return false;
      const expiryMs = new Date(a.rentedUntil).getTime();
      return isNaN(expiryMs) || expiryMs <= nowMs + 24 * 60 * 60 * 1000;
    });

    return {
      totalAccounts,
      totalOrders: orderStats.totalOrders || orders.length,
      totalOrderRevenue,
      totalAccountsValue,
      totalSystemFlow,

      // DÒNG TIỀN SỐNG (Thuê Có Hạn)
      liveAccountsCount: liveAccounts.length,
      liveAccountsValue,
      liveOrdersRevenue,
      totalLiveFlow,
      livePercent,
      liveRented,
      liveAvailable,
      liveFillRate: liveAccounts.length > 0 ? Math.round((liveRented / liveAccounts.length) * 100) : 0,

      // DÒNG TIỀN CHẾT (Thuê Vĩnh Viễn / Bán Đứt)
      deadAccountsCount: deadAccounts.length,
      deadAccountsValue,
      deadOrdersRevenue,
      totalDeadFlow,
      deadPercent,
      deadRented,
      deadAvailable,

      // Trạng thái vận hành
      rentedCount: rentedList.length,
      availableCount: accounts.filter((a) => a.status === "AVAILABLE").length,
      expiringCount: expiringList.length,
      rentedList,
    };
  }, [accounts, orders, orderStats]);

  // 3. TÍNH TOÁN BỘ CHỈ SỐ LỢI NHUẬN (NGÀY, TUẦN, THÁNG, NĂM & LÃI 20% THUÊ LÂU DÀI)
  const profitAnalytics = useMemo(() => {
    const nowMs = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;
    const oneYearMs = 365 * oneDayMs;

    // Phân loại đơn hàng hợp lệ (không tính đơn hủy)
    const validOrders = orders.filter((o) => o.status !== "CANCELLED");

    // Doanh thu đơn Dòng Sống theo chu kỳ thời gian
    const getLiveRevenueInPeriod = (msRange: number) => {
      return validOrders
        .filter((o) => {
          const isLive =
            o.durationHours !== -1 &&
            !o.package?.toLowerCase().includes("vĩnh viễn") &&
            !o.package?.toLowerCase().includes("vô cực");
          if (!isLive) return false;
          if (!o.createdAt) return true;
          const t = new Date(o.createdAt).getTime();
          return isNaN(t) || nowMs - t <= msRange;
        })
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    };

    // Doanh thu đơn Dòng Chết theo chu kỳ thời gian
    const getDeadRevenueInPeriod = (msRange: number) => {
      return validOrders
        .filter((o) => {
          const isDead =
            o.durationHours === -1 ||
            o.package?.toLowerCase().includes("vĩnh viễn") ||
            o.package?.toLowerCase().includes("vô cực");
          if (!isDead) return false;
          if (!o.createdAt) return true;
          const t = new Date(o.createdAt).getTime();
          return isNaN(t) || nowMs - t <= msRange;
        })
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    };

    // Ước tính công suất doanh thu luân chuyển hàng ngày từ kho acc đang cho thuê
    // VIP: ~15.000đ/giờ * 8h/ngày = 120.000đ/ngày
    // Clone: ~150.000đ/tháng / 30 = 5.000đ/ngày
    const rentedVipCount = accounts.filter(
      (a) => a.category === "VIP" && a.status === "RENTED" && !a.isPermanentRental
    ).length;
    const rentedCloneCount = accounts.filter(
      (a) => a.category === "CLONE" && a.status === "RENTED" && !a.isPermanentRental
    ).length;
    const dailyEstimatedLiveRental = rentedVipCount * 120000 + rentedCloneCount * 5000;

    // 1. DOANH THU DÒNG SỐNG (LIVE REVENUE)
    const dayLiveRevenue = Math.max(getLiveRevenueInPeriod(oneDayMs), dailyEstimatedLiveRental);
    const weekLiveRevenue = Math.max(getLiveRevenueInPeriod(sevenDaysMs), dayLiveRevenue * 7);
    const monthLiveRevenue = Math.max(getLiveRevenueInPeriod(thirtyDaysMs), dayLiveRevenue * 30);
    const yearLiveRevenue = Math.max(getLiveRevenueInPeriod(oneYearMs), dayLiveRevenue * 365);

    // Biên lãi Dòng Sống: 80% (chi phí vận hành/khấu hao 20%)
    const LIVE_PROFIT_MARGIN = 0.80;
    const dayLiveProfit = Math.round(dayLiveRevenue * LIVE_PROFIT_MARGIN);
    const weekLiveProfit = Math.round(weekLiveRevenue * LIVE_PROFIT_MARGIN);
    const monthLiveProfit = Math.round(monthLiveRevenue * LIVE_PROFIT_MARGIN);
    const yearLiveProfit = Math.round(yearLiveRevenue * LIVE_PROFIT_MARGIN);

    // 2. DÒNG TIỀN CHẾT: MẶC ĐỊNH LÃI 20% (deadProfitRate) trên Toàn Bộ Vốn Kho Vô Cực + Đơn Vĩnh Viễn
    const deadBaseCapital = cashFlowStats.deadAccountsValue + cashFlowStats.deadOrdersRevenue;
    const yearDeadProfit = Math.round(deadBaseCapital * deadProfitRate);
    const monthDeadProfit = Math.round(yearDeadProfit / 12);
    const weekDeadProfit = Math.round(yearDeadProfit / 52);
    const dayDeadProfit = Math.round(yearDeadProfit / 365);

    const yearDeadRevenue = deadBaseCapital;
    const monthDeadRevenue = Math.round(yearDeadRevenue / 12);
    const weekDeadRevenue = Math.round(yearDeadRevenue / 52);
    const dayDeadRevenue = Math.round(yearDeadRevenue / 365);

    // 3. TỔNG LỢI NHUẬN & DOANH THU TOÀN DIỆN TỪNG KỲ
    const dayTotalProfit = dayLiveProfit + dayDeadProfit;
    const weekTotalProfit = weekLiveProfit + weekDeadProfit;
    const monthTotalProfit = monthLiveProfit + monthDeadProfit;
    const yearTotalProfit = yearLiveProfit + yearDeadProfit;

    const dayTotalRevenue = dayLiveRevenue + dayDeadRevenue;
    const weekTotalRevenue = weekLiveRevenue + weekDeadRevenue;
    const monthTotalRevenue = monthLiveRevenue + monthDeadRevenue;
    const yearTotalRevenue = yearLiveRevenue + yearDeadRevenue;

    // Chi tiết theo kỳ đang chọn (profitPeriod)
    const currentPeriodData = {
      DAY: {
        label: "Hôm Nay (24 Giờ)",
        subLabel: "Ước tính lợi nhuận ngày hôm nay",
        liveProfit: dayLiveProfit,
        deadProfit: dayDeadProfit,
        totalProfit: dayTotalProfit,
        liveRevenue: dayLiveRevenue,
        deadRevenue: dayDeadRevenue,
        totalRevenue: dayTotalRevenue,
        liveShare: dayTotalProfit > 0 ? Math.round((dayLiveProfit / dayTotalProfit) * 100) : 100,
        deadShare: dayTotalProfit > 0 ? Math.round((dayDeadProfit / dayTotalProfit) * 100) : 0,
        margin: dayTotalRevenue > 0 ? Math.round((dayTotalProfit / dayTotalRevenue) * 100) : 0,
      },
      WEEK: {
        label: "Tuần Này (7 Ngày)",
        subLabel: "Lợi nhuận luân chuyển trong 7 ngày",
        liveProfit: weekLiveProfit,
        deadProfit: weekDeadProfit,
        totalProfit: weekTotalProfit,
        liveRevenue: weekLiveRevenue,
        deadRevenue: weekDeadRevenue,
        totalRevenue: weekTotalRevenue,
        liveShare: weekTotalProfit > 0 ? Math.round((weekLiveProfit / weekTotalProfit) * 100) : 100,
        deadShare: weekTotalProfit > 0 ? Math.round((weekDeadProfit / weekTotalProfit) * 100) : 0,
        margin: weekTotalRevenue > 0 ? Math.round((weekTotalProfit / weekTotalRevenue) * 100) : 0,
      },
      MONTH: {
        label: "Tháng Này (30 Ngày)",
        subLabel: "Chu kỳ dòng tiền hàng tháng tiêu chuẩn",
        liveProfit: monthLiveProfit,
        deadProfit: monthDeadProfit,
        totalProfit: monthTotalProfit,
        liveRevenue: monthLiveRevenue,
        deadRevenue: monthDeadRevenue,
        totalRevenue: monthTotalRevenue,
        liveShare: monthTotalProfit > 0 ? Math.round((monthLiveProfit / monthTotalProfit) * 100) : 100,
        deadShare: monthTotalProfit > 0 ? Math.round((monthDeadProfit / monthTotalProfit) * 100) : 0,
        margin: monthTotalRevenue > 0 ? Math.round((monthTotalProfit / monthTotalRevenue) * 100) : 0,
      },
      YEAR: {
        label: "Cả Năm (365 Ngày)",
        subLabel: "Toàn bộ lợi nhuận năm & thu hồi vốn",
        liveProfit: yearLiveProfit,
        deadProfit: yearDeadProfit,
        totalProfit: yearTotalProfit,
        liveRevenue: yearLiveRevenue,
        deadRevenue: yearDeadRevenue,
        totalRevenue: yearTotalRevenue,
        liveShare: yearTotalProfit > 0 ? Math.round((yearLiveProfit / yearTotalProfit) * 100) : 100,
        deadShare: yearTotalProfit > 0 ? Math.round((yearDeadProfit / yearTotalProfit) * 100) : 0,
        margin: yearTotalRevenue > 0 ? Math.round((yearTotalProfit / yearTotalRevenue) * 100) : 0,
      },
    }[profitPeriod];

    return {
      deadProfitRate,
      deadBaseCapital,
      day: {
        profit: dayTotalProfit,
        liveProfit: dayLiveProfit,
        deadProfit: dayDeadProfit,
        revenue: dayTotalRevenue,
        liveRevenue: dayLiveRevenue,
        deadRevenue: dayDeadRevenue,
        margin: dayTotalRevenue > 0 ? Math.round((dayTotalProfit / dayTotalRevenue) * 100) : 0,
      },
      week: {
        profit: weekTotalProfit,
        liveProfit: weekLiveProfit,
        deadProfit: weekDeadProfit,
        revenue: weekTotalRevenue,
        liveRevenue: weekLiveRevenue,
        deadRevenue: weekDeadRevenue,
        margin: weekTotalRevenue > 0 ? Math.round((weekTotalProfit / weekTotalRevenue) * 100) : 0,
      },
      month: {
        profit: monthTotalProfit,
        liveProfit: monthLiveProfit,
        deadProfit: monthDeadProfit,
        revenue: monthTotalRevenue,
        liveRevenue: monthLiveRevenue,
        deadRevenue: monthDeadRevenue,
        margin: monthTotalRevenue > 0 ? Math.round((monthTotalProfit / monthTotalRevenue) * 100) : 0,
      },
      year: {
        profit: yearTotalProfit,
        liveProfit: yearLiveProfit,
        deadProfit: yearDeadProfit,
        revenue: yearTotalRevenue,
        liveRevenue: yearLiveRevenue,
        deadRevenue: yearDeadRevenue,
        margin: yearTotalRevenue > 0 ? Math.round((yearTotalProfit / yearTotalRevenue) * 100) : 0,
      },
      currentPeriodData,
    };
  }, [accounts, orders, cashFlowStats, deadProfitRate, profitPeriod]);

  // 4. THAO TÁC THU HỒI TÀI KHOẢN (ĐỔI VỀ AVAILABLE)
  const handleReclaimAccount = async (account: DashboardAccountItem) => {
    const toastId = toast.loading(`Đang thu hồi acc [${account.code}]...`);
    try {
      const res = await updateAccountApi({
        id: account.id,
        status: "AVAILABLE",
        rented_until: null,
      });

      if (!res.success) {
        throw new Error(res.error || "Không thể cập nhật trạng thái!");
      }

      setAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id
            ? { ...a, status: "AVAILABLE", rentedUntil: null, isPermanentRental: false }
            : a
        )
      );

      toast.success(`✅ Đã thu hồi acc [${account.code}] về trạng thái SẴN SÀNG!`, {
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
    const d = new Date(Date.now() + initialHours * 60 * 60 * 1000);
    setCustomEndTime(toLocalDatetimeInputString(d));
  };

  // Chọn số giờ thuê mẫu nhanh (hỗ trợ cả Vô cực ∞)
  const handleSelectQuickHours = (hours: number) => {
    setQuickHours(hours);
    if (hours === -1 || hours >= 87600) {
      // Gói Vô Cực / Vĩnh Viễn -> đặt ngày 10 năm sau (năm 2036+)
      const d = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000);
      setCustomEndTime(toLocalDatetimeInputString(d));
    } else {
      const d = new Date(Date.now() + hours * 60 * 60 * 1000);
      setCustomEndTime(toLocalDatetimeInputString(d));
    }
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
    const isPermanent = quickHours === -1 || quickHours >= 87600 || targetDate.getFullYear() >= 2035;
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

      setAccounts((prev) =>
        prev.map((a) =>
          a.id === rentModalAccount.id
            ? { ...a, status: "RENTED", rentedUntil: isoString, isPermanentRental: isPermanent }
            : a
        )
      );

      toast.success(
        `✅ Đã thiết lập cho thuê [${rentModalAccount.code}] (${isPermanent ? "Dòng tiền chết - Vĩnh viễn" : "Dòng tiền sống - Có hạn"}) thành công!`,
        { id: toastId }
      );
      setRentModalAccount(null);
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`, { id: toastId });
    } finally {
      setIsSubmittingRental(false);
    }
  };

  // Sao chép thông tin tài khoản cho khách Zalo
  const handleCopyAccountInfo = (account: DashboardAccountItem) => {
    const flowText = account.isPermanentRental ? "Dòng Tiền Chết (Thuê Vĩnh Viễn ∞)" : "Dòng Tiền Sống (Thuê Có Hạn)";
    const text = `[THÔNG TIN ACC SHOP TFT]\n- Mã Acc: ${account.code}\n- Tên Acc: ${account.title}\n- Loại: ${account.category === "VIP" ? "Kho VIP" : "Kho Clone"}\n- Trạng Thái: ${account.status === "RENTED" ? "Đang Thuê" : "Sẵn Sàng"}\n- Phân Loại: ${flowText}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Đã sao chép thông tin acc [${account.code}]!`);
    });
  };

  // Danh sách tài khoản đã lọc theo Search, Category & Dòng Tiền (FlowFilter)
  const filteredAccounts = useMemo(() => {
    const nowMs = Date.now();
    return accounts.filter((a) => {
      // 1. Lọc theo Category
      if (categoryFilter === "VIP" && a.category !== "VIP") return false;
      if (categoryFilter === "CLONE" && a.category !== "CLONE") return false;

      // 2. Lọc theo Dòng Tiền (Flow Filter)
      if (flowFilter === "LIVE" && a.isPermanentRental) return false;
      if (flowFilter === "DEAD" && !a.isPermanentRental) return false;
      if (flowFilter === "RENTED" && a.status !== "RENTED") return false;
      if (flowFilter === "AVAILABLE" && a.status !== "AVAILABLE") return false;
      if (flowFilter === "EXPIRING") {
        if (a.status !== "RENTED" || a.isPermanentRental || !a.rentedUntil) return false;
        const expMs = new Date(a.rentedUntil).getTime();
        if (!isNaN(expMs) && expMs > nowMs + 24 * 60 * 60 * 1000) return false;
      }

      // 3. Lọc theo từ khóa tìm kiếm
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
  }, [accounts, categoryFilter, flowFilter, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================ */}
      {/* 1. WELCOME BANNER & REFRESH ACTION                           */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Phân Tích Dòng Tiền & Vốn Hệ Thống • {PROFILE_INFO.realName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight font-gaming">
            Báo Cáo Dòng Tiền Tổng, Dòng Tiền Sống & Dòng Tiền Chết
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
            Hệ thống đang quản lý <strong className="font-bold text-white">{cashFlowStats.totalAccounts} tài khoản</strong> với{" "}
            <strong className="text-emerald-400 font-bold">{cashFlowStats.livePercent}% Dòng tiền sống</strong> (luân chuyển định kỳ) và{" "}
            <strong className="text-purple-400 font-bold">{cashFlowStats.deadPercent}% Dòng tiền chết</strong> (vô cực / cố định).
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10 flex-shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 active:scale-95 shadow-xs"
            title="Tải lại dữ liệu mới nhất từ cơ sở dữ liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Đồng Bộ Dữ Liệu</span>
          </button>

          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer font-gaming"
          >
            <DollarSign className="w-4 h-4" />
            <span>Quản Lý Đơn Hàng ➔</span>
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. THREE MASTER FINANCIAL CARDS (TỔNG, SỐNG, CHẾT)          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        
        {/* CARD 1: DÒNG TIỀN TỔNG (TOTAL CASH FLOW & CAPITAL) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-3.5 relative overflow-hidden group hover:border-slate-400 transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 font-gaming">
                1. DÒNG TIỀN TỔNG
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Toàn Bộ Vốn & Doanh Thu
              </h3>
            </div>
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm">
              <PieChart className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {cashFlowStats.totalSystemFlow.toLocaleString("vi-VN")}đ
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Vốn Kho Acc ({cashFlowStats.totalAccountsValue.toLocaleString("vi-VN")}đ) + Doanh Thu Đơn ({cashFlowStats.totalOrderRevenue.toLocaleString("vi-VN")}đ)
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Tổng Kho Acc</span>
              <strong className="font-mono font-black text-slate-900 text-sm">
                {cashFlowStats.totalAccounts} Tài Khoản
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Tổng Đơn Hàng</span>
              <strong className="font-mono font-black text-slate-900 text-sm">
                {cashFlowStats.totalOrders} Giao Dịch
              </strong>
            </div>
          </div>
        </div>

        {/* CARD 2: DÒNG TIỀN SỐNG (ACTIVE / DYNAMIC CASH FLOW - ACC THUÊ CÓ HẠN) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-emerald-200 shadow-sm space-y-3.5 relative overflow-hidden group hover:border-emerald-400 hover:shadow-emerald-500/10 transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 font-gaming">
                  2. DÒNG TIỀN SỐNG ({cashFlowStats.livePercent}%)
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1">
                <span>Acc Thuê Có Hạn</span>
                <span className="text-[10px] px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Xoay Vòng
                </span>
              </h3>
            </div>
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl shadow-md shadow-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight">
              {cashFlowStats.totalLiveFlow.toLocaleString("vi-VN")}đ
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Vốn {cashFlowStats.liveAccountsCount} Acc Thuê ({cashFlowStats.liveAccountsValue.toLocaleString("vi-VN")}đ) + Thu ngắn hạn ({cashFlowStats.liveOrdersRevenue.toLocaleString("vi-VN")}đ)
            </p>
          </div>

          <div className="pt-2 border-t border-emerald-100 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 block uppercase">Đang Cho Thuê</span>
              <strong className="font-mono font-black text-emerald-900 text-sm">
                {cashFlowStats.liveRented} Acc (Lấp đầy {cashFlowStats.liveFillRate}%)
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 block uppercase">Sẵn Sàng Trong Kho</span>
              <strong className="font-mono font-black text-emerald-900 text-sm">
                {cashFlowStats.liveAvailable} Acc Chờ Khách
              </strong>
            </div>
          </div>
        </div>

        {/* CARD 3: DÒNG TIỀN CHẾT (STATIC / SUNK CAPITAL - ACC THUÊ VĨNH VIỄN / BÁN ĐỨT) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-purple-200 shadow-sm space-y-3.5 relative overflow-hidden group hover:border-purple-400 hover:shadow-purple-500/10 transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 font-gaming">
                  3. DÒNG TIỀN CHẾT ({cashFlowStats.deadPercent}%)
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1">
                <span>Thuê Vĩnh Viễn / Vô Cực</span>
                <span className="text-[10px] px-2 py-0.2 rounded-md bg-purple-100 text-purple-800 font-bold border border-purple-200">
                  Thu 1 Lần
                </span>
              </h3>
            </div>
            <div className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-purple-500/20">
              <InfinityIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 font-mono tracking-tight">
              {cashFlowStats.totalDeadFlow.toLocaleString("vi-VN")}đ
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Vốn {cashFlowStats.deadAccountsCount} Acc Vĩnh Viễn ({cashFlowStats.deadAccountsValue.toLocaleString("vi-VN")}đ) + Thu chốt ({cashFlowStats.deadOrdersRevenue.toLocaleString("vi-VN")}đ)
            </p>
          </div>

          <div className="pt-2 border-t border-purple-100 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
              <span className="text-[10px] font-bold text-purple-700 block uppercase">Đã Chốt Vĩnh Viễn</span>
              <strong className="font-mono font-black text-purple-900 text-sm">
                {cashFlowStats.deadAccountsCount} Acc Vô Cực ∞
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
              <span className="text-[10px] font-bold text-purple-700 block uppercase">Tỷ Trọng Cố Định</span>
              <strong className="font-mono font-black text-purple-900 text-sm">
                {cashFlowStats.deadPercent}% Tổng Vốn
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. VISUAL PROFIT ANALYTICS: NGÀY / TUẦN / THÁNG / NĂM       */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border-2 border-orange-200/80 p-5 sm:p-7 shadow-lg shadow-orange-500/5 space-y-6 relative overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black uppercase tracking-wider font-gaming border border-orange-200">
                <Coins className="w-3.5 h-3.5 text-orange-600" />
                <span>Thống Kê Lợi Nhuận Thực Tế</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black border border-purple-200">
                <Percent className="w-3 h-3 text-purple-600" />
                <span>Mặc định thuê lâu dài lãi {(deadProfitRate * 100).toFixed(0)}%</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-gaming tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <span>Bảng Lợi Nhuận Ngày • Tuần • Tháng • Năm</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl font-medium">
              Báo cáo hiệu suất tài chính theo chu kỳ với quy tắc: <strong className="text-purple-700 font-bold">Thuê lâu dài (Vô cực ∞) lãi {(deadProfitRate * 100).toFixed(0)}%</strong> cố định trên vốn, kết hợp <strong className="text-emerald-700 font-bold">Thuê ngắn hạn biên lãi xoay vòng 80%</strong>.
            </p>
          </div>

          {/* Quick Controls: Simulator % Lãi Thuê Lâu Dài */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/80 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-slate-600">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Biên Lãi Lâu Dài:</span>
            </div>
            {[
              { label: "15%", rate: 0.15 },
              { label: "20% (Chuẩn)", rate: 0.20 },
              { label: "25%", rate: 0.25 },
              { label: "30%", rate: 0.30 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setDeadProfitRate(preset.rate);
                  toast.success(`Đã cập nhật tỷ suất lãi thuê lâu dài: ${(preset.rate * 100).toFixed(0)}%`);
                }}
                className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer font-mono ${
                  deadProfitRate === preset.rate
                    ? "bg-purple-600 text-white shadow-xs font-black"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/60"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 PROFIT TIMEFRAME HERO CARDS (DAY, WEEK, MONTH, YEAR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Hôm Nay / 24H */}
          <div
            onClick={() => setProfitPeriod("DAY")}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
              profitPeriod === "DAY"
                ? "bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                : "bg-slate-50/70 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-amber-800 font-gaming flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>1. HÔM NAY (24H)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                Biên Lãi {profitAnalytics.day.margin}%
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                +{profitAnalytics.day.profit.toLocaleString("vi-VN")}đ
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Doanh thu cơ sở: <strong className="font-mono text-slate-700">{profitAnalytics.day.revenue.toLocaleString("vi-VN")}đ</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-amber-200/60 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>🟢 Lãi Dòng Sống:</span>
                <span className="font-mono">+{profitAnalytics.day.liveProfit.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex items-center justify-between text-purple-700 font-bold">
                <span>🟣 Lãi Dòng Chết ({(deadProfitRate * 100).toFixed(0)}%):</span>
                <span className="font-mono">+{profitAnalytics.day.deadProfit.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          {/* Card 2: Tuần Này / 7 Ngày */}
          <div
            onClick={() => setProfitPeriod("WEEK")}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
              profitPeriod === "WEEK"
                ? "bg-teal-50/80 border-teal-500 shadow-md ring-2 ring-teal-500/20"
                : "bg-slate-50/70 border-slate-200 hover:border-teal-300 hover:bg-teal-50/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-teal-800 font-gaming flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>2. TUẦN NÀY (7N)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-900">
                Biên Lãi {profitAnalytics.week.margin}%
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                +{profitAnalytics.week.profit.toLocaleString("vi-VN")}đ
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Doanh thu cơ sở: <strong className="font-mono text-slate-700">{profitAnalytics.week.revenue.toLocaleString("vi-VN")}đ</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-teal-200/60 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>🟢 Lãi Dòng Sống:</span>
                <span className="font-mono">+{profitAnalytics.week.liveProfit.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex items-center justify-between text-purple-700 font-bold">
                <span>🟣 Lãi Dòng Chết ({(deadProfitRate * 100).toFixed(0)}%):</span>
                <span className="font-mono">+{profitAnalytics.week.deadProfit.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          {/* Card 3: Tháng Này / 30 Ngày (HERO HIGHLIGHT) */}
          <div
            onClick={() => setProfitPeriod("MONTH")}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
              profitPeriod === "MONTH"
                ? "bg-gradient-to-b from-orange-50 to-amber-50/90 border-orange-500 shadow-lg ring-2 ring-orange-500/20"
                : "bg-slate-50/70 border-slate-200 hover:border-orange-300 hover:bg-orange-50/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-orange-800 font-gaming flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>3. THÁNG NÀY (30N)</span>
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-600 text-white shadow-xs">
                🌟 Trọng Tâm
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-orange-600 font-mono tracking-tight">
                +{profitAnalytics.month.profit.toLocaleString("vi-VN")}đ
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Doanh thu cơ sở: <strong className="font-mono text-slate-700">{profitAnalytics.month.revenue.toLocaleString("vi-VN")}đ</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-orange-200/70 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>🟢 Lãi Dòng Sống:</span>
                <span className="font-mono">+{profitAnalytics.month.liveProfit.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex items-center justify-between text-purple-700 font-bold">
                <span>🟣 Lãi Dòng Chết ({(deadProfitRate * 100).toFixed(0)}%):</span>
                <span className="font-mono">+{profitAnalytics.month.deadProfit.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          {/* Card 4: Cả Năm / 365 Ngày */}
          <div
            onClick={() => setProfitPeriod("YEAR")}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-3 ${
              profitPeriod === "YEAR"
                ? "bg-purple-50/80 border-purple-500 shadow-md ring-2 ring-purple-500/20"
                : "bg-slate-50/70 border-slate-200 hover:border-purple-300 hover:bg-purple-50/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-purple-800 font-gaming flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>4. CẢ NĂM (365N)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-900">
                Biên Lãi {profitAnalytics.year.margin}%
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                +{profitAnalytics.year.profit.toLocaleString("vi-VN")}đ
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Doanh thu cơ sở: <strong className="font-mono text-slate-700">{profitAnalytics.year.revenue.toLocaleString("vi-VN")}đ</strong>
              </p>
            </div>

            <div className="pt-2 border-t border-purple-200/60 space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>🟢 Lãi Dòng Sống:</span>
                <span className="font-mono">+{profitAnalytics.year.liveProfit.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex items-center justify-between text-purple-700 font-bold">
                <span>🟣 Lãi Dòng Chết ({(deadProfitRate * 100).toFixed(0)}%):</span>
                <span className="font-mono">+{profitAnalytics.year.deadProfit.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE DRILLDOWN & CONTRIBUTION SPLIT BAR */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm font-gaming">
                Phân Rã Cơ Cấu Lợi Nhuận: <span className="text-orange-400 font-extrabold">{profitAnalytics.currentPeriodData.label}</span>
              </h4>
            </div>

            {/* Timeframe Tab Switcher */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
              {(["DAY", "WEEK", "MONTH", "YEAR"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setProfitPeriod(period)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    profitPeriod === period
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {period === "DAY" && "Ngày (24H)"}
                  {period === "WEEK" && "Tuần (7N)"}
                  {period === "MONTH" && "Tháng (30N)"}
                  {period === "YEAR" && "Năm (365N)"}
                </button>
              ))}
            </div>
          </div>

          {/* Contribution Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Dòng Sống: {profitAnalytics.currentPeriodData.liveShare}% (+{profitAnalytics.currentPeriodData.liveProfit.toLocaleString("vi-VN")}đ)</span>
              </span>
              <span className="text-purple-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                <span>Dòng Chết ({(deadProfitRate * 100).toFixed(0)}% Lãi): {profitAnalytics.currentPeriodData.deadShare}% (+{profitAnalytics.currentPeriodData.deadProfit.toLocaleString("vi-VN")}đ)</span>
              </span>
            </div>

            <div className="w-full h-4 rounded-xl bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${Math.max(5, profitAnalytics.currentPeriodData.liveShare)}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              />
              <div
                style={{ width: `${Math.max(5, profitAnalytics.currentPeriodData.deadShare)}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Detailed Summary Stats 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block font-gaming">
                🟢 Dòng Tiền Sống (Xoay Vòng)
              </span>
              <div className="font-mono text-white font-extrabold text-sm">
                +{profitAnalytics.currentPeriodData.liveProfit.toLocaleString("vi-VN")}đ
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Biên lãi 80% từ doanh thu {profitAnalytics.currentPeriodData.liveRevenue.toLocaleString("vi-VN")}đ luân chuyển liên tục.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase block font-gaming">
                🟣 Dòng Tiền Chết (Lâu Dài {(deadProfitRate * 100).toFixed(0)}%)
              </span>
              <div className="font-mono text-white font-extrabold text-sm">
                +{profitAnalytics.currentPeriodData.deadProfit.toLocaleString("vi-VN")}đ
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {(deadProfitRate * 100).toFixed(0)}% cố định trên tổng vốn {cashFlowStats.deadAccountsValue.toLocaleString("vi-VN")}đ acc vô cực.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-950/60 to-slate-800 border border-orange-500/30 space-y-1">
              <span className="text-[10px] font-bold text-orange-400 uppercase block font-gaming">
                💎 Tổng Lợi Nhuận Thu Về
              </span>
              <div className="font-mono text-orange-400 font-extrabold text-sm">
                +{profitAnalytics.currentPeriodData.totalProfit.toLocaleString("vi-VN")}đ
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Tỷ suất sinh lời toàn hệ thống đạt <strong className="text-white font-bold">{profitAnalytics.currentPeriodData.margin}%</strong> trên tổng doanh thu.
              </p>
            </div>
          </div>
        </div>

        {/* Footnote Rule Explanations */}
        <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/60 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 block">Quy tắc tính toán lợi nhuận chuẩn của Shop TFT:</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              • <strong>Acc cho thuê lâu dài (Dòng tiền chết - Vô cực ∞):</strong> Lãi mặc định <strong className="text-purple-700 font-bold">{(deadProfitRate * 100).toFixed(0)}%</strong> tính trên toàn bộ giá trị acc và đơn hàng vĩnh viễn (thu hồi vốn ngay).<br />
              • <strong>Acc cho thuê có hạn (Dòng tiền sống):</strong> Biên lợi nhuận trung bình đạt <strong className="text-emerald-700 font-bold">80%</strong> trên doanh thu cho thuê theo giờ/ngày/tháng sau khi trừ chi phí vận hành và bảo quản acc.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. VISUAL CASH FLOW SPECTRUM BAR & HEALTH INSIGHTS           */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base font-gaming uppercase tracking-tight">
              Cơ Cấu Tỷ Lệ Dòng Tiền Sống vs Dòng Tiền Chết
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Tổng tài sản luân chuyển: <strong className="font-mono text-slate-900 font-black">{cashFlowStats.totalSystemFlow.toLocaleString("vi-VN")}đ</strong>
          </span>
        </div>

        {/* Visual Spectrum Bar */}
        <div className="space-y-2">
          <div className="w-full h-7 rounded-2xl bg-slate-100 overflow-hidden flex shadow-inner border border-slate-200">
            {/* Live Segment */}
            <div
              style={{ width: `${Math.max(8, cashFlowStats.livePercent)}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white text-[11px] font-black font-mono transition-all duration-500 px-2 truncate"
              title={`Dòng tiền sống: ${cashFlowStats.livePercent}% (${cashFlowStats.totalLiveFlow.toLocaleString("vi-VN")}đ)`}
            >
              🟢 SỐNG: {cashFlowStats.livePercent}% ({cashFlowStats.totalLiveFlow.toLocaleString("vi-VN")}đ)
            </div>

            {/* Dead Segment */}
            {cashFlowStats.deadPercent > 0 && (
              <div
                style={{ width: `${Math.max(8, cashFlowStats.deadPercent)}%` }}
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white text-[11px] font-black font-mono transition-all duration-500 px-2 truncate"
                title={`Dòng tiền chết: ${cashFlowStats.deadPercent}% (${cashFlowStats.totalDeadFlow.toLocaleString("vi-VN")}đ)`}
              >
                🟣 CHẾT: {cashFlowStats.deadPercent}% ({cashFlowStats.totalDeadFlow.toLocaleString("vi-VN")}đ)
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-medium text-slate-600 pt-1">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>Dòng Tiền Sống: {cashFlowStats.liveAccountsCount} Acc Thuê Có Hạn ({cashFlowStats.totalLiveFlow.toLocaleString("vi-VN")}đ)</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-purple-700">
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
                <span>Dòng Tiền Chết: {cashFlowStats.deadAccountsCount} Acc Vĩnh Viễn ({cashFlowStats.totalDeadFlow.toLocaleString("vi-VN")}đ)</span>
              </span>
            </div>

            <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
              {cashFlowStats.livePercent >= 60
                ? "🌟 Dòng tiền cực kỳ khỏe, tính thanh khoản định kỳ cao!"
                : "💡 Nên bổ sung thêm các acc cho thuê theo giờ/ngày để tăng dòng tiền sống"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. SMART FILTER TABS & ACCOUNT INVENTORY TABLE               */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base font-gaming uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" />
              <span>Kho Tài Khoản Phân Theo Dòng Tiền ({filteredAccounts.length} / {accounts.length} Acc)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi và quản lý riêng biệt từng acc Dòng Tiền Sống (Thuê có hạn) và Dòng Tiền Chết (Thuê vĩnh viễn / Vô cực).
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã acc, tướng tí nị, rank..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap text-xs">
          <button
            type="button"
            onClick={() => setFlowFilter("ALL")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              flowFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Tất Cả</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">{accounts.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setFlowFilter("LIVE")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              flowFilter === "LIVE"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <span>🟢 Dòng Tiền Sống (Thuê Có Hạn)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-800 text-white text-[10px] font-mono">{cashFlowStats.liveAccountsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setFlowFilter("DEAD")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              flowFilter === "DEAD"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
            }`}
          >
            <span>🟣 Dòng Tiền Chết (Vô Cực ∞)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-purple-800 text-white text-[10px] font-mono">{cashFlowStats.deadAccountsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setFlowFilter("RENTED")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              flowFilter === "RENTED"
                ? "bg-orange-600 text-white shadow-xs"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
            }`}
          >
            <span>🔥 Đang Cho Thuê</span>
            <span className="px-1.5 py-0.2 rounded-md bg-orange-800 text-white text-[10px] font-mono">{cashFlowStats.rentedCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setFlowFilter("EXPIRING")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              flowFilter === "EXPIRING"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            <span>⏳ Sắp Hết Hạn / Quá Hạn</span>
            <span className="px-1.5 py-0.2 rounded-md bg-rose-800 text-white text-[10px] font-mono">{cashFlowStats.expiringCount}</span>
          </button>
        </div>

        {/* Account List Items */}
        {filteredAccounts.length === 0 ? (
          <div className="py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">Không tìm thấy tài khoản nào phù hợp</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Thử chọn tab bộ lọc khác hoặc tìm kiếm với từ khóa khác nhé!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredAccounts.map((account) => {
              const expiryInfo = formatRentalExpiry(account.rentedUntil);

              return (
                <div
                  key={account.id}
                  className="py-3.5 px-2.5 sm:px-3 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs group"
                >
                  {/* Cột 1: Thông tin Acc & Badge Dòng Tiền */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={account.thumbnail}
                      alt={account.code}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/avatar.jpg";
                      }}
                    />

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[10px]">
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

                        {/* Badge DÒNG TIỀN SỐNG vs DÒNG TIỀN CHẾT */}
                        {account.isPermanentRental ? (
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-black text-[10px] border border-purple-200 flex items-center gap-1">
                            <InfinityIcon className="w-3 h-3" />
                            <span>DÒNG TIỀN CHẾT (VÔ CỰC ∞)</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-200 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            <span>DÒNG TIỀN SỐNG (THUÊ CÓ HẠN)</span>
                          </span>
                        )}

                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {account.category === "VIP" ? account.rank : account.rankBadge}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {account.title}
                      </h4>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Định giá: <strong className="text-slate-900 font-mono font-bold">{(account.accountValue || account.price || 0).toLocaleString("vi-VN")}đ</strong></span>
                        {account.category === "VIP" ? (
                          <span>Giá thuê: <strong className="text-orange-600 font-mono font-bold">{account.hourlyPrice?.toLocaleString("vi-VN")}đ/giờ</strong></span>
                        ) : (
                          <span>Giá thuê: <strong className="text-orange-600 font-mono font-bold">{account.monthlyPrice?.toLocaleString("vi-VN")}đ/tháng</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cột 2: Trạng thái & Hạn Thuê */}
                  <div className="flex flex-col justify-center min-w-[210px] bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Trạng thái:</span>
                      {account.status === "RENTED" ? (
                        <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-600" />
                          <span>Đang Cho Thuê</span>
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Sẵn Sàng</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1.5 text-[11px]">
                      <span className="text-slate-500 font-medium">Thời hạn:</span>
                      {account.status === "RENTED" && expiryInfo ? (
                        <strong className="text-slate-900 font-mono font-bold">
                          {expiryInfo.expiryFormatted}
                        </strong>
                      ) : (
                        <span className="text-slate-400 italic">Chưa phát sinh thuê</span>
                      )}
                    </div>

                    {account.status === "RENTED" && expiryInfo && (
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60 text-[10px]">
                        <span className="text-slate-400">Đếm ngược:</span>
                        <span
                          className={`font-mono font-bold ${
                            !expiryInfo.isInfinite && expiryInfo.remainingSec === 0
                              ? "text-rose-600 bg-rose-50 px-1 py-0.2 rounded"
                              : "text-orange-600"
                          }`}
                        >
                          {!expiryInfo.isInfinite && expiryInfo.remainingSec === 0
                            ? "⚠️ Quá Hạn Thuê"
                            : `⏳ ${expiryInfo.shortCountdown}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cột 3: Nút Thao Tác Nhanh */}
                  <div className="flex items-center gap-1.5 justify-end flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyAccountInfo(account)}
                      title="Sao chép thông tin"
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-xs cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openRentModal(account)}
                      className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{account.status === "RENTED" ? "Gia Hạn" : "Cho Thuê Nhanh"}</span>
                    </button>

                    {account.status === "RENTED" && (
                      <button
                        type="button"
                        onClick={() => handleReclaimAccount(account)}
                        className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Thu Hồi</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 5. MODAL: THIẾT LẬP THỜI GIAN CHO THUÊ / GIA HẠN NHANH         */}
      {/* ============================================================ */}
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

              {/* Phím bấm nhanh số giờ & Vô cực */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  ⚡ Chọn Gói Thời Gian (Sống / Chết):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "2 Giờ (Sống)", hours: 2 },
                    { label: "4 Giờ (Sống)", hours: 4 },
                    { label: "10 Giờ (Đêm)", hours: 10 },
                    { label: "24 Giờ (1N)", hours: 24 },
                    { label: "3 Ngày", hours: 72 },
                    { label: "7 Ngày (1T)", hours: 168 },
                    { label: "30 Ngày", hours: 720 },
                    { label: "♾️ Vô Cực (Chết)", hours: -1 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSelectQuickHours(p.hours)}
                      className={`py-2 px-1 rounded-xl font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer text-center ${
                        quickHours === p.hours
                          ? p.hours === -1
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-orange-600 text-white shadow-xs"
                          : p.hours === -1
                          ? "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
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

              {/* Phân loại dòng tiền tóm tắt */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Phân loại dòng tiền:</span>
                {quickHours === -1 ? (
                  <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                    🟣 Dòng Tiền Chết (Thuê Vĩnh Viễn)
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    🟢 Dòng Tiền Sống (Thuê Có Hạn)
                  </span>
                )}
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
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/20 active:scale-98"
                >
                  {isSubmittingRental ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Xác Nhận Lưu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
