"use client";

import React, { useState } from "react";
import {
  Link2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Compass,
  ArrowRight,
  FileText,
  Layers,
  Network,
  Info,
} from "lucide-react";
import { InternalLinksAuditReport } from "@/utils/seo-shared";

interface InternalLinksTabProps {
  report: InternalLinksAuditReport | null;
  onRefresh?: () => void;
}

export function InternalLinksTab({ report, onRefresh }: InternalLinksTabProps) {
  const [filterType, setFilterType] = useState<"all" | "orphan" | "broken" | "hub" | "redirect">("all");

  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3">
        <Network className="w-8 h-8 text-gray-400 mx-auto animate-pulse" />
        <p className="text-xs text-gray-500 font-medium">Đang tải báo cáo liên kết nội bộ...</p>
      </div>
    );
  }

  const {
    timestamp,
    healthStatus,
    totalPagesAudited,
    totalInternalLinks,
    orphanPages,
    brokenLinks,
    excessiveLinks,
    missingHubLinks,
    redirectLinks,
  } = report;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Link2 className="w-4 h-4" />
            </span>
            <h2 className="font-heading font-bold text-sm text-gray-900">
              Kiểm Toán Cấu Trúc Liên Kết Nội Bộ (Internal Links Audit)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Phân tích tự động đồ thị liên kết nội bộ toàn website, phát hiện trang mồ côi (orphan pages), liên kết hỏng (404/old .com), thiếu liên kết Topic Hub và chuỗi redirect nội bộ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {healthStatus === "excellent" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cấu trúc tối ưu 100%</span>
            </span>
          )}
          {healthStatus === "good" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Tốt (Có gợi ý tối ưu)</span>
            </span>
          )}
          {healthStatus === "needs_attention" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Cần khắc phục</span>
            </span>
          )}
          {healthStatus === "critical" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 whitespace-nowrap">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Có liên kết hỏng/mồ côi</span>
            </span>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Quét lại liên kết"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Tổng Liên Kết
          </span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-gray-900 mt-1">
            {totalInternalLinks}
          </p>
          <span className="text-[11px] text-gray-400 block mt-0.5">
            Trên {totalPagesAudited} trang đã quét
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Trang Mồ Côi
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-xl sm:text-2xl font-bold font-mono ${orphanPages.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {orphanPages.length}
            </span>
            {orphanPages.length === 0 && (
              <span className="text-[10px] text-emerald-600 font-semibold uppercase">Zero Orphan</span>
            )}
          </div>
          <span className="text-[11px] text-gray-400 block mt-0.5">
            0 trang bị cô lập
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Liên Kết Hỏng
          </span>
          <p className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${brokenLinks.length > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {brokenLinks.length}
          </p>
          <span className="text-[11px] text-gray-400 block mt-0.5">
            404 hoặc domain sai
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Mùa 18 Thiếu Hub
          </span>
          <p className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${missingHubLinks.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {missingHubLinks.length}
          </p>
          <span className="text-[11px] text-gray-400 block mt-0.5">
            {missingHubLinks.length === 0 ? "100% linked" : "Cần bổ sung link Hub"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Trỏ Vào Redirect
          </span>
          <p className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${redirectLinks.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {redirectLinks.length}
          </p>
          <span className="text-[11px] text-gray-400 block mt-0.5">
            {redirectLinks.length === 0 ? "Trỏ trực tiếp" : "Nên trỏ URL đích"}
          </span>
        </div>
      </div>

      {/* 3. Section 1: Orphan Pages Detection */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-500" />
            <h3 className="font-heading font-bold text-sm text-gray-900">
              1. Kiểm Tra Trang Mồ Côi (Orphan Pages Detection)
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${orphanPages.length === 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {orphanPages.length === 0 ? "Không có trang mồ côi" : `${orphanPages.length} trang mồ côi`}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {orphanPages.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-emerald-900">
                  Cấu trúc hoàn hảo — Zero Orphan Pages
                </p>
                <p className="text-emerald-700 leading-relaxed font-normal">
                  Toàn bộ 18 bài viết blog, Topic Hub (/blog/tft-mua-18), các trang cẩm nang hướng dẫn và các landing page chính đều nhận được ít nhất một liên kết nội bộ chất lượng từ bài viết khác hoặc thanh điều hướng. Bot Google có thể dễ dàng crawl toàn site.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-red-600 mb-2 font-medium">
                Phát hiện các trang dưới đây chưa có bất kỳ liên kết nội bộ nào trỏ tới:
              </p>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden text-xs">
                {orphanPages.map((op, idx) => (
                  <div key={idx} className="p-3 bg-red-50/30 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-gray-900">{op.title}</span>
                      <p className="font-mono text-gray-500 text-[11px]">{op.path}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      {op.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Section 2: Broken Internal Links Detection */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className="font-heading font-bold text-sm text-gray-900">
              2. Kiểm Tra Liên Kết Nội Bộ Hỏng (Broken Links Check)
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${brokenLinks.length === 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {brokenLinks.length === 0 ? "Không có liên kết hỏng" : `${brokenLinks.length} liên kết hỏng`}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {brokenLinks.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-emerald-900">
                  Tất cả liên kết nội bộ đều hoạt động bình thường
                </p>
                <p className="text-emerald-700 leading-relaxed font-normal">
                  Không phát hiện URL 404, không có liên kết trỏ tới tên miền cũ (.com) và không có đường dẫn tĩnh sai lệch. Trải nghiệm người dùng và ngân sách crawl của bot tìm kiếm được đảm bảo trọn vẹn.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-red-200 rounded-xl overflow-hidden text-xs">
              {brokenLinks.map((bl, idx) => (
                <div key={idx} className="p-3 bg-red-50/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-gray-800">Từ trang: {bl.source}</span>
                    <p className="font-mono text-red-600 font-bold mt-0.5">Trỏ tới: {bl.target}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">{bl.reason}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                    404 Error
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Section 3: Topic Hub Consistency Check */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <h3 className="font-heading font-bold text-sm text-gray-900">
              3. Cụm Chủ Đề Mùa 18 & Liên Kết Về Hub (/blog/tft-mua-18)
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${missingHubLinks.length === 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
            {missingHubLinks.length === 0 ? "100% bài viết liên kết Hub" : `${missingHubLinks.length} bài thiếu link Hub`}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {missingHubLinks.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-emerald-900">
                  Topic Cluster gắn kết chặt chẽ
                </p>
                <p className="text-emerald-700 leading-relaxed font-normal">
                  100% bài viết thuộc cụm chủ đề TFT Mùa 18 và Meta & Đội Hình đều có liên kết ngữ cảnh trỏ ngược về trang Topic Hub <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">/blog/tft-mua-18</code>. Điều này giúp củng cố tín hiệu Topical Authority với Google.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-amber-200 rounded-xl overflow-hidden text-xs">
              {missingHubLinks.map((mh, idx) => (
                <div key={idx} className="p-3 bg-amber-50/30 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-gray-900">{mh.title}</span>
                    <p className="font-mono text-gray-500 text-[11px]">{mh.path}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {mh.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Section 4: Redirect Internal Links & Excessive Links Check */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Redirect internal links */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h4 className="font-heading font-bold text-xs text-gray-900">
              4. Liên Kết Trỏ Vào Redirect
            </h4>
            <span className="text-[11px] font-bold font-mono text-gray-500">
              {redirectLinks.length} liên kết
            </span>
          </div>
          <div className="p-4 text-xs">
            {redirectLinks.length === 0 ? (
              <p className="text-emerald-700 flex items-center gap-1.5 font-normal">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Tất cả internal links đều trỏ thẳng vào URL đích cuối cùng.</span>
              </p>
            ) : (
              <div className="space-y-2">
                {redirectLinks.map((rl, idx) => (
                  <div key={idx} className="p-2 rounded bg-amber-50 text-gray-700 font-mono text-[11px]">
                    <span>{rl.target}</span> → <strong>{rl.destination}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Excessive links */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h4 className="font-heading font-bold text-xs text-gray-900">
              5. Mật Độ Liên Kết Nội Bộ (Link Density)
            </h4>
            <span className="text-[11px] font-bold font-mono text-gray-500">
              {excessiveLinks.length} bài quá tải
            </span>
          </div>
          <div className="p-4 text-xs">
            {excessiveLinks.length === 0 ? (
              <p className="text-emerald-700 flex items-center gap-1.5 font-normal">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Mật độ liên kết đạt chuẩn tự nhiên (3-8 liên kết/bài viết). Không spam link.</span>
              </p>
            ) : (
              <div className="space-y-2">
                {excessiveLinks.map((el, idx) => (
                  <div key={idx} className="p-2 rounded bg-red-50 text-red-700 text-[11px]">
                    <strong>{el.path}</strong>: {el.warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
