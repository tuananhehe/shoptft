"use client";

import React, { useState, useMemo } from "react";
import { OrderItem } from "@/utils/orders-service";
import {
  TimeRange,
  ProfitSummary,
  aggregateProfitData,
  formatCompactVND,
} from "@/utils/profit-analytics";

interface AdminRevenueChartProps {
  orders: OrderItem[];
}

export const AdminRevenueChart: React.FC<AdminRevenueChartProps> = ({ orders }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const summary: ProfitSummary = useMemo(() => {
    return aggregateProfitData(orders, timeRange);
  }, [orders, timeRange]);

  const maxRevenue = useMemo(() => {
    const highest = Math.max(...summary.chartPoints.map((p) => p.revenue), 0);
    return highest > 0 ? highest * 1.15 : 100000;
  }, [summary.chartPoints]);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-heading font-bold text-sm text-[#111111]">
            Biểu đồ doanh thu
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Tổng cộng:{" "}
            <span className="font-semibold text-[#111111]">
              {summary.totalRevenue.toLocaleString("vi-VN")}đ
            </span>{" "}
            ({summary.totalOrders} đơn hàng)
          </p>
        </div>

        {/* Range Controls */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg self-start sm:self-auto text-xs">
          {(
            [
              { key: "7d", label: "7 ngày" },
              { key: "30d", label: "30 ngày" },
              { key: "12m", label: "12 tháng" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTimeRange(t.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                timeRange === t.key
                  ? "bg-white text-[#111111] shadow-xs font-semibold"
                  : "text-[#6B7280] hover:text-[#111111]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="relative h-56 w-full pt-4">
        {/* Background Y-Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
            <div key={ratio} className="w-full flex items-center gap-2 border-b border-gray-100">
              <span className="text-[10px] font-mono text-gray-400 w-10 text-right">
                {formatCompactVND(Math.round(maxRevenue * ratio))}
              </span>
              <div className="flex-1 border-t border-dashed border-gray-100" />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="absolute inset-0 pl-12 pr-2 pb-6 flex items-end justify-between gap-1 sm:gap-2">
          {summary.chartPoints.map((point, idx) => {
            const heightPercent = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 z-20 pointer-events-none bg-[#111111] text-white text-[11px] py-1.5 px-2.5 rounded-lg shadow-lg whitespace-nowrap">
                    <p className="font-semibold">{point.fullDate || point.label}</p>
                    <p className="text-gray-300 font-mono mt-0.5">
                      {point.revenue.toLocaleString("vi-VN")}đ ({point.orderCount} đơn)
                    </p>
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{
                    height: `${Math.min(100, Math.max(heightPercent > 0 ? 6 : 2, heightPercent))}%`,
                  }}
                  className={`w-full max-w-[36px] rounded-t transition-all duration-200 ${
                    point.revenue > 0
                      ? isHovered
                        ? "bg-black"
                        : "bg-gray-800"
                      : "bg-gray-200"
                  }`}
                />

                {/* X-axis Label */}
                <span
                  className={`text-[10px] font-medium mt-2 transition-colors truncate max-w-full text-center ${
                    isHovered ? "text-[#111111] font-bold" : "text-gray-400"
                  }`}
                >
                  {timeRange === "30d" && idx % 4 !== 0 ? "" : point.label.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
