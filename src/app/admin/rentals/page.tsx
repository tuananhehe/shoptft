"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Search,
  CheckCircle2,
  Eye,
  Plus,
  Copy,
  Check,
  Send,
  X,
  KeyRound,
  User,
  Phone,
  Gamepad2,
  Trash2,
  RefreshCw,
  Loader2,
  CalendarDays,
  AlertTriangle,
  DollarSign,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  UserCheck,
  Ban,
  Calendar,
  AlertCircle,
  FileText,
  MessageCircle,
} from "lucide-react";
import { PROFILE_INFO, TFT_RENTAL_ACCOUNTS, TFT_CLONE_ACCOUNTS } from "@/data/tft-data";
import { getVipAndCloneAccounts } from "@/utils/supabase/accounts-service";
import {
  OrderItem,
  OrdersStats,
  OrderType,
  OrderStatus,
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  extendOrder,
  generateRandomPassword,
  getRentalTimeRemaining,
  buildDeliveryMessage,
  formatOrderDateTime,
} from "@/utils/orders-service";
import toast from "react-hot-toast";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatVND(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString("vi-VN") + "đ";
}

function StatusBadge({
  status,
  isOverdue,
  isExpiringSoon,
}: {
  status: OrderStatus;
  isOverdue?: boolean;
  isExpiringSoon?: boolean;
}) {
  if (status === "RENTING") {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>Quá hạn</span>
        </span>
      );
    }
    if (isExpiringSoon) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Sắp hết hạn</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Đang thuê</span>
      </span>
    );
  }

  const map: Record<OrderStatus, { label: string; cls: string }> = {
    RENTING: { label: "Đang thuê", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    COMPLETED: { label: "Đã kết thúc", cls: "bg-slate-100 text-slate-700 border border-slate-200" },
    EXPIRED: { label: "Hết hạn", cls: "bg-rose-50 text-rose-600 border border-rose-200" },
    CANCELLED: { label: "Đã hủy", cls: "bg-gray-100 text-gray-500 border border-gray-200" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-500" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${s.cls}`}>{s.label}</span>;
}

function TypeBadge({ type }: { type: OrderType }) {
  return type === "VIP" ? (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#111111] text-white text-[9px] font-black tracking-wider">VIP</span>
  ) : (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-700 text-white text-[9px] font-semibold tracking-wider">CLONE</span>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

interface MemberItem {
  id: string;
  username: string;
  full_name?: string;
  zalo?: string;
  status: "ACTIVE" | "LOCKED";
}

function AdminRentalsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialAction = searchParams.get("action");
  const initialAccountCode = searchParams.get("accountCode") || "";
  const initialSearch = searchParams.get("search") || "";

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "EXPIRING" | "OVERDUE" | "HISTORY" | "ALL">("ACTIVE");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState<OrdersStats>({
    totalRevenue: 0,
    totalOrders: 0,
    rentingOrders: 0,
    expiringOrders: 0,
    overdueOrders: 0,
    completedOrders: 0,
    expiredOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Accounts & Members
  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);

  // Search & Type Filter
  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "VIP" | "CLONE">("ALL");
  const [timeFilter, setTimeFilter] = useState<"ALL" | "TODAY" | "7DAYS" | "30DAYS">("ALL");

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(initialAction === "create");
  const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null);
  const [extendOrder_, setExtendOrder_] = useState<OrderItem | null>(null);
  const [completeConfirmOrder, setCompleteConfirmOrder] = useState<OrderItem | null>(null);
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Create Form State
  const [formAccountCode, setFormAccountCode] = useState(initialAccountCode);
  const [customerMode, setCustomerMode] = useState<"MANUAL" | "MEMBER">("MANUAL");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [formCustomer, setFormCustomer] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [packageMode, setPackageMode] = useState<"PRESET" | "CUSTOM">("PRESET");
  const [formPackage, setFormPackage] = useState("2 Giờ Trải Nghiệm");
  const [formDurationHours, setFormDurationHours] = useState<number>(2);
  const [formAmount, setFormAmount] = useState<number>(30000);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [formEndDate, setFormEndDate] = useState(
    new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [formLogin, setFormLogin] = useState("");
  const [formPass, setFormPass] = useState("");
  const [formNote, setFormNote] = useState("");

  // Extend Form State
  const [extendType, setExtendType] = useState<"HOURS" | "DAYS">("DAYS");
  const [extendValue, setExtendValue] = useState<number>(1);
  const [extendPrice, setExtendPrice] = useState<number>(0);
  const [extendNote, setExtendNote] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load orders data
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getOrders();
      setOrders(result.data || []);
      if (result.stats) setStats(result.stats);
    } catch {
      toast.error("Lỗi kết nối khi tải danh sách lượt thuê!");
    } finally {
      setLoading(false);
    }
  };

  // Load accounts and members on mount
  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 45_000);

    // Fetch accounts
    getVipAndCloneAccounts()
      .then(({ vipAccounts: v, cloneAccounts: c }) => {
        const list = [...(v || []), ...(c || [])];
        setAllAccounts(list);
      })
      .catch(() => {});

    // Fetch members
    const token = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
    fetch("/api/admin/users", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-admin-token": token } : {}),
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setMembers(json.data);
        }
      })
      .catch(() => {});

    return () => clearInterval(timer);
  }, []);

  // When account code is preselected via query parameter
  useEffect(() => {
    if (initialAccountCode) {
      setFormAccountCode(initialAccountCode);
      const acc = allAccounts.find((a) => a.code === initialAccountCode || a.id === initialAccountCode);
      if (acc) {
        applyAccountPackagePresets(acc, "2 Giờ Trải Nghiệm");
      }
    }
  }, [initialAccountCode, allAccounts]);

  // Helper to find account details
  const getAccountByCode = (code: string) => {
    return allAccounts.find(
      (a) => a.code?.toLowerCase().trim() === code?.toLowerCase().trim() || a.id === code
    );
  };

  // Package preset calculation
  const applyAccountPackagePresets = (acc: any, pkgName: string) => {
    const isVip = (acc.category || acc.type || "VIP") === "VIP";
    const accountVal = Number(acc.accountValue) || Number(acc.price) || 850000;

    let hours = 2;
    let price = 30000;

    if (pkgName.includes("2 Giờ")) {
      hours = 2;
      price = acc.hourlyPrice ? acc.hourlyPrice * 2 : Math.round((accountVal * 0.03) / 1000) * 1000 + 20000;
    } else if (pkgName.includes("24 Giờ") || pkgName.includes("1 Ngày")) {
      hours = 24;
      price = acc.dailyPrice || Math.round(((accountVal * 0.12) / 2) / 1000) * 1000 + 20000;
    } else if (pkgName.includes("7 Ngày")) {
      hours = 168;
      price = acc.weeklyPrice || Math.round((accountVal * 0.12) / 1000) * 1000 + 20000;
    } else if (pkgName.includes("30 Ngày")) {
      hours = 720;
      price = acc.monthlyPrice || Math.round((accountVal * 0.30) / 1000) * 1000;
    } else if (pkgName.includes("Lâu Dài")) {
      hours = -1; // Vô cực
      price = isVip ? accountVal : Number(acc.periodPrice) || Number(acc.price) || 150000;
    }

    setFormPackage(pkgName);
    setFormDurationHours(hours);
    setFormAmount(price);

    const now = new Date();
    setFormStartDate(now.toISOString().slice(0, 16));
    if (hours > 0) {
      const exp = new Date(now.getTime() + hours * 3600 * 1000);
      setFormEndDate(exp.toISOString().slice(0, 16));
    }
  };

  // Handle Account Selection Change in Create Modal
  const handleAccountSelect = (code: string) => {
    setFormAccountCode(code);
    const acc = getAccountByCode(code);
    if (acc) {
      applyAccountPackagePresets(acc, formPackage);
      setFormLogin(`tft_${acc.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`);
      setFormPass(generateRandomPassword());
    }
  };

  // Handle Member Selection Change in Create Modal
  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setFormCustomer(member.full_name || member.username);
      setFormPhone(member.zalo || "");
    }
  };

  // Active double rental check
  const activeRentedAccountCodes = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.status === "RENTING" && o.accountCode) {
        set.add(o.accountCode.toLowerCase().trim());
      }
    });
    return set;
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    const now = Date.now();

    return orders.filter((order) => {
      const remaining = getRentalTimeRemaining(order.expiresAt);
      const isOverdue = order.status === "RENTING" && remaining.isExpired;
      const isExpiringSoon = order.status === "RENTING" && remaining.isExpiringSoon;

      // Tab filter
      if (activeTab === "ACTIVE") {
        if (order.status !== "RENTING") return false;
      } else if (activeTab === "EXPIRING") {
        if (order.status !== "RENTING" || !isExpiringSoon) return false;
      } else if (activeTab === "OVERDUE") {
        if (order.status !== "RENTING" || !isOverdue) return false;
      } else if (activeTab === "HISTORY") {
        if (order.status === "RENTING") return false;
      }

      // Type filter
      if (typeFilter !== "ALL" && order.type !== typeFilter) {
        return false;
      }

      // Time filter (based on createdAt)
      if (timeFilter !== "ALL" && order.createdAt) {
        const createdMs = new Date(order.createdAt).getTime();
        const diffDays = (now - createdMs) / (1000 * 3600 * 24);
        if (timeFilter === "TODAY" && diffDays > 1) return false;
        if (timeFilter === "7DAYS" && diffDays > 7) return false;
        if (timeFilter === "30DAYS" && diffDays > 30) return false;
      }

      // Search query filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchCode = order.accountCode?.toLowerCase().includes(q);
        const matchTitle = order.accountTitle?.toLowerCase().includes(q);
        const matchCustomer = order.customer?.toLowerCase().includes(q);
        const matchPhone = order.phoneZalo?.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchCustomer && !matchPhone) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeTab, typeFilter, timeFilter, search]);

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
      toast.success("Đã sao chép!");
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  // Submit Create Rental
  const handleCreateRental = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccountCode || !formCustomer.trim()) {
      toast.error("Vui lòng chọn tài khoản và nhập tên khách hàng!");
      return;
    }

    // Double rental check on client
    if (activeRentedAccountCodes.has(formAccountCode.toLowerCase().trim())) {
      toast.error("Tài khoản này hiện đang có lượt thuê hoạt động!");
      return;
    }

    let calculatedExpiresAt: string | null = null;
    let calculatedDurationHours = formDurationHours;

    if (packageMode === "CUSTOM") {
      const startMs = new Date(formStartDate).getTime();
      const endMs = new Date(formEndDate).getTime();
      if (endMs <= startMs) {
        toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu!");
        return;
      }
      calculatedExpiresAt = new Date(endMs).toISOString();
      calculatedDurationHours = Math.round((endMs - startMs) / (3600 * 1000));
    } else {
      if (formDurationHours === -1) {
        calculatedExpiresAt = null; // Lâu dài
      } else {
        calculatedExpiresAt = new Date(Date.now() + formDurationHours * 3600 * 1000).toISOString();
      }
    }

    const acc = getAccountByCode(formAccountCode);
    const accType: OrderType = (acc?.category || acc?.type || "VIP") === "CLONE" ? "CLONE" : "VIP";

    setActionLoading(true);
    const toastId = toast.loading("Đang ghi nhận lượt thuê...");

    try {
      const res = await createOrder({
        type: accType,
        customer: formCustomer.trim(),
        memberId: customerMode === "MEMBER" && selectedMemberId ? selectedMemberId : undefined,
        deliveredBy: "Admin",
        phoneZalo: formPhone.trim() || PROFILE_INFO.phoneZalo,
        accountCode: formAccountCode.trim(),
        accountTitle: acc?.title || acc?.name || formAccountCode,
        package: packageMode === "CUSTOM" ? `Tùy chỉnh (${calculatedDurationHours}h)` : formPackage,
        durationHours: calculatedDurationHours,
        amount: Number(formAmount) || 0,
        paymentMethod: "TRANSFER",
        status: "RENTING",
        createdBy: "ADMIN",
        source: "ADMIN",
        startedAt: new Date(formStartDate).toISOString(),
        expiresAt: calculatedExpiresAt,
        accountLogin: formLogin.trim() || `tft_${formAccountCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        accountPass: formPass.trim() || generateRandomPassword(),
        notes: formNote.trim() || "Lượt thuê do Admin ghi nhận.",
      });

      if (res.success) {
        toast.success(`✅ Đã ghi nhận lượt thuê cho acc ${formAccountCode}!`, { id: toastId });
        setCreateModalOpen(false);
        // Reset form
        setFormAccountCode("");
        setFormCustomer("");
        setFormPhone("");
        setSelectedMemberId("");
        setFormNote("");
        await fetchData();
      } else {
        toast.error(res.error || "Không thể tạo lượt thuê!", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tạo lượt thuê!", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Complete Rental
  const handleConfirmComplete = async () => {
    if (!completeConfirmOrder) return;
    setActionLoading(true);
    const toastId = toast.loading(`Đang kết thúc lượt thuê ${completeConfirmOrder.accountCode}...`);

    try {
      const res = await updateOrder(completeConfirmOrder.id, {
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      });

      if (res.success) {
        toast.success(`✅ Đã kết thúc lượt thuê! Tài khoản đã trả về kho sẵn sàng.`, { id: toastId });
        setCompleteConfirmOrder(null);
        if (detailOrder?.id === completeConfirmOrder.id) {
          setDetailOrder(null);
        }
        await fetchData();
      } else {
        toast.error(res.error || "Không thể kết thúc lượt thuê!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi khi kết thúc lượt thuê!", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Cancel Rental
  const handleConfirmCancel = async () => {
    if (!cancelConfirmOrder) return;
    setActionLoading(true);
    const toastId = toast.loading(`Đang hủy lượt thuê ${cancelConfirmOrder.accountCode}...`);

    try {
      const noteAppend = cancelReason.trim() ? `\n[Lý do hủy: ${cancelReason.trim()}]` : "";
      const res = await updateOrder(cancelConfirmOrder.id, {
        status: "CANCELLED",
        notes: `${cancelConfirmOrder.notes || ""}${noteAppend}`.trim(),
      });

      if (res.success) {
        toast.success(`✅ Đã hủy lượt thuê! Tài khoản đã được phục hồi.`, { id: toastId });
        setCancelConfirmOrder(null);
        setCancelReason("");
        if (detailOrder?.id === cancelConfirmOrder.id) {
          setDetailOrder(null);
        }
        await fetchData();
      } else {
        toast.error(res.error || "Không thể hủy lượt thuê!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi khi hủy lượt thuê!", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Extend Rental
  const handleConfirmExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendOrder_) return;

    const extraHours = extendType === "DAYS" ? extendValue * 24 : extendValue;
    if (extraHours <= 0) {
      toast.error("Vui lòng nhập thời gian gia hạn hợp lệ!");
      return;
    }

    setActionLoading(true);
    const toastId = toast.loading(`Đang gia hạn ${extendOrder_.accountCode}...`);

    try {
      const res = await extendOrder(extendOrder_.id, extraHours, extendPrice);
      if (res.success) {
        toast.success(`✅ Đã gia hạn thêm ${extraHours} giờ thành công!`, { id: toastId });
        setExtendOrder_(null);
        setExtendValue(1);
        setExtendPrice(0);
        setExtendNote("");
        await fetchData();
      } else {
        toast.error(res.error || "Không thể gia hạn!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi khi gia hạn!", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Send Zalo Handover Message
  const handleSendZalo = (order: OrderItem) => {
    const msg = buildDeliveryMessage(order);
    const encoded = encodeURIComponent(msg);
    const cleanPhone = order.phoneZalo?.replace(/\D/g, "") || "";
    const url = cleanPhone
      ? `https://zalo.me/${cleanPhone}?message=${encoded}`
      : `https://zalo.me/${PROFILE_INFO.phoneZalo.replace(/\D/g, "")}?message=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* ── 1. HEADER & ACTIONS ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Lượt Thuê
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi các tài khoản đang được khách sử dụng và lịch sử thuê do Admin ghi nhận.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 bg-white"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setFormAccountCode("");
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi nhận lượt thuê</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI METRIC CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-900 leading-none">{stats.rentingOrders}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Đang thuê</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-amber-700 leading-none">{stats.expiringOrders || 0}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Sắp hết hạn (≤ 24h)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-rose-700 leading-none">{stats.overdueOrders || 0}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Quá hạn (Cần xử lý)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-900 leading-none">{formatVND(stats.totalRevenue)}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Doanh thu ghi nhận</p>
          </div>
        </div>
      </div>

      {/* ── 3. TABS & FILTER BAR ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-4 pt-3 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "ACTIVE", label: `Đang thuê (${stats.rentingOrders})` },
            { id: "EXPIRING", label: `Sắp hết hạn (${stats.expiringOrders || 0})` },
            { id: "OVERDUE", label: `Quá hạn (${stats.overdueOrders || 0})` },
            { id: "HISTORY", label: `Lịch sử (${stats.completedOrders + (stats.expiredOrders || 0)})` },
            { id: "ALL", label: `Tất cả (${stats.totalOrders})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#111111] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sub-filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-50/50">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo MS Acc, tên acc, tên khách, số điện thoại / Zalo..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Type */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 text-xs">
              {(["ALL", "VIP", "CLONE"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    typeFilter === t ? "bg-[#111111] text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t === "ALL" ? "Tất cả" : t}
                </button>
              ))}
            </div>

            {/* Filter Time */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="ALL">Mọi thời gian</option>
              <option value="TODAY">Hôm nay</option>
              <option value="7DAYS">7 ngày qua</option>
              <option value="30DAYS">30 ngày qua</option>
            </select>
          </div>
        </div>

        {/* ── 4. PRIMARY VIEW: TABLE ───────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">MS Acc</th>
                <th className="py-3 px-4 min-w-[200px]">Tên Acc</th>
                <th className="py-3 px-4 min-w-[160px]">Khách Hàng</th>
                <th className="py-3 px-4">Zalo</th>
                <th className="py-3 px-4">Gói Thuê</th>
                <th className="py-3 px-4">Bắt Đầu</th>
                <th className="py-3 px-4">Kết Thúc</th>
                <th className="py-3 px-4 min-w-[130px]">Thời Gian Còn Lại</th>
                <th className="py-3 px-4 text-right">Giá Thuê</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
                      <span className="text-xs font-semibold">Đang tải danh sách lượt thuê...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <CalendarDays className="w-6 h-6 opacity-60" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        {activeTab === "ACTIVE"
                          ? "Không có lượt thuê đang hoạt động."
                          : "Không tìm thấy lượt thuê phù hợp."}
                      </p>
                      <button
                        onClick={() => {
                          setFormAccountCode("");
                          setCreateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ghi nhận lượt thuê</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const remaining = getRentalTimeRemaining(order.expiresAt);
                  const isOverdue = order.status === "RENTING" && remaining.isExpired;
                  const isExpiringSoon = order.status === "RENTING" && remaining.isExpiringSoon;
                  const acc = getAccountByCode(order.accountCode);
                  const thumb = acc?.thumbnail || acc?.image_url || acc?.img || "";

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setDetailOrder(order)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* MS Acc */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <TypeBadge type={order.type} />
                          <span>{order.accountCode}</span>
                        </div>
                      </td>

                      {/* Tên Acc */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={order.accountTitle}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                              <Gamepad2 className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-semibold text-slate-900 truncate max-w-[200px]" title={order.accountTitle}>
                            {order.accountTitle}
                          </span>
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-semibold text-slate-900">
                            {order.memberId && (
                              <span
                                title="Tài khoản Member liên kết"
                                className="inline-flex items-center p-0.5 rounded bg-blue-50 text-blue-700"
                              >
                                <UserCheck className="w-3 h-3" />
                              </span>
                            )}
                            <span className="truncate max-w-[140px]">{order.customer}</span>
                          </div>
                          {order.memberId && (
                            <span className="text-[10px] text-blue-600 font-mono">Member ID #{order.memberId.slice(0, 6)}</span>
                          )}
                        </div>
                      </td>

                      {/* Zalo */}
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {order.phoneZalo ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-slate-700">{order.phoneZalo}</span>
                            <button
                              onClick={() => copyToClipboard(order.phoneZalo!, `phone-${order.id}`)}
                              className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Sao chép Zalo"
                            >
                              {copiedId === `phone-${order.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleSendZalo(order)}
                              className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Nhắn Zalo"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Gói thuê */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 text-[11px]">
                          {order.package}
                        </span>
                      </td>

                      {/* Bắt đầu */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-[11px] font-mono">
                        {formatOrderDateTime(order.startedAt || order.createdAt)}
                      </td>

                      {/* Kết thúc */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-[11px] font-mono">
                        {order.expiresAt ? formatOrderDateTime(order.expiresAt) : "Lâu dài ∞"}
                      </td>

                      {/* Thời gian còn lại */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {order.status === "RENTING" ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isOverdue
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : isExpiringSoon
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : !order.expiresAt
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{remaining.formatted}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Giá thuê */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900">
                        {formatVND(order.amount)}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge
                          status={order.status}
                          isOverdue={isOverdue}
                          isExpiringSoon={isExpiringSoon}
                        />
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {order.status === "RENTING" && (
                            <>
                              <button
                                onClick={() => setExtendOrder_(order)}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                title="Gia hạn thêm thời gian thuê"
                              >
                                Gia hạn
                              </button>

                              <button
                                onClick={() => setCompleteConfirmOrder(order)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                title="Chốt hoàn thành & trả acc về kho"
                              >
                                Kết thúc
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setDetailOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết lượt thuê"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {order.status === "RENTING" && (
                            <button
                              onClick={() => setCancelConfirmOrder(order)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hủy lượt thuê này"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. MODAL: GHI NHẬN LƯỢT THUÊ MỚI ──────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Ghi Nhận Lượt Thuê
                </h3>
                <p className="text-xs text-slate-500">
                  Tạo lượt thuê thủ công và tự động chuyển tài khoản sang trạng thái Đang thuê.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRental} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Mục 1: Chọn Tài Khoản */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>1. Tài Khoản Cho Thuê *</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Chỉ chọn tài khoản Sẵn sàng trong kho
                  </span>
                </label>
                <select
                  value={formAccountCode}
                  onChange={(e) => handleAccountSelect(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 font-medium"
                >
                  <option value="">-- Chọn tài khoản từ kho --</option>
                  {allAccounts.map((acc) => {
                    const isRented = activeRentedAccountCodes.has(acc.code?.toLowerCase().trim());
                    return (
                      <option
                        key={acc.code || acc.id}
                        value={acc.code}
                        disabled={isRented}
                      >
                        [{acc.category || acc.type || "VIP"}] {acc.code} - {acc.title || acc.name}{" "}
                        {isRented ? "(ĐANG THUÊ - KHÔNG THỂ CHỌN)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Mục 2: Khách Hàng / Member */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">2. Thông Tin Khách Hàng *</span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode("MANUAL");
                        setSelectedMemberId("");
                      }}
                      className={`px-2 py-1 rounded font-semibold cursor-pointer transition-colors ${
                        customerMode === "MANUAL" ? "bg-[#111111] text-white" : "text-slate-600"
                      }`}
                    >
                      Khách lẻ / Zalo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerMode("MEMBER")}
                      className={`px-2 py-1 rounded font-semibold cursor-pointer transition-colors ${
                        customerMode === "MEMBER" ? "bg-[#111111] text-white" : "text-slate-600"
                      }`}
                    >
                      Chọn Member
                    </button>
                  </div>
                </div>

                {customerMode === "MEMBER" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Chọn Thành Viên Member:</label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => handleMemberSelect(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                    >
                      <option value="">-- Chọn Member --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name || m.username} ({m.username}) - Zalo: {m.zalo || "chưa có"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Tên khách hàng *</label>
                    <input
                      type="text"
                      value={formCustomer}
                      onChange={(e) => setFormCustomer(e.target.value)}
                      required
                      placeholder="Họ tên hoặc Nickname khách..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Số điện thoại / Zalo</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0352.xxx.xxx"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Mục 3: Gói Thuê & Thời Gian */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">3. Gói Thuê & Thời Gian</label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPackageMode("PRESET")}
                      className={`px-2 py-1 rounded font-semibold cursor-pointer transition-colors ${
                        packageMode === "PRESET" ? "bg-[#111111] text-white" : "text-slate-600 bg-slate-100"
                      }`}
                    >
                      Gói chuẩn
                    </button>
                    <button
                      type="button"
                      onClick={() => setPackageMode("CUSTOM")}
                      className={`px-2 py-1 rounded font-semibold cursor-pointer transition-colors ${
                        packageMode === "CUSTOM" ? "bg-[#111111] text-white" : "text-slate-600 bg-slate-100"
                      }`}
                    >
                      Tùy chỉnh ngày/giờ
                    </button>
                  </div>
                </div>

                {packageMode === "PRESET" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "2 Giờ Trải Nghiệm",
                      "24 Giờ (1 Ngày)",
                      "7 Ngày (1 Tuần)",
                      "30 Ngày (1 Tháng)",
                      "Thuê Lâu Dài (Vô Cực ∞)",
                    ].map((pkg) => (
                      <button
                        key={pkg}
                        type="button"
                        onClick={() => {
                          const acc = getAccountByCode(formAccountCode) || allAccounts[0];
                          if (acc) applyAccountPackagePresets(acc, pkg);
                          else setFormPackage(pkg);
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                          formPackage === pkg
                            ? "border-slate-900 bg-slate-900 text-white font-bold"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <p className="font-semibold leading-tight">{pkg}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Bắt đầu:</label>
                      <input
                        type="datetime-local"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Kết thúc:</label>
                      <input
                        type="datetime-local"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* Giá thuê snapshot */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Giá thuê ghi nhận (VNĐ) *
                  </label>
                  <input
                    type="number"
                    value={formAmount || ""}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    min={0}
                    required
                    placeholder="30000"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Mục 4: Thông tin đăng nhập bàn giao */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Tài khoản Riot / Login</label>
                  <input
                    type="text"
                    value={formLogin}
                    onChange={(e) => setFormLogin(e.target.value)}
                    placeholder="tft_acc..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Mật khẩu bàn giao</label>
                  <input
                    type="text"
                    value={formPass}
                    onChange={(e) => setFormPass(e.target.value)}
                    placeholder="Mật khẩu..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Mục 5: Ghi Chú Admin */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">4. Ghi Chú Nội Bộ (Admin Note)</label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={2}
                  placeholder="Khách quen Zalo, hẹn gia hạn lúc 18h, v.v..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Tạo Lượt Thuê</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. MODAL: GIA HẠN LƯỢT THUÊ ───────────────────────────────── */}
      {extendOrder_ && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Gia Hạn Lượt Thuê
                </h3>
                <p className="text-xs text-slate-500">Mã acc: {extendOrder_.accountCode}</p>
              </div>
              <button
                onClick={() => setExtendOrder_(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmExtend} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">{extendOrder_.accountTitle}</p>
                <p>Khách hàng: <span className="font-semibold">{extendOrder_.customer}</span></p>
                <p>
                  Hạn hiện tại:{" "}
                  <span className="font-mono font-semibold">
                    {extendOrder_.expiresAt ? formatOrderDateTime(extendOrder_.expiresAt) : "Lâu dài ∞"}
                  </span>
                </p>
              </div>

              {/* Extension Options */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Thêm thời gian</label>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => { setExtendType("HOURS"); setExtendValue(2); }}
                      className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                        extendType === "HOURS" ? "bg-[#111111] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Giờ
                    </button>
                    <button
                      type="button"
                      onClick={() => { setExtendType("DAYS"); setExtendValue(1); }}
                      className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                        extendType === "DAYS" ? "bg-[#111111] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Ngày
                    </button>
                  </div>
                </div>

                <input
                  type="number"
                  value={extendValue}
                  onChange={(e) => setExtendValue(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Extra Price */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Phí gia hạn thêm (VNĐ)</label>
                <input
                  type="number"
                  value={extendPrice || ""}
                  onChange={(e) => setExtendPrice(Number(e.target.value))}
                  min={0}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setExtendOrder_(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Đang xử lý..." : "Xác nhận gia hạn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. MODAL CONFIRMATION: KẾT THÚC LƯỢT THUÊ ─────────────────── */}
      {completeConfirmOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Kết thúc lượt thuê MS {completeConfirmOrder.accountCode}?
              </h3>
              <p className="text-xs text-slate-500">
                Khách hàng: <span className="font-semibold text-slate-700">{completeConfirmOrder.customer}</span>.
                Sau khi xác nhận, tài khoản sẽ tự động chuyển về trạng thái Sẵn sàng (Còn acc) trong kho.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompleteConfirmOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Đang kết thúc..." : "Kết thúc lượt thuê"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. MODAL CONFIRMATION: HỦY LƯỢT THUÊ ───────────────────────── */}
      {cancelConfirmOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Hủy lượt thuê MS {cancelConfirmOrder.accountCode}?
              </h3>
              <p className="text-xs text-slate-500">
                Lượt thuê sẽ chuyển sang trạng thái Đã hủy và tài khoản sẽ được trả về kho nếu không có lượt thuê nào khác.
              </p>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[11px] font-semibold text-slate-700">Lý do hủy (tùy chọn):</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Khách đổi ý, nhầm mã acc, v.v..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelConfirmOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. DRAWER: CHI TIẾT LƯỢT THUÊ ─────────────────────────────── */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base text-slate-900">Chi Tiết Lượt Thuê</span>
                <span className="text-xs font-mono text-slate-400">#{detailOrder.id}</span>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Account section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tài Khoản
                </h4>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {(() => {
                    const acc = getAccountByCode(detailOrder.accountCode);
                    const thumb = acc?.thumbnail || acc?.image_url || acc?.img;
                    return thumb ? (
                      <img src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <Gamepad2 className="w-6 h-6 text-slate-400" />
                      </div>
                    );
                  })()}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <TypeBadge type={detailOrder.type} />
                      <span className="font-bold text-slate-900 text-xs">{detailOrder.accountCode}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{detailOrder.accountTitle}</p>
                    <Link
                      href={`/tai-khoan/${detailOrder.accountCode}`}
                      target="_blank"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium"
                    >
                      <span>Xem trang web riêng của acc</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Customer section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Khách Hàng
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tên khách:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      {detailOrder.memberId && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                      {detailOrder.customer}
                    </span>
                  </div>
                  {detailOrder.memberId && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tài khoản Member:</span>
                      <span className="font-mono text-blue-600 font-semibold">Liên kết ID #{detailOrder.memberId.slice(0, 8)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Zalo liên hệ:</span>
                    <span className="font-mono font-semibold text-slate-900 flex items-center gap-1">
                      {detailOrder.phoneZalo || "—"}
                      {detailOrder.phoneZalo && (
                        <button
                          onClick={() => copyToClipboard(detailOrder.phoneZalo!, `drawer-zalo`)}
                          className="p-0.5 text-slate-400 hover:text-slate-800 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rental section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Thông Tin Thuê
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl p-3 bg-white text-xs space-y-2">
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Gói thuê:</span>
                    <span className="font-bold text-slate-900">{detailOrder.package}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500">Giá thuê ghi nhận:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{formatVND(detailOrder.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500">Bắt đầu:</span>
                    <span className="font-mono text-slate-700">{formatOrderDateTime(detailOrder.startedAt || detailOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500">Hết hạn:</span>
                    <span className="font-mono text-slate-700">
                      {detailOrder.expiresAt ? formatOrderDateTime(detailOrder.expiresAt) : "Lâu dài ∞"}
                    </span>
                  </div>
                  {detailOrder.completedAt && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-500">Kết thúc thực tế:</span>
                      <span className="font-mono text-slate-700">{formatOrderDateTime(detailOrder.completedAt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500">Trạng thái:</span>
                    <StatusBadge status={detailOrder.status} />
                  </div>
                </div>
              </div>

              {/* Account Credentials */}
              {(detailOrder.accountLogin || detailOrder.accountPass) && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Thông Tin Đăng Nhập
                  </h4>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
                    {detailOrder.accountLogin && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 w-16">Login:</span>
                        <span className="font-mono font-semibold text-slate-900 flex-1 truncate">{detailOrder.accountLogin}</span>
                        <button
                          onClick={() => copyToClipboard(detailOrder.accountLogin, "login")}
                          className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {detailOrder.accountPass && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 w-16">Mật khẩu:</span>
                        <span className="font-mono font-semibold text-slate-900 flex-1 truncate">{detailOrder.accountPass}</span>
                        <button
                          onClick={() => copyToClipboard(detailOrder.accountPass, "pass")}
                          className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Note */}
              {detailOrder.notes && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Ghi Chú Admin (Nội Bộ)
                  </h4>
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 font-medium whitespace-pre-line">
                    {detailOrder.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2 flex-wrap">
              {detailOrder.status === "RENTING" && (
                <>
                  <button
                    onClick={() => {
                      setExtendOrder_(detailOrder);
                      setDetailOrder(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Gia hạn
                  </button>

                  <button
                    onClick={() => {
                      setCompleteConfirmOrder(detailOrder);
                      setDetailOrder(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Kết thúc
                  </button>

                  <button
                    onClick={() => handleSendZalo(detailOrder)}
                    className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 cursor-pointer"
                    title="Gửi thông tin Zalo"
                  >
                    <Send className="w-4 h-4 text-emerald-600" />
                  </button>
                </>
              )}

              <button
                onClick={() => setDetailOrder(null)}
                className="w-full py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Export Default Page with Suspense ──────────────────────────────────────

export default function AdminRentalsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Đang tải Lượt Thuê...</p>
        </div>
      }
    >
      <AdminRentalsContent />
    </Suspense>
  );
}
