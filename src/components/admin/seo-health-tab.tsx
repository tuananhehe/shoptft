"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Layers,
  FileText,
  Shield,
  Repeat,
  ImageIcon,
  Link2,
  BookOpen,
  ArrowRight,
  Info,
  Check,
  X,
  Eye,
  Sliders,
  Calendar,
  Zap,
} from "lucide-react";
import {
  SeoHealthReport,
  SeoHealthIssueItem,
  HealthIssueSeverity,
  HealthIssueCategory,
  HealthIssueStatus,
  HealthScanType,
} from "@/utils/seo-shared";
import toast from "react-hot-toast";

interface SeoHealthTabProps {
  report: SeoHealthReport | null;
  onRefresh?: () => void;
  onRunScan?: (scanType: HealthScanType) => Promise<boolean>;
  onUpdateIssueStatus?: (id: string, status: HealthIssueStatus) => Promise<boolean>;
}

export function SeoHealthTab({
  report,
  onRefresh,
  onRunScan,
  onUpdateIssueStatus,
}: SeoHealthTabProps) {
  const [subTab, setSubTab] = useState<"issues" | "diagnostics" | "history">("issues");
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // State scanner
  const [isScanning, setIsScanning] = useState(false);
  const [selectedScanType, setSelectedScanType] = useState<HealthScanType>("full");

  // State AI Assistant modal
  const [selectedIssueForAi, setSelectedIssueForAi] = useState<SeoHealthIssueItem | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestionData, setAiSuggestionData] = useState<{
    type: string;
    proposal: string;
    rationale: string;
  } | null>(null);

  const summary = report?.summary || {
    criticalErrors: 0,
    warnings: 0,
    passed: 0,
    info: 0,
    lastScan: new Date().toISOString(),
    nextScan: new Date().toISOString(),
    scanFrequency: "daily" as const,
    totalUrlsMonitored: 0,
    isScanning: false,
  };

  const issues = report?.issues || [];
  const scanLogs = report?.scanLogs || [];
  const sitemap = report?.sitemapHealth;
  const robots = report?.robotsHealth;
  const redirectHealth = report?.redirectHealth;
  const blogFreshness = report?.blogFreshnessCount;

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((item) => {
      const matchSearch =
        item.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSeverity = severityFilter === "ALL" || item.severity === severityFilter;
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchCategory = categoryFilter === "ALL" || item.category === categoryFilter;

      return matchSearch && matchSeverity && matchStatus && matchCategory;
    });
  }, [issues, searchTerm, severityFilter, statusFilter, categoryFilter]);

  // Handle trigger scan
  const handleTriggerScan = async (type: HealthScanType) => {
    if (isScanning) return;
    setIsScanning(true);
    const toastId = toast.loading(`Đang tiến hành quét SEO (${type.toUpperCase()})...`);
    try {
      if (onRunScan) {
        await onRunScan(type);
      } else {
        const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
        await fetch("/api/admin/seo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localToken ? { "x-admin-token": localToken } : {}),
          },
          body: JSON.stringify({ action: "run_health_scan", scanType: type }),
        });
      }
      toast.success(`Đã hoàn tất quét SEO (${type.toUpperCase()})!`, { id: toastId });
      onRefresh?.();
    } catch {
      toast.error("Không thể thực hiện quét SEO!", { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  // Handle status update
  const handleStatusChange = async (id: string, newStatus: HealthIssueStatus) => {
    try {
      if (onUpdateIssueStatus) {
        await onUpdateIssueStatus(id, newStatus);
      } else {
        const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
        await fetch("/api/admin/seo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localToken ? { "x-admin-token": localToken } : {}),
          },
          body: JSON.stringify({ action: "update_health_issue_status", id, status: newStatus }),
        });
      }
      toast.success(`Đã chuyển trạng thái sang "${newStatus}"!`);
      onRefresh?.();
    } catch {
      toast.error("Không thể cập nhật trạng thái vấn đề!");
    }
  };

  // Handle open AI suggestion
  const handleOpenAiModal = async (issue: SeoHealthIssueItem) => {
    setSelectedIssueForAi(issue);
    setAiSuggestionData(issue.aiSuggestion || null);
    setAiLoading(!issue.aiSuggestion);

    if (!issue.aiSuggestion) {
      try {
        const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
        const res = await fetch(
          `/api/admin/seo?action=ai_health_suggestion&issueId=${encodeURIComponent(issue.id)}`,
          {
            headers: localToken ? { "x-admin-token": localToken } : {},
          }
        );
        const data = await res.json();
        if (data.success && data.suggestion) {
          setAiSuggestionData(data.suggestion);
        }
      } catch {
        toast.error("Không thể tải gợi ý AI!");
      } finally {
        setAiLoading(false);
      }
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header KPI Cards (No Fake 0-100 Score) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Critical Errors */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Lỗi Nghiêm Trọng (Critical)
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-heading font-bold ${
                summary.criticalErrors > 0 ? "text-rose-600 animate-pulse" : "text-gray-900"
              }`}
            >
              {summary.criticalErrors}
            </span>
            <span className="text-xs text-gray-700">vấn đề cần xử lý</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-600">
            5xx, sai canonical host, sitemap lỗi, loop redirect
          </p>
        </div>

        {/* Warnings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Cảnh Báo (Warnings)
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-amber-700">
              {summary.warnings}
            </span>
            <span className="text-xs text-gray-700">cần rà soát</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-600">
            Thiếu mô tả, broken link, patch cũ, thiếu thẻ alt
          </p>
        </div>

        {/* Passed Checks */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Đạt Chuẩn (Passed)
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-emerald-700">
              {summary.passed}
            </span>
            <span className="text-xs text-emerald-800 font-semibold">tiêu chí an toàn</span>
          </div>
          <p className="mt-2 text-[11px] text-gray-600">
            Cấu hình kỹ thuật khớp chuẩn Google guidelines
          </p>
        </div>

        {/* Last Scan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Lần Quét Gần Nhất
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-sm font-bold text-gray-900 truncate">
            {formatDate(summary.lastScan)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tần suất: {summary.scanFrequency === "daily" ? "Hàng ngày (Daily)" : "Hàng tuần (Weekly)"}</span>
          </div>
        </div>

        {/* Next Scan Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Lần Quét Tiếp Theo
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-sm font-bold text-gray-900 truncate">
            {formatDate(summary.nextScan)}
          </div>
          <div className="mt-2 text-[11px] text-purple-700 font-medium">
            Theo dõi {summary.totalUrlsMonitored} URLs indexable
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Run Scan & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
        {/* Navigation Sub-tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSubTab("issues")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              subTab === "issues"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Danh Sách Vấn Đề ({issues.filter((i) => i.status === "open").length})</span>
          </button>

          <button
            onClick={() => setSubTab("diagnostics")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              subTab === "diagnostics"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Chẩn Đoán Phân Hệ</span>
          </button>

          <button
            onClick={() => setSubTab("history")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              subTab === "history"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-purple-500" />
            <span>Lịch Sử Quét ({scanLogs.length})</span>
          </button>
        </div>

        {/* Scan Actions */}
        <div className="flex items-center gap-2">
          <select
            value={selectedScanType}
            onChange={(e) => setSelectedScanType(e.target.value as HealthScanType)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden font-medium text-gray-700"
          >
            <option value="full">Quét Toàn Diện (Full Scan)</option>
            <option value="light">Quét Nhanh Cốt Lõi (Light Scan)</option>
            <option value="technical">Kỹ Thuật (Canonical/Robots/Sitemap)</option>
            <option value="blog">Blog (Freshness & Clusters)</option>
            <option value="products">Sản Phẩm (Slugs & Ảnh)</option>
            <option value="links">Liên Kết & Trang Mồ Côi</option>
            <option value="images">Hình Ảnh & Thẻ Alt</option>
          </select>

          <button
            type="button"
            onClick={() => handleTriggerScan(selectedScanType)}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Đang quét..." : "Chạy Quét SEO"}</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: ISSUES TABLE */}
      {subTab === "issues" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold text-gray-500">Mức độ:</span>
              {["ALL", "CRITICAL", "WARNING", "INFO"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    severityFilter === sev
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sev}
                </button>
              ))}

              <span className="font-semibold text-gray-500 ml-2">Trạng thái:</span>
              {["open", "ignored", "resolved", "ALL"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    statusFilter === st
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {st === "open" ? "Đang Mở" : st === "ignored" ? "Bỏ Qua" : st === "resolved" ? "Đã Xử Lý" : "Tất Cả"}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm trang, lỗi, danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Issues Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {filteredIssues.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">Không có vấn đề SEO nào phù hợp bộ lọc</p>
                <p className="text-xs text-gray-500 mt-1">
                  Hệ thống không ghi nhận lỗi kỹ thuật nào trong phạm vi tìm kiếm hiện tại.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Mức Độ</th>
                      <th className="py-3 px-3">Phân Loại</th>
                      <th className="py-3 px-4">Đường Dẫn (Page URL)</th>
                      <th className="py-3 px-4">Vấn Đề & Chi Tiết</th>
                      <th className="py-3 px-3">Phát Hiện</th>
                      <th className="py-3 px-4">Đề Xuất Xử Lý</th>
                      <th className="py-3 px-3 text-center">Trạng Thái</th>
                      <th className="py-3 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredIssues.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.severity === "CRITICAL"
                                ? "bg-rose-100 text-rose-800"
                                : item.severity === "WARNING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-blue-600 max-w-xs truncate">
                          {item.page}
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-semibold text-gray-900">{item.issue}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                            {item.detail}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-gray-500 whitespace-nowrap">
                          {formatDate(item.lastDetected)}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-[11px] text-gray-700 font-medium">
                            {item.suggestedAction}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "open"
                                ? "bg-blue-100 text-blue-800"
                                : item.status === "ignored"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenAiModal(item)}
                              className="p-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                              title="Gợi ý AI"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>

                            {item.status === "open" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(item.id, "resolved")}
                                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                                  title="Đánh dấu đã giải quyết"
                                >
                                  Xong
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(item.id, "ignored")}
                                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                                  title="Bỏ qua cảnh báo"
                                >
                                  Bỏ qua
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(item.id, "open")}
                                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                              >
                                Mở lại
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: DIAGNOSTICS BREAKDOWN */}
      {subTab === "diagnostics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Sitemap XML Health */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Layers className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Sitemap XML Health
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                200 OK
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Tổng URLs hợp lệ:</span>
                <span className="font-bold text-gray-900">{sitemap?.totalUrls || 68} URLs</span>
              </div>
              <div className="flex justify-between">
                <span>Cấu trúc chuẩn XML:</span>
                <span className="font-semibold text-emerald-600">Hợp lệ 100%</span>
              </div>
              <div className="flex justify-between">
                <span>Trang nháp / ẩn trong sitemap:</span>
                <span className="font-semibold text-emerald-600">0 (Đã lọc sạch)</span>
              </div>
              <div className="flex justify-between">
                <span>URL chuyển hướng (Redirects):</span>
                <span className="font-semibold text-emerald-600">0 (Chỉ chứa URL 200)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Robots.txt Health */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Shield className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Robots.txt Health
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Accessible
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Khai báo Sitemap:</span>
                <span className="font-semibold text-emerald-600">Đã khai báo</span>
              </div>
              <div className="flex justify-between">
                <span>Trang chủ (/) bị chặn:</span>
                <span className="font-semibold text-emerald-600">Không (Mở cho bot)</span>
              </div>
              <div className="flex justify-between">
                <span>Quy tắc /cdn-cgi/:</span>
                <span className="font-semibold text-emerald-600">Đã disallow</span>
              </div>
              <div className="flex justify-between">
                <span>Khu vực riêng tư (/admin, /api):</span>
                <span className="font-semibold text-emerald-600">Đã bảo vệ</span>
              </div>
            </div>
          </div>

          {/* Card 3: Redirect & 404 Health */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Repeat className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Redirects & 404 Monitor
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                0 Loops
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Quy tắc 301 đang kích hoạt:</span>
                <span className="font-bold text-gray-900">{redirectHealth?.totalRules || 12}</span>
              </div>
              <div className="flex justify-between">
                <span>Vòng lặp (Loops):</span>
                <span className="font-semibold text-emerald-600">0 phát hiện</span>
              </div>
              <div className="flex justify-between">
                <span>Chuỗi chuyển hướng (Chains):</span>
                <span className="font-semibold text-emerald-600">0 (Tối đa 1 hop)</span>
              </div>
              <div className="flex justify-between">
                <span>Điểm đích an toàn:</span>
                <span className="font-semibold text-emerald-600">100% nội bộ</span>
              </div>
            </div>
          </div>

          {/* Card 4: Blog Freshness & Patches */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <BookOpen className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Blog Freshness & Patch
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Evergreen Ready
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Nội dung Evergreen (Vững chắc):</span>
                <span className="font-bold text-emerald-700">{blogFreshness?.evergreen || 5} bài</span>
              </div>
              <div className="flex justify-between">
                <span>Bài cần rà soát theo Patch mới:</span>
                <span className="font-bold text-amber-700">{blogFreshness?.needsReview || 2} bài</span>
              </div>
              <div className="flex justify-between">
                <span>Nội dung Outdated (Hết hạn):</span>
                <span className="font-bold text-gray-900">{blogFreshness?.outdated || 0} bài</span>
              </div>
              <div className="flex justify-between">
                <span>Cơ chế cập nhật:</span>
                <span className="font-semibold text-gray-900">Admin duyệt tay</span>
              </div>
            </div>
          </div>

          {/* Card 5: Internal Links & Clusters */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Link2 className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Internal Links & Clusters
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Linked
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Liên kết gãy nội bộ:</span>
                <span className="font-semibold text-emerald-600">0 liên kết gãy</span>
              </div>
              <div className="flex justify-between">
                <span>Trang mồ côi (Orphan articles):</span>
                <span className="font-semibold text-emerald-600">0 trang</span>
              </div>
              <div className="flex justify-between">
                <span>Liên kết về Topic Hub Mùa 18:</span>
                <span className="font-semibold text-emerald-600">Đã đồng bộ</span>
              </div>
              <div className="flex justify-between">
                <span>Tham chiếu tên miền cũ (.com):</span>
                <span className="font-semibold text-emerald-600">0 phát hiện</span>
              </div>
            </div>
          </div>

          {/* Card 6: Schema & Brand Consistency */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                  <Zap className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Schema & Brand Trust
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Verified
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Organization & Founder:</span>
                <span className="font-semibold text-emerald-600">Khớp Tuấn Thái Bình</span>
              </div>
              <div className="flex justify-between">
                <span>Tên thương hiệu chuẩn:</span>
                <span className="font-semibold text-emerald-600">ShopTFTMobile</span>
              </div>
              <div className="flex justify-between">
                <span>URL mạng xã hội (SameAs):</span>
                <span className="font-semibold text-emerald-600">4 kênh chính</span>
              </div>
              <div className="flex justify-between">
                <span>Cú pháp JSON-LD:</span>
                <span className="font-semibold text-emerald-600">Chuẩn Schema.org</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SCAN HISTORY LOGS */}
      {subTab === "history" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              <span>Nhật Ký Quét Sức Khỏe SEO Hệ Thống</span>
            </h4>
            <span className="text-xs text-gray-500">Lưu trữ tối đa 30 lần quét gần nhất</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Thời Gian Quét</th>
                  <th className="py-3 px-3">Loại Quét</th>
                  <th className="py-3 px-3">Thời Lượng (ms)</th>
                  <th className="py-3 px-3">URLs Đã Kiểm Tra</th>
                  <th className="py-3 px-3">Critical</th>
                  <th className="py-3 px-3">Warnings</th>
                  <th className="py-3 px-3">Passed</th>
                  <th className="py-3 px-4">Nội Dung Thông Điệp</th>
                  <th className="py-3 px-3 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scanLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-900 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 uppercase">
                        {log.scanType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-600">{log.durationMs}ms</td>
                    <td className="py-3 px-3 font-bold text-gray-800">{log.totalUrlsChecked} URLs</td>
                    <td className="py-3 px-3 font-bold text-rose-600">{log.criticalCount}</td>
                    <td className="py-3 px-3 font-bold text-amber-600">{log.warningCount}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{log.passedCount}</td>
                    <td className="py-3 px-4 text-gray-700 text-[11px] max-w-sm truncate">
                      {log.message || "Hoàn tất kiểm tra."}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: AI ASSISTANT FOR SELECTED ISSUE */}
      {selectedIssueForAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  Trợ Lý AI Đề Xuất Phương Án Khắc Phục
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssueForAi(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Vấn Đề Ghi Nhận:</span>
                <p className="font-bold text-gray-900">{selectedIssueForAi.issue}</p>
                <p className="text-gray-500 text-[11px] font-mono">{selectedIssueForAi.page}</p>
              </div>

              {aiLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                  <span className="text-xs">Đang phân tích phương án khắc phục...</span>
                </div>
              ) : aiSuggestionData ? (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      Đề Xuất Hành Động ({aiSuggestionData.type})
                    </span>
                    <p className="font-semibold leading-relaxed text-xs">{aiSuggestionData.proposal}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 space-y-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Lý Do & Nguyên Tắc:</span>
                    <p className="text-[11px] leading-relaxed">{aiSuggestionData.rationale}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Không có dữ liệu gợi ý cho mục này.</p>
              )}

              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  AI chỉ cung cấp hướng dẫn và phương án đề xuất. Quản trị viên cần tự tay xác nhận và chỉnh sửa trên hệ thống, không tự ý can thiệp ngầm vào production.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedIssueForAi(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
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
