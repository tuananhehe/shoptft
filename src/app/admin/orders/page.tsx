"use client";

import React, { useState } from "react";
import { Receipt, Search, CheckCircle2, Clock, MessageCircle, Eye, Filter } from "lucide-react";
import { PROFILE_INFO } from "@/data/tft-data";

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [orders, setOrders] = useState([
    {
      id: "ORD-9821",
      customer: "Nguyễn Hoàng Long",
      phoneZalo: "0987.123.***",
      accountCode: "MS: 8899",
      accountTitle: "Acc Thách Đấu - Ahri Chiêu Hồn",
      package: "2 Giờ Trải Nghiệm",
      amount: 49000,
      status: "COMPLETED",
      statusLabel: "Đã Bàn Giao",
      date: "27/08/2026 22:45",
      notes: "Khách đã nhận pass và xác nhận vào được acc.",
    },
    {
      id: "ORD-8842",
      customer: "Trần Minh Đức",
      phoneZalo: "0912.456.***",
      accountCode: "MS: 6632",
      accountTitle: "Acc Đại Cao Thủ - Aatrox Sát Thần",
      package: "Thuê 7 Ngày (1 Tuần)",
      amount: 164000,
      status: "RENTING",
      statusLabel: "Đang Thuê",
      date: "27/08/2026 21:15",
      notes: "Hết hạn thuê vào ngày 03/09/2026 lúc 21:15.",
    },
    {
      id: "ORD-7719",
      customer: "Lê Quốc Bảo",
      phoneZalo: "0934.789.***",
      accountCode: "COACH-01",
      accountTitle: "Coaching 1-1 Bắt Meta",
      package: "Gói 2 Buổi (180 Phút)",
      amount: 300000,
      status: "COMPLETED",
      statusLabel: "Đã Hoàn Thành",
      date: "27/08/2026 19:30",
      notes: "Đã hướng dẫn xoay bài meta Mùa 13.",
    },
    {
      id: "ORD-6620",
      customer: "Hoàng Yến Vy",
      phoneZalo: "0905.678.***",
      accountCode: "MS: 7721",
      accountTitle: "Acc Kim Cương - Gwen Búp Bê",
      package: "2 Giờ Trải Nghiệm",
      amount: 43000,
      status: "COMPLETED",
      statusLabel: "Đã Bàn Giao",
      date: "26/08/2026 21:40",
      notes: "Khách khen acc mượt, sân khấu đổi nhạc hay.",
    },
    {
      id: "ORD-5510",
      customer: "Vũ Hải Đăng",
      phoneZalo: "0978.333.***",
      accountCode: "MS: 9912",
      accountTitle: "Acc Thách Đấu - Yasuo Chân Long",
      package: "Thuê 30 Ngày (1 Tháng)",
      amount: 360000,
      status: "RENTING",
      statusLabel: "Đang Thuê",
      date: "25/08/2026 14:20",
      notes: "Gói thuê 1 tháng miễn phí đổi pass.",
    },
  ]);

  const filteredOrders = orders.filter((ord) => {
    const matchSearch =
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.accountCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || ord.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Quản Lý Đơn Hàng Thuê Acc & Dịch Vụ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi danh sách khách thuê, lịch sử thanh toán và trạng thái bàn giao.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, tên khách..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">Tất cả đơn ({orders.length})</option>
            <option value="COMPLETED">Đã Hoàn Thành</option>
            <option value="RENTING">Đang Thuê</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Tài Khoản / Dịch Vụ</th>
                <th className="py-3.5 px-4">Gói Thuê</th>
                <th className="py-3.5 px-4">Số Tiền</th>
                <th className="py-3.5 px-4">Thời Gian</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs">
                      {ord.id}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <strong className="text-slate-900 font-bold block">{ord.customer}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">{ord.phoneZalo}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-orange-600">{ord.accountCode}</span>
                      <span className="text-slate-600 line-clamp-1">{ord.accountTitle}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-semibold border border-orange-200">
                      {ord.package}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-red-600 text-sm">
                    {ord.amount.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-mono">
                    {ord.date}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        ord.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {ord.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
