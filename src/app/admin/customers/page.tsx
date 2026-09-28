"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  Search,
  Lock,
  Unlock,
  KeyRound,
  Edit2,
  Trash2,
  ShieldCheck,
  Phone,
  MessageCircle,
  Loader2,
  X,
  Check,
  Copy,
  AlertCircle,
  Clock,
  UserCheck,
  Filter,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CalendarDays,
  Gamepad2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  Tag,
  Ban,
  ArrowUpDown,
} from "lucide-react";
import { SafeMember } from "@/utils/members-service";
import { OrderItem } from "@/utils/orders-service";

interface CustomerItem extends SafeMember {
  rentalCount: number;
  activeRentalCount: number;
  profileStatus: "COMPLETE" | "MISSING_NAME" | "MISSING_ZALO" | "MISSING_BOTH";
}

interface CustomerStats {
  totalMembers: number;
  activeMembers: number;
  lockedMembers: number;
  incompleteProfiles: number;
  membersWithActiveRentals: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatVND(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString("vi-VN") + "đ";
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "—";
  }
}

function ProfileStatusBadge({ status }: { status: CustomerItem["profileStatus"] }) {
  if (status === "COMPLETE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Đầy đủ</span>
      </span>
    );
  }
  if (status === "MISSING_NAME") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>Thiếu tên</span>
      </span>
    );
  }
  if (status === "MISSING_ZALO") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>Thiếu Zalo</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <AlertCircle className="w-3 h-3 text-slate-500" />
      <span>Thiếu thông tin</span>
    </span>
  );
}

function AccountStatusBadge({ status }: { status: "ACTIVE" | "LOCKED" }) {
  return status === "ACTIVE" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>Hoạt động</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <Lock className="w-3 h-3 text-rose-600" />
      <span>Đã khóa</span>
    </span>
  );
}

// ─── Main Content Component ──────────────────────────────────────────────────

function AdminCustomersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalMembers: 0,
    activeMembers: 0,
    lockedMembers: 0,
    incompleteProfiles: 0,
    membersWithActiveRentals: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "LOCKED">("ALL");
  const [profileFilter, setProfileFilter] = useState<"ALL" | "COMPLETE" | "INCOMPLETE">("ALL");
  const [rentalFilter, setRentalFilter] = useState<"ALL" | "HAS_RENTALS" | "NO_RENTALS">("ALL");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "name" | "lastLogin" | "rentals">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<{
    member: SafeMember;
    rentals: OrderItem[];
    stats: {
      rentalCount: number;
      totalRentalSpent: number;
      lastRentalDate: string | null;
    };
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal: Edit
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editZalo, setEditZalo] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "LOCKED">("ACTIVE");
  const [editNotes, setEditNotes] = useState("");

  // Modal: Create
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createFullName, setCreateFullName] = useState("");
  const [createZalo, setCreateZalo] = useState("");
  const [createStatus, setCreateStatus] = useState<"ACTIVE" | "LOCKED">("ACTIVE");
  const [createNotes, setCreateNotes] = useState("");

  // Modal: Reset Password
  const [resettingCustomer, setResettingCustomer] = useState<CustomerItem | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Modal: Lock / Unlock Confirm
  const [toggleLockCustomer, setToggleLockCustomer] = useState<CustomerItem | null>(null);

  const getAdminHeaders = () => {
    const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
    return {
      "Content-Type": "application/json",
      ...(localToken ? { "x-admin-token": localToken } : {}),
    };
  };

  // Fetch Customers List with server filters
  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (profileFilter !== "ALL") params.append("profileStatus", profileFilter);
      if (rentalFilter !== "ALL") params.append("rentalFilter", rentalFilter);
      params.append("sort", sortOption);
      params.append("page", page.toString());
      params.append("limit", "15");

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: getAdminHeaders(),
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setCustomers(json.data);
        setTotalCount(json.total || json.data.length);
        setTotalPages(json.totalPages || 1);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch {
      toast.error("Lỗi kết nối khi tải danh sách khách hàng!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, statusFilter, profileFilter, rentalFilter, sortOption, page]);

  // Load single customer detail
  const openDetailDrawer = async (c: CustomerItem) => {
    try {
      setDetailLoading(true);
      setDetailCustomer({
        member: c,
        rentals: [],
        stats: {
          rentalCount: c.rentalCount,
          totalRentalSpent: 0,
          lastRentalDate: null,
        },
      });

      const res = await fetch(`/api/admin/users/${c.id}`, {
        headers: getAdminHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDetailCustomer(json.data);
      }
    } catch {
      toast.error("Không thể tải chi tiết khách hàng!");
    } finally {
      setDetailLoading(false);
    }
  };

  // Copy helper
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

  // Submit Create Member
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUsername.trim() || !createPassword.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập và mật khẩu tạm!");
      return;
    }

    setActionLoading(true);
    const toastId = toast.loading("Đang tạo tài khoản Member...");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          username: createUsername.trim(),
          password: createPassword.trim(),
          full_name: createFullName.trim(),
          zalo: createZalo.trim(),
          status: createStatus,
          notes: createNotes.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (json.warning) {
          toast(json.warning, { icon: "⚠️", duration: 5000 });
        }
        toast.success("✅ Đã tạo tài khoản Member thành công!", { id: toastId });
        setCreateModalOpen(false);
        // Reset form
        setCreateUsername("");
        setCreatePassword("");
        setCreateFullName("");
        setCreateZalo("");
        setCreateNotes("");
        setCreateStatus("ACTIVE");
        loadCustomers();
      } else {
        toast.error(json.message || "Tạo tài khoản thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi máy chủ khi tạo tài khoản!", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Edit Member
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setActionLoading(true);
    const toastId = toast.loading("Đang cập nhật thông tin...");

    try {
      const res = await fetch(`/api/admin/users/${editingCustomer.id}`, {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          full_name: editFullName.trim(),
          zalo: editZalo.trim(),
          status: editStatus,
          notes: editNotes.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("✅ Cập nhật khách hàng thành công!", { id: toastId });
        setEditingCustomer(null);
        if (detailCustomer?.member.id === editingCustomer.id) {
          setDetailCustomer((prev) =>
            prev
              ? {
                  ...prev,
                  member: {
                    ...prev.member,
                    full_name: editFullName.trim(),
                    zalo: editZalo.trim(),
                    status: editStatus,
                    notes: editNotes.trim(),
                  },
                }
              : null
          );
        }
        loadCustomers();
      } else {
        toast.error(json.message || "Cập nhật thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi khi cập nhật!", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Quick Note Save from Detail Drawer
  const handleSaveDetailNote = async (noteText: string) => {
    if (!detailCustomer) return;
    try {
      const res = await fetch(`/api/admin/users/${detailCustomer.member.id}`, {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({ notes: noteText.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Đã lưu ghi chú CSKH!");
        setDetailCustomer((prev) =>
          prev ? { ...prev, member: { ...prev.member, notes: noteText.trim() } } : null
        );
        loadCustomers();
      }
    } catch {
      toast.error("Không thể lưu ghi chú!");
    }
  };

  // Submit Toggle Lock
  const handleConfirmToggleLock = async () => {
    if (!toggleLockCustomer) return;
    const newStatus = toggleLockCustomer.status === "ACTIVE" ? "LOCKED" : "ACTIVE";

    setActionLoading(true);
    const toastId = toast.loading(
      newStatus === "LOCKED" ? "Đang khóa tài khoản..." : "Đang mở khóa..."
    );

    try {
      const res = await fetch(`/api/admin/users/${toggleLockCustomer.id}`, {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          newStatus === "LOCKED"
            ? `Đã khóa tài khoản "${toggleLockCustomer.username}"!`
            : `Đã mở khóa tài khoản "${toggleLockCustomer.username}"!`,
          { id: toastId }
        );
        setToggleLockCustomer(null);
        if (detailCustomer?.member.id === toggleLockCustomer.id) {
          setDetailCustomer((prev) =>
            prev ? { ...prev, member: { ...prev.member, status: newStatus } } : null
          );
        }
        loadCustomers();
      } else {
        toast.error(json.message || "Thao tác thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi khi đổi trạng thái!", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Reset Password
  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingCustomer || !newPassword.trim()) return;

    if (newPassword.trim().length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setActionLoading(true);
    const toastId = toast.loading("Đang cập nhật mật khẩu mới...");

    try {
      const res = await fetch(`/api/admin/users/${resettingCustomer.id}`, {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Đã đổi mật khẩu cho "${resettingCustomer.username}"!`, { id: toastId });
        setResettingCustomer(null);
        setNewPassword("");
      } else {
        toast.error(json.message || "Đổi mật khẩu thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi khi đổi mật khẩu!", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. HEADER & ACTIONS ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Khách Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý Member và thông tin CSKH của ShopTFTMobile.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadCustomers}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 bg-white"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tạo Member</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI METRIC CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-900 leading-none">{stats.totalMembers}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Tổng số Member</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-emerald-700 leading-none">{stats.activeMembers}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Đang hoạt động</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-amber-700 leading-none">{stats.incompleteProfiles}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Thiếu thông tin</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-blue-700 leading-none">{stats.membersWithActiveRentals}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Đang có lượt thuê</p>
          </div>
        </div>
      </div>

      {/* ── 3. FILTERS & SEARCH BAR ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên đăng nhập, họ tên, số điện thoại / Zalo..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 transition-colors"
            />
          </div>

          {/* Sub Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Profile */}
            <select
              value={profileFilter}
              onChange={(e) => {
                setProfileFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="ALL">Hồ sơ: Tất cả</option>
              <option value="COMPLETE">Hồ sơ: Đầy đủ</option>
              <option value="INCOMPLETE">Hồ sơ: Thiếu thông tin</option>
            </select>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
            </select>

            {/* Filter Rentals */}
            <select
              value={rentalFilter}
              onChange={(e) => {
                setRentalFilter(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="ALL">Lượt thuê: Tất cả</option>
              <option value="HAS_RENTALS">Có lượt thuê</option>
              <option value="NO_RENTALS">Chưa có lượt thuê</option>
            </select>

            {/* Sort */}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="newest">Mới tạo nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Tên A → Z</option>
              <option value="lastLogin">Đăng nhập gần nhất</option>
              <option value="rentals">Lượt thuê nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. CUSTOMER TABLE (PRIMARY VIEW) ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tài Khoản</th>
                <th className="py-3 px-4 min-w-[160px]">Họ Và Tên</th>
                <th className="py-3 px-4">Zalo</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Hồ Sơ</th>
                <th className="py-3 px-4 text-center">Lượt Thuê</th>
                <th className="py-3 px-4">Ngày Tạo</th>
                <th className="py-3 px-4">Cập Nhật Gần Nhất</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
                      <span className="text-xs font-semibold">Đang tải danh sách khách hàng...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6 opacity-60" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">Chưa có khách hàng nào.</p>
                      <button
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Tạo Member</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openDetailDrawer(c)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Tài khoản */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 text-xs font-bold">
                          {c.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{c.username}</span>
                      </div>
                    </td>

                    {/* Họ và tên */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {c.full_name ? (
                        <span>{c.full_name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa bổ sung</span>
                      )}
                    </td>

                    {/* Zalo */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {c.zalo ? (
                        <div className="flex items-center gap-1 font-mono text-slate-800">
                          <span>{c.zalo}</span>
                          <button
                            onClick={() => copyToClipboard(c.zalo!, `zalo-${c.id}`)}
                            className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                            title="Sao chép Zalo"
                          >
                            {copiedId === `zalo-${c.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          {c.zalo.replace(/\D/g, "").length >= 9 && (
                            <a
                              href={`https://zalo.me/${c.zalo.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                              title="Mở Zalo"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có</span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <AccountStatusBadge status={c.status} />
                    </td>

                    {/* Hồ sơ */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <ProfileStatusBadge status={c.profileStatus} />
                    </td>

                    {/* Lượt thuê */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        c.rentalCount > 0 ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-slate-400"
                      }`}>
                        {c.rentalCount > 0 ? `${c.rentalCount} lượt thuê` : "0"}
                      </span>
                    </td>

                    {/* Ngày tạo */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>

                    {/* Cập nhật gần nhất */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {formatDate(c.updatedAt || c.lastLoginAt || c.createdAt)}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingCustomer(c);
                            setEditFullName(c.full_name || "");
                            setEditZalo(c.zalo || "");
                            setEditStatus(c.status);
                            setEditNotes(c.notes || "");
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setResettingCustomer(c);
                            setNewPassword("");
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Đặt lại mật khẩu"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setToggleLockCustomer(c)}
                          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                            c.status === "ACTIVE"
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-rose-600 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={c.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {c.status === "ACTIVE" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Hiển thị trang <strong className="text-slate-900">{page}</strong> / {totalPages} (Tổng {totalCount} khách hàng)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40 cursor-pointer hover:bg-slate-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40 cursor-pointer hover:bg-slate-50"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. MODAL: TẠO MEMBER ────────────────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">Tạo Member Mới</h3>
                <p className="text-xs text-slate-500">
                  Tài khoản đăng nhập được tạo thủ công bởi Admin phục vụ CSKH.
                </p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Tên đăng nhập *</label>
                  <input
                    type="text"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                    required
                    placeholder="tuan_khachvip"
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Mật khẩu tạm *</label>
                  <input
                    type="text"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    required
                    placeholder="Mật khẩu tối thiểu 6 ký tự..."
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Họ và tên (Tùy chọn)</label>
                  <input
                    type="text"
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Số điện thoại / Zalo (Tùy chọn)</label>
                  <input
                    type="text"
                    value={createZalo}
                    onChange={(e) => setCreateZalo(e.target.value)}
                    placeholder="0352.xxx.xxx"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Trạng thái tài khoản</label>
                <select
                  value={createStatus}
                  onChange={(e) => setCreateStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="LOCKED">Đã khóa</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Ghi chú CSKH (Nội bộ Admin)</label>
                <textarea
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  rows={2}
                  placeholder="Khách quen Zalo, hay thuê tướng Tí Nị,..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Tạo Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. MODAL: CHỈNH SỬA THÔNG TIN ──────────────────────────────── */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Chỉnh Sửa Khách Hàng: {editingCustomer.username}
                </h3>
                <p className="text-xs text-slate-500">Cập nhật họ tên, Zalo và ghi chú chăm sóc khách hàng.</p>
              </div>
              <button onClick={() => setEditingCustomer(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Họ và tên</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Họ và tên..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Số điện thoại / Zalo</label>
                  <input
                    type="text"
                    value={editZalo}
                    onChange={(e) => setEditZalo(e.target.value)}
                    placeholder="0352..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Trạng thái tài khoản</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="LOCKED">Đã khóa</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Ghi chú CSKH (Nội bộ Admin)</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú nội bộ..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. MODAL: ĐỔI MẬT KHẨU TẠM ─────────────────────────────────── */}
      {resettingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Đặt lại mật khẩu: {resettingCustomer.username}
              </h3>
              <p className="text-xs text-slate-500">
                Nhập mật khẩu mới cho khách hàng. Mật khẩu sẽ được mã hóa an toàn trên hệ thống.
              </p>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-3">
              <div className="space-y-1">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới (ít nhất 6 ký tự)..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingCustomer(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Đang lưu..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. MODAL CONFIRMATION: KHÓA / MỞ KHÓA ─────────────────────── */}
      {toggleLockCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
              toggleLockCustomer.status === "ACTIVE" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
            }`}>
              {toggleLockCustomer.status === "ACTIVE" ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {toggleLockCustomer.status === "ACTIVE"
                  ? `Khóa tài khoản "${toggleLockCustomer.username}"?`
                  : `Mở khóa tài khoản "${toggleLockCustomer.username}"?`}
              </h3>
              <p className="text-xs text-slate-500">
                {toggleLockCustomer.status === "ACTIVE"
                  ? "Khi bị khóa, khách hàng sẽ không thể đăng nhập vào hệ thống Member. Lịch sử thuê trước đó vẫn được giữ nguyên."
                  : "Khách hàng sẽ có thể đăng nhập bình thường sau khi mở khóa."}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setToggleLockCustomer(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleLock}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                  toggleLockCustomer.status === "ACTIVE"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionLoading ? "Đang xử lý..." : toggleLockCustomer.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. DRAWER: CHI TIẾT KHÁCH HÀNG & LỊCH SỬ THUÊ ────────────── */}
      {detailCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="w-full max-w-lg h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-base text-slate-900">Chi Tiết Khách Hàng</span>
                <AccountStatusBadge status={detailCustomer.member.status} />
              </div>
              <button
                onClick={() => setDetailCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Account info section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Thông Tin Tài Khoản
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tên đăng nhập:</span>
                    <span className="font-mono font-bold text-slate-900">{detailCustomer.member.username}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mã định danh (ID):</span>
                    <span className="font-mono text-slate-500 text-[11px]">{detailCustomer.member.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ngày tạo:</span>
                    <span className="font-mono text-slate-700">{formatDate(detailCustomer.member.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Đăng nhập gần nhất:</span>
                    <span className="font-mono text-slate-700">{formatDate(detailCustomer.member.lastLoginAt)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Care info section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Thông Tin Chăm Sóc Khách Hàng (CSKH)
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="font-bold text-slate-900">
                      {detailCustomer.member.full_name || <span className="text-slate-400 font-normal italic">Chưa bổ sung</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Zalo liên hệ:</span>
                    {detailCustomer.member.zalo ? (
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-900">
                        <span>{detailCustomer.member.zalo}</span>
                        <button
                          onClick={() => copyToClipboard(detailCustomer.member.zalo!, "detail-zalo")}
                          className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                          title="Sao chép Zalo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {detailCustomer.member.zalo.replace(/\D/g, "").length >= 9 && (
                          <a
                            href={`https://zalo.me/${detailCustomer.member.zalo.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                            title="Mở Zalo"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa có</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Real Summary Stats */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Thống Kê Thuê Acc Thực Tế
                </h4>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900 leading-none">{detailCustomer.stats.rentalCount}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Lượt thuê</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-lg font-bold text-slate-900 leading-none">{formatVND(detailCustomer.stats.totalRentalSpent)}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Tổng giá trị</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {detailCustomer.stats.lastRentalDate ? formatDate(detailCustomer.stats.lastRentalDate).split(" ")[0] : "Chưa có"}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Lần gần nhất</p>
                  </div>
                </div>
              </div>

              {/* Linked Rental History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Lịch Sử Thuê Acc ({detailCustomer.rentals.length})
                  </h4>
                  <Link
                    href={`/admin/rentals?search=${encodeURIComponent(detailCustomer.member.username)}`}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Xem trên module Lượt Thuê ↗
                  </Link>
                </div>

                {detailCustomer.rentals.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                    Khách hàng chưa có lịch sử thuê tài khoản nào.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {detailCustomer.rentals.map((r) => (
                      <div key={r.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900">{r.accountCode}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                              {r.package}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{r.accountTitle}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {formatDate(r.startedAt || r.createdAt)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-mono font-bold text-slate-900 block">{formatVND(r.amount)}</span>
                          <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            r.status === "RENTING"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : r.status === "COMPLETED"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {r.status === "RENTING" ? "Đang thuê" : r.status === "COMPLETED" ? "Đã xong" : r.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Private Admin Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Ghi Chú Admin (Nội Bộ)
                  </h4>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Bảo mật nội bộ
                  </span>
                </div>
                <div className="space-y-2">
                  <textarea
                    defaultValue={detailCustomer.member.notes || ""}
                    id="admin-detail-note"
                    rows={3}
                    placeholder="Ghi chú sở thích, thói quen, độ uy tín của khách..."
                    className="w-full px-3.5 py-2.5 text-xs bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:border-slate-900 resize-none text-slate-900"
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById("admin-detail-note") as HTMLTextAreaElement;
                      if (el) handleSaveDetailNote(el.value);
                    }}
                    className="px-3 py-1.5 bg-[#111111] hover:bg-[#222222] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Lưu ghi chú CSKH
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  const m = detailCustomer.member;
                  setDetailCustomer(null);
                  setEditingCustomer({
                    ...m,
                    rentalCount: detailCustomer.stats.rentalCount,
                    activeRentalCount: 0,
                    profileStatus: m.full_name && m.zalo ? "COMPLETE" : "MISSING_BOTH",
                  });
                  setEditFullName(m.full_name || "");
                  setEditZalo(m.zalo || "");
                  setEditStatus(m.status);
                  setEditNotes(m.notes || "");
                }}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Chỉnh sửa
              </button>

              <button
                onClick={() => {
                  const m = detailCustomer.member;
                  setDetailCustomer(null);
                  setResettingCustomer({
                    ...m,
                    rentalCount: detailCustomer.stats.rentalCount,
                    activeRentalCount: 0,
                    profileStatus: m.full_name && m.zalo ? "COMPLETE" : "MISSING_BOTH",
                  });
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Đổi mật khẩu
              </button>

              <button
                onClick={() => {
                  const m = detailCustomer.member;
                  setDetailCustomer(null);
                  setToggleLockCustomer({
                    ...m,
                    rentalCount: detailCustomer.stats.rentalCount,
                    activeRentalCount: 0,
                    profileStatus: m.full_name && m.zalo ? "COMPLETE" : "MISSING_BOTH",
                  });
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  detailCustomer.member.status === "ACTIVE"
                    ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                {detailCustomer.member.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
              </button>

              <button
                onClick={() => setDetailCustomer(null)}
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

// ─── Default Page Export with Suspense ──────────────────────────────────────

export default function AdminCustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Đang tải Khách Hàng...</p>
        </div>
      }
    >
      <AdminCustomersContent />
    </Suspense>
  );
}
