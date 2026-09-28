"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; cls: string }> = {
    RENTING: { label: "Đang thuê", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    COMPLETED: { label: "Hoàn thành", cls: "bg-slate-100 text-slate-600 border border-slate-200" },
    EXPIRED: { label: "Hết hạn", cls: "bg-rose-50 text-rose-600 border border-rose-200" },
    CANCELLED: { label: "Đã huỷ", cls: "bg-gray-100 text-gray-500 border border-gray-200" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-500" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${s.cls}`}>{s.label}</span>;
}

function TypeBadge({ type }: { type: OrderType }) {
  return type === "VIP" ? (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#111111] text-white text-[9px] font-black tracking-wider">VIP</span>
  ) : (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-700 text-white text-[9px] font-semibold tracking-wider">CLONE</span>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function AdminRentalsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "active" | "history" | null;

  const [tab, setTab] = useState<"active" | "history">(tabParam === "history" ? "history" : "active");
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

  const [vipAccounts, setVipAccounts] = useState(TFT_RENTAL_ACCOUNTS);
  const [cloneAccounts, setCloneAccounts] = useState(TFT_CLONE_ACCOUNTS);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "VIP" | "CLONE">("ALL");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null);
  const [extendOrder_, setExtendOrder_] = useState<OrderItem | null>(null);

  // Form
  const [formType, setFormType] = useState<OrderType>("VIP");
  const [formAccountCode, setFormAccountCode] = useState("");
  const [formCustomer, setFormCustomer] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPackage, setFormPackage] = useState("");
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formLogin, setFormLogin] = useState("");
  const [formPass, setFormPass] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formDays, setFormDays] = useState<number>(1);

  const [extendDays, setExtendDays] = useState<number>(1);
  const [extendPrice, setExtendPrice] = useState<number>(0);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getOrders();
      setOrders(result.data || []);
      if (result.stats) setStats(result.stats);
    } catch {
      toast.error("Lỗi tải dữ liệu lượt thuê!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getVipAndCloneAccounts().then(({ vipAccounts: v, cloneAccounts: c }) => {
      if (v.length) setVipAccounts(v as any);
      if (c.length) setCloneAccounts(c as any);
    }).catch(() => {});
  }, []);

  const getAccountThumb = (code: string, type: OrderType) => {
    const list = type === "VIP" ? vipAccounts : cloneAccounts;
    const found = (list as any[]).find((a) => a.code === code || a.id === code);
    return found?.thumbnail || found?.img || "";
  };

  const filtered = useMemo(() => {
    const isActive = tab === "active";
    return orders.filter((o) => {
      const statusOk = isActive
        ? o.status === "RENTING"
        : o.status !== "RENTING";
      const typeOk = typeFilter === "ALL" || o.type === typeFilter;
      const q = search.toLowerCase();
      const searchOk =
        !q ||
        (o.customer && o.customer.toLowerCase().includes(q)) ||
        (o.accountCode && o.accountCode.toLowerCase().includes(q)) ||
        (o.accountTitle && o.accountTitle.toLowerCase().includes(q)) ||
        (o.phoneZalo && o.phoneZalo.includes(q));
      return statusOk && typeOk && searchOk;
    });
  }, [orders, tab, typeFilter, search]);

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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAccountCode || !formCustomer || !formPackage || !formAmount) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setActionLoading(true);
    try {
      const accList = formType === "VIP" ? vipAccounts : cloneAccounts;
      const acc = (accList as any[]).find((a) => a.code === formAccountCode || a.id === formAccountCode);
      const expiresAt = formDays > 0
        ? new Date(Date.now() + formDays * 86_400_000).toISOString()
        : undefined;

      await createOrder({
        type: formType,
        customer: formCustomer.trim(),
        deliveredBy: "Admin",
        phoneZalo: formPhone.trim() || "0352.867.283",
        accountCode: formAccountCode,
        accountTitle: acc?.title || acc?.name || formAccountCode,
        package: formPackage,
        durationHours: formDays > 0 ? formDays * 24 : -1,
        amount: formAmount,
        paymentMethod: "TRANSFER",
        status: "RENTING",
        createdBy: "ADMIN",
        source: "ADMIN",
        accountLogin: formLogin.trim() || "riot_account",
        accountPass: formPass.trim() || generateRandomPassword(),
        notes: formNote.trim() || "Lượt thuê do Admin tạo.",
        expiresAt,
      });

      toast.success("Đã tạo lượt thuê!");
      setCreateModalOpen(false);
      setFormType("VIP");
      setFormAccountCode("");
      setFormCustomer("");
      setFormPhone("");
      setFormPackage("");
      setFormAmount(0);
      setFormLogin("");
      setFormPass("");
      setFormNote("");
      setFormDays(1);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo lượt thuê");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (order: OrderItem) => {
    if (!confirm(`Hoàn thành lượt thuê của ${order.customer}?`)) return;
    setActionLoading(true);
    try {
      await updateOrder(order.id, { status: "COMPLETED" });
      toast.success("Đã hoàn thành lượt thuê!");
      await fetchData();
    } catch {
      toast.error("Lỗi cập nhật!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (order: OrderItem) => {
    if (!confirm(`Xoá lượt thuê của ${order.customer}? Không thể hoàn tác.`)) return;
    setActionLoading(true);
    try {
      await deleteOrder(order.id);
      toast.success("Đã xoá!");
      await fetchData();
    } catch {
      toast.error("Lỗi xoá!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendOrder_ || extendDays < 1) return;
    setActionLoading(true);
    try {
      await extendOrder(extendOrder_.id, extendDays * 24, extendPrice);
      toast.success(`Đã gia hạn thêm ${extendDays} ngày!`);
      setExtendOrder_(null);
      setExtendPrice(0);
      await fetchData();
    } catch {
      toast.error("Lỗi gia hạn!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendZalo = (order: OrderItem) => {
    const msg = buildDeliveryMessage(order);
    const encoded = encodeURIComponent(msg);
    const phone = order.phoneZalo?.replace(/\D/g, "") || "";
    const url = phone
      ? `https://zalo.me/${phone}?message=${encoded}`
      : `https://zalo.me/${PROFILE_INFO.phoneZalo.replace(/\./g, "")}?message=${encoded}`;
    window.open(url, "_blank");
  };

  const currentAccList = formType === "VIP" ? vipAccounts : cloneAccounts;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#111111] font-heading">Lượt Thuê</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Quản lý các tài khoản đang được khách thuê và lịch sử thuê do Admin ghi nhận.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo lượt thuê</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Đang thuê", value: stats.rentingOrders, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Hoàn thành", value: stats.completedOrders, icon: CheckCircle2, color: "text-slate-600", bg: "bg-slate-50" },
          { label: "Hết hạn", value: stats.expiredOrders, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Doanh thu", value: formatVND(stats.totalRevenue), icon: DollarSign, color: "text-[#111111]", bg: "bg-gray-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-[#111111] leading-none">{kpi.value}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5 font-medium">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-[#E5E7EB] px-4 pt-3 gap-1">
          {(["active", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === t
                  ? "bg-[#111111] text-white"
                  : "text-[#6B7280] hover:text-[#111111] hover:bg-slate-50"
              }`}
            >
              {t === "active" ? `Đang thuê (${stats.rentingOrders})` : `Lịch sử (${stats.completedOrders + stats.expiredOrders})`}
            </button>
          ))}
        </div>

        {/* Search + Type filter */}
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-[#E5E7EB]">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên khách, SĐT, mã acc..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
            />
          </div>
          <div className="flex gap-1.5">
            {(["ALL", "VIP", "CLONE"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  typeFilter === t
                    ? "bg-[#111111] text-white"
                    : "text-[#6B7280] border border-[#E5E7EB] hover:border-slate-400"
                }`}
              >
                {t === "ALL" ? "Tất cả" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-xs">Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Không có lượt thuê nào</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {filtered.map((order) => {
              const remaining = getRentalTimeRemaining(order.expiresAt);
              const thumb = getAccountThumb(order.accountCode, order.type);
              return (
                <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Account + Customer */}
                    <div className="flex items-center gap-3 min-w-0">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={order.accountTitle}
                          className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB] flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Gamepad2 className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <TypeBadge type={order.type} />
                          <span className="text-xs font-bold text-[#111111] truncate">{order.accountTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{order.accountCode}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-slate-600 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />{order.customer}
                          </span>
                          {order.phoneZalo && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />{order.phoneZalo}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-slate-400">{order.package}</span>
                          <span className="text-[10px] font-bold text-[#111111]">{formatVND(order.amount)}</span>
                          {remaining && (
                            <span className={`text-[10px] font-medium flex items-center gap-0.5 ${
                              remaining.isExpired ? "text-rose-500" : remaining.isExpiringSoon ? "text-amber-600" : "text-emerald-600"
                            }`}>
                              <Clock className="w-3 h-3" />
                              {remaining.formatted}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status + Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <StatusBadge status={order.status} />
                      {order.status === "RENTING" && (
                        <>
                          <button
                            onClick={() => setExtendOrder_(order)}
                            title="Gia hạn"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <CalendarDays className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSendZalo(order)}
                            title="Gửi Zalo"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleComplete(order)}
                            title="Hoàn thành"
                            className="p-1.5 text-slate-400 hover:text-[#111111] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDetailOrder(order)}
                        title="Chi tiết"
                        className="p-1.5 text-slate-400 hover:text-[#111111] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(order)}
                        title="Xoá"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE MODAL ───────────────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white">
              <h3 className="text-sm font-bold text-[#111111] font-heading">Tạo lượt thuê mới</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-5 space-y-4">
              {/* Type */}
              <div className="flex gap-2">
                {(["VIP", "CLONE"] as OrderType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setFormType(t); setFormAccountCode(""); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      formType === t ? "bg-[#111111] text-white border-[#111111]" : "border-[#E5E7EB] text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {t === "VIP" ? "VIP Acc" : "Clone Acc"}
                  </button>
                ))}
              </div>

              {/* Account */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Tài khoản</label>
                <select
                  value={formAccountCode}
                  onChange={(e) => setFormAccountCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
                >
                  <option value="">Chọn tài khoản...</option>
                  {(currentAccList as any[]).map((acc) => (
                    <option key={acc.code || acc.id} value={acc.code || acc.id}>
                      {acc.title || acc.name} ({acc.code || acc.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Khách hàng *</label>
                  <input
                    value={formCustomer}
                    onChange={(e) => setFormCustomer(e.target.value)}
                    required
                    placeholder="Tên khách..."
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Số điện thoại / Zalo</label>
                  <input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0352..."
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Gói thuê *</label>
                  <input
                    value={formPackage}
                    onChange={(e) => setFormPackage(e.target.value)}
                    required
                    placeholder="1 ngày, 7 ngày..."
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Số tiền (đ) *</label>
                  <input
                    type="number"
                    value={formAmount || ""}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    required
                    min={0}
                    placeholder="50000"
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Login</label>
                  <input
                    value={formLogin}
                    onChange={(e) => setFormLogin(e.target.value)}
                    placeholder="email hoặc username"
                    className="w-full px-3 py-2 text-xs font-mono border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Mật khẩu</label>
                  <input
                    value={formPass}
                    onChange={(e) => setFormPass(e.target.value)}
                    placeholder="Tự sinh nếu để trống"
                    className="w-full px-3 py-2 text-xs font-mono border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Số ngày thuê</label>
                <input
                  type="number"
                  value={formDays}
                  onChange={(e) => setFormDays(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Ghi chú</label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900 bg-slate-50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {actionLoading ? "Đang tạo..." : "Tạo lượt thuê"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── EXTEND MODAL ──────────────────────────────────────────── */}
      {extendOrder_ && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#111111] font-heading">Gia hạn thuê</h3>
              <button onClick={() => setExtendOrder_(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleExtend} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-[#E5E7EB] text-xs text-slate-600">
                <p className="font-bold text-[#111111]">{extendOrder_.accountTitle}</p>
                <p>Khách: {extendOrder_.customer}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Gia hạn thêm (ngày)</label>
                <input
                  type="number"
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Phí gia hạn thêm (đ)</label>
                <input
                  type="number"
                  value={extendPrice || ""}
                  onChange={(e) => setExtendPrice(Number(e.target.value))}
                  min={0}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-lg bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                {actionLoading ? "Đang gia hạn..." : `Gia hạn ${extendDays} ngày`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAIL DRAWER ──────────────────────────────────────────── */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white">
              <h3 className="text-sm font-bold text-[#111111] font-heading">Chi tiết lượt thuê</h3>
              <button onClick={() => setDetailOrder(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                {getAccountThumb(detailOrder.accountCode, detailOrder.type) ? (
                  <img
                    src={getAccountThumb(detailOrder.accountCode, detailOrder.type)}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E5E7EB]"
                    alt=""
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center border border-[#E5E7EB]">
                    <Gamepad2 className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TypeBadge type={detailOrder.type} />
                    <StatusBadge status={detailOrder.status} />
                  </div>
                  <p className="text-sm font-bold text-[#111111] mt-1">{detailOrder.accountTitle}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{detailOrder.accountCode}</p>
                </div>
              </div>

              {[
                { label: "Khách hàng", value: detailOrder.customer },
                { label: "Số điện thoại / Zalo", value: detailOrder.phoneZalo || "—" },
                { label: "Gói thuê", value: detailOrder.package },
                { label: "Số tiền", value: formatVND(detailOrder.amount) },
                { label: "Ngày tạo", value: formatOrderDateTime(detailOrder.createdAt) },
                { label: "Hết hạn", value: detailOrder.expiresAt ? formatOrderDateTime(detailOrder.expiresAt) : "Không giới hạn" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center text-xs py-2 border-b border-[#F3F4F6] last:border-0">
                  <span className="text-slate-500 font-medium">{label}</span>
                  <span className="text-[#111111] font-semibold text-right">{value}</span>
                </div>
              ))}

              {/* Account credentials */}
              {(detailOrder.accountLogin || detailOrder.accountPass) && (
                <div className="rounded-xl bg-slate-50 border border-[#E5E7EB] p-3 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> Thông tin đăng nhập
                  </p>
                  {[
                    { label: "Login", value: detailOrder.accountLogin, id: "login" },
                    { label: "Pass", value: detailOrder.accountPass, id: "pass" },
                  ].map(({ label, value, id }) => value && (
                    <div key={id} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-medium w-10 flex-shrink-0">{label}:</span>
                      <span className="flex-1 text-[11px] font-mono text-[#111111] truncate">{value}</span>
                      <button
                        onClick={() => copyToClipboard(value, `${detailOrder.id}-${id}`)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer flex-shrink-0"
                      >
                        {copiedId === `${detailOrder.id}-${id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {detailOrder.notes && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
                  {detailOrder.notes}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {detailOrder.status === "RENTING" && (
                  <button
                    onClick={() => { handleSendZalo(detailOrder); setDetailOrder(null); }}
                    className="flex-1 py-2 rounded-lg bg-[#111111] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Gửi Zalo
                  </button>
                )}
                <button
                  onClick={() => setDetailOrder(null)}
                  className="flex-1 py-2 rounded-lg border border-[#E5E7EB] text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page Export ────────────────────────────────────────────────────────────

export default function AdminRentalsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-7 h-7 text-slate-900 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Đang tải Lượt Thuê...</p>
        </div>
      }
    >
      <AdminRentalsContent />
    </Suspense>
  );
}
