"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
} from "@/utils/orders-service";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus | "EXPIRING">("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "AMOUNT_DESC" | "EXPIRY">("NEWEST");

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
  const [newCustomer, setNewCustomer] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAccountCode, setNewAccountCode] = useState("MS: 8899");
  const [newAccountTitle, setNewAccountTitle] = useState("");
  const [newPackage, setNewPackage] = useState("2 Giờ Trải Nghiệm");
  const [newDurationHours, setNewDurationHours] = useState<number>(2);
  const [newAmount, setNewAmount] = useState<number>(30000);
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
      if (vips && vips.length > 0) setVipAccounts(vips);
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
        setNewAccountTitle(acc.title || `${acc.mainChibi} - ${acc.mainArena}`);
        setNewLogin(`tft_${acc.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`);
        setNewPass(generateRandomPassword());
        if (newDurationHours === 2) {
          setNewPackage("2 Giờ Trải Nghiệm");
          setNewAmount(acc.hourlyPrice ? acc.hourlyPrice * 2 : 30000);
        }
      }
    } else if (createType === "CLONE") {
      const acc = cloneAccounts.find((a) => a.code === newAccountCode) || cloneAccounts[0];
      if (acc) {
        setNewAccountTitle(acc.title || `Acc Clone ${acc.rankBadge}`);
        setNewPackage("Full Sở Hữu (Bàn Giao Trọn Đời ∞)");
        setNewDurationHours(-1);
        setNewAmount(Number(acc.price) || 150000);
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
  }, [createType, newAccountCode]);

  // Handle preset duration change in Create Form
  const handleSelectDurationPreset = (hours: number, label: string, priceMultiplier = 1) => {
    setNewDurationHours(hours);
    setNewPackage(label);

    if (createType === "VIP") {
      const acc = vipAccounts.find((a) => a.code === newAccountCode) || vipAccounts[0];
      if (hours === 2) {
        setNewAmount(acc.hourlyPrice ? acc.hourlyPrice * 2 : 30000);
      } else if (hours === 24) {
        setNewAmount(acc.dailyPrice || 50000);
      } else if (hours === 168) {
        setNewAmount(acc.weeklyPrice || 164000);
      } else if (hours === 720) {
        setNewAmount(acc.monthlyPrice || 360000);
      } else if (hours === -1) {
        setNewAmount(Number(acc.periodPrice) || 600000);
      } else {
        const hourly = acc.hourlyPrice || 15000;
        setNewAmount(hourly * hours);
      }
    }
  };

  // Submit Create Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.trim()) {
      toast.error("Vui lòng nhập tên khách hàng!");
      return;
    }

    setActionLoading(true);
    const toastId = toast.loading("Đang khởi tạo đơn hàng & thông tin bàn giao...");

    const res = await createOrder({
      type: createType,
      customer: newCustomer.trim(),
      phoneZalo: newPhone.trim() || "09xx.xxx.xxx",
      accountCode: newAccountCode,
      accountTitle: newAccountTitle,
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
      setNewCustomer("");
      setNewPhone("");
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
          ord.accountCode.toLowerCase().includes(query) ||
          ord.accountTitle.toLowerCase().includes(query) ||
          ord.phoneZalo.toLowerCase().includes(query) ||
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
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block font-gaming">
              Tổng Doanh Thu
            </span>
            <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {stats.totalRevenue.toLocaleString("vi-VN")}đ
            </strong>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Hệ thống giao dịch tự động
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Đơn đang thuê active */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block font-gaming">
              Đang Thuê (Active)
            </span>
            <strong className="text-2xl font-black text-orange-600 font-mono mt-1 block">
              {stats.rentingOrders} Đơn
            </strong>
            <span className="text-[11px] text-orange-600 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> Đang phục vụ khách
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-xs">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Đơn đã hoàn tất */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block font-gaming">
              Đã Hoàn Tất
            </span>
            <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {stats.completedOrders} Đơn
            </strong>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              ✓ Đã thu hồi & bàn giao
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Tổng số giao dịch */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block font-gaming">
              Tổng Giao Dịch
            </span>
            <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {stats.totalOrders} Đơn
            </strong>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Acc VIP + Clone + Cày Rank
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ: TÌM KIẾM, BỘ LỌC TABS & NÚT TẠO ĐƠN */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 font-gaming uppercase">
              <Receipt className="w-5 h-5 text-orange-600" />
              <span>Quản Lý Đơn Hàng & Thuê Tài Khoản ĐTCL</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi thời gian thuê, sao chép tin nhắn bàn giao Riot ID, gia hạn giờ chơi và quản lý doanh thu.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => loadOrdersData(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-600" : ""}`} />
              <span className="hidden sm:inline">Làm Mới</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreateType("VIP");
                setCreateModalOpen(true);
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/25 transition-all hover:scale-105 cursor-pointer font-gaming"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Đơn Nhanh</span>
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Tất Cả ({orders.length})
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("VIP")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === "VIP"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/60"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Thuê Acc VIP ({orders.filter((o) => o.type === "VIP").length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("CLONE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === "CLONE"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60"
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Acc Clone ∞ ({orders.filter((o) => o.type === "CLONE").length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("COACHING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === "COACHING" || typeFilter === "SERVICE"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60"
              }`}
            >
              <Award className="w-3 h-3" />
              <span>Cày Rank & Coaching</span>
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
                placeholder="Tìm mã đơn, tên khách, số Zalo, mã acc..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 focus:outline-none transition-colors"
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
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="RENTING">🟢 Đang Thuê ({stats.rentingOrders})</option>
              <option value="EXPIRING">⏰ Sắp Hết Hạn (&lt;1h)</option>
              <option value="COMPLETED">✅ Đã Hoàn Thành ({stats.completedOrders})</option>
            </select>

            {/* Sắp xếp */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer hidden sm:block"
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Đang tải dữ liệu đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 px-4 text-center text-slate-400 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
              <Receipt className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {searchTerm || typeFilter !== "ALL" || statusFilter !== "ALL"
                  ? "Không tìm thấy đơn hàng nào phù hợp bộ lọc"
                  : "Chưa có đơn hàng nào trong hệ thống"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchTerm || typeFilter !== "ALL" || statusFilter !== "ALL"
                  ? "Bạn có thể thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc để xem toàn bộ danh sách."
                  : "Hệ thống không tự động tạo đơn ảo. Mọi đơn thuê tài khoản hoặc dịch vụ do bạn (Admin) tạo sẽ được lưu trữ và hiển thị tại đây."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateType("VIP");
                setCreateModalOpen(true);
              }}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md shadow-orange-600/25 transition-all hover:scale-105 cursor-pointer font-gaming"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Đơn Hàng Mới</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-gaming">
                <tr>
                  <th className="py-3.5 px-4">Mã Đơn</th>
                  <th className="py-3.5 px-4">Khách Hàng & Zalo</th>
                  <th className="py-3.5 px-4">Tài Khoản / Dịch Vụ</th>
                  <th className="py-3.5 px-4">Gói Thuê</th>
                  <th className="py-3.5 px-4">Thanh Toán</th>
                  <th className="py-3.5 px-4">Hạn Sử Dụng</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
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
                      {/* 1. Mã Đơn & Type Badge */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs shadow-2xs block w-fit">
                            {ord.id}
                          </span>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span
                              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded block w-fit font-gaming ${
                                ord.type === "VIP"
                                  ? "bg-orange-100 text-orange-700"
                                  : ord.type === "CLONE"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {ord.type === "VIP" ? "VIP" : ord.type === "CLONE" ? "CLONE" : "DỊCH VỤ"}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Admin</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Khách Hàng */}
                      <td className="py-4 px-4">
                        <strong className="text-slate-900 font-bold block text-sm group-hover:text-orange-600 transition-colors">
                          {ord.customer}
                        </strong>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{ord.phoneZalo}</span>
                          <a
                            href={`https://zalo.me/${ord.phoneZalo.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 font-bold ml-1 text-[10px] underline flex items-center gap-0.5"
                            title="Chat Zalo ngay"
                          >
                            <span>Zalo</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </td>

                      {/* 3. Tài Khoản */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-mono font-bold text-[11px]">
                              {ord.accountCode}
                            </span>
                            <span className="text-slate-800 font-bold truncate">{ord.accountTitle}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">
                            ID: <code className="text-slate-700 font-semibold">{ord.accountLogin}</code> • Pass:{" "}
                            <code className="text-slate-700 font-semibold">{ord.accountPass}</code>
                          </div>
                        </div>
                      </td>

                      {/* 4. Gói Thuê */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200 text-xs inline-block">
                          {ord.package}
                        </span>
                      </td>

                      {/* 5. Thanh Toán */}
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-red-600 text-sm block">
                          {ord.amount.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Chuyển khoản</span>
                      </td>

                      {/* 6. Hạn Sử Dụng */}
                      <td className="py-4 px-4">
                        {ord.expiresAt ? (
                          <div className="space-y-0.5">
                            <span className="text-slate-800 font-mono font-semibold block text-xs">
                              {new Date(ord.expiresAt).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </span>
                            {isRenting && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded block w-fit font-mono ${
                                  timeInfo.isExpired
                                    ? "bg-rose-100 text-rose-700 animate-pulse"
                                    : timeInfo.isExpiringSoon
                                    ? "bg-amber-100 text-amber-800 animate-pulse"
                                    : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {timeInfo.formatted}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold text-[11px]">
                            Vô Cực ∞
                          </span>
                        )}
                      </td>

                      {/* 7. Trạng Thái */}
                      <td className="py-4 px-4">
                        {ord.status === "RENTING" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Đang Thuê</span>
                          </span>
                        ) : ord.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Đã Hoàn Tất</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
                            <span>Đã Hủy</span>
                          </span>
                        )}
                      </td>

                      {/* 8. Thao Tác Nhanh */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Nút Copy Delivery Message */}
                          <button
                            type="button"
                            onClick={() => handleCopyDelivery(ord)}
                            className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors cursor-pointer"
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
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
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
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-slate-900 font-gaming">{selectedOrder.id}</h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-gaming ${
                        selectedOrder.type === "VIP"
                          ? "bg-orange-100 text-orange-700"
                          : selectedOrder.type === "CLONE"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {selectedOrder.type}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Khởi tạo lúc: {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
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
              {/* Creator Banner */}
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900 font-semibold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Người tạo đơn: <strong>Admin (Tuấn Thái Bình)</strong></span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  🛡️ Chính Chủ
                </span>
              </div>

              {/* Box 1: Thông tin khách hàng & Tài khoản bàn giao */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Khách hàng:</span>
                    <strong className="text-slate-900 text-sm font-bold block">{selectedOrder.customer}</strong>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-slate-600">{selectedOrder.phoneZalo}</span>
                      <a
                        href={`https://zalo.me/${selectedOrder.phoneZalo.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold flex items-center gap-1 hover:bg-blue-700"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Mở Zalo</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Tài khoản & Gói thuê:</span>
                    <strong className="text-orange-700 font-bold block">
                      [{selectedOrder.accountCode}] {selectedOrder.accountTitle}
                    </strong>
                    <span className="text-slate-600 block mt-0.5">
                      Gói: <strong>{selectedOrder.package}</strong> • Giá:{" "}
                      <strong className="text-red-600 font-mono">
                        {selectedOrder.amount.toLocaleString("vi-VN")}đ
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Riot ID & Pass Credentials Box */}
                <div className="pt-2 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
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

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Mật Khẩu Hiện Tại:</span>
                      <strong className="text-red-600 font-mono text-xs">{selectedOrder.accountPass}</strong>
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
                        className="p-1.5 text-orange-600 hover:text-orange-800 rounded bg-orange-50 cursor-pointer"
                        title="Tạo Mật khẩu Mới Ngẫu Nhiên"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Hạn sử dụng & Gia Hạn Thuê */}
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-orange-800 block">Thời hạn sử dụng đơn thuê:</span>
                    <strong className="text-slate-900 font-mono text-sm block">
                      {selectedOrder.expiresAt
                        ? new Date(selectedOrder.expiresAt).toLocaleString("vi-VN")
                        : "Full Sở Hữu Vô Cực ∞"}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedOrder.status === "RENTING" && (
                      <button
                        type="button"
                        onClick={() => setShowExtendBox(!showExtendBox)}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Gia Hạn Thuê</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedOrder)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                        selectedOrder.status === "RENTING"
                          ? "bg-slate-900 hover:bg-black text-white"
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
                  <div className="p-3 bg-white rounded-xl border border-orange-300 space-y-2.5 animate-fadeIn">
                    <span className="font-bold text-slate-800 block text-xs">Chọn gói gia hạn nhanh cho khách:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickExtend(selectedOrder, 2, 30000)}
                        className="p-2 bg-slate-50 hover:bg-orange-100 border border-slate-200 rounded-lg text-center cursor-pointer"
                      >
                        <strong className="block text-slate-900 text-xs">+2 Giờ</strong>
                        <span className="text-[10px] text-orange-600 font-mono">+30.000đ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickExtend(selectedOrder, 24, 50000)}
                        className="p-2 bg-slate-50 hover:bg-orange-100 border border-slate-200 rounded-lg text-center cursor-pointer"
                      >
                        <strong className="block text-slate-900 text-xs">+1 Ngày (24h)</strong>
                        <span className="text-[10px] text-orange-600 font-mono">+50.000đ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickExtend(selectedOrder, 168, 164000)}
                        className="p-2 bg-slate-50 hover:bg-orange-100 border border-slate-200 rounded-lg text-center cursor-pointer"
                      >
                        <strong className="block text-slate-900 text-xs">+7 Ngày (1 Tuần)</strong>
                        <span className="text-[10px] text-orange-600 font-mono">+164.000đ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickExtend(selectedOrder, 720, 360000)}
                        className="p-2 bg-slate-50 hover:bg-orange-100 border border-slate-200 rounded-lg text-center cursor-pointer"
                      >
                        <strong className="block text-slate-900 text-xs">+30 Ngày (1 Tháng)</strong>
                        <span className="text-[10px] text-orange-600 font-mono">+360.000đ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Box 3: Ghi chú đơn hàng */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ghi chú nội bộ:</span>
                  </span>
                  {!editingNotes ? (
                    <button
                      type="button"
                      onClick={() => setEditingNotes(true)}
                      className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
                    >
                      Sửa ghi chú
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px] cursor-pointer"
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
                className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Đơn Này</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleCopyDelivery(selectedOrder)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/25 cursor-pointer font-gaming"
                >
                  {copiedDelivery ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedDelivery ? "Đã Sao Chép!" : "Copy Tin Nhắn Bàn Giao"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL TẠO ĐƠN HÀNG MỚI (CREATE ORDER) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 font-gaming uppercase">Tạo Đơn Hàng Mới</h3>
                  <span className="text-xs text-slate-500">Khởi tạo đơn thuê tài khoản & bàn giao tức thì 30s</span>
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

            {/* Admin Creator Indicator */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block font-gaming">Người tạo đơn</span>
                  <strong className="text-slate-900">Tuấn Thái Bình (Admin)</strong>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-bold shadow-2xs">
                🛡️ Đơn Admin Tạo
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              {/* 1. Chọn loại đơn */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">1. Loại Đơn Hàng:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateType("VIP")}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      createType === "VIP"
                        ? "bg-orange-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Thuê Acc VIP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateType("CLONE")}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      createType === "CLONE"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Acc Clone ∞</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateType("COACHING")}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      createType === "COACHING"
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Cày Rank / Duo</span>
                  </button>
                </div>
              </div>

              {/* 2. Chọn Tài Khoản / Dịch Vụ */}
              {createType === "VIP" && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">2. Chọn Tài Khoản VIP Trong Kho:</label>
                  <select
                    value={newAccountCode}
                    onChange={(e) => setNewAccountCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {vipAccounts.map((a) => (
                      <option key={a.id || a.code} value={a.code}>
                        [{a.code}] - {a.mainChibi} ({a.rank}) - {a.hourlyPrice?.toLocaleString("vi-VN")}đ/h
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {createType === "CLONE" && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">2. Chọn Tài Khoản Clone Trong Kho:</label>
                  <select
                    value={newAccountCode}
                    onChange={(e) => setNewAccountCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
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
                  <label className="font-bold text-slate-800 block">3. Chọn Gói Thời Gian Thuê:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectDurationPreset(2, "2 Giờ Trải Nghiệm")}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newDurationHours === 2 ? "bg-orange-50 border-orange-500 font-bold" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span className="block text-slate-900">2 Giờ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDurationPreset(24, "Thuê 1 Ngày (24h)")}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newDurationHours === 24 ? "bg-orange-50 border-orange-500 font-bold" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span className="block text-slate-900">1 Ngày (24h)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDurationPreset(168, "Thuê 7 Ngày (1 Tuần)")}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newDurationHours === 168 ? "bg-orange-50 border-orange-500 font-bold" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span className="block text-slate-900">7 Ngày</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDurationPreset(720, "Thuê 30 Ngày (1 Tháng)")}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        newDurationHours === 720 ? "bg-orange-50 border-orange-500 font-bold" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span className="block text-slate-900">30 Ngày</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Khách hàng & Giá */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Tên Khách Hàng (*):</label>
                  <input
                    type="text"
                    required
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Số Điện Thoại / Zalo:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0912.345.678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* 5. Giá tiền & Thanh toán */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Số Tiền Thu (VNĐ):</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-red-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Phương Thức Thanh Toán:</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
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
                  <label className="font-bold text-slate-800 block">Riot ID / Login Bàn Giao:</label>
                  <input
                    type="text"
                    value={newLogin}
                    onChange={(e) => setNewLogin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 block">Mật Khẩu Bàn Giao:</label>
                    <button
                      type="button"
                      onClick={() => setNewPass(generateRandomPassword())}
                      className="text-[10px] text-orange-600 font-bold hover:underline"
                    >
                      Sinh pass mới
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-red-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* 7. Ghi chú */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Ghi Chú Đơn Hàng:</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Khách quen, thanh toán đủ, hẹn giờ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-600/25 transition-all hover:scale-105 cursor-pointer font-gaming disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Tạo Đơn Hàng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
