"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Gamepad2,
  ChevronRight,
  ExternalLink,
  Calendar,
  Layers,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardResponseData } from "@/app/api/admin/dashboard/route";
import { formatOrderDateTime } from "@/utils/orders-service";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from dedicated server API
  const loadDashboard = useCallback(async (showNotice = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("shoptft_admin_token")
          : null;
      const headers: Record<string, string> = token
        ? { "x-admin-token": token }
        : {};

      const res = await fetch("/api/admin/dashboard", {
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Phiên đăng nhập quản trị viên đã hết hạn hoặc không có quyền.");
          return;
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Không thể tải dữ liệu bảng điều khiển");
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (showNotice) {
          toast.success("Đã làm mới dữ liệu hệ thống!");
        }
      } else {
        throw new Error(json.error || "Dữ liệu trả về không hợp lệ");
      }
    } catch (err: any) {
      console.error("Lỗi tải dashboard:", err);
      setError(err.message || "Lỗi khi kết nối với máy chủ.");
      if (showNotice) {
        toast.error("Không thể làm mới dữ liệu!");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Current Vietnam Date
  const currentDateStr = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6 pb-12">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#111111] tracking-tight">
            Tổng quan
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Theo dõi tình trạng kho acc, lượt thuê và khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-[#E5E7EB] text-xs text-[#6B7280]">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span className="capitalize">{currentDateStr}</span>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] hover:bg-gray-50 text-xs font-semibold text-[#111111] transition-colors cursor-pointer shadow-xs disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gray-500" : ""}`}
            />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-center justify-between gap-3 text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadDashboard()}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold cursor-pointer transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 2. PRIMARY KPI CARDS (MAXIMUM 5 COMPACT CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1: Tổng Acc */}
        <Link
          href="/admin/accounts"
          className="group bg-white border border-[#E5E7EB] hover:border-gray-400 rounded-xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Tổng Acc
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="my-2">
            {isLoading && !data ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
            ) : (
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#111111]">
                {data?.accounts.total ?? "—"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {data ? `${data.accounts.vip} VIP • ${data.accounts.clone} Clone` : "Đang tải..."}
          </p>
        </Link>

        {/* KPI 2: Còn Acc */}
        <Link
          href="/admin/accounts?status=AVAILABLE"
          className="group bg-white border border-[#E5E7EB] hover:border-gray-400 rounded-xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Còn Acc
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="my-2">
            {isLoading && !data ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
            ) : (
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-600">
                {data?.accounts.available ?? "—"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {data && data.accounts.total > 0
              ? `${Math.round((data.accounts.available / data.accounts.total) * 100)}% tổng kho`
              : "Sẵn sàng cho thuê"}
          </p>
        </Link>

        {/* KPI 3: Đang Thuê */}
        <Link
          href="/admin/rentals?tab=ACTIVE"
          className="group bg-white border border-[#E5E7EB] hover:border-gray-400 rounded-xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Đang Thuê
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="my-2">
            {isLoading && !data ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
            ) : (
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-600">
                {data?.rentals.active ?? "—"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {data && data.accounts.total > 0
              ? `${Math.round((data.rentals.active / data.accounts.total) * 100)}% tổng kho`
              : "Lượt thuê đang chạy"}
          </p>
        </Link>

        {/* KPI 4: Cần Xử Lý */}
        <a
          href="#can-xu-ly"
          className="group bg-white border border-[#E5E7EB] hover:border-gray-400 rounded-xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Cần Xử Lý
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="my-2">
            {isLoading && !data ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
            ) : (
              <span
                className={`font-heading font-extrabold text-2xl sm:text-3xl ${
                  data && data.actionRequiredCount > 0 ? "text-rose-600" : "text-[#111111]"
                }`}
              >
                {data?.actionRequiredCount ?? "—"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {data && data.actionRequiredCount > 0
              ? `${data.issues.length} vấn đề cần lưu ý`
              : "Tất cả ổn định"}
          </p>
        </a>

        {/* KPI 5: Khách Hàng */}
        <Link
          href="/admin/customers"
          className="group bg-white border border-[#E5E7EB] hover:border-gray-400 rounded-xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col justify-between col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-[#6B7280]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Khách Hàng
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="my-2">
            {isLoading && !data ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
            ) : (
              <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#111111]">
                {data?.customers.total ?? "—"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B7280]">
            {data
              ? `${data.customers.complete} đủ thông tin`
              : "Thành viên CSKH"}
          </p>
        </Link>
      </div>

      {/* 3. MAIN SECTION — CẦN XỬ LÝ (ACTIONABLE ISSUES) */}
      <section
        id="can-xu-ly"
        className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs scroll-mt-6 space-y-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertCircle
              className={`w-4 h-4 ${
                data && data.actionRequiredCount > 0 ? "text-amber-600" : "text-emerald-600"
              }`}
            />
            <h2 className="font-heading font-bold text-sm text-[#111111]">
              Cần xử lý
            </h2>
            {data && data.actionRequiredCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {data.actionRequiredCount} mục
              </span>
            )}
          </div>

          <span className="text-xs text-[#6B7280]">
            Ưu tiên giải quyết theo mức độ ảnh hưởng vận hành
          </span>
        </div>

        {/* Empty state: Không có việc cần xử lý lúc này */}
        {data && data.issues.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#6B7280] flex flex-col items-center justify-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-medium text-[#111111]">
              Không có việc cần xử lý lúc này.
            </span>
            <p className="text-[11px] text-[#6B7280]">
              Kho acc, lượt thuê và hồ sơ khách hàng đều đang trong trạng thái ổn định.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {data?.issues.map((issue) => {
              const isUrgent = issue.severity === "urgent";
              const isAttention = issue.severity === "attention";

              return (
                <div
                  key={issue.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                    isUrgent
                      ? "bg-rose-50/70 border-rose-200"
                      : isAttention
                      ? "bg-amber-50/70 border-amber-200"
                      : "bg-sky-50/60 border-sky-200"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold flex-shrink-0 mt-0.5 ${
                        isUrgent
                          ? "bg-rose-600 text-white"
                          : isAttention
                          ? "bg-amber-500 text-white"
                          : "bg-sky-600 text-white"
                      }`}
                    >
                      !
                    </span>
                    <div>
                      <h4
                        className={`font-semibold ${
                          isUrgent
                            ? "text-rose-950"
                            : isAttention
                            ? "text-amber-950"
                            : "text-sky-950"
                        }`}
                      >
                        {issue.title}
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          isUrgent
                            ? "text-rose-800"
                            : isAttention
                            ? "text-amber-800"
                            : "text-sky-800"
                        }`}
                      >
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <Link
                      href={issue.link}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs ${
                        isUrgent
                          ? "bg-rose-700 hover:bg-rose-800 text-white"
                          : isAttention
                          ? "bg-amber-700 hover:bg-amber-800 text-white"
                          : "bg-sky-700 hover:bg-sky-800 text-white"
                      }`}
                    >
                      <span>{issue.linkText}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. ACTIVE RENTALS PREVIEW (5-8 RECORDS) */}
      <section className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading font-bold text-sm text-[#111111]">
              Lượt thuê đang hoạt động
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Danh sách lượt thuê sắp xếp theo mức độ ưu tiên: Quá hạn → Sắp hết hạn → Sớm nhất.
            </p>
          </div>

          <Link
            href="/admin/rentals"
            className="text-xs font-semibold text-[#111111] hover:text-black inline-flex items-center gap-1 group"
          >
            <span>Xem tất cả ({data?.rentals.active ?? 0})</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {data && data.activeRentalsPreview.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7280]">
            Chưa có lượt thuê đang hoạt động.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#F7F7F8] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">MS</th>
                  <th className="py-3 px-4">Khách</th>
                  <th className="py-3 px-4">Gói</th>
                  <th className="py-3 px-4">Bắt đầu</th>
                  <th className="py-3 px-4">Hết hạn</th>
                  <th className="py-3 px-4">Còn lại</th>
                  <th className="py-3 px-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {data?.activeRentalsPreview.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50/70 transition-colors ${
                      item.isOverdue ? "bg-rose-50/30" : item.isExpiringSoon ? "bg-amber-50/20" : ""
                    }`}
                  >
                    {/* MS / Account */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Link
                        href={`/admin/accounts?search=${encodeURIComponent(item.accountCode)}`}
                        className="font-semibold text-[#111111] hover:underline font-mono text-xs flex items-center gap-1"
                      >
                        <span>{item.accountCode}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 font-sans">
                          {item.type}
                        </span>
                      </Link>
                      <p className="text-[11px] text-[#6B7280] max-w-[200px] truncate mt-0.5">
                        {item.accountTitle}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Link
                        href={`/admin/customers?search=${encodeURIComponent(
                          item.phoneZalo || item.customer
                        )}`}
                        className="font-medium text-[#111111] hover:underline"
                      >
                        {item.customer}
                      </Link>
                      {item.phoneZalo && (
                        <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                          {item.phoneZalo}
                        </div>
                      )}
                    </td>

                    {/* Package */}
                    <td className="py-3 px-4 max-w-xs truncate text-[#6B7280]">
                      {item.package}
                    </td>

                    {/* Started At */}
                    <td className="py-3 px-4 whitespace-nowrap text-[#6B7280] font-mono text-[11px]">
                      {formatOrderDateTime(item.startedAt)}
                    </td>

                    {/* Expires At */}
                    <td className="py-3 px-4 whitespace-nowrap text-[#6B7280] font-mono text-[11px]">
                      {item.expiresAt ? formatOrderDateTime(item.expiresAt) : "Vô Cực ∞"}
                    </td>

                    {/* Time Remaining */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold font-mono text-[11px] ${
                          item.isOverdue
                            ? "text-rose-700"
                            : item.isExpiringSoon
                            ? "text-amber-700"
                            : "text-[#111111]"
                        }`}
                      >
                        {item.timeRemainingFormatted}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      {item.isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>QUÁ HẠN</span>
                        </span>
                      ) : item.isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Sắp hết hạn</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Đang thuê</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. INVENTORY OVERVIEW & CUSTOMER CARE (TWO COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Box 1: Tình trạng kho */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-gray-700" />
                <h3 className="font-heading font-bold text-sm text-[#111111]">
                  Tình trạng kho
                </h3>
              </div>
              <Link
                href="/admin/accounts"
                className="text-xs font-semibold text-[#111111] hover:underline"
              >
                Xem Kho Acc →
              </Link>
            </div>

            {/* Sub-counts: VIP vs Clone */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[11px] font-semibold text-[#6B7280] uppercase">
                  Acc VIP
                </div>
                <div className="font-heading font-bold text-xl text-[#111111] mt-1">
                  {data?.accounts.vip ?? "—"}
                </div>
                <div className="text-[11px] text-[#6B7280] mt-0.5">
                  {data ? `${data.accounts.vipAvailable} tài khoản sẵn sàng` : "..."}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[11px] font-semibold text-[#6B7280] uppercase">
                  Acc Clone
                </div>
                <div className="font-heading font-bold text-xl text-[#111111] mt-1">
                  {data?.accounts.clone ?? "—"}
                </div>
                <div className="text-[11px] text-[#6B7280] mt-0.5">
                  {data ? `${data.accounts.cloneAvailable} tài khoản sẵn sàng` : "..."}
                </div>
              </div>
            </div>

            {/* Status distribution breakdown */}
            <div className="mt-4 space-y-2">
              <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Phân bổ trạng thái
              </div>

              <div className="space-y-1.5 text-xs">
                {/* Available */}
                <div className="flex items-center justify-between text-[#111111]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Còn Acc (Sẵn sàng)</span>
                  </div>
                  <span className="font-semibold">{data?.accounts.available ?? 0}</span>
                </div>

                {/* Rented */}
                <div className="flex items-center justify-between text-[#111111]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Đang Thuê</span>
                  </div>
                  <span className="font-semibold">{data?.accounts.rented ?? 0}</span>
                </div>

                {/* Maintenance */}
                <div className="flex items-center justify-between text-[#111111]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Bảo Trì</span>
                  </div>
                  <span className="font-semibold">{data?.accounts.maintenance ?? 0}</span>
                </div>

                {/* Hidden */}
                <div className="flex items-center justify-between text-[#111111]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span>Ẩn</span>
                  </div>
                  <span className="font-semibold">{data?.accounts.hidden ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Khách hàng / CSKH */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-700" />
                <h3 className="font-heading font-bold text-sm text-[#111111]">
                  Khách hàng / CSKH
                </h3>
              </div>
              <Link
                href="/admin/customers"
                className="text-xs font-semibold text-[#111111] hover:underline"
              >
                Xem Khách Hàng →
              </Link>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[11px] font-semibold text-[#6B7280] uppercase">
                  Tổng Member
                </div>
                <div className="font-heading font-bold text-xl text-[#111111] mt-1">
                  {data?.customers.total ?? "—"}
                </div>
                <div className="text-[11px] text-[#6B7280] mt-0.5">
                  Thành viên quản lý
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[11px] font-semibold text-[#6B7280] uppercase">
                  Đang Thuê Acc
                </div>
                <div className="font-heading font-bold text-xl text-[#111111] mt-1">
                  {data?.customers.activeRentalCustomers ?? 0}
                </div>
                <div className="text-[11px] text-[#6B7280] mt-0.5">
                  Khách có lượt thuê active
                </div>
              </div>
            </div>

            {/* CSKH Breakdown */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#111111]">
                <span className="text-[#6B7280]">Hồ sơ đầy đủ thông tin:</span>
                <span className="font-semibold text-emerald-600">
                  {data?.customers.complete ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#111111]">
                <span className="text-[#6B7280]">Hồ sơ thiếu thông tin CSKH:</span>
                <span
                  className={`font-semibold ${
                    data && data.customers.incomplete > 0 ? "text-amber-600" : "text-gray-700"
                  }`}
                >
                  {data?.customers.incomplete ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Action alert if incomplete > 0 */}
          {data && data.customers.incomplete > 0 ? (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-2">
              <span className="text-amber-900 font-medium">
                {data.customers.incomplete} khách hàng chưa cập nhật số Zalo / Họ tên.
              </span>
              <Link
                href="/admin/customers?profileStatus=INCOMPLETE"
                className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold text-[11px] flex-shrink-0 cursor-pointer"
              >
                Cập nhật →
              </Link>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Hồ sơ khách hàng hiện tại đều đầy đủ thông tin CSKH.</span>
            </div>
          )}
        </div>
      </div>

      {/* 6. RECENT ACCOUNTS & RECENT UPDATES (TWO COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Acc mới thêm */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-gray-700" />
                <h3 className="font-heading font-bold text-sm text-[#111111]">
                  Acc mới thêm
                </h3>
              </div>
              <Link
                href="/admin/accounts"
                className="text-xs font-semibold text-[#111111] hover:underline"
              >
                Xem Kho Acc →
              </Link>
            </div>

            {data && data.recentAccounts.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">
                Chưa có tài khoản nào.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 pt-1">
                {data?.recentAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/accounts?search=${encodeURIComponent(acc.code)}`}
                          className="font-semibold text-[#111111] hover:underline font-mono"
                        >
                          {acc.code}
                        </Link>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                          {acc.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                        {acc.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          acc.status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : acc.status === "RENTED"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {acc.status === "AVAILABLE"
                          ? "Còn Acc"
                          : acc.status === "RENTED"
                          ? "Đang Thuê"
                          : acc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cập nhật gần đây (Real Activity / Updates) */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-sm text-[#111111]">
                  Cập nhật gần đây
                </h3>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Dữ liệu đồng bộ từ Kho Acc, Lượt Thuê và Thành Viên.
                </p>
              </div>
            </div>

            {data && data.recentUpdates.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">
                Chưa có cập nhật nào gần đây.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 pt-1">
                {data?.recentUpdates.map((u) => (
                  <Link
                    key={u.id}
                    href={u.link}
                    className="py-2.5 flex items-start justify-between gap-3 text-xs group hover:bg-gray-50/50 rounded-lg px-1 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[#111111] group-hover:text-black flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            u.type === "RENTAL"
                              ? "bg-amber-500"
                              : u.type === "ACCOUNT"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                          }`}
                        />
                        <span>{u.title}</span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                        {u.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-[#9CA3AF] whitespace-nowrap flex-shrink-0 font-mono">
                      {formatOrderDateTime(u.timestamp)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
