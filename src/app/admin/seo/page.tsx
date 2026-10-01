"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Globe,
  FileText,
  Package,
  Layers,
  Repeat,
  Code2,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  Info,
  Sliders,
  Shield,
  ArrowRight,
  Sparkles,
  ImageIcon,
  Share2,
  Link2,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import {
  SeoConfigDatabase,
  SeoAuditReport,
  DEFAULT_SEO_CONFIG,
  RedirectRule,
  formatProductSeo,
  ImageHealthReport,
  InternalLinksAuditReport,
  GscPerformanceReport,
  ContentOpportunityItem,
  ContentBrief,
  BacklinkMonitorReport,
  BacklinkItem,
} from "@/utils/seo-shared";
import { ContentRefreshTab } from "@/components/admin/content-refresh-tab";
import { InternalLinksTab } from "@/components/admin/internal-links-tab";
import { RankingOptimizationTab } from "@/components/admin/ranking-optimization-tab";
import { ContentOpportunitiesTab } from "@/components/admin/content-opportunities-tab";
import { BacklinksTab } from "@/components/admin/backlinks-tab";

type TabKey =
  | "overview"
  | "pages"
  | "products"
  | "refresh"
  | "internal_links"
  | "ranking"
  | "content_opportunities"
  | "backlinks"
  | "sitemap"
  | "redirects"
  | "schema"
  | "settings";

