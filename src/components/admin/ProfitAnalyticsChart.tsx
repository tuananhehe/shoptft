"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  Zap,
  Crown,
  Award,
  Sparkles,
  ArrowUpRight,
  Info,
} from "lucide-react";
import {
  TimeRange,
  ChartType,
  ChartDataPoint,
  ProfitSummary,
  aggregateProfitData,
  formatCompactVND,
} from "@/utils/profit-analytics";
import { OrderItem } from "@/utils/orders-service";

interface ProfitAnalyticsChartProps {
  orders: OrderItem[];
  extraRentedAccounts?: Array<{
    code?: string;
    category: "VIP" | "CLONE";
    amount: number;
    profit: number;
    title?: string;
  }>;
}

export default function ProfitAnalyticsChart({
  orders,
  extraRentedAccounts = [],
}: ProfitAnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Tính toán dữ liệu thống kê
  const summary: ProfitSummary = useMemo(() => {
    return aggregateProfitData(orders, timeRange, extraRentedAccounts);
  }, [orders, timeRange, extraRentedAccounts]);

  const maxVal = useMemo(() => {
    const highest = Math.max(...summary.chartPoints.map((p) => Math.max(p.revenue, p.profit)), 0);
    return highest > 0 ? highest * 1.15 : 100000;
  }, [summary.chartPoints]);

  // Tạo đường dẫn cong SVG cho Area Chart
  const svgPathData = useMemo(() => {
    const points = summary.chartPoints;
    if (points.length === 0) return { linePath: "", areaPath: "" };

    const width = 1000;
    const height = 260;
    const paddingX = 40;
    const paddingY = 20;
    const effectiveW = width - paddingX * 2;
    const effectiveH = height - paddingY * 2;

    const coords = points.map((p, idx) => {
      const x = paddingX + (idx / Math.max(1, points.length - 1)) * effectiveW;
      const y = height - paddingY - (p.profit / maxVal) * effectiveH;
      return { x, y };
    });

    if (coords.length === 1) {
      const c = coords[0];
      return {
        linePath: `M ${c.x} ${c.y}`,
        areaPath: `M ${c.x} ${height - paddingY} L ${c.x} ${c.y} L ${c.x} ${height - paddingY} Z`,
        coords,
      };
    }

    // Smooth spline
    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const first = coords[0];
    const last = coords[coords.length - 1];
    const areaPath = `${linePath} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;

    return { linePath, areaPath, coords };
  }, [summary.chartPoints, maxVal]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-6 overflow-hidden">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 text-orange-600 font-bold">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase font-gaming tracking-tight">
              Biểu Đồ Lợi Nhuận & Doanh Thu Shop
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
              Real-time
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Theo dõi chính xác dòng tiền lãi từ thuê tài khoản & dịch vụ theo chu kỳ thời gian.
          </p>
        </div>

        {/* Bộ lọc chu kỳ & kiểu biểu đồ */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Switch 7d / 30d / 12m */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80">
            {(
              [
                { id: "7d", label: "7 Ngày" },
                { id: "30d", label: "30 Ngày" },
                { id: "12m", label: "12 Tháng" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === t.id
                    ? "bg-white text-orange-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Switch Bar / Area */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-white text-orange-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Biểu đồ cột (Bar)"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-white text-orange-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Biểu đồ miền cong (Area)"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bốn Thẻ Chỉ Số KPI Nhanh */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Lợi Nhuận */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 border border-emerald-200/80 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-gaming block">
            💎 Lợi Nhuận Chu Kỳ
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tracking-tight">
            +{summary.totalProfit.toLocaleString("vi-VN")}đ
          </div>
          <p className="text-[10px] text-emerald-600/90 font-medium">
            Lãi ròng chốt túi thực tế
          </p>
        </div>

        {/* KPI 2: Tổng Doanh Thu */}
        <div className="bg-gradient-to-br from-orange-50/80 to-orange-100/40 border border-orange-200/80 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider font-gaming block">
            💵 Tổng Doanh Thu
          </span>
          <div className="text-xl sm:text-2xl font-black text-orange-600 font-mono tracking-tight">
            {summary.totalRevenue.toLocaleString("vi-VN")}đ
          </div>
          <p className="text-[10px] text-orange-600/90 font-medium">
            {summary.totalOrders} lượt thuê & đơn hàng
          </p>
        </div>

        {/* KPI 3: Tỷ Suất Sinh Lời */}
        <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/40 border border-amber-200/80 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider font-gaming block">
            ⚡ Tỷ Suất Sinh Lời
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono tracking-tight">
            {summary.profitMargin}%
          </div>
          <p className="text-[10px] text-amber-700/90 font-medium">
            Hiệu quả sinh lời trên doanh thu
          </p>
        </div>

        {/* KPI 4: Ngày Thu Hoạch Cao Nhất */}
        <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/40 border border-purple-200/80 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider font-gaming block">
            🏆 Đỉnh Điểm Chu Kỳ
          </span>
          <div className="text-base sm:text-lg font-black text-purple-700 font-mono truncate">
            {summary.peakDay.label}
          </div>
          <p className="text-[10px] text-purple-600/90 font-bold font-mono">
            +{summary.peakDay.profit.toLocaleString("vi-VN")}đ LÃI
          </p>
        </div>
      </div>

      {/* 3. Khung Vẽ Biểu Đồ SVG Tương Tác */}
      <div
        ref={containerRef}
        className="relative bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-800 overflow-hidden shadow-inner select-none"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Thước đo giá trị bên trái */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2 border-b border-slate-800/80 pb-2">
          <span>Đơn vị: VNĐ (Lợi Nhuận & Doanh Thu)</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Lợi Nhuận</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span>Doanh Thu</span>
            </span>
          </div>
        </div>

        {/* Khu vực Render đồ họa */}
        <div className="relative h-64 sm:h-72 w-full">
          {/* Lưới ngang (Grid lines) */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
              <div
                key={ratio}
                className="w-full flex items-center gap-2 border-b border-slate-800/60"
              >
                <span className="text-[9px] font-mono text-slate-500 w-12 text-right">
                  {formatCompactVND(Math.round(maxVal * ratio))}
                </span>
                <div className="flex-1 border-t border-dashed border-slate-800/60" />
              </div>
            ))}
          </div>

          {/* DẠNG 1: BIỂU ĐỒ CỘT (BAR CHART) */}
          {chartType === "bar" && (
            <div className="absolute inset-0 pl-14 pr-2 pt-2 pb-6 flex items-end justify-between gap-1 sm:gap-2">
              {summary.chartPoints.map((point, idx) => {
                const heightPercent = maxVal > 0 ? (point.profit / maxVal) * 100 : 0;
                const revHeightPercent = maxVal > 0 ? (point.revenue / maxVal) * 100 : 0;
                const isHovered = hoveredPoint?.label === point.label;

                return (
                  <div
                    key={idx}
                    onMouseEnter={(e) => {
                      setHoveredPoint(point);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentRect = containerRef.current?.getBoundingClientRect();
                      if (parentRect) {
                        setHoverPos({
                          x: rect.left - parentRect.left + rect.width / 2,
                          y: rect.top - parentRect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                  >
                    {/* Cột Doanh thu & Lợi nhuận */}
                    <div className="w-full max-w-[48px] h-full flex items-end justify-center relative">
                      {/* Cột Doanh Thu (Background Bar) */}
                      {revHeightPercent > 0 && (
                        <div
                          style={{ height: `${Math.min(100, Math.max(4, revHeightPercent))}%` }}
                          className="w-full bg-slate-800/90 rounded-t-md transition-all duration-300 group-hover:bg-slate-700"
                        />
                      )}

                      {/* Cột Lợi Nhuận (Foreground Glowing Bar) */}
                      <div
                        style={{ height: `${Math.min(100, Math.max(heightPercent > 0 ? 6 : 2, heightPercent))}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 relative ${
                          point.profit > 0
                            ? "bg-gradient-to-t from-orange-600 via-orange-500 to-amber-400 shadow-md shadow-orange-500/20 group-hover:from-orange-500 group-hover:to-amber-300 group-hover:shadow-orange-500/50"
                            : "bg-slate-800/40"
                        }`}
                      >
                        {point.profit > 0 && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-200 rounded-t-md" />
                        )}
                      </div>
                    </div>

                    {/* Nhãn trục hoành */}
                    <span
                      className={`text-[10px] sm:text-[11px] font-mono mt-2 transition-colors truncate max-w-full text-center ${
                        isHovered ? "text-orange-400 font-bold" : "text-slate-400"
                      }`}
                    >
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* DẠNG 2: BIỂU ĐỒ MIỀN CONG (AREA CHART) */}
          {chartType === "area" && (
            <div className="absolute inset-0 pl-12 pr-2 pt-2 pb-6">
              <svg
                viewBox="0 0 1000 260"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ea580c" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>

                {/* Vùng đổ màu Area */}
                {svgPathData.areaPath && (
                  <path d={svgPathData.areaPath} fill="url(#areaGradient)" />
                )}

                {/* Đường cong Line */}
                {svgPathData.linePath && (
                  <path
                    d={svgPathData.linePath}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Các điểm chấm tròn tương tác */}
                {svgPathData.coords &&
                  svgPathData.coords.map((c, idx) => {
                    const point = summary.chartPoints[idx];
                    const isHovered = hoveredPoint?.label === point?.label;

                    return (
                      <g key={idx}>
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={isHovered ? 6.5 : 4}
                          className={`transition-all cursor-pointer ${
                            isHovered
                              ? "fill-amber-300 stroke-orange-600 stroke-[3]"
                              : "fill-orange-500 stroke-slate-900 stroke-[2]"
                          }`}
                          onMouseEnter={() => {
                            setHoveredPoint(point);
                            const parentRect = containerRef.current?.getBoundingClientRect();
                            if (parentRect) {
                              const scaleX = parentRect.width / 1000;
                              const scaleY = parentRect.height / 260;
                              setHoverPos({
                                x: c.x * scaleX,
                                y: c.y * scaleY,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    );
                  })}
              </svg>

              {/* Nhãn trục hoành bên dưới */}
              <div className="absolute bottom-0 left-12 right-2 flex justify-between">
                {summary.chartPoints.map((p, idx) => {
                  if (timeRange === "30d" && idx % 4 !== 0 && idx !== summary.chartPoints.length - 1) {
                    return null;
                  }
                  return (
                    <span
                      key={idx}
                      className="text-[9px] sm:text-[10px] font-mono text-slate-400"
                    >
                      {p.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* TOOLTIP TƯƠNG TÁC (GLASSMORPHISM) */}
          {hoveredPoint && hoverPos && (
            <div
              style={{
                left: `${Math.max(80, Math.min(hoverPos.x, (containerRef.current?.clientWidth || 300) - 120))}px`,
                top: `${Math.max(10, hoverPos.y - 110)}px`,
              }}
              className="absolute -translate-x-1/2 z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl space-y-1.5 min-w-[160px] animate-fadeIn text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="font-bold text-slate-300 text-[11px]">
                  📅 {hoveredPoint.label}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {hoveredPoint.orderCount} đơn
                </span>
              </div>

              <div className="space-y-0.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-300">
                  <span>Doanh thu:</span>
                  <strong>{hoveredPoint.revenue.toLocaleString("vi-VN")}đ</strong>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>💎 Lãi ròng:</span>
                  <strong>+{hoveredPoint.profit.toLocaleString("vi-VN")}đ</strong>
                </div>
              </div>

              {hoveredPoint.orderCount > 0 && (
                <div className="text-[9px] text-slate-400 border-t border-slate-800/80 pt-1 flex justify-between">
                  <span>VIP: {formatCompactVND(hoveredPoint.vipRevenue)}</span>
                  <span>Clone: {formatCompactVND(hoveredPoint.cloneRevenue)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Thanh Tỷ Trọng Đóng Góp Lợi Nhuận Theo Danh Mục */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 font-gaming uppercase tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Cơ Cấu Nguồn Lãi Theo Danh Mục
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Chu kỳ: {timeRange === "7d" ? "7 Ngày qua" : timeRange === "30d" ? "30 Ngày qua" : "12 Tháng"}
          </span>
        </div>

        {/* Thanh Progress Đa Màu */}
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${summary.categoryBreakdown.vip.percentage}%` }}
            className="bg-orange-500 h-full transition-all duration-500"
            title={`Kho VIP: ${summary.categoryBreakdown.vip.percentage}%`}
          />
          <div
            style={{ width: `${summary.categoryBreakdown.clone.percentage}%` }}
            className="bg-purple-600 h-full transition-all duration-500"
            title={`Kho Clone: ${summary.categoryBreakdown.clone.percentage}%`}
          />
          <div
            style={{ width: `${summary.categoryBreakdown.service.percentage}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Dịch Vụ: ${summary.categoryBreakdown.service.percentage}%`}
          />
        </div>

        {/* Chú giải chi tiết */}
        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-[11px] truncate">👑 Thuê VIP</div>
              <div className="text-[10px] text-slate-500 font-mono">
                {summary.categoryBreakdown.vip.amount.toLocaleString("vi-VN")}đ ({summary.categoryBreakdown.vip.percentage}%)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-[11px] truncate">⚡ Thuê Clone</div>
              <div className="text-[10px] text-slate-500 font-mono">
                {summary.categoryBreakdown.clone.amount.toLocaleString("vi-VN")}đ ({summary.categoryBreakdown.clone.percentage}%)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-slate-800 text-[11px] truncate">🏆 Cày Thuê</div>
              <div className="text-[10px] text-slate-500 font-mono">
                {summary.categoryBreakdown.service.amount.toLocaleString("vi-VN")}đ ({summary.categoryBreakdown.service.percentage}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
