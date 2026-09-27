"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { SafeMember } from "@/utils/members-service";

export default function AdminUsersPage() {
  const [members, setMembers] = useState<SafeMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "LOCKED">("ALL");
  const [profileFilter, setProfileFilter] = useState<"ALL" | "COMPLETED" | "INCOMPLETE">("ALL");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "name" | "lastLogin">("newest");
  const [copiedZaloId, setCopiedZaloId] = useState<string | null>(null);

  // Modal Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createFullName, setCreateFullName] = useState("");
  const [createZalo, setCreateZalo] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [createStatus, setCreateStatus] = useState<"ACTIVE" | "LOCKED">("ACTIVE");
  const [isCreating, setIsCreating] = useState(false);

  // Modal Edit
  const [editingMember, setEditingMember] = useState<SafeMember | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editZalo, setEditZalo] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "LOCKED">("ACTIVE");
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal Reset Password
  const [resetMember, setResetMember] = useState<SafeMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Modal Delete
  const [deletingMember, setDeletingMember] = useState<SafeMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getAdminHeaders = () => {
    const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
    return {
      "Content-Type": "application/json",
      ...(localToken ? { "x-admin-token": localToken } : {}),
    };
  };

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users", {
        headers: getAdminHeaders(),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMembers(json.data);
      } else {
        toast.error(json.message || "Không thể tải danh sách thành viên.");
      }
    } catch {
      toast.error("Lỗi kết nối khi tải danh sách thành viên.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleCopyZalo = (id: string, zaloNumber: string) => {
    if (!zaloNumber) return;
    navigator.clipboard.writeText(zaloNumber);
    setCopiedZaloId(id);
    toast.success("Đã sao chép");
    setTimeout(() => {
      setCopiedZaloId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const formatLastLogin = (dateStr?: string | null) => {
    if (!dateStr) return "Chưa đăng nhập";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Chưa đăng nhập";
      return d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Chưa đăng nhập";
    }
  };

  // Filter members
  const filteredMembers = members
    .filter((m) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        m.username.toLowerCase().includes(term) ||
        (m.full_name && m.full_name.toLowerCase().includes(term)) ||
        (m.zalo && m.zalo.toLowerCase().includes(term)) ||
        (m.notes && m.notes.toLowerCase().includes(term));

      const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;

      const isCompleted = Boolean(m.full_name?.trim() && m.zalo?.trim());
      const matchesProfile =
        profileFilter === "ALL" ||
        (profileFilter === "COMPLETED" && isCompleted) ||
        (profileFilter === "INCOMPLETE" && !isCompleted);

      return matchesSearch && matchesStatus && matchesProfile;
    })
    .sort((a, b) => {
      if (sortOption === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortOption === "name") {
        return (a.full_name || a.username).localeCompare(b.full_name || b.username);
      }
      if (sortOption === "lastLogin") {
        return new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime();
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const activeCount = members.filter((m) => m.status === "ACTIVE").length;
  const lockedCount = members.filter((m) => m.status === "LOCKED").length;

  // Handle Create Member
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUsername.trim() || !createPassword.trim()) {
      toast.error("Vui lòng nhập Tên đăng nhập và Mật khẩu!");
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Đang tạo tài khoản...");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          username: createUsername.trim(),
          password: createPassword.trim(),
          full_name: createFullName.trim(),
          zalo: createZalo.trim(),
          notes: createNotes.trim(),
          status: createStatus,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Đã tạo thành viên "${createUsername}" thành công!`, { id: toastId });
        setIsCreateModalOpen(false);
        setCreateUsername("");
        setCreatePassword("");
        setCreateFullName("");
        setCreateZalo("");
        setCreateNotes("");
        setCreateStatus("ACTIVE");
        loadMembers();
      } else {
        toast.error(json.message || "Tạo thành viên thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi máy chủ khi tạo thành viên!", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (m: SafeMember) => {
    setEditingMember(m);
    setEditFullName(m.full_name || "");
    setEditZalo(m.zalo || "");
    setEditStatus(m.status);
    setEditNotes(m.notes || "");
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setIsUpdating(true);
    const toastId = toast.loading("Đang cập nhật thông tin...");

    try {
      const res = await fetch(`/api/admin/users/${editingMember.id}`, {
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
        toast.success("Cập nhật thành công!", { id: toastId });
        setEditingMember(null);
        loadMembers();
      } else {
        toast.error(json.message || "Cập nhật thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi máy chủ khi cập nhật!", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle Lock/Unlock
  const handleToggleLock = async (m: SafeMember) => {
    const newStatus = m.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    const label = newStatus === "LOCKED" ? "Khóa" : "Mở khóa";
    const toastId = toast.loading(`Đang ${label} tài khoản...`);

    try {
      const res = await fetch(`/api/admin/users/${m.id}`, {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Đã ${label} tài khoản "${m.username}"!`, { id: toastId });
        loadMembers();
      } else {
        toast.error(json.message || "Thao tác thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi máy chủ!", { id: toastId });
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetMember) return;
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setIsResetting(true);
    const toastId = toast.loading("Đang đặt lại mật khẩu...");

    try {
      const res = await fetch(`/api/admin/users/${resetMember.id}`, {
        method: "PUT",
        headers: getAdminHeaders(),
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Đã đổi mật khẩu cho "${resetMember.username}" thành công!`, { id: toastId });
        setResetMember(null);
        setNewPassword("");
      } else {
        toast.error(json.message || "Đổi mật khẩu thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi máy chủ khi đổi mật khẩu!", { id: toastId });
    } finally {
      setIsResetting(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async () => {
    if (!deletingMember) return;

    setIsDeleting(true);
    const toastId = toast.loading("Đang xóa thành viên...");

    try {
      const res = await fetch(`/api/admin/users/${deletingMember.id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Đã xóa tài khoản "${deletingMember.username}"!`, { id: toastId });
        setDeletingMember(null);
        loadMembers();
      } else {
        toast.error(json.message || "Xóa thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi máy chủ khi xóa!", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Quản Lý Thành Viên
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {members.length} Khách
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tài khoản do Admin cấp trực tiếp. Bổ sung Họ tên & Zalo sau lần đăng nhập đầu tiên.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cấp Tài Khoản Mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng thành viên</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{members.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Đang hoạt động</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Tài khoản bị khóa</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{lockedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo username, họ tên, Zalo, ghi chú..."
              className="w-full h-10 pl-9.5 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
            </select>

            {/* Profile Filter */}
            <select
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="ALL">Tất cả hồ sơ</option>
              <option value="COMPLETED">Đã hoàn tất</option>
              <option value="INCOMPLETE">Chưa hoàn tất</option>
            </select>

            {/* Sort Option */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium focus:outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Họ tên A-Z</option>
              <option value="lastLogin">Đăng nhập gần nhất</option>
            </select>

            <span className="text-xs text-slate-500 ml-2 hidden lg:inline">
              <strong>{filteredMembers.length}</strong> / {members.length}
            </span>
          </div>
        </div>

        {/* Member Table */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
            <span className="text-xs">Đang tải danh sách thành viên...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-700">Không tìm thấy thành viên nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Thử thay đổi bộ lọc hoặc bấm "Cấp Tài Khoản Mới" để tạo tài khoản mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Tài Khoản</th>
                  <th className="py-3 px-4">Họ Và Tên</th>
                  <th className="py-3 px-4">Số Zalo</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Ngày Tạo</th>
                  <th className="py-3 px-4">Lần Đăng Nhập Gần Nhất</th>
                  <th className="py-3 px-4">Ghi Chú Nội Bộ</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMembers.map((m) => {
                  const isLocked = m.status === "LOCKED";
                  const isCopied = copiedZaloId === m.id;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Username */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        @{m.username}
                      </td>

                      {/* Full Name */}
                      <td className="py-3.5 px-4">
                        {m.full_name ? (
                          <span className="font-medium text-slate-900">{m.full_name}</span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                            Chưa bổ sung
                          </span>
                        )}
                      </td>

                      {/* Zalo with Copy button */}
                      <td className="py-3.5 px-4">
                        {m.zalo ? (
                          <div className="inline-flex items-center gap-1.5">
                            <a
                              href={`https://zalo.me/${m.zalo.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                              title="Mở Zalo"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{m.zalo}</span>
                            </a>
                            <button
                              onClick={() => handleCopyZalo(m.id, m.zalo!)}
                              title="Sao chép Zalo"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa có</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <Lock className="w-3 h-3" />
                            <span>Bị khóa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Hoạt động</span>
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(m.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Last Login At */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {m.lastLoginAt ? (
                          <span className="text-slate-700 font-mono">
                            {formatLastLogin(m.lastLoginAt)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa đăng nhập</span>
                        )}
                      </td>

                      {/* Internal Notes */}
                      <td className="py-3.5 px-4 max-w-[180px] truncate text-slate-600 text-[11px]" title={m.notes || ""}>
                        {m.notes || <span className="text-slate-300">-</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* Toggle Lock */}
                          <button
                            onClick={() => handleToggleLock(m)}
                            title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLocked
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-rose-600"
                            }`}
                          >
                            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResetMember(m);
                              setNewPassword("");
                            }}
                            title="Đặt lại mật khẩu"
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(m)}
                            title="Sửa thông tin"
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Member */}
                          <button
                            onClick={() => setDeletingMember(m)}
                            title="Xóa tài khoản"
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ============================================================ */}
      {/* MODAL: TẠO TÀI KHOẢN MỚI                                     */}
      {/* ============================================================ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <UserPlus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Cấp Tài Khoản Thành Viên Mới</h3>
                  <p className="text-[11px] text-slate-500">Khách sẽ đăng nhập và bổ sung Họ tên + Zalo nếu chưa có</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    placeholder="vd: tuantft2026..."
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu ban đầu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    required
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    placeholder="vd: Nguyễn Văn A..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Zalo (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={createZalo}
                    onChange={(e) => setCreateZalo(e.target.value)}
                    placeholder="vd: 0352867283..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={createStatus}
                  onChange={(e) => setCreateStatus(e.target.value as "ACTIVE" | "LOCKED")}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="LOCKED">Bị khóa (LOCKED)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú nội bộ (Chỉ Admin thấy)
                </label>
                <input
                  type="text"
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="Ghi chú về khách hàng, acc đã thuê, ưu đãi..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? "Đang tạo..." : "Xác Nhận Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SỬA THÔNG TIN THÀNH VIÊN                              */}
      {/* ============================================================ */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Sửa Thông Tin Thành Viên</h3>
                  <p className="text-[11px] text-slate-500 font-mono">@{editingMember.username}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Họ và tên khách..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Zalo
                  </label>
                  <input
                    type="text"
                    value={editZalo}
                    onChange={(e) => setEditZalo(e.target.value)}
                    placeholder="Số Zalo..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái tài khoản
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as "ACTIVE" | "LOCKED")}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                >
                  <option value="ACTIVE">Hoạt động (Khách đăng nhập bình thường)</option>
                  <option value="LOCKED">Khóa tài khoản (Chặn đăng nhập)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú nội bộ (Chỉ Admin thấy)
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ghi chú về khách hàng..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: RESET PASSWORD                                        */}
      {/* ============================================================ */}
      {resetMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Đặt Lại Mật Khẩu</h3>
                  <p className="text-[11px] text-slate-500 font-mono">@{resetMember.username}</p>
                </div>
              </div>
              <button
                onClick={() => setResetMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  required
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetMember(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? "Đang đặt..." : "Xác Nhận Đổi Mật Khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: XÓA THÀNH VIÊN                                        */}
      {/* ============================================================ */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-center font-bold text-slate-900 text-base">Xóa Tài Khoản Này?</h3>
            <p className="text-center text-xs text-slate-500 mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản <strong className="font-mono text-slate-800">@{deletingMember.username}</strong>?
              Thao tác này không thể hoàn tác.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteMember}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xác Nhận Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
