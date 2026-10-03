"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Layers,
  FileText,
  Filter,
  ShieldCheck,
  Zap,
  Target,
  Users,
  Compass,
  Link2,
  ChevronRight,
  Split,
  HelpCircle,
  Calendar,
  UploadCloud,
  FileSpreadsheet,
  Clock,
  Database,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  GscPeriodKey,
  GscPerformanceReport,
  RankingOpportunity,
  GscQueryItem,
  GscOpportunityType,
  GscOpportunityPriority,
  CannibalizationIssue,
  ContentGapItem,
  BlogSeoConversion,
  TitleChangeLog,
  PRODUCTION_ORIGIN,
} from "@/utils/seo-shared";

interface RankingOptimizationTabProps {
  initialReport?: GscPerformanceReport | null;
  onRefresh?: () => void;
}

export function RankingOptimizationTab({
  initialReport,
  onRefresh,
}: RankingOptimizationTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<GscPeriodKey>("28d");
  const [report, setReport] = useState<GscPerformanceReport | null>(
    initialReport || null
  );
  const [loading, setLoading] = useState(false);
  const [selectedOpportunityFilter, setSelectedOpportunityFilter] = useState<
    "all" | GscOpportunityType
  >("all");
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<
    "all" | GscOpportunityPriority
  >("all");

  // AI Proposal Modal state
  const [activeProposal, setActiveProposal] = useState<{
    targetQuery: string;
    targetPage: string;
    proposedTitle: string;
    proposedMetaDescription: string;
    missingSections: string[];
    internalLinkAnchors: Array<{ sourcePage: string; anchorText: string }>;
    searchIntentNote: string;
    safeguardNote: string;
  } | null>(null);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  // Active query tab in list
  const [queryGroupTab, setQueryGroupTab] = useState<
    "non_brand" | "brand" | "all"
  >("non_brand");

  // CSV Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvContent, setImportCsvContent] = useState("");
  const [importPeriod, setImportPeriod] = useState<GscPeriodKey>("28d");
  const [isImporting, setIsImporting] = useState(false);

  const handleImportCsv = async () => {
    if (!importCsvContent.trim()) {
      toast.error("Vui lòng dán hoặc tải lên nội dung tệp CSV!");
      return;
    }
    try {
      setIsImporting(true);
      const localToken =
        typeof window !== "undefined"
          ? localStorage.getItem("shoptft_admin_token")
          : null;
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify({
          action: "import_gsc_csv",
          csvContent: importCsvContent,
          period: importPeriod,
        }),
      });
      const data = await res.json();
      if (data.success && data.gscReport) {
        toast.success(data.message || "Đã nhập dữ liệu Search Console thành công!");
        setReport(data.gscReport);
        setSelectedPeriod(importPeriod);
        setIsImportModalOpen(false);
        setImportCsvContent("");
      } else {
        toast.error(data.error || "Lỗi khi nhập dữ liệu CSV");
      }
    } catch {
      toast.error("Lỗi mạng khi kết nối tới máy chủ");
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setImportCsvContent(text);
    };
    reader.readAsText(file);
  };

  // Fetch report when period changes
  const fetchReportForPeriod = async (period: GscPeriodKey) => {
    try {
      setLoading(true);
      const localToken =
        typeof window !== "undefined"
          ? localStorage.getItem("shoptft_admin_token")
          : null;
      const res = await fetch(`/api/admin/seo?period=${period}`, {
        headers: localToken ? { "x-admin-token": localToken } : {},
      });
      const data = await res.json();
      if (data.success && data.gscReport) {
        setReport(data.gscReport);
      } else {
        toast.error("Không thể tải báo cáo Search Console kỳ đã chọn");
      }
    } catch {
      toast.error("Lỗi kết nối khi tải dữ liệu Search Console");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReport && initialReport.period === selectedPeriod) {
      setReport(initialReport);
    } else {
      fetchReportForPeriod(selectedPeriod);
    }
  }, [selectedPeriod]);

  // Request AI proposal
  const handleOpenAiProposal = async (opp: RankingOpportunity) => {
    try {
      setLoadingProposal(true);
      const localToken =
        typeof window !== "undefined"
          ? localStorage.getItem("shoptft_admin_token")
          : null;
      const res = await fetch(
        `/api/admin/seo?action=ai_proposal&query=${encodeURIComponent(
          opp.query
        )}&pageUrl=${encodeURIComponent(opp.page)}&opportunityType=${encodeURIComponent(
          opp.opportunity
        )}`,
        {
          headers: localToken ? { "x-admin-token": localToken } : {},
        }
      );
      const data = await res.json();
      if (data.success && data.proposal) {
        setActiveProposal(data.proposal);
      } else {
        toast.error("Không thể tạo đề xuất AI cho truy vấn này");
      }
    } catch {
      toast.error("Lỗi khi kết nối với AI Assistant");
    } finally {
      setLoadingProposal(false);
    }
  };

  const copyToClipboard = (text: string, type: "title" | "desc") => {
    navigator.clipboard.writeText(text);
    if (type === "title") {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    }
    toast.success("Đã copy vào bộ nhớ tạm!");
  };

  if (!report && loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-gray-400 mx-auto animate-spin" />
        <p className="text-xs text-gray-600 font-medium">
          Đang tải dữ liệu Google Search Console & Ranking Optimization...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <p className="text-xs text-gray-600 font-medium">
          Chưa có dữ liệu Search Console khả dụng.
        </p>
      </div>
    );
  }

  const {
    summary,
    brandQueries,
    nonBrandQueries,
    topPages,
    opportunities,
    cannibalization,
    contentGaps,
    blogPerformance,
    funnel,
    titleHistory,
  } = report;

  // Filter opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchType =
      selectedOpportunityFilter === "all" ||
      opp.opportunity === selectedOpportunityFilter;
    const matchPriority =
      selectedPriorityFilter === "all" ||
      opp.priority === selectedPriorityFilter;
    return matchType && matchPriority;
  });

  const highCount = opportunities.filter((o) => o.priority === "HIGH").length;
  const medCount = opportunities.filter((o) => o.priority === "MEDIUM").length;
  const lowCount = opportunities.filter((o) => o.priority === "LOW").length;

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TIMEFRAME SELECTOR */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="font-heading font-bold text-sm sm:text-base text-gray-900">
              Google Search Console & Ranking Optimization
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Tối ưu SEO theo dữ liệu Search Console thực tế. Tách bạch nhóm Brand vs Non-brand, phát hiện từ khóa vị trí 4–20, xử lý xung đột Cannibalization và chuyển đổi Organic qua Zalo.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
            <button
              onClick={() => setSelectedPeriod("7d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedPeriod === "7d"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              7 ngày qua
            </button>
            <button
              onClick={() => setSelectedPeriod("28d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedPeriod === "28d"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              28 ngày qua
            </button>
            <button
              onClick={() => setSelectedPeriod("3m")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedPeriod === "3m"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              3 tháng qua
            </button>
          </div>

          <button
            onClick={() => {
              if (onRefresh) onRefresh();
              fetchReportForPeriod(selectedPeriod);
            }}
            disabled={loading}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* DATA SOURCE INDICATOR & STATUS */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          report.isConnected && summary.impressions > 0
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-amber-500/10 border-amber-500/20 text-amber-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`p-2 rounded-xl shrink-0 ${
                report.isConnected && summary.impressions > 0
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-600"
              }`}
            >
              <Database className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xs sm:text-sm">
                  {report.isConnected && summary.impressions > 0
                    ? "Dữ liệu thực tế từ Google Search Console"
                    : "Chưa có dữ liệu Search Console"}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    report.isConnected && summary.impressions > 0
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-700 border border-amber-500/30"
                  }`}
                >
                  {report.isConnected && summary.impressions > 0 ? "Đã xác thực" : "Cần kết nối / nhập CSV"}
                </span>
                {report.lastSynced &&
                  Date.now() - new Date(report.lastSynced).getTime() >
                    30 * 24 * 60 * 60 * 1000 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> &gt; 30 ngày (Dữ liệu cũ)
                    </span>
                  )}
              </div>
              <div
                className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] mt-1 ${
                  report.isConnected && summary.impressions > 0
                    ? "text-zinc-400"
                    : "text-amber-700"
                }`}
              >
                <span>
                  Property:{" "}
                  <code
                    className={
                      report.isConnected && summary.impressions > 0
                        ? "text-zinc-200"
                        : "text-amber-900 font-semibold"
                    }
                  >
                    {report.property || "https://www.shoptftmobile.net"}
                  </code>
                </span>
                <span>
                  Nguồn:{" "}
                  <strong>
                    {report.dataSource === "IMPORT_CSV"
                      ? "Nhập tệp CSV thực tế"
                      : report.dataSource === "LIVE_GSC"
                      ? "Google Search Console API"
                      : "Chưa có dữ liệu"}
                  </strong>
                </span>
                <span>
                  Kỳ:{" "}
                  <strong>
                    {selectedPeriod === "7d"
                      ? "7 ngày"
                      : selectedPeriod === "28d"
                      ? "28 ngày"
                      : "3 tháng"}
                  </strong>
                </span>
                <span>
                  Lần đồng bộ gần nhất:{" "}
                  <strong>
                    {report.lastSynced
                      ? new Date(report.lastSynced).toLocaleString("vi-VN")
                      : "Chưa đồng bộ"}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>
              {report.isConnected && summary.impressions > 0
                ? "Cập nhật dữ liệu CSV"
                : "Kết nối / Nhập dữ liệu"}
            </span>
          </button>
        </div>
      </div>

      {/* ZERO DATA WARNING & INSTRUCTIONS */}
      {(!report.isConnected || summary.impressions === 0) && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-gray-900 font-heading">
              Chưa có dữ liệu Search Console
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Hệ thống tuyệt đối <strong>không sử dụng dữ liệu ảo (mock/seed)</strong> cho các chỉ số Clicks, Impressions, CTR và Vị trí của <code>https://www.shoptftmobile.net</code>. Vui lòng tải lên tệp xuất (CSV) từ Google Search Console để xem báo cáo chi tiết.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Nhập tệp Queries.csv từ GSC</span>
            </button>
          </div>
          <div className="text-left max-w-lg mx-auto bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-2 mt-4">
            <div className="font-semibold text-gray-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cách xuất tệp từ Google Search Console:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600">
              <li>Mở <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google Search Console</a> và chọn thuộc tính <strong>https://www.shoptftmobile.net</strong></li>
              <li>Vào menu <strong>Hiệu suất (Performance)</strong> → Chọn tab <strong>Truy vấn (Queries)</strong></li>
              <li>Chọn khoảng thời gian (28 ngày qua hoặc 3 tháng qua)</li>
              <li>Nhấp nút <strong>Xuất (Export)</strong> ở góc trên bên phải → chọn <strong>Tệp CSV</strong></li>
              <li>Mở tệp <code>Queries.csv</code> vừa tải về và dán nội dung vào nút Nhập dữ liệu ở trên.</li>
            </ol>
          </div>
        </div>
      )}

      {/* 2. SIX KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Organic Clicks */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-medium">
            <span>Organic Clicks</span>
            <Search className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-heading text-gray-900 mt-2">
            {summary.clicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">
              +{summary.nonBrandClicksPercentage.toFixed(1)}%
            </span>{" "}
            non-brand
          </div>
        </div>

        {/* Card 2: Total Impressions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-medium">
            <span>Lượt hiển thị (Imp)</span>
            <Eye className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-heading text-gray-900 mt-2">
            {summary.impressions.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Hiển thị thực tế GSC
          </div>
        </div>

        {/* Card 3: Average CTR */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-medium">
            <span>CTR Trung Bình</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-heading text-gray-900 mt-2">
            {summary.ctr.toFixed(2)}%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Tốt (&gt; 4.0% ngành game)
          </div>
        </div>

        {/* Card 4: Non-brand Clicks (Growth Focus) */}
        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-[11px] font-semibold">
            <span>Non-Brand Clicks</span>
            <Target className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-heading text-emerald-950 mt-2">
            {summary.nonBrandClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Chiếm {summary.nonBrandClicksPercentage.toFixed(1)}% traffic
          </div>
        </div>

        {/* Card 5: SEO Opportunities */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-medium">
            <span>Cơ hội SEO</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-heading text-gray-900 mt-2">
            {opportunities.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
            <span className="text-red-600 font-semibold">{highCount} High</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">{medCount} Med</span>
          </div>
        </div>

        {/* Card 6: Cannibalization & Indexing */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-[11px] font-medium">
            <span>Xung đột & Index</span>
            <Split className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-heading text-gray-900 mt-2">
            {cannibalization.length}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            Đã có phương án xử lý
          </div>
        </div>
      </div>

      {/* 3. BRAND VS NON-BRAND SPLIT CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Phân Tách Nhóm Truy Vấn: Brand vs Non-Brand</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Ưu tiên mở rộng tệp khách hàng tự nhiên chưa biết thương hiệu (Non-Brand), song song bảo toàn thứ hạng độc tôn cho từ khoá Brand.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700">
            Tỷ trọng Non-Brand:{" "}
            <span className="text-emerald-600">
              {summary.nonBrandClicksPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Visual Comparison Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${100 - summary.nonBrandClicksPercentage}%` }}
              className="bg-blue-600 h-full transition-all"
              title={`Brand: ${(100 - summary.nonBrandClicksPercentage).toFixed(1)}%`}
            />
            <div
              style={{ width: `${summary.nonBrandClicksPercentage}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Non-Brand: ${summary.nonBrandClicksPercentage.toFixed(1)}%`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Brand ({summary.brandClicks.toLocaleString()} clicks -{" "}
              {(100 - summary.nonBrandClicksPercentage).toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Non-Brand ({summary.nonBrandClicks.toLocaleString()} clicks -{" "}
              {summary.nonBrandClicksPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Metrics Grid Brand vs Non-Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Brand Box */}
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">
                Thương hiệu (Brand Intent)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                Bảo vệ vị trí 1.0 - 1.5
              </span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Các truy vấn: <code className="font-mono">shoptftmobile</code>,{" "}
              <code className="font-mono">shoptft</code>,{" "}
              <code className="font-mono">Tuấn Thái Bình TFT</code>.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-blue-100/60 text-center">
              <div>
                <div className="text-[10px] text-blue-600">Clicks</div>
                <div className="text-xs font-bold text-blue-950">
                  {summary.brandClicks.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-blue-600">CTR</div>
                <div className="text-xs font-bold text-blue-950">
                  {summary.brandCtr.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-blue-600">Vị trí TB</div>
                <div className="text-xs font-bold text-blue-950">
                  {summary.brandAvgPosition.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Non-Brand Box */}
          <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">
                Không thương hiệu (Commercial &amp; Content)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Mục tiêu tăng trưởng chính
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Các cụm từ: <code className="font-mono">thuê acc TFT</code>,{" "}
              <code className="font-mono">thuê acc ĐTCL</code>,{" "}
              <code className="font-mono">TFT mùa 18</code>,{" "}
              <code className="font-mono">đội hình TFT</code>.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-100/60 text-center">
              <div>
                <div className="text-[10px] text-emerald-600">Clicks</div>
                <div className="text-xs font-bold text-emerald-950">
                  {summary.nonBrandClicks.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-600">CTR</div>
                <div className="text-xs font-bold text-emerald-950">
                  {summary.nonBrandCtr.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-600">Vị trí TB</div>
                <div className="text-xs font-bold text-emerald-950">
                  {summary.nonBrandAvgPosition.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CANNIBALIZATION ALERTS PANEL */}
      {cannibalization.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                <Split className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-heading font-bold text-sm text-gray-900">
                  Cảnh Báo Xung Đột Từ Khóa (Keyword Cannibalization)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Phát hiện 2 hoặc nhiều URL cùng cạnh tranh trên cùng một nhóm truy vấn, gây phân tán sức mạnh SEO.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              {cannibalization.length} xung đột
            </span>
          </div>

          <div className="space-y-3">
            {cannibalization.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span>Truy vấn:</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-gray-900 font-mono">
                      "{item.query}"
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600 flex items-center gap-1">
                    <span>Trang đích chuẩn (Designated):</span>
                    <a
                      href={item.recommendedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono font-semibold text-emerald-700 hover:underline flex items-center gap-0.5"
                    >
                      {item.recommendedUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500">
                  <span className="font-semibold text-gray-700">Các URL đang bị chia sẻ click/impression:</span>{" "}
                  {item.competingUrls.map((u, i) => (
                    <span
                      key={i}
                      className="inline-block px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono mr-1.5 mt-1"
                    >
                      {u}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-gray-700 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-amber-100/70">
                  <strong className="text-amber-800">Khuyến nghị xử lý:</strong>{" "}
                  {item.actionReason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. OPPORTUNITIES TABLE WITH PRIORITY RULES */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Target className="w-4 h-4" />
              </span>
              <h3 className="font-heading font-bold text-sm text-gray-900">
                Bảng Cơ Hội SEO &amp; Ưu Tiên Tối Ưu (SEO Opportunities)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ưu tiên theo nguyên tắc: High (vị trí 4–15 commercial, CTR thấp nghiêm trọng, lỗi index) &gt; Medium (vị trí 15–30, liên kết nội bộ) &gt; Low.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Type */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSelectedOpportunityFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  selectedOpportunityFilter === "all"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedOpportunityFilter("Ranking")}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  selectedOpportunityFilter === "Ranking"
                    ? "bg-white text-blue-700 shadow-xs font-semibold"
                    : "text-gray-500"
                }`}
              >
                Vị trí 4–20
              </button>
              <button
                onClick={() => setSelectedOpportunityFilter("CTR")}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  selectedOpportunityFilter === "CTR"
                    ? "bg-white text-amber-700 shadow-xs font-semibold"
                    : "text-gray-500"
                }`}
              >
                CTR thấp
              </button>
              <button
                onClick={() => setSelectedOpportunityFilter("Content")}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  selectedOpportunityFilter === "Content"
                    ? "bg-white text-purple-700 shadow-xs font-semibold"
                    : "text-gray-500"
                }`}
              >
                Nội dung
              </button>
            </div>

            {/* Filter by Priority */}
            <select
              value={selectedPriorityFilter}
              onChange={(e) =>
                setSelectedPriorityFilter(e.target.value as any)
              }
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-hidden"
            >
              <option value="all">Tất cả mức ưu tiên</option>
              <option value="HIGH">Ưu tiên CAO (High)</option>
              <option value="MEDIUM">Ưu tiên VỪA (Medium)</option>
              <option value="LOW">Ưu tiên THẤP (Low)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 border-b border-gray-100 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Truy vấn (Query)</th>
                <th className="py-3 px-4">Trang đích</th>
                <th className="py-3 px-3 text-right">Clicks</th>
                <th className="py-3 px-3 text-right">Imp</th>
                <th className="py-3 px-3 text-right">CTR</th>
                <th className="py-3 px-3 text-right">Vị trí</th>
                <th className="py-3 px-3 text-center">Phân loại</th>
                <th className="py-3 px-3 text-center">Mức ưu tiên</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Không có cơ hội nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{opp.query}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                        {opp.targetAudienceOrIntent}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={opp.page}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-gray-600 hover:text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span className="line-clamp-1">{opp.page}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-gray-900">
                      {opp.clicks}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-600">
                      {opp.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-semibold ${
                          opp.ctr < 3.0
                            ? "text-red-600"
                            : opp.ctr < 4.5
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {opp.ctr.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                          opp.position <= 3
                            ? "bg-emerald-100 text-emerald-800"
                            : opp.position <= 10
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        #{opp.position.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          opp.opportunity === "CTR"
                            ? "bg-amber-100 text-amber-800"
                            : opp.opportunity === "Ranking"
                            ? "bg-blue-100 text-blue-800"
                            : opp.opportunity === "Indexing"
                            ? "bg-red-100 text-red-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {opp.opportunity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          opp.priority === "HIGH"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : opp.priority === "MEDIUM"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {opp.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenAiProposal(opp)}
                        disabled={loadingProposal}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Đề xuất AI</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. AI SEO PROPOSAL MODAL */}
      {activeProposal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-base text-gray-900">
                    Đề Xuất Tối Ưu Xếp Hạng (AI Ranking Assistant)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Dựa trên truy vấn:{" "}
                    <strong className="text-gray-800">
                      "{activeProposal.targetQuery}"
                    </strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveProposal(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1.5 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Guardrail Alert */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Chỉ mang tính chất đề xuất (Proposal Only):</strong>{" "}
                {activeProposal.safeguardNote} Hệ thống không tự ý ghi đè bài viết hoặc tiêu đề trang live.
              </div>
            </div>

            {/* Proposed Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">
                  Tiêu đề SEO đề xuất (Title Recommendation)
                </label>
                <button
                  onClick={() =>
                    copyToClipboard(activeProposal.proposedTitle, "title")
                  }
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedTitle ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedTitle ? "Đã copy" : "Copy"}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 font-sans">
                {activeProposal.proposedTitle}
              </div>
              <div className="text-[10px] text-gray-400 flex items-center justify-between">
                <span>Độ dài: {activeProposal.proposedTitle.length} ký tự</span>
                <span className="text-emerald-600 font-medium">Chuẩn SEO (&lt; 60 ký tự)</span>
              </div>
            </div>

            {/* Proposed Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">
                  Mô tả SEO đề xuất (Meta Description)
                </label>
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeProposal.proposedMetaDescription,
                      "desc"
                    )
                  }
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedDesc ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedDesc ? "Đã copy" : "Copy"}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed font-sans">
                {activeProposal.proposedMetaDescription}
              </div>
              <div className="text-[10px] text-gray-400 flex items-center justify-between">
                <span>
                  Độ dài: {activeProposal.proposedMetaDescription.length} ký tự
                </span>
                <span className="text-emerald-600 font-medium">
                  Chuẩn Google Snippet (130-155 ký tự)
                </span>
              </div>
            </div>

            {/* Missing Sections */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                Mục nội dung cần bổ sung để thỏa mãn Search Intent:
              </label>
              <div className="space-y-1.5">
                {activeProposal.missingSections.map((sec, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Links Anchor Suggestion */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                Gợi ý đặt liên kết nội bộ (Internal Links Anchor):
              </label>
              <div className="space-y-1.5">
                {activeProposal.internalLinkAnchors.map((link, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 flex items-center justify-between"
                  >
                    <span>
                      Từ trang: <strong className="font-mono">{link.sourcePage}</strong>
                    </span>
                    <span className="text-indigo-600 font-semibold">
                      Anchor: "{link.anchorText}"
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => setActiveProposal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Đóng đề xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ORGANIC CONVERSION FUNNEL (CONVERSION LOOP) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Compass className="w-4 h-4" />
            </span>
            <h3 className="font-heading font-bold text-sm text-gray-900">
              Vòng Lặp Chuyển Đổi Tự Nhiên (Organic Conversion Loop)
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Đo lường hành trình người dùng: Tìm kiếm tự nhiên → Ghé thăm kho /shop → Xem tài khoản cụ thể → Nhấn tư vấn Zalo.
          </p>
        </div>

        {/* Funnel Steps Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1 relative">
            <div className="text-[11px] font-semibold text-gray-500 flex items-center justify-between">
              <span>1. Lượt truy cập Organic</span>
              <span className="text-xs font-bold text-gray-900">100%</span>
            </div>
            <div className="text-lg font-bold font-heading text-gray-900">
              {funnel.organicVisits.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500">Từ Google Search</div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1 relative">
            <div className="text-[11px] font-semibold text-blue-700 flex items-center justify-between">
              <span>2. Vào xem Kho Acc</span>
              <span className="text-xs font-bold text-blue-900">
                {funnel.organicToShopRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-bold font-heading text-blue-950">
              {funnel.shopVisits.toLocaleString()}
            </div>
            <div className="text-[10px] text-blue-600">Truy cập /shop hoặc /thue-acc-tft-dtcl</div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1 relative">
            <div className="text-[11px] font-semibold text-purple-700 flex items-center justify-between">
              <span>3. Xem Chi Tiết Acc</span>
              <span className="text-xs font-bold text-purple-900">
                {funnel.shopToProductRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-bold font-heading text-purple-950">
              {funnel.productViews.toLocaleString()}
            </div>
            <div className="text-[10px] text-purple-600">Xem modal/chi tiết acc VIP/Clone</div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 relative">
            <div className="text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
              <span>4. Chuyển đổi Zalo</span>
              <span className="text-xs font-bold text-emerald-900">
                {funnel.productToZaloRate.toFixed(1)}%
              </span>
            </div>
            <div className="text-lg font-bold font-heading text-emerald-950">
              {funnel.zaloClicks.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-700">Click tư vấn thuê acc qua Zalo</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 gap-2">
          <span>
            Tỷ lệ chuyển đổi toàn phễu (End-to-End Conversion Rate):{" "}
            <strong className="text-emerald-700 font-bold">
              {funnel.overallConversionRate.toFixed(2)}%
            </strong>
          </span>
          <span className="text-[11px] text-gray-500">
            Mỗi 1,000 lượt organic đem về ~{Math.round(funnel.overallConversionRate * 10)} khách liên hệ Zalo thuê acc thật
          </span>
        </div>
      </div>

      {/* 8. BLOG PERFORMANCE & ARTICLE TO SHOP CONVERSION */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <FileText className="w-4 h-4" />
              </span>
              <h3 className="font-heading font-bold text-sm text-gray-900">
                Hiệu Suất Blog &amp; Chuyển Đổi Vào Shop (Blog → Shop Loop)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Bài viết ít traffic nhưng tỷ lệ chuyển đổi cao vẫn rất giá trị; theo dõi lượng độc giả click xem acc và liên hệ Zalo từ từng bài blog.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
            {blogPerformance.length} bài phân tích
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 border-b border-gray-100 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Bài viết (Article)</th>
                <th className="py-3 px-3 text-center">Patch</th>
                <th className="py-3 px-3 text-right">Imp</th>
                <th className="py-3 px-3 text-right">Clicks</th>
                <th className="py-3 px-3 text-right">CTR</th>
                <th className="py-3 px-3 text-right">Vị trí</th>
                <th className="py-3 px-3 text-right">Vào Shop</th>
                <th className="py-3 px-3 text-right">Zalo Clicks</th>
                <th className="py-3 px-3 text-right">Tỷ lệ CĐ</th>
                <th className="py-3 px-4 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogPerformance.map((post, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 max-w-xs">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-gray-900 hover:text-blue-600 hover:underline line-clamp-1 flex items-center gap-1"
                    >
                      <span>{post.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Cập nhật: {post.updatedAt}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {post.patch ? (
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-mono text-[10px] font-bold">
                        {post.patch}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-600">
                    {post.impressions.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-gray-900">
                    {post.clicks}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-semibold ${
                        post.ctr < 3.0 ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {post.ctr.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    #{post.position.toFixed(1)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-blue-600">
                    {post.blogToShopClicks}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600">
                    {post.zaloClicks}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-gray-900">
                      {post.conversionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {post.performanceGroup === "top_performer" && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Top Chuyển Đổi
                      </span>
                    )}
                    {post.performanceGroup === "high_impression_low_ctr" && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Tối ưu CTR Title
                      </span>
                    )}
                    {post.performanceGroup === "pos_8_20" && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Đẩy vị trí 4–20
                      </span>
                    )}
                    {post.performanceGroup === "traffic_drop" && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        Cập nhật Patch
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. CONTENT GAPS PANEL */}
      {contentGaps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-bold text-sm text-gray-900">
                  Khoảng Trống Nội Dung (Content Gaps)
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Các truy vấn có lượt tìm kiếm thực tế trên Search Console nhưng website chưa có Landing Page chuyên biệt phù hợp.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
              {contentGaps.length} cơ hội đề xuất
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {contentGaps.map((gap, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 font-mono">
                      "{gap.query}"
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600">
                      {gap.searchImpressions.toLocaleString()} imp
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    {gap.userIntent}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-200/60 space-y-1">
                  <div className="text-[10px] text-gray-500">Đề xuất tiêu đề:</div>
                  <div className="font-semibold text-gray-900 text-[11px]">
                    {gap.suggestedTitle}
                  </div>
                  <div className="font-mono text-[10px] text-indigo-600">
                    {gap.suggestedUrl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. TITLE TESTING & CHANGE HISTORY LOG */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="font-heading font-bold text-sm text-gray-900">
                Nhật Ký Thử Nghiệm &amp; Thay Đổi Tiêu Đề (Title Testing History)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ghi nhận lịch sử điều chỉnh title để kiểm chứng hiệu quả CTR. Nguyên tắc: Không thay đổi liên tục, theo dõi ít nhất 2–4 tuần trước khi đánh giá.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
            {titleHistory.length} bản ghi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 border-b border-gray-100 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Trang</th>
                <th className="py-3 px-4">Tiêu đề cũ (Old Title)</th>
                <th className="py-3 px-4">Tiêu đề mới (New Title)</th>
                <th className="py-3 px-3 text-center">Ngày đổi</th>
                <th className="py-3 px-3 text-right">CTR gốc</th>
                <th className="py-3 px-3 text-right">CTR hiện tại</th>
                <th className="py-3 px-4">Lý do điều chỉnh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {titleHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                    {item.pageUrl}
                  </td>
                  <td className="py-3 px-4 text-gray-500 max-w-xs line-clamp-1">
                    {item.oldTitle}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 max-w-xs line-clamp-1">
                    {item.newTitle}
                  </td>
                  <td className="py-3 px-3 text-center text-gray-500 font-mono text-[11px]">
                    {item.dateChanged}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-500">
                    {item.baselineCtr.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    {item.currentCtr ? (
                      <span className="font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        {item.currentCtr.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">Đang theo dõi</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-[11px]">
                    {item.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL IMPORT GSC CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <UploadCloud className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 font-heading">
                    Nhập dữ liệu Google Search Console
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Thuộc tính: https://www.shoptftmobile.net
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Khoảng thời gian (Period):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["7d", "28d", "3m"] as GscPeriodKey[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setImportPeriod(p)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        importPeriod === p
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p === "7d" ? "7 ngày qua" : p === "28d" ? "28 ngày qua" : "3 tháng qua"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tải lên tệp Queries.csv:
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Hoặc dán nội dung CSV vào đây:
                </label>
                <textarea
                  value={importCsvContent}
                  onChange={(e) => setImportCsvContent(e.target.value)}
                  placeholder="Top queries,Clicks,Impressions,CTR,Position&#10;thuê acc tft,120,1800,6.67%,4.2&#10;shoptftmobile,350,2100,16.67%,1.1..."
                  rows={6}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Hỗ trợ cả tiêu đề tiếng Anh (Top queries, Clicks, Impressions, CTR, Position) và tiếng Việt (Cụm từ tìm kiếm, Số lượt nhấp, Số lượt hiển thị, CTR, Vị trí).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                disabled={isImporting || !importCsvContent.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Xác nhận &amp; Tính toán</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