const SAMPLE_ACCOUNTS = [
  {
    id: "sample-1",
    code: "MS: 9966",
    title: "Acc Ahri Tí Nị Chiêu Hồn + Sân EDM Đổi Nhạc",
    type: "VIP",
    mainChibi: "Ahri Tí Nị Chiêu Hồn",
    mainArena: "Sân Đấu EDM Đổi Nhạc",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    price: 3600,
    hourlyPrice: 3600,
  },
  {
    id: "sample-2",
    code: "MS: 8821",
    title: "Acc Yasuo Tí Nị Kiếm Sư Bão Kiếm + Rank Cao Thủ",
    type: "VIP",
    mainChibi: "Yasuo Tí Nị Kiếm Sư",
    mainArena: "Sân Đấu Thần Thoại",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    price: 4500,
    hourlyPrice: 4500,
  },
  {
    id: "sample-3",
    code: "MS: 3310",
    title: "Acc Clone Rank Kim Cương - Sẵn Đánh Ngay",
    type: "CLONE",
    mainChibi: "Linh Thú Poro",
    mainArena: "Sân Đấu Tiêu Chuẩn",
    thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    price: 2500,
    hourlyPrice: 2500,
  },
];

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SeoConfigDatabase>(DEFAULT_SEO_CONFIG);
  const [audit, setAudit] = useState<SeoAuditReport | null>(null);
  const [productMetrics, setProductMetrics] = useState({
    totalIndexable: 48,
    missingTitle: 0,
    missingImage: 0,
    invalidSlug: 0,
    duplicateCanonical: 0,
    hiddenRisk: 0,
  });

  // Sub-states
  const [selectedPageKey, setSelectedPageKey] = useState<string>("/");
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [auditFilter, setAuditFilter] = useState<"all" | "error" | "warning" | "passed">("all");
  const [imageHealth, setImageHealth] = useState<ImageHealthReport | null>(null);
  const [internalLinksAudit, setInternalLinksAudit] = useState<InternalLinksAuditReport | null>(null);
  const [gscReport, setGscReport] = useState<GscPerformanceReport | null>(null);
  const [contentOpportunities, setContentOpportunities] = useState<ContentOpportunityItem[]>([]);
  const [contentBriefs, setContentBriefs] = useState<ContentBrief[]>([]);
  const [backlinkReport, setBacklinkReport] = useState<BacklinkMonitorReport | null>(null);
  const [socialNetworkPreview, setSocialNetworkPreview] = useState<"facebook" | "twitter">("facebook");

  // Fetch SEO configuration from API
  const fetchSeoData = async () => {
    try {
      setLoading(true);
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/seo", {
        headers: localToken ? { "x-admin-token": localToken } : {},
      });
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
        if (data.audit) setAudit(data.audit);
        if (data.productMetrics) setProductMetrics(data.productMetrics);
        if (data.imageHealth) setImageHealth(data.imageHealth);
        if (data.internalLinksAudit) setInternalLinksAudit(data.internalLinksAudit);
        if (data.gscReport) {
          setGscReport(data.gscReport);
          if (data.gscReport.contentOpportunities) {
            setContentOpportunities(data.gscReport.contentOpportunities);
          }
        }
        if (data.contentOpportunities) setContentOpportunities(data.contentOpportunities);
        if (data.contentBriefs) setContentBriefs(data.contentBriefs);
        if (data.backlinkReport) setBacklinkReport(data.backlinkReport);
      } else {
        toast.error(data.error || "Không thể tải dữ liệu SEO!");
      }
    } catch {
      toast.error("Lỗi kết nối khi tải cấu hình SEO!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBacklink = async (item: Omit<BacklinkItem, "id" | "firstSeen" | "lastSeen">) => {
    const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
    const res = await fetch("/api/admin/seo?action=add_backlink", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localToken ? { "x-admin-token": localToken } : {}),
      },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (data.success) {
      if (data.backlinkReport) setBacklinkReport(data.backlinkReport);
      return true;
    }
    throw new Error(data.error || "Lỗi khi thêm backlink");
  };

  const handleUpdateBacklink = async (id: string, updates: Partial<BacklinkItem>) => {
    const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
    const res = await fetch("/api/admin/seo?action=update_backlink", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localToken ? { "x-admin-token": localToken } : {}),
      },
      body: JSON.stringify({ id, updates }),
    });
    const data = await res.json();
    if (data.success) {
      if (data.backlinkReport) setBacklinkReport(data.backlinkReport);
      return true;
    }
    throw new Error(data.error || "Lỗi khi cập nhật backlink");
  };

  const handleDeleteBacklink = async (id: string) => {
    const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
    const res = await fetch("/api/admin/seo?action=delete_backlink", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localToken ? { "x-admin-token": localToken } : {}),
      },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      if (data.backlinkReport) setBacklinkReport(data.backlinkReport);
      return true;
    }
    throw new Error(data.error || "Lỗi khi xóa backlink");
  };

  const handleImportBacklinksCsv = async (csvContent: string) => {
    const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
    const res = await fetch("/api/admin/seo?action=import_backlinks_csv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localToken ? { "x-admin-token": localToken } : {}),
      },
      body: JSON.stringify({ csvContent }),
    });
    const data = await res.json();
    if (data.success) {
      if (data.backlinkReport) setBacklinkReport(data.backlinkReport);
      return { importedCount: data.message?.includes("thành công") ? (data.backlinkReport?.summary?.totalBacklinks || 1) : 0, errors: data.errors || [] };
    }
    return { importedCount: 0, errors: [data.error || "Lỗi import CSV"] };
  };

  useEffect(() => {
    fetchSeoData();
  }, []);

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Đang lưu cấu hình SEO...");
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(localToken ? { "x-admin-token": localToken } : {}),
        },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Đã lưu cài đặt SEO thành công!", { id: toastId });
        if (data.data) setConfig(data.data);
        if (data.audit) setAudit(data.audit);
      } else {
        toast.error(data.error || "Lưu thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi lưu cài đặt SEO!", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!confirm("Bạn có chắc chắn muốn khôi phục toàn bộ cấu hình SEO về mặc định chuẩn hóa?")) return;
    const toastId = toast.loading("Đang khôi phục SEO mặc định...");
    try {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("shoptft_admin_token") : null;
      const res = await fetch("/api/admin/seo?action=reset", {
        method: "PUT",
        headers: localToken ? { "x-admin-token": localToken } : {},
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Đã khôi phục mặc định thành công!", { id: toastId });
        if (data.data) setConfig(data.data);
        if (data.audit) setAudit(data.audit);
      } else {
        toast.error(data.error || "Lỗi khôi phục!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối khi khôi phục!", { id: toastId });
    }
  };

  // Helper for updating nested page
  const updatePageField = (path: string, field: string, value: any) => {
    setConfig((prev) => {
      const curPage = prev.pages[path] || {
        path,
        name: path,
        title: "",
        description: "",
      };
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [path]: {
            ...curPage,
            [field]: value,
          },
        },
      };
    });
  };

  // Helper for updating page robots
  const updatePageRobots = (path: string, field: "index" | "follow", value: boolean) => {
    setConfig((prev) => {
      const curPage = prev.pages[path] || {
        path,
        name: path,
        title: "",
        description: "",
      };
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [path]: {
            ...curPage,
            robots: {
              index: curPage.robots?.index ?? true,
              follow: curPage.robots?.follow ?? true,
              [field]: value,
            },
          },
        },
      };
    });
  };

  // Helper for redirects
  const addRedirectRule = () => {
    const newRule: RedirectRule = {
      id: `red-${Date.now()}`,
      source: "",
      destination: "",
      permanent: true,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    setConfig((prev) => ({
      ...prev,
      redirects: [...prev.redirects, newRule],
    }));
  };

  const removeRedirectRule = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      redirects: prev.redirects.filter((r) => r.id !== id),
    }));
  };

  const updateRedirectRule = (id: string, field: keyof RedirectRule, value: any) => {
    setConfig((prev) => ({
      ...prev,
      redirects: prev.redirects.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 text-gray-500 animate-spin" />
        <p className="text-xs text-gray-600 font-medium">Đang tải cấu hình SEO hệ thống...</p>
      </div>
    );
  }

  const selectedPage = config.pages[selectedPageKey] || {
    path: selectedPageKey,
    name: selectedPageKey,
    title: "",
    description: "",
  };

  const currentSample = SAMPLE_ACCOUNTS[selectedSampleIndex];
  const productPreview = formatProductSeo(
    currentSample,
    config.productTemplate,
    config.global.siteName
  );

  const filteredIssues = (audit?.issues || []).filter((issue) => {
    if (auditFilter === "all") return true;
    return issue.type === auditFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gray-100 text-gray-800">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-heading font-bold text-gray-900">
              Quản Trị Hệ Thống SEO Toàn Diện
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tối ưu metadata, canonical, OpenGraph, sitemap, robots, schema và redirect không xung đột.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gray-950 hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto shadow-xs custom-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "overview"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Tổng quan</span>
          {audit && audit.summary.errors > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {audit.summary.errors}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("pages")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "pages"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Trang ({Object.keys(config.pages).length})</span>
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "products"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Sản phẩm</span>
        </button>

        <button
          onClick={() => setActiveTab("refresh")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "refresh"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Content Refresh</span>
        </button>

        <button
          onClick={() => setActiveTab("internal_links")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "internal_links"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-blue-500" />
          <span>Internal Links</span>
          {internalLinksAudit && (internalLinksAudit.brokenLinks.length > 0 || internalLinksAudit.orphanPages.length > 0) && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {internalLinksAudit.brokenLinks.length + internalLinksAudit.orphanPages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("ranking")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "ranking"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>Thứ Hạng & GSC</span>
          {gscReport && gscReport.opportunities.filter((o) => o.priority === "HIGH").length > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {gscReport.opportunities.filter((o) => o.priority === "HIGH").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("content_opportunities")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "content_opportunities"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-500" />
          <span>Content Opportunities</span>
          {contentOpportunities.filter((o) => o.priority === "HIGH").length > 0 && (
            <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold">
              {contentOpportunities.filter((o) => o.priority === "HIGH").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("backlinks")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "backlinks"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-teal-500" />
          <span>Backlink Monitor</span>
          {backlinkReport && backlinkReport.summary.totalBacklinks > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
              {backlinkReport.summary.totalBacklinks}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("sitemap")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "sitemap"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Sitemap & Robots</span>
        </button>

        <button
          onClick={() => setActiveTab("redirects")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "redirects"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Redirect ({config.redirects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("schema")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "schema"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Schema</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "settings"
              ? "bg-gray-900 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Cài đặt</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TỔNG QUAN & BÁO CÁO SỨC KHỎE SEO                        */}
      {/* ============================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Trạng thái sức khỏe
              </span>
              <div className="mt-2 flex items-center gap-2">
                {audit?.healthStatus === "excellent" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Rất tốt (Sẵn sàng)</span>
                  </span>
                )}
                {audit?.healthStatus === "good" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Tốt (Có vài lưu ý)</span>
                  </span>
                )}
                {audit?.healthStatus === "needs_attention" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Cần chú ý</span>
                  </span>
                )}
                {audit?.healthStatus === "critical" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Có lỗi nghiêm trọng</span>
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Lỗi cần khắc phục
              </span>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {audit?.summary.errors || 0}
              </p>
              <span className="text-[11px] text-gray-400">Ảnh hưởng xếp hạng</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Cảnh báo tối ưu
              </span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {audit?.summary.warnings || 0}
              </p>
              <span className="text-[11px] text-gray-400">Khuyến nghị cải thiện</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Hạng mục đạt chuẩn
              </span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {audit?.summary.passed || 0}
              </p>
              <span className="text-[11px] text-gray-400">Đã tối ưu chuẩn Google</span>
            </div>
          </div>

          {/* Audit Issues List with Filter */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-bold text-sm text-gray-900">
                  Chi tiết kiểm tra & Sức khỏe SEO kỹ thuật
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Phân tích tự động dựa trên thẻ Title, Meta Description, Canonical, Sitemap và Loop Redirect.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs">
                <button
                  onClick={() => setAuditFilter("all")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    auditFilter === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600"
                  }`}
                >
                  Tất cả ({audit?.summary.total || 0})
                </button>
                <button
                  onClick={() => setAuditFilter("error")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    auditFilter === "error" ? "bg-white text-red-600 shadow-xs" : "text-gray-600"
                  }`}
                >
                  Lỗi ({audit?.summary.errors || 0})
                </button>
                <button
                  onClick={() => setAuditFilter("warning")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    auditFilter === "warning" ? "bg-white text-amber-600 shadow-xs" : "text-gray-600"
                  }`}
                >
                  Cảnh báo ({audit?.summary.warnings || 0})
                </button>
                <button
                  onClick={() => setAuditFilter("passed")}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    auditFilter === "passed" ? "bg-white text-emerald-600 shadow-xs" : "text-gray-600"
                  }`}
                >
                  Đạt ({audit?.summary.passed || 0})
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto custom-scrollbar">
              {filteredIssues.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  Không có mục kiểm tra nào trong bộ lọc này.
                </div>
              ) : (
                filteredIssues.map((issue) => (
                  <div key={issue.id} className="p-4 flex items-start gap-3 hover:bg-gray-50/60 transition-colors">
                    <div className="mt-0.5 flex-shrink-0">
                      {issue.type === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {issue.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {issue.type === "passed" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-gray-900">{issue.title}</span>
                        {issue.page && (
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-mono text-[10px]">
                            {issue.page}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] uppercase">
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{issue.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Image SEO & Social Preview Health Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-heading font-bold text-sm text-gray-900">
                    Sức Khỏe Hình Ảnh & Social Preview (Image Health)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Kiểm tra thẻ Alt text, kích thước tải, tỷ lệ khung hình và ảnh đại diện chia sẻ mạng xã hội (OpenGraph).
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-500 block">Tỉ lệ ảnh đạt chuẩn</span>
                <span className="text-sm font-bold text-emerald-600">
                  {imageHealth && imageHealth.totalChecked > 0
                    ? Math.round(
                        (Math.max(0, imageHealth.totalChecked - imageHealth.items.length) /
                          imageHealth.totalChecked) *
                          100
                      )
                    : 100}
                  %
                </span>
              </div>
            </div>

            {/* Image Metrics Grid */}
            <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-5 gap-3 border-b border-gray-100 bg-gray-50/50">
              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Tổng ảnh quét
                </span>
                <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                  {imageHealth?.totalChecked || 0}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Thiếu Alt text
                </span>
                <span
                  className={`text-lg font-bold mt-0.5 block ${
                    (imageHealth?.missingAlt || 0) > 0 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {imageHealth?.missingAlt || 0}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Thiếu OpenGraph
                </span>
                <span
                  className={`text-lg font-bold mt-0.5 block ${
                    (imageHealth?.missingOg || 0) > 0 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {imageHealth?.missingOg || 0}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Ảnh lỗi / Trống
                </span>
                <span
                  className={`text-lg font-bold mt-0.5 block ${
                    (imageHealth?.brokenImage || 0) > 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {imageHealth?.brokenImage || 0}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Vượt dung lượng
                </span>
                <span
                  className={`text-lg font-bold mt-0.5 block ${
                    (imageHealth?.oversizedImage || 0) > 0 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {imageHealth?.oversizedImage || 0}
                </span>
              </div>
            </div>

            {/* List of Image Audit Findings */}
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {!imageHealth || imageHealth.items.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <span>Toàn bộ hình ảnh hệ thống đã có Alt text và OpenGraph đầy đủ!</span>
                </div>
              ) : (
                imageHealth.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 sm:p-4 flex items-start justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 flex-shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                            {item.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-gray-100 text-gray-600">
                            {item.source}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5 font-mono">
                          {item.url}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.severity === "error" ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Lỗi</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Khuyến nghị</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: QUẢN LÝ TRANG (PAGES METADATA)                           */}
      {/* ============================================================== */}
      {activeTab === "pages" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Page Selector Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-3 shadow-xs space-y-1.5 h-fit">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-1 block">
              Danh sách trang tĩnh chính
            </span>
            {Object.entries(config.pages).map(([pKey, pVal]) => (
              <button
                key={pKey}
                onClick={() => setSelectedPageKey(pKey)}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                  selectedPageKey === pKey
                    ? "bg-gray-100 text-gray-950 font-bold border-l-4 border-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{pVal.name || pKey}</span>
                  <span className="text-[10px] font-mono text-gray-400">{pKey}</span>
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-1">
                  {pVal.title || "Chưa có Title"}
                </p>
              </button>
            ))}
          </div>

          {/* Page Editor & Live Preview */}
          <div className="lg:col-span-8 space-y-6">
            {/* Editor Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-heading font-bold text-sm text-gray-900">
                    Cấu hình SEO: {selectedPage.name}
                  </h3>
                  <span className="font-mono text-xs text-gray-500">{selectedPage.path}</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPage.robots?.index ?? true}
                      onChange={(e) => updatePageRobots(selectedPageKey, "index", e.target.checked)}
                      className="rounded border-gray-300 text-gray-900"
                    />
                    <span>Index</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPage.robots?.follow ?? true}
                      onChange={(e) => updatePageRobots(selectedPageKey, "follow", e.target.checked)}
                      className="rounded border-gray-300 text-gray-900"
                    />
                    <span>Follow</span>
                  </label>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">Tiêu đề (Meta Title)</label>
                  <span
                    className={`text-[11px] font-mono ${
                      selectedPage.title.length > 70
                        ? "text-red-500 font-bold"
                        : selectedPage.title.length >= 30
                        ? "text-emerald-600 font-semibold"
                        : "text-amber-600"
                    }`}
                  >
                    {selectedPage.title.length} / 65 ký tự khuyến nghị
                  </span>
                </div>
                <input
                  type="text"
                  value={selectedPage.title}
                  onChange={(e) => updatePageField(selectedPageKey, "title", e.target.value)}
                  placeholder="Tiêu đề trang..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">Mô tả (Meta Description)</label>
                  <span
                    className={`text-[11px] font-mono ${
                      selectedPage.description.length > 175
                        ? "text-red-500 font-bold"
                        : selectedPage.description.length >= 120
                        ? "text-emerald-600 font-semibold"
                        : "text-amber-600"
                    }`}
                  >
                    {selectedPage.description.length} / 160 ký tự khuyến nghị
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={selectedPage.description}
                  onChange={(e) => updatePageField(selectedPageKey, "description", e.target.value)}
                  placeholder="Mô tả trang chi tiết..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                />
              </div>

              {/* Canonical URL Override */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Canonical URL (Để trống sẽ tự động lấy theo domain gốc)
                </label>
                <input
                  type="text"
                  value={selectedPage.canonical || ""}
                  onChange={(e) => updatePageField(selectedPageKey, "canonical", e.target.value)}
                  placeholder="https://www.shoptftmobile.net/..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
                />
              </div>

              {/* OpenGraph Fields */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Cấu hình hiển thị chia sẻ (OpenGraph / Facebook / Zalo)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-600">OG Title</label>
                    <input
                      type="text"
                      value={selectedPage.ogTitle || ""}
                      onChange={(e) => updatePageField(selectedPageKey, "ogTitle", e.target.value)}
                      placeholder="Mặc định dùng Meta Title..."
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-600">OG Image URL</label>
                    <input
                      type="text"
                      value={selectedPage.ogImage || ""}
                      onChange={(e) => updatePageField(selectedPageKey, "ogImage", e.target.value)}
                      placeholder="/banner-seo.jpg..."
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Google SERP Live Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trước kết quả tìm kiếm Google (SERP Preview)</span>
              </span>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1 font-sans">
                <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                  <span className="font-semibold text-gray-800">{config.global.siteName}</span>
                  <span className="text-gray-400">›</span>
                  <span className="text-gray-500 truncate">{selectedPage.canonical || `https://www.shoptftmobile.net${selectedPage.path}`}</span>
                </div>
                <h4 className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer leading-snug line-clamp-1">
                  {selectedPage.title || "Tiêu đề trang của bạn trên Google"}
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                  {selectedPage.description || "Mô tả trang của bạn sẽ hiển thị tại đây khi người dùng tìm kiếm trên Google."}
                </p>
              </div>
            </div>

            {/* Social Share Preview (Facebook / Zalo & Twitter / X) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Mô phỏng hiển thị chia sẻ MXH (Facebook / Zalo / Twitter)</span>
                </span>
                <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setSocialNetworkPreview("facebook")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      socialNetworkPreview === "facebook" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500"
                    }`}
                  >
                    Facebook / Zalo
                  </button>
                  <button
                    type="button"
                    onClick={() => setSocialNetworkPreview("twitter")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      socialNetworkPreview === "twitter" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500"
                    }`}
                  >
                    Twitter / X
                  </button>
                </div>
              </div>

              {socialNetworkPreview === "facebook" ? (
                /* Facebook / Zalo Card Simulation */
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white max-w-lg shadow-xs">
                  <div className="relative aspect-[1.91/1] w-full bg-gray-900 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        selectedPage.ogImage ||
                        config.global.defaultOgImage ||
                        "/banner-seo.jpg"
                      }
                      alt="OpenGraph Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/banner-seo.jpg";
                      }}
                    />
                  </div>
                  <div className="p-3 bg-[#f0f2f5] border-t border-gray-200">
                    <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider block">
                      {(() => {
                        try {
                          return new URL(config.global.canonicalOrigin || "https://www.shoptftmobile.net").hostname;
                        } catch {
                          return "shoptftmobile.net";
                        }
                      })()}
                    </span>
                    <h5 className="text-xs font-bold text-gray-900 line-clamp-1 mt-0.5">
                      {selectedPage.ogTitle || selectedPage.title || "Tiêu đề chia sẻ mạng xã hội"}
                    </h5>
                    <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                      {selectedPage.description || "Mô tả ngắn gọn hiển thị khi gửi link qua tin nhắn Zalo hoặc chia sẻ trên Facebook feed."}
                    </p>
                  </div>
                </div>
              ) : (
                /* Twitter / X Large Summary Card Simulation */
                <div className="rounded-2xl border border-gray-800 overflow-hidden bg-black text-white max-w-lg shadow-xs">
                  <div className="relative aspect-[2/1] w-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        selectedPage.ogImage ||
                        config.global.defaultOgImage ||
                        "/banner-seo.jpg"
                      }
                      alt="Twitter Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/banner-seo.jpg";
                      }}
                    />
                  </div>
                  <div className="p-3 bg-zinc-950 border-t border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block font-mono">
                      {(() => {
                        try {
                          return new URL(config.global.canonicalOrigin || "https://www.shoptftmobile.net").hostname;
                        } catch {
                          return "shoptftmobile.net";
                        }
                      })()}
                    </span>
                    <h5 className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                      {selectedPage.ogTitle || selectedPage.title || "Tiêu đề thẻ Twitter"}
                    </h5>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                      {selectedPage.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* TAB 3: MẪU SEO SẢN PHẨM / KHO ACC                             */}
      {/* ============================================================== */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Product Audit Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="text-[11px] font-medium text-gray-500">Tổng product indexable</div>
              <div className="text-xl font-heading font-bold text-gray-900 mt-1">{productMetrics.totalIndexable}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>AVAILABLE + RENTED</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="text-[11px] font-medium text-gray-500">Product thiếu title</div>
              <div className={`text-xl font-heading font-bold mt-1 ${productMetrics.missingTitle > 0 ? "text-red-500" : "text-emerald-600"}`}>
                {productMetrics.missingTitle}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Tiêu đề trống</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="text-[11px] font-medium text-gray-500">Product thiếu ảnh</div>
              <div className={`text-xl font-heading font-bold mt-1 ${productMetrics.missingImage > 0 ? "text-amber-500" : "text-emerald-600"}`}>
                {productMetrics.missingImage}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Chưa có thumbnail</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="text-[11px] font-medium text-gray-500">Slug không hợp lệ</div>
              <div className={`text-xl font-heading font-bold mt-1 ${productMetrics.invalidSlug > 0 ? "text-red-500" : "text-emerald-600"}`}>
                {productMetrics.invalidSlug}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Ký tự đặc biệt/dấu cách</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="text-[11px] font-medium text-gray-500">Canonical trùng lặp</div>
              <div className={`text-xl font-heading font-bold mt-1 ${productMetrics.duplicateCanonical > 0 ? "text-red-500" : "text-emerald-600"}`}>
                {productMetrics.duplicateCanonical}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">URL bị trùng</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="text-[11px] font-medium text-gray-500">Nguy cơ lộ acc ẩn</div>
              <div className={`text-xl font-heading font-bold mt-1 ${productMetrics.hiddenRisk > 0 ? "text-red-500" : "text-emerald-600"}`}>
                {productMetrics.hiddenRisk}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Đã chặn an toàn</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-5">
              <div>
                <h3 className="font-heading font-bold text-sm text-gray-900">
                  Mẫu sinh Title & Meta Description tự động cho Kho Acc
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Áp dụng nhất quán cho hơn 50+ tài khoản chi tiết (/acc/[id]), tránh trùng lặp nội dung.
                </p>
              </div>

              {/* Variable tokens guide */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-gray-500" />
                  <span>Các biến hỗ trợ:</span>
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  <code className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-800">
                    {"{product_name}"}
                  </code>
                  <code className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-800">
                    {"{pet}"}
                  </code>
                  <code className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-800">
                    {"{arena}"}
                  </code>
                  <code className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-800">
                    {"{type}"}
                  </code>
                  <code className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-800">
                    {"{price}"}
                  </code>
                  <code className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-800">
                    {"{site_name}"}
                  </code>
                </div>
              </div>

              {/* Title Template */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Mẫu Tiêu Đề (Title Template)</label>
                <input
                  type="text"
                  value={config.productTemplate.titleTemplate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      productTemplate: {
                        ...prev.productTemplate,
                        titleTemplate: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
                />
              </div>

              {/* Description Template */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Mẫu Mô Tả (Description Template)</label>
                <textarea
                  rows={3}
                  value={config.productTemplate.descriptionTemplate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      productTemplate: {
                        ...prev.productTemplate,
                        descriptionTemplate: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
                />
              </div>

              {/* Default OG Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Ảnh OG mặc định khi acc chưa có ảnh</label>
                <input
                  type="text"
                  value={config.productTemplate.defaultOgImage}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      productTemplate: {
                        ...prev.productTemplate,
                        defaultOgImage: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                />
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Thử nghiệm trên tài khoản mẫu
                  </span>
                  <select
                    value={selectedSampleIndex}
                    onChange={(e) => setSelectedSampleIndex(Number(e.target.value))}
                    className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-gray-50"
                  >
                    {SAMPLE_ACCOUNTS.map((acc, idx) => (
                      <option key={acc.id} value={idx}>
                        {acc.code} - [{acc.type}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Google SERP Preview */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Google Search Preview</span>
                  </span>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1 font-sans">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <span className="font-semibold text-gray-800">{config.global.siteName}</span>
                      <span className="text-gray-400">›</span>
                      <span className="text-gray-500 truncate">https://www.shoptftmobile.net/acc/{currentSample.id}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer leading-snug line-clamp-1">
                      {productPreview.title}
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                      {productPreview.description}
                    </p>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 px-1">
                    <span>Title: {productPreview.title.length} ký tự</span>
                    <span>Desc: {productPreview.description.length} ký tự</span>
                  </div>
                </div>

                {/* Social / Zalo Preview */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Social / Zalo Preview</span>
                  </span>
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                    <div className="aspect-video w-full bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={currentSample.thumbnail || config.productTemplate.defaultOgImage}
                        alt="Social preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-1">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                        shoptftmobile.net
                      </span>
                      <h5 className="text-xs font-bold text-gray-900 line-clamp-1">
                        {productPreview.title}
                      </h5>
                      <p className="text-[11px] text-gray-600 line-clamp-2">
                        {productPreview.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: CONTENT REFRESH (AI ASSISTED)                             */}
      {/* ============================================================== */}
      {activeTab === "refresh" && <ContentRefreshTab />}

      {/* ============================================================== */}
      {/* TAB: INTERNAL LINKS AUDIT (PHASE 5)                             */}
      {/* ============================================================== */}
      {activeTab === "internal_links" && (
        <InternalLinksTab
          report={internalLinksAudit}
          onRefresh={fetchSeoData}
        />
      )}

      {/* ============================================================== */}
      {/* TAB: GOOGLE SEARCH CONSOLE & RANKING OPTIMIZATION (PHASE 7)   */}
      {/* ============================================================== */}
      {activeTab === "ranking" && (
        <RankingOptimizationTab
          initialReport={gscReport}
          onRefresh={fetchSeoData}
        />
      )}

      {/* ============================================================== */}
      {/* TAB: CONTENT OPPORTUNITIES & QUERY EXPANSION (PHASE 8)         */}
      {/* ============================================================== */}
      {activeTab === "content_opportunities" && (
        <ContentOpportunitiesTab
          opportunities={contentOpportunities}
          briefs={contentBriefs}
          onRefresh={fetchSeoData}
        />
      )}

      {/* ============================================================== */}
      {/* TAB: BACKLINK MONITOR & OFF-SITE AUTHORITY (PHASE 10)           */}
      {/* ============================================================== */}
      {activeTab === "backlinks" && (
        <BacklinksTab
          report={backlinkReport}
          onRefresh={fetchSeoData}
          onAddBacklink={handleAddBacklink}
          onUpdateBacklink={handleUpdateBacklink}
          onDeleteBacklink={handleDeleteBacklink}
          onImportCsv={handleImportBacklinksCsv}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 4: SITEMAP & ROBOTS                                        */}
      {/* ============================================================== */}
      {activeTab === "sitemap" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sitemap Info Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Sitemap XML (Động)</span>
              </h3>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium"
              >
                <span>Mở XML</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Sitemap tự động cập nhật tất cả trang chính (/shop, /thue-acc-tft-dtcl, /ve-shop, /huong-dan) và toàn bộ tài khoản còn hiệu lực trong hệ thống.
            </p>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 font-mono text-xs text-gray-700">
              <div className="flex justify-between">
                <span>URL Sitemap:</span>
                <span className="font-bold text-gray-900">{config.global.canonicalOrigin}/sitemap.xml</span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className="text-emerald-600 font-semibold">Tự động (force-dynamic)</span>
              </div>
              <div className="flex justify-between">
                <span>Tần suất thu thập:</span>
                <span>daily / weekly</span>
              </div>
            </div>
          </div>

          {/* Robots.txt Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Cấu hình Robots.txt</span>
              </h3>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium"
              >
                <span>Xem file</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Các đường dẫn được phép (Allow)</label>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {config.robotsConfig.allowPaths.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700">Các đường dẫn bị chặn (Disallow)</label>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {config.robotsConfig.disallowPaths.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: ĐIỀU HƯỚNG / REDIRECTS (301/302)                         */}
      {/* ============================================================== */}
      {activeTab === "redirects" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-gray-900">
                Quản lý chuyển hướng URL (Redirect Manager)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Chuyển hướng an toàn 301 (Vĩnh viễn) hoặc 302 (Tạm thời), tích hợp kiểm tra loop tự động.
              </p>
            </div>

            <button
              onClick={addRedirectRule}
              className="px-3.5 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm chuyển hướng</span>
            </button>
          </div>

          <div className="space-y-3">
            {config.redirects.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                Chưa có quy tắc chuyển hướng nào. Nhấn &quot;Thêm chuyển hướng&quot; để tạo mới.
              </div>
            ) : (
              config.redirects.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Nguồn (Source)</label>
                      <input
                        type="text"
                        value={rule.source}
                        onChange={(e) => updateRedirectRule(rule.id, "source", e.target.value)}
                        placeholder="/duong-dan-cu"
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg font-mono bg-white focus:outline-hidden focus:border-gray-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Đích (Destination)</label>
                      <input
                        type="text"
                        value={rule.destination}
                        onChange={(e) => updateRedirectRule(rule.id, "destination", e.target.value)}
                        placeholder="/duong-dan-moi"
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg font-mono bg-white focus:outline-hidden focus:border-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={rule.permanent ? "301" : "302"}
                      onChange={(e) => updateRedirectRule(rule.id, "permanent", e.target.value === "301")}
                      className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="301">301 (Permanent)</option>
                      <option value="302">302 (Temporary)</option>
                    </select>

                    <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => updateRedirectRule(rule.id, "enabled", e.target.checked)}
                        className="rounded border-gray-300 text-gray-900"
                      />
                      <span>Bật</span>
                    </label>

                    <button
                      onClick={() => removeRedirectRule(rule.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Xóa quy tắc"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: SCHEMA & DỮ LIỆU CÓ CẤU TRÚC                            */}
      {/* ============================================================== */}
      {activeTab === "schema" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-gray-900">
              Cấu hình Schema.org (Organization & Founder)
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Tên tổ chức (Organization Name)</label>
              <input
                type="text"
                value={config.schema.organizationName}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    schema: { ...prev.schema, organizationName: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Người sáng lập (Founder)</label>
                <input
                  type="text"
                  value={config.schema.founderName}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      schema: { ...prev.schema, founderName: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Chức danh (Founder Title)</label>
                <input
                  type="text"
                  value={config.schema.founderTitle}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      schema: { ...prev.schema, founderTitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Các liên kết cùng chủ sở hữu (sameAs - Phân cách bằng dấu phẩy)
              </label>
              <textarea
                rows={2}
                value={config.schema.sameAs.join(", ")}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    schema: {
                      ...prev.schema,
                      sameAs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    },
                  }))
                }
                placeholder="https://zalo.me/..., https://checkscam.vn/..."
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
              />
            </div>
          </div>

          {/* JSON-LD Preview */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              <span>Xem trước JSON-LD sinh ra trong thẻ &lt;head&gt;</span>
            </span>

            <pre className="p-3.5 rounded-xl bg-gray-900 text-gray-100 font-mono text-[11px] overflow-x-auto max-h-[380px] leading-relaxed custom-scrollbar">
              {JSON.stringify(
                {
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "WebSite",
                      "@id": `${config.global.canonicalOrigin}/#website`,
                      url: config.global.canonicalOrigin,
                      name: config.global.siteName,
                    },
                    {
                      "@type": "Organization",
                      "@id": `${config.global.canonicalOrigin}/#organization`,
                      name: config.schema.organizationName,
                      alternateName: config.global.secondaryBrandName || "Tuấn Thái Bình TFT",
                      url: config.global.canonicalOrigin,
                      logo: `${config.global.canonicalOrigin}/avatar.jpg`,
                      founder: {
                        "@type": "Person",
                        name: config.schema.founderName,
                        jobTitle: config.schema.founderTitle,
                        url: `${config.global.canonicalOrigin}/ve-shop`,
                      },
                      contactPoint: {
                        "@type": "ContactPoint",
                        telephone: "+84352867283",
                        contactType: "customer service",
                        availableLanguage: ["Vietnamese"],
                        url: config.global.zaloUrl || "https://zalo.me/0352867283",
                      },
                      sameAs: config.schema.sameAs,
                    },
                  ],
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: CÀI ĐẶT TOÀN CỤC (GLOBAL SETTINGS)                      */}
      {/* ============================================================== */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-5 max-w-3xl">
          <div>
            <h3 className="font-heading font-bold text-sm text-gray-900">
              Cài đặt SEO toàn cục (Global SEO)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Cấu hình thông tin thương hiệu, domain chuẩn và mã xác minh các công cụ tìm kiếm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Tên Website (Site Name)</label>
              <input
                type="text"
                value={config.global.siteName}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, siteName: e.target.value },
                  }))
                }
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Tên Thương Hiệu Chính (Primary Brand)</label>
              <input
                type="text"
                value={config.global.brandName}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, brandName: e.target.value },
                  }))
                }
                placeholder="ShopTFTMobile"
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Định Danh Phụ (Secondary Identity)</label>
              <input
                type="text"
                value={config.global.secondaryBrandName || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, secondaryBrandName: e.target.value },
                  }))
                }
                placeholder="Tuấn Thái Bình TFT"
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Đường dẫn Logo (Logo URL)</label>
              <input
                type="text"
                value={config.global.logoUrl || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, logoUrl: e.target.value },
                  }))
                }
                placeholder="/images/logo.png"
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Hotline / Zalo Hỗ Trợ</label>
              <input
                type="text"
                value={config.global.phoneZalo || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, phoneZalo: e.target.value },
                  }))
                }
                placeholder="0352867283"
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Khung Giờ Hỗ Trợ (Support Hours)</label>
              <input
                type="text"
                value={config.global.supportHours || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, supportHours: e.target.value },
                  }))
                }
                placeholder="11:00 - 24:00 hàng ngày"
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Link Tra Cứu Bảo Hiểm Checkscam</label>
              <input
                type="text"
                value={config.global.trustVerificationUrl || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, trustVerificationUrl: e.target.value },
                  }))
                }
                placeholder="https://checkscam.vn/?qh_ss=0352867283"
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Số Tiền Bảo Hiểm Ký Quỹ</label>
              <input
                type="text"
                value={config.global.insuranceAmount || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, insuranceAmount: e.target.value },
                  }))
                }
                placeholder="30.000.000 VNĐ"
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-hidden focus:border-gray-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Domain chuẩn (Canonical Origin - Bắt buộc dùng HTTPS)
            </label>
            <input
              type="text"
              value={config.global.canonicalOrigin}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  global: { ...prev.global, canonicalOrigin: e.target.value },
                }))
              }
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Mã Google Site Verification</label>
              <input
                type="text"
                value={config.global.googleVerification || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, googleVerification: e.target.value },
                  }))
                }
                placeholder="google-site-verification=..."
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Mã Bing Webmaster Verification</label>
              <input
                type="text"
                value={config.global.bingVerification || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    global: { ...prev.global, bingVerification: e.target.value },
                  }))
                }
                placeholder="msvalidate.01=..."
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-gray-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
