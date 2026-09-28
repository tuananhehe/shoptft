"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  MessageCircle,
  Eye,
  Filter,
  Plus,
  Copy,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Check,
  Send,
  X,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  User,
  Phone,
  Calendar,
  AlertTriangle,
  Flame,
  Sparkles,
  Award,
  Gamepad2,
  Trash2,
  Edit3,
  RefreshCw,
  Loader2,
  Tag,
  Share2,
  ChevronDown,
  ArrowUpDown,
  History,
  CalendarDays,
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

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState<OrdersStats>({
    totalRevenue: 0,
    totalOrders: 0,
    rentingOrders: 0,
    completedOrders: 0,
    expiredOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Accounts list for dropdowns
  const [vipAccounts, setVipAccounts] = useState(TFT_RENTAL_ACCOUNTS);
  const [cloneAccounts, setCloneAccounts] = useState(TFT_CLONE_ACCOUNTS);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | OrderType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus | "EXPIRING">(
    tabParam === "rentals" ? "RENTING" : "ALL"
  );
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "AMOUNT_DESC" | "EXPIRY">("NEWEST");

  useEffect(() => {
    if (tabParam === "rentals") {
      setStatusFilter("RENTING");
    }
  }, [tabParam]);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [copiedDelivery, setCopiedDelivery] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedLogin, setCopiedLogin] = useState(false);

  // Custom Extension state
  const [extendHours, setExtendHours] = useState<number>(2);
  const [extendPrice, setExtendPrice] = useState<number>(30000);
  const [showExtendBox, setShowExtendBox] = useState(false);

  // Note edit state in modal
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Create Order Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<OrderType>("VIP");
  const [newCustomer, setNewCustomer] = useState("Khách hàng ẩn danh");
  const [newDeliveredBy, setNewDeliveredBy] = useState("Admin");
  const [newPhone, setNewPhone] = useState("0352.867.283");
  const [newAccountCode, setNewAccountCode] = useState("");
  const [newAccountTitle, setNewAccountTitle] = useState("");
  const [newPackage, setNewPackage] = useState("Gói 24 Giờ (1 Ngày VIP)");
  const [newDurationHours, setNewDurationHours] = useState<number>(24);
  const [newAmount, setNewAmount] = useState<number>(60000);
  const [newPaymentMethod, setNewPaymentMethod] = useState<"TRANSFER" | "MOMO" | "ZALO_PAY" | "CARD">("TRANSFER");
  const [newLogin, setNewLogin] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Load orders data
  const loadOrdersData = async (showToast = false) => {
    setLoading(true);
    const res = await getOrders();
    if (res.success) {
      setOrders(res.data);
      setStats(res.stats);
      if (showToast) {
        toast.success("✅ Đã làm mới danh sách đơn hàng!");
      }
    } else {
      toast.error(res.error || "Không thể tải đơn hàng");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrdersData();
    // Load fresh accounts for selector
    getVipAndCloneAccounts().then(({ vipAccounts: vips, cloneAccounts: clones }) => {
      if (vips && vips.length > 0) {
        setVipAccounts(vips);
        if (!newAccountCode && vips[0]) {
          setNewAccountCode(vips[0].code);
        }
      }
      if (clones && clones.length > 0) setCloneAccounts(clones);
    });

    // Auto refresh status every 60s
    const interval = setInterval(() => {
      loadOrdersData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Sync Create Order defaults when type or account changes
  useEffect(() => {
    if (createType === "VIP") {
      const acc = vipAccounts.find((a) => a.code === newAccountCode) || vipAccounts[0];
      if (acc) {
        setNewAccountTitle(acc.title || `${acc.mainChibi || "Tí Nị VIP"} - ${acc.rank || "Thách Đấu"}`);
        setNewLogin(`tft_${acc.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`);
        setNewPass(generateRandomPassword());
        const accountValue = Number(acc.accountValue) || Number(acc.periodPrice) || 850000;
        if (newDurationHours === 2) {
          setNewPackage("Gói 2 Giờ (Trải Nghiệm Nhanh)");
          setNewAmount(Math.round((accountValue * 0.03) / 1000) * 1000 + 20000);
        } else if (newDurationHours === 24) {
          setNewPackage("Gói 24 Giờ (1 Ngày VIP)");
          setNewAmount(acc.dailyPrice || Math.round((((accountValue * 0.12) + 20000) / 2) / 1000) * 1000);
        } else if (newDurationHours === 168) {
          setNewPackage("Gói 7 Ngày (Tiết Kiệm VIP)");
          setNewAmount(acc.weeklyPrice || (Math.round((accountValue * 0.12) / 1000) * 1000 + 20000));
        } else if (newDurationHours === 720) {
          setNewPackage("Gói 30 Ngày (1 Tháng VIP)");
          setNewAmount(Math.round((accountValue * 0.30) / 1000) * 1000);
        } else if (newDurationHours === -1) {
          setNewPackage("Gói Thuê Lâu Dài (Vô Cực ∞)");
          setNewAmount(accountValue);
        }
      }
    } else if (createType === "CLONE") {
      const acc = cloneAccounts.find((a) => a.code === newAccountCode) || cloneAccounts[0];
      if (acc) {
        setNewAccountTitle(acc.title || `Acc Clone ${acc.rankBadge || "Unranked"}`);
        setNewPackage("Gói Thuê Lâu Dài (Bàn Giao Full Thông Tin)");
        setNewDurationHours(-1);
        setNewAmount(Number(acc.price) || Number(acc.periodPrice) || Number(acc.monthlyPrice) || 150000);
        setNewLogin(`smurf_${acc.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`);
        setNewPass(`ClonePass@${Math.floor(1000 + Math.random() * 9000)}`);
      }
    } else {
      setNewAccountCode("COACH-01");
      setNewAccountTitle("Coaching 1-1 Bắt Meta & Tư Duy Xoay Bài");
      setNewPackage("1 Buổi (90 Phút)");
      setNewDurationHours(2);
      setNewAmount(150000);
      setNewLogin("voice_discord");
      setNewPass("discord_coaching");
    }
  }, [createType, newAccountCode, vipAccounts, cloneAccounts]);

  // Handle preset duration change in Create Form
  const handleSelectDurationPreset = (hours: number, label: string) => {
    setNewDurationHours(hours);
    setNewPackage(label);

    if (createType === "VIP") {
      const acc = vipAccounts.find((a) => a.code === newAccountCode) || vipAccounts[0];
      if (acc) {
        const accountValue = Number(acc.accountValue) || Number(acc.periodPrice) || 850000;
        if (hours === 2) {
          setNewAmount(Math.round((accountValue * 0.03) / 1000) * 1000 + 20000);
        } else if (hours === 24) {
          setNewAmount(acc.dailyPrice || Math.round((((accountValue * 0.12) + 20000) / 2) / 1000) * 1000);
        } else if (hours === 168) {
          setNewAmount(acc.weeklyPrice || (Math.round((accountValue * 0.12) / 1000) * 1000 + 20000));
        } else if (hours === 720) {
          setNewAmount(Math.round((accountValue * 0.30) / 1000) * 1000);
        } else if (hours === -1) {
          setNewAmount(accountValue);
        } else {
          const hourly = acc.hourlyPrice || Math.round((((accountValue * 0.03) + 20000) / 2) / 1000) * 1000;
          setNewAmount(hourly * hours);
        }
      }
    } else if (createType === "CLONE") {
      const acc = cloneAccounts.find((a) => a.code === newAccountCode) || cloneAccounts[0];
      if (acc) {
        const clonePrice = Number(acc.price) || Number(acc.periodPrice) || 150000;
        if (hours === 168) {
          setNewAmount(Number(acc.weeklyPrice) || 50000);
        } else if (hours === 720) {
          setNewAmount(Number(acc.monthlyPrice) || clonePrice);
        } else {
          setNewAmount(clonePrice);
        }
      }
    }
  };

  // Submit Create Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    setActionLoading(true);
    const toastId = toast.loading("Đang khởi tạo đơn hàng & thông tin bàn giao...");

    const customerName = newCustomer.trim() || "Khách hàng ẩn danh";
    const delivererName = newDeliveredBy.trim() || "Admin";

    const res = await createOrder({
      type: createType,
      customer: customerName,
      deliveredBy: delivererName,
      phoneZalo: newPhone.trim() || "0352.867.283",
      accountCode: newAccountCode || (vipAccounts[0]?.code || "MS: 680"),
      accountTitle: newAccountTitle || "Tài khoản TFT VIP",
      package: newPackage,
      durationHours: newDurationHours,
      amount: newAmount,
      paymentMethod: newPaymentMethod,
      status: "RENTING",
      createdBy: "ADMIN",
      source: "ADMIN",
      accountLogin: newLogin.trim(),
      accountPass: newPass.trim(),
      notes: newNotes.trim() || "Đơn hàng do Admin Tuấn Thái Bình tạo.",
    });

    if (res.success && res.data) {
      toast.success(`✅ Đã tạo thành công đơn ${res.data.id}!`, { id: toastId });
      setCreateModalOpen(false);
      setNewCustomer("Khách hàng ẩn danh");
      setNewPhone("0352.867.283");
      setNewNotes("");

      // Open detail modal immediately with newly created order
      setSelectedOrder(res.data);
      loadOrdersData();
    } else {
      toast.error(`Lỗi: ${res.error || "Không thể tạo đơn"}`, { id: toastId });
    }
    setActionLoading(false);
  };

  // Toggle order status (RENTING <-> COMPLETED)
  const handleToggleStatus = async (order: OrderItem) => {
    const nextStatus: OrderStatus = order.status === "RENTING" ? "COMPLETED" : "RENTING";
    const toastId = toast.loading(
      nextStatus === "COMPLETED" ? "Đang đánh dấu hoàn thành & thu hồi acc..." : "Đang kích hoạt đơn thuê..."
    );

    const res = await updateOrder(order.id, {
      status: nextStatus,
    });

    if (res.success && res.data) {
      toast.success(
        nextStatus === "COMPLETED"
          ? `✅ Đơn ${order.id} đã hoàn thành! Tài khoản đã thu hồi.`
          : `✅ Đơn ${order.id} đã chuyển sang trạng thái Đang Thuê.`,
        { id: toastId }
      );

      setSelectedOrder((prev) => (prev?.id === order.id ? res.data! : prev));
      loadOrdersData();
    } else {
      toast.error(`Lỗi: ${res.error}`, { id: toastId });
    }
  };

  // Quick Generate new random password
  const handleResetPassword = async (order: OrderItem) => {
    const newPassword = generateRandomPassword();
    const toastId = toast.loading("Đang cập nhật mật khẩu mới...");

    const res = await updateOrder(order.id, {
      accountPass: newPassword,
      notes: `${order.notes || ""}\n[${new Date().toLocaleTimeString("vi-VN")}] Đã đổi pass mới: ${newPassword}`.trim(),
    });

    if (res.success && res.data) {
      toast.success(`✅ Đã đổi pass mới: ${newPassword}`, { id: toastId });
      setSelectedOrder(res.data);
      loadOrdersData();
    } else {
      toast.error(`Lỗi: ${res.error}`, { id: toastId });
    }
  };

  // Quick Extend Rental
  const handleQuickExtend = async (order: OrderItem, hours: number, price: number) => {
    const toastId = toast.loading(`Đang gia hạn thêm +${hours}h...`);
    const res = await extendOrder(order.id, hours, price);

    if (res.success && res.data) {
      toast.success(`✅ Đã gia hạn đơn ${order.id} thêm +${hours} giờ!`, { id: toastId });
      setSelectedOrder(res.data);
      setShowExtendBox(false);
      loadOrdersData();
    } else {
      toast.error(`Lỗi: ${res.error}`, { id: toastId });
    }
  };

  // Save Note in Modal
  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    const res = await updateOrder(selectedOrder.id, {
      notes: noteText,
    });
    if (res.success && res.data) {
      setSelectedOrder(res.data);
      setEditingNotes(false);
      toast.success("✅ Đã cập nhật ghi chú đơn hàng!");
      loadOrdersData();
    } else {
      toast.error("Không thể lưu ghi chú");
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderId} không?`)) {
      return;
    }

    const toastId = toast.loading(`Đang xóa đơn ${orderId}...`);
    const res = await deleteOrder(orderId);

    if (res.success) {
      toast.success(`✅ Đã xóa đơn ${orderId} thành công!`, { id: toastId });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      loadOrdersData();
    } else {
      toast.error(`Lỗi: ${res.error}`, { id: toastId });
    }
  };

  // Filtered & Sorted orders list
  const filteredOrders = useMemo(() => {
    const now = Date.now();

    return orders
      .filter((ord) => {
        // 1. Search
        const query = searchTerm.toLowerCase().trim();
        const matchSearch =
          !query ||
          ord.id.toLowerCase().includes(query) ||
          ord.customer.toLowerCase().includes(query) ||
          (ord.deliveredBy && ord.deliveredBy.toLowerCase().includes(query)) ||
          ord.accountCode.toLowerCase().includes(query) ||
          ord.accountTitle.toLowerCase().includes(query) ||
          (ord.phoneZalo && ord.phoneZalo.toLowerCase().includes(query)) ||
          (ord.notes && ord.notes.toLowerCase().includes(query));

        // 2. Type Filter
        const matchType = typeFilter === "ALL" || ord.type === typeFilter;

        // 3. Status Filter
        let matchStatus = true;
        if (statusFilter === "EXPIRING") {
          const isRenting = ord.status === "RENTING";
          const isExpiring = ord.expiresAt && new Date(ord.expiresAt).getTime() - now <= 60 * 60 * 1000;
          matchStatus = isRenting && !!isExpiring;
        } else if (statusFilter !== "ALL") {
          matchStatus = ord.status === statusFilter;
        }

        return matchSearch && matchType && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "OLDEST") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "AMOUNT_DESC") {
          return b.amount - a.amount;
        }
        if (sortBy === "EXPIRY") {
          const expA = a.expiresAt ? new Date(a.expiresAt).getTime() : 9999999999999;
          const expB = b.expiresAt ? new Date(b.expiresAt).getTime() : 9999999999999;
          return expA - expB;
        }
        return 0;
      });
  }, [orders, searchTerm, typeFilter, statusFilter, sortBy]);

  // Copy Delivery Message
  const handleCopyDelivery = (ord: OrderItem) => {
    const msg = buildDeliveryMessage(ord);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg);
    }
    setCopiedDelivery(true);
    toast.success("✅ Đã sao chép tin nhắn bàn giao thông tin!");
    setTimeout(() => setCopiedDelivery(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Tổng Doanh Thu
            </span>
            <strong className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
              {stats.totalRevenue.toLocaleString("vi-VN")}đ
            </strong>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Lợi nhuận cho thuê
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Đơn đang thuê active */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Đang Cho Thuê (Active)
            </span>
            <strong className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
              {stats.rentingOrders} Đơn
            </strong>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> Đang phục vụ khách
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Đơn đã hoàn tất */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Đã Hoàn Tất
            </span>
            <strong className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
              {stats.completedOrders} Đơn
            </strong>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Đã thu hồi & nghiệm thu
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Tổng số giao dịch */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Tổng Giao Dịch
            </span>
            <strong className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
              {stats.totalOrders} Đơn
            </strong>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Acc VIP + Clone TFT
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ: TÌM KIẾM, BỘ LỌC TABS & NÚT TẠO ĐƠN */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-800" />
              <span>{tabParam === "rentals" ? "Quản Lý Tài Khoản Đang Cho Thuê" : "Quản Lý Đơn Hàng & Giao Dịch Cho Thuê"}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tài khoản bàn giao trực tiếp qua Zalo • Bắt đầu, hạn trả, gia hạn và thu hồi tài khoản.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => loadOrdersData(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-slate-900" : ""}`} />
              <span className="hidden sm:inline">Làm Mới</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreateType("VIP");
                setNewCustomer("Khách hàng ẩn danh");
                setNewDeliveredBy("Admin");
                setCreateModalOpen(true);
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Đơn Cho Thuê Nhanh</span>
            </button>
          </div>
        </div>

        {/* Tab Phân Loại & Bộ Lọc Nhanh */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Segmented Pills for Type */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setTypeFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === "ALL"
                  ? "bg-[#111111] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Tất Cả ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("VIP")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === "VIP"
                  ? "bg-[#111111] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Sparkles className="w-3 h-3 text-slate-400" />
              <span>Thuê VIP ({orders.filter((o) => o.type === "VIP").length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("CLONE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === "CLONE"
                  ? "bg-[#111111] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Flame className="w-3 h-3 text-slate-400" />
              <span>Acc Clone ({orders.filter((o) => o.type === "CLONE").length})</span>
            </button>
          </div>

          {/* Search bar & Sort */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã đơn, khách, mã acc..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Trạng thái */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="RENTING">🟢 Đang thuê ({stats.rentingOrders})</option>
              <option value="EXPIRING">⏰ Sắp hết hạn (&lt;24h)</option>
              <option value="COMPLETED">✓ Đã hoàn tất ({stats.completedOrders})</option>
            </select>

            {/* Sắp xếp */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer hidden sm:block"
            >
              <option value="NEWEST">Mới nhất trước</option>
              <option value="EXPIRY">Hạn thuê gần nhất</option>
              <option value="AMOUNT_DESC">Giá cao nhất</option>
              <option value="OLDEST">Cũ nhất trước</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. BẢNG ĐƠN HÀNG (DESKTOP & MOBILE RESPONSIVE) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-7 h-7 text-slate-900 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Đang tải dữ liệu đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 px-4 text-center text-slate-400 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-800">
                {searchTerm || typeFilter !== "ALL" || statusFilter !== "ALL"
                  ? "Không tìm thấy đơn hàng nào phù hợp bộ lọc"
                  : "Chưa có đơn hàng nào trong hệ thống"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchTerm || typeFilter !== "ALL" || statusFilter !== "ALL"
                  ? "Bạn có thể thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc để xem toàn bộ danh sách."
                  : "Quản lý toàn bộ danh sách tài khoản cho thuê, ngày giao, hạn trả và gia hạn."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateType("VIP");
                setNewCustomer("Khách hàng ẩn danh");
                setNewDeliveredBy("Admin");
                setCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Đơn Hàng Mới</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã Đơn & Người Giao</th>
                  <th className="py-3 px-4">Người Nhận</th>
                  <th className="py-3 px-4">Tài Khoản Cho Thuê</th>
                  <th className="py-3 px-4">Ngày Cho Thuê</th>
                  <th className="py-3 px-4">Hạn Trả</th>
                  <th className="py-3 px-4">Gói & Doanh Thu</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const timeInfo = getRentalTimeRemaining(ord.expiresAt);
                  const isRenting = ord.status === "RENTING";

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => {
                        setSelectedOrder(ord);
                        setNoteText(ord.notes || "");
                        setEditingNotes(false);
                        setShowExtendBox(false);
                      }}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* 1. Mã Đơn & Người Giao Badge */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold text-xs block w-fit">
                            {ord.id}
                          </span>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span
                              className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded block w-fit ${
                                ord.type === "VIP"
                                  ? "bg-slate-900 text-white"
                                  : ord.type === "CLONE"
                                  ? "bg-slate-100 text-slate-700 border border-slate-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {ord.type === "VIP" ? "VIP" : ord.type === "CLONE" ? "CLONE" : "DỊCH VỤ"}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1 py-0.5 rounded">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Giao: {ord.deliveredBy || "Admin"}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Người Nhận (Khách hàng ẩn danh) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <strong className="text-slate-900 font-semibold block text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                              {ord.customer || "Khách hàng ẩn danh"}
                            </strong>
                          </div>

                          {ord.phoneZalo && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{ord.phoneZalo}</span>
                              <a
                                href={`https://zalo.me/${ord.phoneZalo.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-800 font-medium ml-1 text-[10px] underline flex items-center gap-0.5"
                                title="Chat Zalo ngay"
                              >
                                <span>Zalo</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. Tài Khoản Cho Thuê */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-0.5 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-semibold text-[11px] border border-slate-200">
                              {ord.accountCode}
                            </span>
                            <span className="text-slate-800 font-medium truncate">{ord.accountTitle}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">
                            ID: <code className="text-slate-700 font-semibold">{ord.accountLogin}</code> • Pass:{" "}
                            <code className="text-slate-700 font-semibold">{ord.accountPass}</code>
                          </div>
                        </div>
                      </td>

                      {/* 4. Ngày Cho Thuê */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1 text-slate-700 font-mono font-medium text-xs">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{formatOrderDateTime(ord.startedAt || ord.createdAt)}</span>
                        </div>
                      </td>

                      {/* 5. Ngày Kết Thúc (Hạn Trả) */}
                      <td className="py-3.5 px-4 align-top">
                        {ord.expiresAt ? (
                          <div className="space-y-1">
                            <span className="text-slate-900 font-mono font-semibold block text-xs">
                              {formatOrderDateTime(ord.expiresAt)}
                            </span>
                            {isRenting && (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded block w-fit font-mono ${
                                  timeInfo.isExpired
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : timeInfo.isExpiringSoon
                                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {timeInfo.formatted}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium text-[11px]">
                            Lâu dài ∞
                          </span>
                        )}
                      </td>

                      {/* 6. Gói & Doanh Thu */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[11px] inline-block">
                            {ord.package}
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-xs block">
                            {ord.amount.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </td>

                      {/* 7. Trạng Thái */}
                      <td className="py-3.5 px-4 align-top">
                        {ord.status === "RENTING" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Đang Thuê</span>
                          </span>
                        ) : ord.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Đã Hoàn Tất</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-medium">
                            <span>Đã Hủy</span>
                          </span>
                        )}
                      </td>

                      {/* 8. Thao Tác Nhanh */}
                      <td className="py-3.5 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Nút Copy Delivery Message */}
                          <button
                            type="button"
                            onClick={() => handleCopyDelivery(ord)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Sao chép tin nhắn bàn giao Riot ID & Pass"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Xem chi tiết */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(ord);
                              setNoteText(ord.notes || "");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#111111] hover:bg-[#222222] text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Chi Tiết</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL CHI TIẾT ĐƠN HÀNG & BÀN GIAO THÔNG TIN */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 font-mono">{selectedOrder.id}</h3>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        selectedOrder.type === "VIP"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {selectedOrder.type}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Khởi tạo lúc: {formatOrderDateTime(selectedOrder.createdAt)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Cards */}
            <div className="space-y-4 text-xs">
              {/* Deliverer & Recipient Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-800 font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Người Giao: <strong>{selectedOrder.deliveredBy || "Admin"}</strong></span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                    Admin
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-800 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-600" />
                    <span>Người Nhận: <strong>{selectedOrder.customer || "Khách hàng ẩn danh"}</strong></span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                    Khách Hàng
                  </span>
                </div>
              </div>

              {/* Box 1: Thông tin khách hàng & Tài khoản bàn giao */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Thông tin liên hệ:</span>
                    <strong className="text-slate-900 text-sm font-semibold block">{selectedOrder.customer || "Khách hàng ẩn danh"}</strong>
                    {selectedOrder.phoneZalo && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-slate-600">{selectedOrder.phoneZalo}</span>
                        <a
                          href={`https://zalo.me/${selectedOrder.phoneZalo.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-medium flex items-center gap-1 hover:bg-blue-700"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Mở Zalo</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Tài khoản & Gói thuê:</span>
                    <strong className="text-slate-900 font-semibold block">
                      [{selectedOrder.accountCode}] {selectedOrder.accountTitle}
                    </strong>
                    <span className="text-slate-600 block mt-0.5">
                      Gói: <strong>{selectedOrder.package}</strong> • Giá:{" "}
                      <strong className="text-slate-900 font-mono font-bold">
                        {selectedOrder.amount.toLocaleString("vi-VN")}đ
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Riot ID & Pass Credentials Box */}
                <div className="pt-2 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Riot ID / Login:</span>
                      <strong className="text-slate-900 font-mono text-xs">{selectedOrder.accountLogin}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.accountLogin);
                        toast.success("Đã copy Login!");
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded bg-slate-50 cursor-pointer"
                      title="Copy Login"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Mật Khẩu Hiện Tại:</span>
                      <strong className="text-slate-900 font-mono text-xs">{selectedOrder.accountPass}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedOrder.accountPass);
                          toast.success("Đã copy Mật khẩu!");
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded bg-slate-50 cursor-pointer"
                        title="Copy Mật khẩu"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResetPassword(selectedOrder)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded bg-slate-100 cursor-pointer"
                        title="Tạo Mật khẩu Mới Ngẫu Nhiên"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Ngày Cho Thuê & Ngày Kết Thúc */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ngày Bắt Đầu Thuê:</span>
                    </span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                      {formatOrderDateTime(selectedOrder.startedAt || selectedOrder.createdAt)}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hạn Trả (Ngày Kết Thúc):</span>
                    </span>
                    <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                      {selectedOrder.expiresAt ? formatOrderDateTime(selectedOrder.expiresAt) : "Sở Hữu Lâu Dài ∞"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {selectedOrder.status === "RENTING" && (
                      <button
                        type="button"
                        onClick={() => setShowExtendBox(!showExtendBox)}
                        className="px-3 py-1.5 bg-[#111111] hover:bg-[#222222] text-white rounded-lg font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Gia Hạn Thuê</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedOrder)}
                      className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                        selectedOrder.status === "RENTING"
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedOrder.status === "RENTING" ? "Hoàn Thành & Thu Hồi" : "Mở Lại Đơn Thuê"}</span>
                    </button>
                  </div>
                </div>

                {/* Hộp gia hạn mở rộng */}
                {showExtendBox && (
                  <div className="p-3 bg-white rounded-lg border border-slate-300 space-y-2.5 animate-fadeIn">
                    <span className="font-semibold text-slate-800 block text-xs">Chọn gói gia hạn nhanh cho khách:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickExtend(selectedOrder, 2, 30000)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-center cursor-pointer transition-colors"
                      >
                        <strong className="block text-slate-900 text-xs">+2 Giờ</strong>
                        <span className="text-[10px] text-slate-600 font-mono">+30.000đ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickExtend(selectedOrder, 24, 60000)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-center cursor-pointer transition-colors"
                      >
                        <strong className="block text-slate-900 text-xs">+1 Ngày (24h)</strong>
                        <span className="text-[10px] text-slate-600 font-mono">+60.000đ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickExtend(selectedOrder, 168, 240000)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-center cursor-pointer transition-colors"
                      >
                        <strong className="block text-slate-900 text-xs">+7 Ngày</strong>
                        <span className="text-[10px] text-slate-600 font-mono">+240.000đ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickExtend(selectedOrder, 720, 799000)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-center cursor-pointer transition-colors"
                      >
                        <strong className="block text-slate-900 text-xs">+30 Ngày</strong>
                        <span className="text-[10px] text-slate-600 font-mono">+799.000đ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Box 3: Ghi chú đơn hàng */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ghi chú nội bộ:</span>
                  </span>
                  {!editingNotes ? (
                    <button
                      type="button"
                      onClick={() => setEditingNotes(true)}
                      className="text-[11px] font-semibold text-slate-700 hover:text-black hover:underline cursor-pointer"
                    >
                      Sửa ghi chú
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="px-2.5 py-0.5 bg-[#111111] text-white rounded font-medium text-[10px] cursor-pointer"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNotes(false)}
                        className="text-[10px] text-slate-500 hover:text-slate-800"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                {editingNotes ? (
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {selectedOrder.notes || "Chưa có ghi chú nào."}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Đơn Này</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleCopyDelivery(selectedOrder)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  {copiedDelivery ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedDelivery ? "Đã Sao Chép!" : "Copy Tin Nhắn Bàn Giao Zalo"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL TẠO ĐƠN HÀNG MỚI (CREATE ORDER) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Tạo Đơn Cho Thuê Mới</h3>
                  <span className="text-xs text-slate-500">Khởi tạo đơn thuê tài khoản & bàn giao thông tin</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Admin & Recipient Indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Người Giao</span>
                  <strong className="text-slate-900">Admin</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                <User className="w-4 h-4 text-slate-600" />
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Người Nhận Mặc Định</span>
                  <strong className="text-slate-900">Khách Hàng Ẩn Danh</strong>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              {/* 1. Chọn loại đơn */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 block">1. Loại Đơn Hàng:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateType("VIP")}
                    className={`py-2 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      createType === "VIP"
                        ? "bg-[#111111] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Thuê Acc VIP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateType("CLONE")}
                    className={`py-2 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      createType === "CLONE"
                        ? "bg-[#111111] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Acc Clone</span>
                  </button>
                </div>
              </div>

              {/* 2. Chọn Tài Khoản */}
              {createType === "VIP" && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 block">2. Chọn Tài Khoản VIP Trong Kho:</label>
                  <select
                    value={newAccountCode}
                    onChange={(e) => setNewAccountCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    {vipAccounts.map((a) => (
                      <option key={a.id || a.code} value={a.code}>
                        [{a.code}] - {a.mainChibi || a.title} ({a.rank}) - {a.hourlyPrice?.toLocaleString("vi-VN")}đ/h
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {createType === "CLONE" && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 block">2. Chọn Tài Khoản Clone Trong Kho:</label>
                  <select
                    value={newAccountCode}
                    onChange={(e) => setNewAccountCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    {cloneAccounts.map((a) => (
                      <option key={a.id || a.code} value={a.code}>
                        [{a.code}] - {a.title} ({a.rankBadge}) - {Number(a.price).toLocaleString("vi-VN")}đ
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 3. Gói thời gian thuê */}
              {createType === "VIP" && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800 block">3. Chọn Gói Thời Gian Thuê:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectDurationPreset(2, "Gói 2 Giờ (Trải Nghiệm Nhanh)")}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newDurationHours === 2 ? "bg-[#111111] text-white border-transparent font-semibold shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="block text-xs">2 Giờ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDurationPreset(24, "Gói 24 Giờ (1 Ngày VIP)")}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newDurationHours === 24 ? "bg-[#111111] text-white border-transparent font-semibold shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="block text-xs">1 Ngày (24h)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDurationPreset(168, "Gói 7 Ngày (Tiết Kiệm VIP)")}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newDurationHours === 168 ? "bg-[#111111] text-white border-transparent font-semibold shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="block text-xs">7 Ngày</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDurationPreset(720, "Gói 30 Ngày (1 Tháng VIP)")}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newDurationHours === 720 ? "bg-[#111111] text-white border-transparent font-semibold shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="block text-xs">30 Ngày</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDurationPreset(-1, "Gói Thuê Lâu Dài (Vô Cực ∞)")}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                        newDurationHours === -1 ? "bg-[#111111] text-white border-transparent font-semibold shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="block text-xs">Lâu Dài (∞)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Khách hàng (Người nhận) & Người Giao */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Tên Người Nhận (Khách Hàng):</label>
                  <input
                    type="text"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    placeholder="Khách hàng ẩn danh"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Số Điện Thoại / Zalo:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0352.867.283"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* 5. Giá tiền & Thanh toán */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Số Tiền Thu (VNĐ):</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Phương Thức Thanh Toán:</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="TRANSFER">Chuyển Khoản Ngân Hàng (STK)</option>
                    <option value="MOMO">Ví MoMo</option>
                    <option value="ZALO_PAY">ZaloPay</option>
                    <option value="CARD">Thẻ Cào / Khác</option>
                  </select>
                </div>
              </div>

              {/* 6. Riot ID & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">Riot ID / Login Bàn Giao:</label>
                  <input
                    type="text"
                    value={newLogin}
                    onChange={(e) => setNewLogin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 block">Mật Khẩu Bàn Giao:</label>
                    <button
                      type="button"
                      onClick={() => setNewPass(generateRandomPassword())}
                      className="text-[10px] text-slate-600 hover:text-black font-semibold hover:underline"
                    >
                      Sinh pass mới
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* 7. Ghi chú */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 block">Ghi Chú Đơn Hàng:</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Khách quen, thanh toán đủ, hẹn giờ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition-colors"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#111111] hover:bg-[#222222] text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Tạo Đơn Cho Thuê</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-7 h-7 text-slate-900 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Đang tải quản lý đơn hàng...</p>
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
