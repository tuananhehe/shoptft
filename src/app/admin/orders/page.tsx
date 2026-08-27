"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { PROFILE_INFO, TFT_RENTAL_ACCOUNTS } from "@/data/tft-data";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  customer: string;
  phoneZalo: string;
  accountCode: string;
  accountTitle: string;
  package: string;
  amount: number;
  status: "COMPLETED" | "RENTING" | "PENDING";
  statusLabel: string;
  date: string;
  expiresAt?: string;
  accountLogin: string;
  accountPass: string;
  notes?: string;
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // State danh sách đơn hàng
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: "ORD-9821",
      customer: "Nguyễn Hoàng Long",
      phoneZalo: "0987.123.889",
      accountCode: "MS: 8899",
      accountTitle: "Acc Thách Đấu - Ahri Chiêu Hồn",
      package: "2 Giờ Trải Nghiệm",
      amount: 49000,
      status: "COMPLETED",
      statusLabel: "Đã Hoàn Thành",
      date: "27/08/2026 22:45",
      expiresAt: "28/08/2026 00:45",
      accountLogin: "tft_ahri_vip88",
      accountPass: "TuanTFT@8899",
      notes: "Khách đã nhận pass và xác nhận vào được acc.",
    },
    {
      id: "ORD-8842",
      customer: "Trần Minh Đức",
      phoneZalo: "0912.456.778",
      accountCode: "MS: 6632",
      accountTitle: "Acc Đại Cao Thủ - Aatrox Sát Thần",
      package: "Thuê 7 Ngày (1 Tuần)",
      amount: 164000,
      status: "RENTING",
      statusLabel: "Đang Thuê",
      date: "27/08/2026 21:15",
      expiresAt: "03/09/2026 21:15",
      accountLogin: "tft_aatrox_6632",
      accountPass: "TuanTFT@6632",
      notes: "Hết hạn thuê vào ngày 03/09/2026 lúc 21:15. Đã đóng bảo hiểm.",
    },
    {
      id: "ORD-7719",
      customer: "Lê Quốc Bảo",
      phoneZalo: "0934.789.012",
      accountCode: "COACH-01",
      accountTitle: "Coaching 1-1 Bắt Meta ĐTCL",
      package: "Gói 2 Buổi (180 Phút)",
      amount: 300000,
      status: "COMPLETED",
      statusLabel: "Đã Hoàn Thành",
      date: "27/08/2026 19:30",
      accountLogin: "voice_discord",
      accountPass: "discord_coaching",
      notes: "Đã hướng dẫn xoay bài meta Mùa 13.",
    },
    {
      id: "ORD-6620",
      customer: "Hoàng Yến Vy",
      phoneZalo: "0905.678.999",
      accountCode: "MS: 7721",
      accountTitle: "Acc Kim Cương - Gwen Búp Bê",
      package: "2 Giờ Trải Nghiệm",
      amount: 43000,
      status: "COMPLETED",
      statusLabel: "Đã Hoàn Thành",
      date: "26/08/2026 21:40",
      expiresAt: "26/08/2026 23:40",
      accountLogin: "tft_gwen_7721",
      accountPass: "TuanTFT@7721",
      notes: "Khách khen acc mượt, sân khấu đổi nhạc hay.",
    },
    {
      id: "ORD-5510",
      customer: "Vũ Hải Đăng",
      phoneZalo: "0978.333.666",
      accountCode: "MS: 9912",
      accountTitle: "Acc Thách Đấu - Yasuo Chân Long",
      package: "Thuê 30 Ngày (1 Tháng)",
      amount: 360000,
      status: "RENTING",
      statusLabel: "Đang Thuê",
      date: "25/08/2026 14:20",
      expiresAt: "24/09/2026 14:20",
      accountLogin: "tft_yasuo_9912",
      accountPass: "TuanTFT@9912",
      notes: "Gói thuê 1 tháng miễn phí phí đổi pass. Áp dụng bù 70% nâng cấp.",
    },
  ]);

  // Modal Chi Tiết & Bàn Giao
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Modal Tạo Đơn Nhanh
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAccCode, setNewAccCode] = useState(TFT_RENTAL_ACCOUNTS[0]?.code || "MS: 8899");
  const [newPackage, setNewPackage] = useState("2 Giờ Trải Nghiệm");
  const [newAmount, setNewAmount] = useState<number>(49000);
  const [newNotes, setNewNotes] = useState("");

  // Thống kê nhanh
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const rentingOrders = orders.filter((o) => o.status === "RENTING").length;
    const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;
    return { totalOrders, totalRevenue, rentingOrders, completedOrders };
  }, [orders]);

  // Bộ lọc danh sách đơn
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchSearch =
        ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.phoneZalo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || ord.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Copy tin nhắn bàn giao thông tin
  const handleCopyDeliveryMessage = (ord: OrderItem) => {
    const msg = `[BÀN GIAO TÀI KHOẢN TFT MOBILE]
Xin chào ${ord.customer}, ShopTFT gửi bạn thông tin tài khoản:
- Mã Đơn: ${ord.id}
- Mã Acc: ${ord.accountCode} (${ord.accountTitle})
- Tài khoản: ${ord.accountLogin}
- Mật khẩu: ${ord.accountPass}
- Gói thuê: ${ord.package}
${ord.expiresAt ? `- Hạn sử dụng: ${ord.expiresAt}` : ""}
*Lưu ý: Vui lòng không tự ý đổi thông tin hoặc phá rank. Shop bảo hành 100% suốt thời gian thuê!*`;

    navigator.clipboard.writeText(msg);
    toast.success("✅ Đã sao chép tin nhắn bàn giao tài khoản!");
  };

  // Toggle trạng thái đơn hàng (Đang thuê <-> Đã hoàn thành)
  const handleToggleOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const nextStatus: OrderItem["status"] =
            o.status === "RENTING" ? "COMPLETED" : "RENTING";
          const nextLabel =
            nextStatus === "COMPLETED" ? "Đã Hoàn Thành" : "Đang Thuê";
          return { ...o, status: nextStatus, statusLabel: nextLabel };
        }
        return o;
      })
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "RENTING" ? "COMPLETED" : "RENTING",
              statusLabel:
                prev.status === "RENTING" ? "Đã Hoàn Thành" : "Đang Thuê",
            }
          : null
      );
    }

    toast.success("✅ Đã cập nhật trạng thái đơn hàng!");
  };

  // Tạo đơn hàng mới
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer) {
      toast.error("Vui lòng nhập tên khách hàng!");
      return;
    }

    const matchedAcc = TFT_RENTAL_ACCOUNTS.find((a) => a.code === newAccCode);
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrd: OrderItem = {
      id: newId,
      customer: newCustomer,
      phoneZalo: newPhone || "09xx.xxx.xxx",
      accountCode: newAccCode,
      accountTitle: matchedAcc?.title || "Tài khoản TFT VIP",
      package: newPackage,
      amount: newAmount,
      status: "RENTING",
      statusLabel: "Đang Thuê",
      date: "Vừa tạo xong",
      expiresAt: "Trong 2 giờ tới",
      accountLogin: `tft_${newAccCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      accountPass: `TuanTFT@${Math.floor(1000 + Math.random() * 9000)}`,
      notes: newNotes || "Đơn hàng tạo thủ công qua Zalo.",
    };

    setOrders([newOrd, ...orders]);
    setCreateModalOpen(false);
    toast.success(`✅ Đã tạo đơn hàng ${newId} thành công!`);

    // Reset form
    setNewCustomer("");
    setNewPhone("");
    setNewNotes("");
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Doanh Thu Tổng
            </span>
            <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {stats.totalRevenue.toLocaleString("vi-VN")}đ
            </strong>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18% so với tuần trước
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Tổng đơn hàng */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Tổng Số Đơn
            </span>
            <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {stats.totalOrders} Đơn
            </strong>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Toàn bộ giao dịch
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Đơn đang thuê */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Đang Thuê (Active)
            </span>
            <strong className="text-2xl font-black text-amber-600 font-mono mt-1 block">
              {stats.rentingOrders} Đơn
            </strong>
            <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> Cần theo dõi giờ thu hồi
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Đã hoàn thành */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Đã Hoàn Tất
            </span>
            <strong className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {stats.completedOrders} Đơn
            </strong>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              ✓ Đã thu hồi & reset pass
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. THANH CÔNG CỤ: TÌM KIẾM, BỘ LỌC & NÚT TẠO ĐƠN NHANH */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Danh Sách Đơn Hàng & Lịch Sử Thuê Acc
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Quản lý chi tiết từng đơn đặt thuê, thông tin tài khoản và bàn giao pass 30s.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, tên khách, số Zalo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Lọc trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">Tất cả ({orders.length})</option>
            <option value="RENTING">Đang Thuê ({stats.rentingOrders})</option>
            <option value="COMPLETED">Đã Hoàn Thành ({stats.completedOrders})</option>
          </select>

          {/* Nút Tạo Đơn Nhanh */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Nhanh</span>
          </button>
        </div>
      </div>

      {/* 3. BẢNG ĐƠN HÀNG */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Tài Khoản Thuê</th>
                <th className="py-3.5 px-4">Gói Thuê</th>
                <th className="py-3.5 px-4">Thanh Toán</th>
                <th className="py-3.5 px-4">Thời Gian</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>Không tìm thấy đơn hàng nào phù hợp.</span>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(ord)}
                  >
                    {/* Mã Đơn */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs">
                        {ord.id}
                      </span>
                    </td>

                    {/* Khách Hàng */}
                    <td className="py-4 px-4">
                      <strong className="text-slate-900 font-bold block">{ord.customer}</strong>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {ord.phoneZalo}
                      </span>
                    </td>

                    {/* Tài Khoản Thuê */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 font-mono font-bold text-[11px]">
                          {ord.accountCode}
                        </span>
                        <span className="text-slate-700 font-semibold line-clamp-1">
                          {ord.accountTitle}
                        </span>
                      </div>
                    </td>

                    {/* Gói Thuê */}
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[11px]">
                        {ord.package}
                      </span>
                    </td>

                    {/* Thanh Toán */}
                    <td className="py-4 px-4 font-mono font-bold text-red-600 text-sm">
                      {ord.amount.toLocaleString("vi-VN")}đ
                    </td>

                    {/* Thời Gian */}
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                      {ord.date}
                    </td>

                    {/* Trạng Thái */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          ord.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ord.status === "RENTING" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {ord.statusLabel}
                      </span>
                    </td>

                    {/* Thao Tác Nhanh */}
                    <td
                      className="py-4 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Nút Copy Message Bàn Giao */}
                        <button
                          onClick={() => handleCopyDeliveryMessage(ord)}
                          title="Sao chép tin nhắn bàn giao thông tin"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                        </button>

                        {/* Nút Xem Chi Tiết */}
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Chi Tiết</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: CHI TIẾT ĐƠN HÀNG & BÀN GIAO THÔNG TIN ACC         */}
      {/* ============================================================ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl animate-fadeIn space-y-4 p-6">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-orange-100 border border-orange-200 text-orange-700 font-mono font-bold text-xs">
                  {selectedOrder.id}
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  Chi Tiết Đơn Hàng
                </h3>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thông Tin Khách & Gói Thuê */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Khách hàng:</span>
                <strong className="text-slate-900 block font-bold">{selectedOrder.customer}</strong>
                <span className="text-slate-600 font-mono text-[11px] block">{selectedOrder.phoneZalo}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Thanh toán:</span>
                <strong className="text-red-600 font-mono text-base block font-black">
                  {selectedOrder.amount.toLocaleString("vi-VN")}đ
                </strong>
                <span className="text-slate-600 text-[11px] block">{selectedOrder.package}</span>
              </div>
            </div>

            {/* Khung Thông Tin Tài Khoản Riot & Bàn Giao */}
            <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-orange-900">
                  <KeyRound className="w-4 h-4 text-orange-600" />
                  <span>Thông Tin Tài Khoản Bàn Giao:</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-orange-200/80 text-orange-800 rounded">
                  {selectedOrder.accountCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                  <span className="text-[10px] text-slate-400 font-sans block">Tài khoản:</span>
                  <strong className="text-slate-800 select-all">{selectedOrder.accountLogin}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                  <span className="text-[10px] text-slate-400 font-sans block">Mật khẩu:</span>
                  <strong className="text-red-600 select-all">{selectedOrder.accountPass}</strong>
                </div>
              </div>

              {selectedOrder.expiresAt && (
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thời gian hết hạn thuê: <strong>{selectedOrder.expiresAt}</strong></span>
                </div>
              )}
            </div>

            {/* Ghi chú đơn */}
            {selectedOrder.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700 block mb-0.5">Ghi chú:</span>
                <p>{selectedOrder.notes}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleToggleOrderStatus(selectedOrder.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedOrder.status === "RENTING"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {selectedOrder.status === "RENTING"
                    ? "Xác Nhận Đã Thu Hồi Acc"
                    : "Chuyển Sang Đang Thuê"}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyDeliveryMessage(selectedOrder)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Tin Nhắn Giao Acc</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: TẠO ĐƠN HÀNG THỦ CÔNG (QUẢN LÝ NHANH KHI KHÁCH CHAT) */}
      {/* ============================================================ */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl animate-fadeIn p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-600" />
                <span>Tạo Đơn Hàng Mới</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Tên Khách Hàng:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Số Điện Thoại / Zalo:</label>
                <input
                  type="text"
                  placeholder="09xx.xxx.xxx"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Tài Khoản Thuê:</label>
                  <select
                    value={newAccCode}
                    onChange={(e) => setNewAccCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {TFT_RENTAL_ACCOUNTS.map((a) => (
                      <option key={a.id} value={a.code}>
                        {a.code} ({a.rank})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Gói Thuê:</label>
                  <select
                    value={newPackage}
                    onChange={(e) => setNewPackage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="2 Giờ Trải Nghiệm">2 Giờ Trải Nghiệm</option>
                    <option value="Thuê 7 Ngày (1 Tuần)">Thuê 7 Ngày (1 Tuần)</option>
                    <option value="Thuê 30 Ngày (1 Tháng)">Thuê 30 Ngày (1 Tháng)</option>
                    <option value="Thuê Lâu Dài (999 Ngày)">Thuê Lâu Dài (999 Ngày)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Số Tiền Thu (VNĐ):</label>
                <input
                  type="number"
                  step="1000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-red-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Ghi chú (Tùy chọn):</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ghi chú thêm về đơn hàng..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-600/20"
                >
                  Tạo Đơn Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
