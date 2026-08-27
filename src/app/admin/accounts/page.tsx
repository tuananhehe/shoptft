"use client";

import React, { useState, useMemo } from "react";
import { TFT_RENTAL_ACCOUNTS, TFTRentalAccount } from "@/data/tft-data";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  Eye,
  AlertTriangle,
  X,
  Calendar,
  DollarSign,
  Filter,
  Layers,
  ArrowUpDown,
  Upload,
  Tag,
  Check,
} from "lucide-react";

interface AdminAccount extends TFTRentalAccount {
  rentedUntil?: string; // ISO string format thời gian trả acc
}

export default function AdminAccountsPage() {
  // Khởi tạo state với dữ liệu mock chuẩn từ tft-data
  const [accounts, setAccounts] = useState<AdminAccount[]>(TFT_RENTAL_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "RENTED">("ALL");
  const [rankFilter, setRankFilter] = useState("ALL");

  // State cho Modal Cập Nhật Trạng Thái Đang Thuê
  const [statusModalAccount, setStatusModalAccount] = useState<AdminAccount | null>(null);
  const [quickDurationHours, setQuickDurationHours] = useState<number>(2);
  const [customEndTime, setCustomEndTime] = useState<string>("");

  // State cho Drawer Thêm / Sửa Acc
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);

  // Form State bên trong Drawer
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formRank, setFormRank] = useState<AdminAccount["rank"]>("THÁCH ĐẤU");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formAccountValue, setFormAccountValue] = useState<number>(850000);
  const [formHourlyPrice, setFormHourlyPrice] = useState<number>(15000);
  const [formMainChibi, setFormMainChibi] = useState("");
  const [formAllChibi, setFormAllChibi] = useState<string[]>([]);
  const [formChibiInput, setFormChibiInput] = useState("");
  const [formMainArena, setFormMainArena] = useState("");
  const [formAllArenas, setFormAllArenas] = useState<string[]>([]);
  const [formArenaInput, setFormArenaInput] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = accounts.length;
    const available = accounts.filter((a) => a.status === "AVAILABLE").length;
    const rented = accounts.filter((a) => a.status === "RENTED").length;
    const totalValue = accounts.reduce(
      (sum, a) => sum + (a.accountValue || a.dailyPrice * 16 || 850000),
      0
    );
    return { total, available, rented, totalValue };
  }, [accounts]);

  // Bộ lọc danh sách tài khoản
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        searchTerm.trim() === "" ||
        acc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.mainChibi.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || acc.status === statusFilter;

      const matchRank =
        rankFilter === "ALL" || acc.rank === rankFilter;

      return matchSearch && matchStatus && matchRank;
    });
  }, [accounts, searchTerm, statusFilter, rankFilter]);

  // ============================================================
  // LOGIC 1: TOGGLE TRẠNG THÁI & MODAL NHẬP THỜI GIAN THUÊ
  // ============================================================
  const handleToggleStatus = (account: AdminAccount) => {
    if (account.status === "AVAILABLE") {
      // Đang sẵn sàng -> Bật Modal để nhập thời gian kết thúc thuê
      setStatusModalAccount(account);
      // Mặc định +2 giờ
      const defaultDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
      setCustomEndTime(defaultDate.toISOString().slice(0, 16));
      setQuickDurationHours(2);
    } else {
      // Đang có khách thuê -> Gạt về Sẵn Sàng ngay lập tức
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id
            ? { ...a, status: "AVAILABLE", rentedUntil: undefined }
            : a
        )
      );
      showToast(`Đã chuyển tài khoản ${account.code} sang trạng thái SẴN SÀNG!`);
    }
  };

  // Áp dụng thời gian thuê nhanh (+2h, +7d, +30d)
  const applyQuickDuration = (hours: number) => {
    setQuickDurationHours(hours);
    const targetDate = new Date(Date.now() + hours * 60 * 60 * 1000);
    setCustomEndTime(targetDate.toISOString().slice(0, 16));
  };

  // Xác nhận chuyển trạng thái sang Đang Thuê kèm End Time
  const confirmRentedStatus = () => {
    if (!statusModalAccount) return;

    const endTimeDate = customEndTime ? new Date(customEndTime) : new Date(Date.now() + quickDurationHours * 3600000);

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === statusModalAccount.id
          ? {
              ...a,
              status: "RENTED",
              rentedUntil: endTimeDate.toISOString(),
            }
          : a
      )
    );

    showToast(
      `Đã chuyển ${statusModalAccount.code} sang ĐANG THUÊ đến ${endTimeDate.toLocaleDateString("vi-VN")} ${endTimeDate.toLocaleTimeString("vi-VN")}`
    );
    setStatusModalAccount(null);
  };

  // ============================================================
  // LOGIC 2: DRAWER THÊM / SỬA TÀI KHOẢN
  // ============================================================
  const openCreateDrawer = () => {
    setEditingAccount(null);
    setFormCode(`MS: ${Math.floor(1000 + Math.random() * 9000)}`);
    setFormTitle("");
    setFormRank("THÁCH ĐẤU");
    setFormThumbnail(
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"
    );
    setFormAccountValue(850000);
    setFormHourlyPrice(15000);
    setFormMainChibi("Tí Nị Ahri Chiêu Hồn");
    setFormAllChibi(["Tí Nị Ahri Chiêu Hồn Tinh Quái", "Tí Nị Yasuo Chân Long Kiếm"]);
    setFormMainArena("Sân Đấu Thần Thoại Tiệm Trà Tâm Linh");
    setFormAllArenas(["Sân Đấu Thần Thoại Tiệm Trà Tâm Linh"]);
    setFormDescription("Tài khoản TFT Thần Thoại full tướng Tí Nị HOT nhất.");
    setDrawerOpen(true);
  };

  const openEditDrawer = (account: AdminAccount) => {
    setEditingAccount(account);
    setFormCode(account.code);
    setFormTitle(account.title);
    setFormRank(account.rank);
    setFormThumbnail(account.thumbnail);
    setFormAccountValue(account.accountValue || account.dailyPrice * 16 || 850000);
    setFormHourlyPrice(account.hourlyPrice);
    setFormMainChibi(account.mainChibi);
    setFormAllChibi(account.allChibi || []);
    setFormMainArena(account.mainArena);
    setFormAllArenas(account.allArenas || []);
    setFormDescription(account.description);
    setDrawerOpen(true);
  };

  const handleAddChibiTag = () => {
    if (formChibiInput.trim()) {
      setFormAllChibi((prev) => [...prev, formChibiInput.trim()]);
      setFormChibiInput("");
    }
  };

  const handleRemoveChibiTag = (index: number) => {
    setFormAllChibi((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddArenaTag = () => {
    if (formArenaInput.trim()) {
      setFormAllArenas((prev) => [...prev, formArenaInput.trim()]);
      setFormArenaInput("");
    }
  };

  const handleRemoveArenaTag = (index: number) => {
    setFormAllArenas((prev) => prev.filter((_, i) => i !== index));
  };

  // Lưu Form Thêm / Sửa
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCode || !formTitle) {
      alert("Vui lòng điền đầy đủ Mã Acc và Tiêu đề!");
      return;
    }

    if (editingAccount) {
      // Chế độ Sửa
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === editingAccount.id
            ? {
                ...a,
                code: formCode,
                title: formTitle,
                rank: formRank,
                thumbnail: formThumbnail,
                accountValue: formAccountValue,
                hourlyPrice: formHourlyPrice,
                dailyPrice: Math.round((formAccountValue * 0.08) / 1000) * 1000,
                mainChibi: formMainChibi || formAllChibi[0] || "Tí Nị TFT",
                allChibi: formAllChibi,
                mainArena: formMainArena || formAllArenas[0] || "Sân Đấu Thần Thoại",
                allArenas: formAllArenas,
                description: formDescription,
              }
            : a
        )
      );
      showToast(`Đã cập nhật thành công tài khoản ${formCode}!`);
    } else {
      // Chế độ Thêm Mới
      const newAcc: AdminAccount = {
        id: `rent-${Date.now()}`,
        code: formCode,
        title: formTitle,
        rank: formRank,
        rankColor: "text-amber-400 border-amber-500/50 bg-amber-500/10",
        rankBadgeBg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
        thumbnail: formThumbnail,
        accountValue: formAccountValue,
        hourlyPrice: formHourlyPrice,
        dailyPrice: Math.round((formAccountValue * 0.08) / 1000) * 1000,
        nightPrice: Math.round((formAccountValue * 0.06) / 1000) * 1000,
        status: "AVAILABLE",
        totalLittleLegends: formAllChibi.length * 8,
        totalArenas: formAllArenas.length * 4,
        totalBooms: 24,
        mainChibi: formMainChibi || formAllChibi[0] || "Tí Nị TFT",
        allChibi: formAllChibi,
        mainArena: formMainArena || formAllArenas[0] || "Sân Đấu Thần Thoại",
        allArenas: formAllArenas,
        description: formDescription,
        tag: "MỚI",
      };

      setAccounts((prev) => [newAcc, ...prev]);
      showToast(`Đã thêm mới tài khoản ${formCode} vào kho!`);
    }

    setDrawerOpen(false);
  };

  // Xóa Acc
  const handleDeleteAccount = (id: string, code: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${code} khỏi hệ thống?`)) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast(`Đã xóa tài khoản ${code} thành công.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST THÔNG BÁO */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. SECTION STATS TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Tổng Tài Khoản
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {stats.total} <span className="text-xs text-slate-500 font-normal">Acc</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Sẵn Sàng Cho Thuê
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
              {stats.available} <span className="text-xs text-slate-500 font-normal">Acc</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Đang Có Khách Thuê
            </span>
            <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">
              {stats.rented} <span className="text-xs text-slate-500 font-normal">Acc</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Tổng Giá Trị Kho
            </span>
            <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
              {stats.totalValue.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. FILTER BAR & ACTIONS */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Ô Tìm Kiếm */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã acc, tên, tí nị..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Lọc Trạng Thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">🟢 Sẵn Sàng ({stats.available})</option>
            <option value="RENTED">🔴 Đang Thuê ({stats.rented})</option>
          </select>

          {/* Lọc Rank */}
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">Tất cả bậc Rank</option>
            <option value="THÁCH ĐẤU">Thách Đấu</option>
            <option value="ĐẠI CAO THỦ">Đại Cao Thủ</option>
            <option value="CAO THỦ">Cao Thủ</option>
            <option value="KIM CƯƠNG">Kim Cương</option>
            <option value="LỤC BẢO">Lục Bảo</option>
          </select>
        </div>

        {/* NÚT + THÊM ACC MỚI */}
        <button
          onClick={openCreateDrawer}
          className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Acc Mới</span>
        </button>
      </div>

      {/* 3. TABLE DANH SÁCH TÀI KHOẢN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Acc</th>
                <th className="py-3.5 px-4">Hình Ảnh</th>
                <th className="py-3.5 px-4 min-w-[220px]">Chi Tiết Tài Khoản</th>
                <th className="py-3.5 px-4">Giá Trị Gốc</th>
                <th className="py-3.5 px-4">Giá Thuê / Giờ</th>
                <th className="py-3.5 px-4">Trạng Thái (Gạt Bật/Tắt)</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => {
                  const isRented = account.status === "RENTED";
                  const baseVal =
                    account.accountValue || account.dailyPrice * 16 || 850000;

                  return (
                    <tr
                      key={account.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Cột 1: Mã Acc */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs">
                          {account.code}
                        </span>
                      </td>

                      {/* Cột 2: Hình Ảnh Vuông */}
                      <td className="py-4 px-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0 shadow-sm">
                          <img
                            src={account.thumbnail}
                            alt={account.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Cột 3: Chi Tiết */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-700 border border-orange-200">
                              {account.rank}
                            </span>
                            <span className="text-[11px] font-bold text-slate-600">
                              ⭐ {account.mainChibi}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {account.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            🏟️ {account.mainArena}
                          </p>
                        </div>
                      </td>

                      {/* Cột 4: Giá Trị Gốc */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        {baseVal.toLocaleString("vi-VN")}đ
                      </td>

                      {/* Cột 5: Giá Thuê Giờ */}
                      <td className="py-4 px-4 font-mono font-bold text-red-600 text-sm">
                        {account.hourlyPrice.toLocaleString("vi-VN")}đ
                      </td>

                      {/* Cột 6: Trạng Thái & NÚT GẠT (SWITCH TOGGLE) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {/* Switch Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(account)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isRented ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                            title="Bấm để đổi trạng thái"
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isRented ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>

                          {/* Label Trạng Thái */}
                          {isRented ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px] uppercase block">
                                Đang Thuê
                              </span>
                              {account.rentedUntil && (
                                <span className="text-[9px] text-slate-500 block mt-0.5">
                                  Hết:{" "}
                                  {new Date(account.rentedUntil).toLocaleTimeString(
                                    "vi-VN",
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                              Sẵn Sàng
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 7: Thao Tác Sửa / Xóa */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditDrawer(account)}
                            className="p-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 rounded-lg transition-colors"
                            title="Chỉnh sửa acc"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAccount(account.id, account.code)
                            }
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg transition-colors"
                            title="Xóa acc"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. POPUP MODAL NHẬP THỜI GIAN KẾT THÚC (KHI GẠT SANG ĐANG THUÊ)*/}
      {/* ============================================================ */}
      {statusModalAccount && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Cập Nhật Trạng Thái Đang Thuê
                  </h3>
                  <span className="text-xs text-orange-600 font-bold font-mono">
                    {statusModalAccount.code} - {statusModalAccount.title}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStatusModalAccount(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Các Nút Chọn Thời Gian Nhanh */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                1. Chọn nhanh thời gian thuê:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyQuickDuration(2)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                    quickDurationHours === 2
                      ? "bg-orange-600 text-white border-orange-600 shadow-md"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  ⚡ +2 Giờ
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickDuration(168)} // 7 ngày = 168h
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                    quickDurationHours === 168
                      ? "bg-orange-600 text-white border-orange-600 shadow-md"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  📅 +7 Ngày
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickDuration(720)} // 30 ngày = 720h
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                    quickDurationHours === 720
                      ? "bg-orange-600 text-white border-orange-600 shadow-md"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  🌙 +30 Ngày
                </button>
              </div>
            </div>

            {/* Chọn Ngày & Giờ Tùy Chỉnh */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                2. Hoặc tùy chỉnh ngày & giờ kết thúc:
              </label>
              <input
                type="datetime-local"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500 shadow-sm"
              />
              <p className="text-[11px] text-slate-500">
                * Dữ liệu thời gian này sẽ được lưu vào thuộc tính{" "}
                <code className="text-orange-600 font-mono font-bold">rentedUntil</code> để
                Frontend tự động đếm ngược theo thời gian thực.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalAccount(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={confirmRentedStatus}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all"
              >
                Xác Nhận Khách Thuê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. SLIDE-OVER DRAWER THÊM / SỬA ACC (VUỐT TỪ PHẢI SANG)      */}
      {/* ============================================================ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
              {/* Drawer Form */}
              <form onSubmit={handleSaveAccount} className="flex-1 flex flex-col justify-between">
                {/* Header */}
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {editingAccount ? "Chỉnh Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        Nhập thông tin chi tiết vào kho cho thuê
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="p-6 space-y-5 flex-1 overflow-y-auto text-xs">
                  {/* Mã Acc & Bậc Rank */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">
                        Mã Số Acc: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value)}
                        placeholder="VD: MS: 8899"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">
                        Bậc Rank: <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formRank}
                        onChange={(e) => setFormRank(e.target.value as any)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                      >
                        <option value="THÁCH ĐẤU">Thách Đấu</option>
                        <option value="ĐẠI CAO THỦ">Đại Cao Thủ</option>
                        <option value="CAO THỦ">Cao Thủ</option>
                        <option value="KIM CƯƠNG">Kim Cương</option>
                        <option value="LỤC BẢO">Lục Bảo</option>
                        <option value="VÀNG/BẠCH KIM">Vàng / Bạch Kim</option>
                      </select>
                    </div>
                  </div>

                  {/* Tên mô tả ngắn */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">
                      Tiêu Đề / Tên Acc: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="VD: Acc Thách Đấu VIP - Tí Nị Ahri + Yasuo Chân Long"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Giá Trị Gốc & Giá Thuê Giờ */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">
                        Giá Trị Gốc Tài Khoản (VNĐ):
                      </label>
                      <input
                        type="number"
                        step="10000"
                        value={formAccountValue}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormAccountValue(val);
                          // Gợi ý giá thuê giờ ~1.5%
                          setFormHourlyPrice(Math.round((val * 0.015) / 1000) * 1000);
                        }}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">
                        Giá Thuê / Giờ (VNĐ):
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={formHourlyPrice}
                        onChange={(e) => setFormHourlyPrice(Number(e.target.value))}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-red-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Hình ảnh Thumbnail */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">
                      URL Hình Ảnh (Khung Vuông):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formThumbnail}
                        onChange={(e) => setFormThumbnail(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    {formThumbnail && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 mt-2 shadow-sm">
                        <img
                          src={formThumbnail}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tags Tướng Tí Nị (Multi-select) */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 block">
                      Danh Sách Tướng Tí Nị Trong Acc:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formChibiInput}
                        onChange={(e) => setFormChibiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddChibiTag();
                          }
                        }}
                        placeholder="Nhập tên tướng và ấn Thêm (VD: Tí Nị Ahri Tinh Quái)"
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddChibiTag}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold"
                      >
                        Thêm
                      </button>
                    </div>

                    {/* Danh sách Tag đã thêm */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formAllChibi.map((chibi, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 font-medium text-[11px]"
                        >
                          <span>{chibi}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChibiTag(idx)}
                            className="hover:text-red-600 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags Sân Đấu Thần Thoại (Multi-select) */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 block">
                      Danh Sách Sân Đấu Thần Thoại:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formArenaInput}
                        onChange={(e) => setFormArenaInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddArenaTag();
                          }
                        }}
                        placeholder="Nhập tên sân đấu (VD: Sân Đấu Tiệm Trà Tâm Linh)"
                        className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddArenaTag}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold"
                      >
                        Thêm
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formAllArenas.map((arena, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-[11px]"
                        >
                          <span>{arena}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveArenaTag(idx)}
                            className="hover:text-red-600 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mô tả chi tiết */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">
                      Mô Tả & Ghi Chú:
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Mô tả chi tiết linh thú, chưởng lực, sàn đấu..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Footer Drawer */}
                <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-600/20 transition-all hover:scale-105"
                  >
                    {editingAccount ? "Lưu Thay Đổi" : "Tạo Tài Khoản Mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
