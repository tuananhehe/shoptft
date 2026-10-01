"use client";

import React, { useState, useMemo } from "react";
import {
  FlaskConical,
  TrendingUp,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Info,
  Check,
  X,
  Target,
  BarChart2,
  FileText,
  Sliders,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  SerpExperimentsReport,
  SerpExperimentItem,
  SerpCtrOpportunity,
  GoogleRewriteAuditItem,
  SerpExperimentStatus,
  SerpPriority,
} from "@/utils/seo-shared";
import toast from "react-hot-toast";

interface SerpExperimentsTabProps {
  report: SerpExperimentsReport | null;
  onRefresh?: () => void;
  onAddExperiment?: (item: Omit<SerpExperimentItem, "id">) => Promise<boolean>;
  onUpdateExperiment?: (id: string, updates: Partial<SerpExperimentItem>) => Promise<boolean>;
  onDeleteExperiment?: (id: string) => Promise<boolean>;
}

export function SerpExperimentsTab({
  report,
  onRefresh,
  onAddExperiment,
  onUpdateExperiment,
  onDeleteExperiment,
}: SerpExperimentsTabProps) {
  const [subTab, setSubTab] = useState<"experiments" | "opportunities" | "ai_assistant" | "rewrites">(
    "experiments"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // State modal add/edit
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SerpExperimentItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    page: "/thue-acc-tft-dtcl",
    primaryQuery: "",
    oldTitle: "",
    testTitle: "",
    oldMeta: "",
    testMeta: "",
    status: "Running" as SerpExperimentStatus,
    baselineImpressions: 0,
    baselineClicks: 0,
    baselinePosition: 0,
    currentImpressions: 0,
    currentClicks: 0,
    currentPosition: 0,
    downstreamConversionRate: 0,
    notes: "",
    auditFindings: "",
  });

  // State AI Generator
  const [aiTargetPage, setAiTargetPage] = useState("/thue-acc-tft-dtcl");
  const [aiTargetQuery, setAiTargetQuery] = useState("thuê acc tft");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTitleVariants, setAiTitleVariants] = useState<
    { type: string; title: string; rationale: string; length: number }[]
  >([]);
  const [aiMetaVariants, setAiMetaVariants] = useState<
    { type: string; meta: string; rationale: string; length: number }[]
  >([]);

  const experiments = report?.experiments || [];
  const opportunities = report?.opportunities || [];
  const rewrites = report?.rewriteAudits || [];
  const summary = report?.summary || {
    totalExperiments: 0,
    running: 0,
    inReview: 0,
    kept: 0,
    reverted: 0,
    avgCtrLift: 0,
    highPriorityOpportunities: 0,
  };
  const brandVsNonBrand = report?.brandVsNonBrandCtr;
  const organicFunnel = report?.organicConversionTracking;

  // Filtered experiments
  const filteredExperiments = useMemo(() => {
    return experiments.filter((item) => {
      const matchSearch =
        item.primaryQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.testTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [experiments, searchTerm, statusFilter]);

  // Filtered opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const matchSearch =
        item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pageUrl.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPriority = priorityFilter === "ALL" || item.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [opportunities, searchTerm, priorityFilter]);

  const handleOpenAddModal = (prefill?: Partial<typeof formData>) => {
    setEditingItem(null);
    setFormData({
      page: prefill?.page || "/thue-acc-tft-dtcl",
      primaryQuery: prefill?.primaryQuery || "",
      oldTitle: prefill?.oldTitle || "",
      testTitle: prefill?.testTitle || "",
      oldMeta: prefill?.oldMeta || "",
      testMeta: prefill?.testMeta || "",
      status: "Running",
      baselineImpressions: prefill?.baselineImpressions || 0,
      baselineClicks: prefill?.baselineClicks || 0,
      baselinePosition: prefill?.baselinePosition || 0,
      currentImpressions: 0,
      currentClicks: 0,
      currentPosition: 0,
      downstreamConversionRate: 0,
      notes: prefill?.notes || "",
      auditFindings: "",
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: SerpExperimentItem) => {
    setEditingItem(item);
    setFormData({
      page: item.page,
      primaryQuery: item.primaryQuery,
      oldTitle: item.oldTitle,
      testTitle: item.testTitle,
      oldMeta: item.oldMeta,
      testMeta: item.testMeta,
      status: item.status,
      baselineImpressions: item.baselineImpressions,
      baselineClicks: item.baselineClicks,
      baselinePosition: item.baselinePosition,
      currentImpressions: item.currentImpressions || 0,
      currentClicks: item.currentClicks || 0,
      currentPosition: item.currentPosition || 0,
      downstreamConversionRate: item.downstreamConversionRate || 0,
      notes: item.notes || "",
      auditFindings: item.auditFindings || "",
    });
    setShowModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.primaryQuery.trim() || !formData.testTitle.trim()) {
      toast.error("Vui lòng điền Query chính và Tiêu đề thử nghiệm (Test Title)!");
      return;
    }

    try {
      if (editingItem) {
        if (onUpdateExperiment) {
          await onUpdateExperiment(editingItem.id, {
            ...formData,
            currentImpressions: Number(formData.currentImpressions),
            currentClicks: Number(formData.currentClicks),
            currentPosition: Number(formData.currentPosition),
            downstreamConversionRate: Number(formData.downstreamConversionRate),
          });
          toast.success("Đã cập nhật thử nghiệm SERP!");
        }
      } else {
        if (onAddExperiment) {
          const baselineCtr =
            formData.baselineImpressions > 0
              ? +((formData.baselineClicks / formData.baselineImpressions) * 100).toFixed(2)
              : 0;

          await onAddExperiment({
            page: formData.page,
            primaryQuery: formData.primaryQuery,
            oldTitle: formData.oldTitle,
            testTitle: formData.testTitle,
            oldMeta: formData.oldMeta,
            testMeta: formData.testMeta,
            startDate: new Date().toISOString(),
            reviewDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
            status: formData.status,
            baselineImpressions: Number(formData.baselineImpressions),
            baselineClicks: Number(formData.baselineClicks),
            baselineCtr,
            baselinePosition: Number(formData.baselinePosition),
            currentImpressions: formData.currentImpressions ? Number(formData.currentImpressions) : undefined,
            currentClicks: formData.currentClicks ? Number(formData.currentClicks) : undefined,
            currentPosition: formData.currentPosition ? Number(formData.currentPosition) : undefined,
            downstreamConversionRate: formData.downstreamConversionRate ? Number(formData.downstreamConversionRate) : undefined,
            notes: formData.notes,
            auditFindings: formData.auditFindings,
          });
          toast.success("Đã thêm thử nghiệm SERP mới!");
        }
      }
      setShowModal(false);
      onRefresh?.();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu thử nghiệm!");
    }
  };

  const handleQuickStatusChange = async (item: SerpExperimentItem, newStatus: SerpExperimentStatus) => {
    if (!onUpdateExperiment) return;
    try {
      await onUpdateExperiment(item.id, { status: newStatus });
      toast.success(`Đã chuyển trạng thái sang "${newStatus}"!`);
      onRefresh?.();
    } catch {
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi thử nghiệm này?")) return;
    if (!onDeleteExperiment) return;
    try {
      await onDeleteExperiment(id);
      toast.success("Đã xóa thử nghiệm SERP!");
      onRefresh?.();
    } catch {
      toast.error("Không thể xóa thử nghiệm!");
    }
  };

  // Run AI Variants Generator
  const handleGenerateAiVariants = async () => {
    setAiLoading(true);
    try {
      const [titleRes, metaRes] = await Promise.all([
        fetch(
          `/api/admin/seo?action=serp_ai_title&pageUrl=${encodeURIComponent(
            aiTargetPage
          )}&query=${encodeURIComponent(aiTargetQuery)}`
        ).then((r) => r.json()),
        fetch(
          `/api/admin/seo?action=serp_ai_meta&pageUrl=${encodeURIComponent(
            aiTargetPage
          )}&query=${encodeURIComponent(aiTargetQuery)}`
        ).then((r) => r.json()),
      ]);

      if (titleRes.success && Array.isArray(titleRes.variants)) {
        setAiTitleVariants(titleRes.variants);
      }
      if (metaRes.success && Array.isArray(metaRes.variants)) {
        setAiMetaVariants(metaRes.variants);
      }
      toast.success("Đã tạo xong các đề xuất Title & Meta từ Trợ lý AI!");
    } catch {
      toast.error("Lỗi khi kết nối Trợ lý AI!");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Experiments & Status */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Tổng Thử Nghiệm SERP
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FlaskConical className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-gray-900">
              {summary.totalExperiments}
            </span>
            <span className="text-xs text-gray-700">đợt test ghi nhận</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
              {summary.running} Running
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-semibold border border-amber-200">
              {summary.inReview} Review
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              {summary.kept} Keep
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 font-semibold border border-rose-200">
              {summary.reverted} Revert
            </span>
          </div>
        </div>

        {/* Card 2: Average CTR Lift */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Mức Tăng CTR Trung Bình
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-emerald-600">
              +{summary.avgCtrLift}%
            </span>
            <span className="text-xs text-emerald-800 font-semibold">tăng trưởng CTR</span>
          </div>
          <p className="mt-2 text-xs text-gray-700">
            Dựa trên các bài test chu kỳ tối thiểu 28 ngày qua Search Console
          </p>
        </div>

        {/* Card 3: High Priority Opportunities */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Cơ Hội CTR Ưu Tiên Cao
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Target className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-rose-600">
              {summary.highPriorityOpportunities}
            </span>
            <span className="text-xs text-rose-800 font-semibold">truy vấn Top 1–10</span>
          </div>
          <p className="mt-2 text-xs text-gray-700">
            Có lượng Impression lớn nhưng CTR thực tế dưới mức benchmark chuẩn
          </p>
        </div>

        {/* Card 4: Google Rewrites Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Soát Lỗi Google Rewrite
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-gray-900">
              {rewrites.length}
            </span>
            <span className="text-xs text-gray-700">trang theo dõi</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-emerald-800 font-semibold">
              {rewrites.filter((r) => r.status === "matched").length} khớp chuẩn
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-amber-900 font-semibold">
              {rewrites.filter((r) => r.status !== "matched").length} bị rút ngắn/đổi
            </span>
          </div>
        </div>
      </div>

      {/* Brand vs Non-Brand & Funnel Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Brand vs Non-Brand CTR Card */}
        {brandVsNonBrand && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <BarChart2 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-gray-900">
                  Hiệu Suất CTR: Brand vs Non-Brand (28 Ngày)
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                GSC Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
                  <span>Brand Queries</span>
                  <span className="text-[11px] text-blue-800 font-bold">Pos ~1.4</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-900">{brandVsNonBrand.brandCtr}%</div>
                <div className="mt-1 text-[11px] text-gray-700">
                  {brandVsNonBrand.brandClicks.toLocaleString()} clicks / {brandVsNonBrand.brandImpressions.toLocaleString()} impressions
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
                  <span>Non-Brand Queries</span>
                  <span className="text-[11px] text-emerald-800 font-bold">Pos ~10.4</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-800">{brandVsNonBrand.nonBrandCtr}%</div>
                <div className="mt-1 text-[11px] text-gray-700">
                  {brandVsNonBrand.nonBrandClicks.toLocaleString()} clicks / {brandVsNonBrand.nonBrandImpressions.toLocaleString()} impressions
                </div>
                <div className="mt-1.5 text-[10px] text-amber-900 font-medium">
                  Mục tiêu benchmark: {brandVsNonBrand.expectedNonBrandBenchmark}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Downstream Conversion Tracking Card */}
        {organicFunnel && (
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-gray-900">
                  Kiểm Soát Chất Lượng Chuyển Đổi (Phòng Clickbait)
                </h3>
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold">
                Zalo Conv: {organicFunnel.funnelZaloRate}%
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">1. Truy cập tự nhiên (Organic Visits)</span>
                <span className="font-semibold text-gray-900">{organicFunnel.totalOrganicVisits.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-700">2. Vào kho hàng (/shop)</span>
                <span className="font-semibold text-gray-900">
                  {organicFunnel.shopVisits.toLocaleString()} ({organicFunnel.funnelShopRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${organicFunnel.funnelShopRate}%` }}></div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-700">3. Xem chi tiết acc (/acc/[id])</span>
                <span className="font-semibold text-gray-900">
                  {organicFunnel.productViews.toLocaleString()} ({organicFunnel.funnelProductRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${organicFunnel.funnelProductRate}%` }}></div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-700">4. Bấm liên hệ Zalo thuê acc</span>
                <span className="font-bold text-emerald-800">
                  {organicFunnel.zaloInquiries.toLocaleString()} ({organicFunnel.funnelZaloRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${organicFunnel.funnelZaloRate * 4}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs and Search/Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSubTab("experiments")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              subTab === "experiments"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Nhật Ký Thử Nghiệm ({experiments.length})</span>
          </button>

          <button
            onClick={() => setSubTab("opportunities")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              subTab === "opportunities"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-rose-500" />
            <span>Cơ Hội CTR ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setSubTab("ai_assistant")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              subTab === "ai_assistant"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Trợ Lý Sinh Title/Meta AI</span>
          </button>

          <button
            onClick={() => setSubTab("rewrites")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              subTab === "rewrites"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Google Rewrite Audit ({rewrites.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm query, page, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden focus:border-gray-400"
            />
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Test Mới</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: EXPERIMENTS LOG */}
      {subTab === "experiments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>Lọc trạng thái:</span>
              {["ALL", "Running", "Review", "Keep", "Revert"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    statusFilter === st
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              Hiển thị {filteredExperiments.length} / {experiments.length} thử nghiệm
            </span>
          </div>

          {filteredExperiments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
              <FlaskConical className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-800">Không tìm thấy thử nghiệm nào phù hợp</p>
              <p className="text-xs text-gray-500 mt-1">
                Hãy tạo thử nghiệm Title/Meta mới hoặc điều chỉnh bộ lọc tìm kiếm.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExperiments.map((item) => {
                const isLiftPositive = (item.ctrLiftPercentage || 0) > 0;
                const titleLength = item.testTitle.length;
                const metaLength = item.testMeta.length;

                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-gray-300 transition-all space-y-4"
                  >
                    {/* Top Row: Page, Query, Status, Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-mono text-xs font-semibold text-gray-800">
                          {item.page}
                        </span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          Query: &ldquo;{item.primaryQuery}&rdquo;
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.status === "Running"
                              ? "bg-blue-100 text-blue-800"
                              : item.status === "Review"
                              ? "bg-amber-100 text-amber-800"
                              : item.status === "Keep"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Quick Status Buttons */}
                        {item.status === "Running" && (
                          <button
                            onClick={() => handleQuickStatusChange(item, "Review")}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer"
                          >
                            Đưa vào Review
                          </button>
                        )}
                        {item.status === "Review" && (
                          <>
                            <button
                              onClick={() => handleQuickStatusChange(item, "Keep")}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                            >
                              Giữ (Keep)
                            </button>
                            <button
                              onClick={() => handleQuickStatusChange(item, "Revert")}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                            >
                              Hoàn tác (Revert)
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                          title="Chỉnh sửa thử nghiệm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Xóa thử nghiệm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Middle: Title & Meta comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Old vs Test Title */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          Tiêu Đề Thử Nghiệm (Title Tag)
                        </div>
                        <div className="line-through text-gray-500">
                          <span className="font-semibold text-gray-600">Cũ:</span> {item.oldTitle || "Chưa ghi nhận"}
                        </div>
                        <div className="text-gray-900 font-semibold flex items-baseline justify-between gap-2">
                          <div>
                            <span className="text-blue-600 font-bold">Mới:</span> {item.testTitle}
                          </div>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                              titleLength <= 65
                                ? "bg-emerald-100 text-emerald-800 font-bold"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {titleLength} ký tự
                          </span>
                        </div>
                      </div>

                      {/* Old vs Test Meta */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs">
                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                          Thẻ Mô Tả (Meta Description)
                        </div>
                        <div className="line-through text-gray-500 line-clamp-2">
                          <span className="font-semibold text-gray-600">Cũ:</span> {item.oldMeta || "Chưa ghi nhận"}
                        </div>
                        <div className="text-gray-900 flex items-baseline justify-between gap-2">
                          <div className="line-clamp-2">
                            <span className="text-blue-600 font-bold">Mới:</span> {item.testMeta}
                          </div>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                              metaLength <= 160
                                ? "bg-emerald-100 text-emerald-800 font-bold"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {metaLength} ký tự
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Metrics comparison, dates, and notes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs pt-2">
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="text-[10px] text-gray-700 font-semibold">Baseline CTR</div>
                        <div className="text-sm font-bold text-gray-800">{item.baselineCtr}%</div>
                        <div className="text-[10px] text-gray-700 font-medium">Pos {item.baselinePosition}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                        <div className="text-[10px] text-blue-900 font-semibold">Current CTR</div>
                        <div className="text-sm font-bold text-blue-900">
                          {item.currentCtr ? `${item.currentCtr}%` : "Đang đo..."}
                        </div>
                        <div className="text-[10px] text-blue-800 font-medium">
                          {item.currentPosition ? `Pos ${item.currentPosition}` : "Theo dõi"}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                        <div className="text-[10px] text-emerald-900 font-semibold">CTR Lift</div>
                        <div
                          className={`text-sm font-bold ${
                            isLiftPositive ? "text-emerald-800" : "text-rose-800"
                          }`}
                        >
                          {item.ctrLiftPercentage !== undefined
                            ? `${isLiftPositive ? "+" : ""}${item.ctrLiftPercentage}%`
                            : "N/A"}
                        </div>
                        <div className="text-[10px] text-emerald-800 font-medium">Hiệu quả test</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                        <div className="text-[10px] text-purple-900 font-semibold">Zalo Conv</div>
                        <div className="text-sm font-bold text-purple-900">
                          {item.downstreamConversionRate ? `${item.downstreamConversionRate}%` : "6.0%"}
                        </div>
                        <div className="text-[10px] text-purple-800 font-medium">Chất lượng traffic</div>
                      </div>

                      <div className="col-span-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-center">
                        <div className="text-[10px] text-gray-700 font-semibold">Ghi chú & Phát hiện SERP</div>
                        <div className="text-[11px] text-gray-800 font-medium line-clamp-2">
                          {item.notes || item.auditFindings || "Thử nghiệm đang hoạt động ổn định."}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CTR OPPORTUNITIES */}
      {subTab === "opportunities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>Mức ưu tiên:</span>
              {["ALL", "HIGH", "MEDIUM", "LOW"].map((pr) => (
                <button
                  key={pr}
                  onClick={() => setPriorityFilter(pr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    priorityFilter === pr
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {filteredOpportunities.length} cơ hội tiềm năng
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Truy Vấn (Query) & Trang Đích</th>
                    <th className="py-3 px-3">Vị Trí & Lượng Xem</th>
                    <th className="py-3 px-3">CTR Thực Tế vs Chuẩn</th>
                    <th className="py-3 px-3">Khoảng Chênh (Gap)</th>
                    <th className="py-3 px-3">Mức Ưu Tiên</th>
                    <th className="py-3 px-4">Chẩn Đoán & Gợi Ý</th>
                    <th className="py-3 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOpportunities.map((opp, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{opp.query}</div>
                        <div className="font-mono text-[11px] text-blue-600">{opp.pageUrl}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">Intent: {opp.intentType}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-800">Pos {opp.position}</div>
                        <div className="text-[11px] text-gray-500">
                          {opp.impressions.toLocaleString()} imp / {opp.clicks} clicks
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900">{opp.ctr}%</div>
                        <div className="text-[10px] text-gray-500">Kỳ vọng: ~{opp.expectedCtr}%</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold ${
                            opp.ctrGap > 0 ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {opp.ctrGap > 0 ? `-${opp.ctrGap}%` : `+${Math.abs(opp.ctrGap)}%`}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            opp.priority === "HIGH"
                              ? "bg-rose-100 text-rose-800"
                              : opp.priority === "MEDIUM"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {opp.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-[11px] text-gray-700 font-medium">{opp.diagnosis}</p>
                        <p className="text-[10px] text-blue-600 mt-1 italic">{opp.recommendedWording}</p>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            handleOpenAddModal({
                              page: opp.pageUrl,
                              primaryQuery: opp.query,
                              baselineImpressions: opp.impressions,
                              baselineClicks: opp.clicks,
                              baselinePosition: opp.position,
                              notes: opp.diagnosis,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          Tạo Test
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: AI TITLE & META GENERATOR */}
      {subTab === "ai_assistant" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Trợ Lý AI Sinh Biến Thể Title & Meta Tối Ưu CTR
                </h3>
                <p className="text-xs text-gray-500">
                  Sinh 4 phương án Tiêu đề (Intent, Feature, Action, Trust) và 3 phương án Mô tả chuẩn độ dài hiển thị.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Trang Mục Tiêu</label>
                <select
                  value={aiTargetPage}
                  onChange={(e) => setAiTargetPage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
                >
                  <option value="/thue-acc-tft-dtcl">/thue-acc-tft-dtcl (Landing Thuê Acc)</option>
                  <option value="/shop">/shop (Kho Acc TFT - ĐTCL)</option>
                  <option value="/blog/tft-mua-18">/blog/tft-mua-18 (Hub TFT Mùa 18)</option>
                  <option value="/ve-shop">/ve-shop (Về ShopTFTMobile & Brand)</option>
                  <option value="/huong-dan/doi-thong-tin-acc-riot">/huong-dan/doi-thong-tin-acc-riot</option>
                  <option value="/">/ (Trang Chủ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Từ Khóa Trọng Tâm</label>
                <input
                  type="text"
                  value={aiTargetQuery}
                  onChange={(e) => setAiTargetQuery(e.target.value)}
                  placeholder="Ví dụ: thuê acc tft, kho acc tft..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGenerateAiVariants}
                  disabled={aiLoading}
                  className="w-full px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {aiLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Sinh Biến Thể Đề Xuất</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Variants Results */}
          {(aiTitleVariants.length > 0 || aiMetaVariants.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Title Variants */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>4 Phương Án Tiêu Đề (Title Variants)</span>
                  </h4>
                  <span className="text-[11px] text-gray-500 font-medium">Chuẩn &lt; 65 ký tự</span>
                </div>

                <div className="space-y-3">
                  {aiTitleVariants.map((tv, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-gray-300 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                          {tv.type}
                        </span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                            tv.length <= 65
                              ? "bg-emerald-100 text-emerald-800 font-bold"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {tv.length} chars
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-900">{tv.title}</div>
                      <p className="text-[11px] text-gray-500">{tv.rationale}</p>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            handleOpenAddModal({
                              page: aiTargetPage,
                              primaryQuery: aiTargetQuery,
                              testTitle: tv.title,
                              notes: `Tạo từ Trợ lý AI (${tv.type}): ${tv.rationale}`,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>Áp dụng vào Test</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta Variants */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-purple-500" />
                    <span>3 Phương Án Mô Tả (Meta Variants)</span>
                  </h4>
                  <span className="text-[11px] text-gray-500 font-medium">Chuẩn &lt; 160 ký tự</span>
                </div>

                <div className="space-y-3">
                  {aiMetaVariants.map((mv, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-gray-300 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                          {mv.type}
                        </span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                            mv.length <= 160
                              ? "bg-emerald-100 text-emerald-800 font-bold"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {mv.length} chars
                        </span>
                      </div>
                      <div className="text-xs text-gray-800 leading-relaxed font-medium">{mv.meta}</div>
                      <p className="text-[11px] text-gray-500">{mv.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: GOOGLE REWRITE AUDIT */}
      {subTab === "rewrites" && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Về cơ chế Google Title Rewrite:</p>
              <p className="text-blue-800 mt-0.5">
                Google có thể tự động viết lại hoặc rút ngắn tiêu đề trên trang kết quả tìm kiếm (SERP) nếu thẻ Title quá dài (&gt; 65-70 ký tự), thiếu tên thương hiệu, không khớp với H1 của trang, hoặc chứa từ ngữ quảng cáo quá đà.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {rewrites.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                      {item.pageUrl}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === "matched"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "rewritten"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">
                      Tiêu đề được cấu hình trong thẻ &lt;title&gt;
                    </div>
                    <div className="text-gray-800 font-medium mt-1">{item.configuredTitle}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="text-[10px] text-blue-700 font-semibold uppercase">
                      Google SERP Snippet thực tế
                    </div>
                    <div className="text-blue-950 font-bold mt-1">{item.serpDisplayTitle}</div>
                  </div>
                </div>

                <div className="pt-1 space-y-1 text-xs">
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-900">Nguyên nhân:</span> {item.rewriteReason}
                  </p>
                  <p className="text-emerald-700 font-medium">
                    <span className="font-semibold text-emerald-900">Khuyến nghị xử lý:</span>{" "}
                    {item.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EXPERIMENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-gray-100 text-gray-800">
                  <FlaskConical className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingItem ? "Cập Nhật Thử Nghiệm SERP" : "Thêm Thử Nghiệm SERP Mới"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Đường Dẫn Trang (Page URL) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.page}
                    onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                    placeholder="/thue-acc-tft-dtcl"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Truy Vấn Chính (Primary Query) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.primaryQuery}
                    onChange={(e) => setFormData({ ...formData, primaryQuery: e.target.value })}
                    placeholder="thuê acc tft"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tiêu Đề Cũ (Old Title)
                  </label>
                  <input
                    type="text"
                    value={formData.oldTitle}
                    onChange={(e) => setFormData({ ...formData, oldTitle: e.target.value })}
                    placeholder="Thuê Acc TFT - ĐTCL | ShopTFTMobile"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-900">
                      Tiêu Đề Thử Nghiệm (Test Title) *
                    </label>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                        formData.testTitle.length <= 65
                          ? "bg-emerald-100 text-emerald-800 font-bold"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {formData.testTitle.length} ký tự (Khuyến nghị: 50–65)
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.testTitle}
                    onChange={(e) => setFormData({ ...formData, testTitle: e.target.value })}
                    placeholder="Thuê Acc TFT - ĐTCL Giá Tốt: Pet, Chibi & Sân Đấu | ShopTFTMobile"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Meta Section */}
              <div className="space-y-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mô Tả Cũ (Old Meta)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.oldMeta}
                    onChange={(e) => setFormData({ ...formData, oldMeta: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-900">
                      Mô Tả Thử Nghiệm (Test Meta)
                    </label>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                        formData.testMeta.length <= 160
                          ? "bg-emerald-100 text-emerald-800 font-bold"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {formData.testMeta.length} ký tự (Khuyến nghị: 130–160)
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.testMeta}
                    onChange={(e) => setFormData({ ...formData, testMeta: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden text-gray-900 font-medium"
                  />
                </div>
              </div>

              {/* Baseline Metrics */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                <div className="text-xs font-bold text-blue-900">Số Liệu Cơ Sở Trước Khi Test (Baseline Metrics)</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">Baseline Impressions</label>
                    <input
                      type="number"
                      value={formData.baselineImpressions}
                      onChange={(e) =>
                        setFormData({ ...formData, baselineImpressions: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">Baseline Clicks</label>
                    <input
                      type="number"
                      value={formData.baselineClicks}
                      onChange={(e) => setFormData({ ...formData, baselineClicks: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">Baseline Position</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.baselinePosition}
                      onChange={(e) =>
                        setFormData({ ...formData, baselinePosition: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Current Metrics (Optional / Live) */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="text-xs font-bold text-emerald-900">
                  Số Liệu Trong Chu Kỳ Thử Nghiệm (Current Metrics)
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">Current Imp</label>
                    <input
                      type="number"
                      value={formData.currentImpressions}
                      onChange={(e) =>
                        setFormData({ ...formData, currentImpressions: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">Current Clicks</label>
                    <input
                      type="number"
                      value={formData.currentClicks}
                      onChange={(e) => setFormData({ ...formData, currentClicks: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">Current Pos</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.currentPosition}
                      onChange={(e) =>
                        setFormData({ ...formData, currentPosition: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">Zalo Conv %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.downstreamConversionRate}
                      onChange={(e) =>
                        setFormData({ ...formData, downstreamConversionRate: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Trạng Thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as SerpExperimentStatus })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden font-semibold"
                  >
                    <option value="Running">Running (Đang chạy test)</option>
                    <option value="Review">Review (Đang xét duyệt)</option>
                    <option value="Keep">Keep (Áp dụng lâu dài)</option>
                    <option value="Revert">Revert (Hoàn tác)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ghi Chú Đánh Giá / Phát Hiện SERP
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="CTR tăng tốt, không ảnh hưởng conversion..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
                >
                  {editingItem ? "Lưu Cập Nhật" : "Bắt Đầu Thử Nghiệm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
