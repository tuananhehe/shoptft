import { OrderItem } from "./orders-service";

export type TimeRange = "7d" | "30d" | "12m";
export type ChartType = "bar" | "area";

export interface ChartDataPoint {
  label: string;
  subLabel?: string;
  fullDate: string;
  revenue: number;
  profit: number;
  orderCount: number;
  vipRevenue: number;
  cloneRevenue: number;
  serviceRevenue: number;
}

export interface ProfitSummary {
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  totalOrders: number;
  peakDay: {
    label: string;
    profit: number;
  };
  categoryBreakdown: {
    vip: { amount: number; profit: number; percentage: number };
    clone: { amount: number; profit: number; percentage: number };
    service: { amount: number; profit: number; percentage: number };
  };
  chartPoints: ChartDataPoint[];
}

/**
 * Format số tiền VNĐ ngắn gọn (VD: 1.2M, 500k, 0đ)
 */
export function formatCompactVND(amount: number): string {
  if (amount >= 1000000) {
    const val = (amount / 1000000).toFixed(1).replace(/\.0$/, "");
    return `${val}M`;
  }
  if (amount >= 1000) {
    const val = (amount / 1000).toFixed(0);
    return `${val}k`;
  }
  return `${amount}đ`;
}

/**
 * Tạo nhãn thứ trong tuần tiếng Việt
 */
function getWeekdayLabel(d: Date): string {
  const day = d.getDay();
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
  return `${dayNames[day]} ${dateStr}`;
}

/**
 * Tính toán & Tổng hợp dữ liệu Lợi nhuận và Doanh thu cho biểu đồ
 */
export function aggregateProfitData(
  orders: OrderItem[],
  timeRange: TimeRange = "7d",
  extraRentedAccounts: Array<{
    category: "VIP" | "CLONE";
    amount: number;
    profit: number;
    title?: string;
  }> = []
): ProfitSummary {
  const now = new Date();
  const points: ChartDataPoint[] = [];

  // Chuẩn bị các mốc thời gian theo timeRange
  if (timeRange === "7d") {
    // 7 ngày gần nhất (từ 6 ngày trước đến hôm nay)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const isToday = i === 0;
      points.push({
        label: isToday ? "Hôm nay" : getWeekdayLabel(d),
        subLabel: `${d.getDate()}/${d.getMonth() + 1}`,
        fullDate: d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }),
        revenue: 0,
        profit: 0,
        orderCount: 0,
        vipRevenue: 0,
        cloneRevenue: 0,
        serviceRevenue: 0,
      });
    }
  } else if (timeRange === "30d") {
    // 30 ngày gần nhất (nhóm theo từng ngày)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const isToday = i === 0;
      points.push({
        label: isToday ? "Hôm nay" : `${d.getDate()}/${d.getMonth() + 1}`,
        subLabel: getWeekdayLabel(d).split(" ")[0],
        fullDate: d.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }),
        revenue: 0,
        profit: 0,
        orderCount: 0,
        vipRevenue: 0,
        cloneRevenue: 0,
        serviceRevenue: 0,
      });
    }
  } else {
    // 12 Tháng trong năm hiện tại
    for (let m = 0; m < 12; m++) {
      const d = new Date(now.getFullYear(), m, 1);
      points.push({
        label: `Tháng ${m + 1}`,
        subLabel: `${now.getFullYear()}`,
        fullDate: `Tháng ${m + 1} Năm ${now.getFullYear()}`,
        revenue: 0,
        profit: 0,
        orderCount: 0,
        vipRevenue: 0,
        cloneRevenue: 0,
        serviceRevenue: 0,
      });
    }
  }

  // Tích hợp dữ liệu từ các đơn hàng thực tế
  orders.forEach((ord) => {
    const ordDate = new Date(ord.createdAt || ord.startedAt || Date.now());
    const amount = Number(ord.amount) || 0;
    // Cho thuê lãi 100% giá gói; dịch vụ 100%
    const profit = amount;

    if (timeRange === "7d") {
      const diffDays = Math.floor((now.getTime() - ordDate.getTime()) / (24 * 3600 * 1000));
      if (diffDays >= 0 && diffDays < 7) {
        const idx = 6 - diffDays;
        if (points[idx]) {
          points[idx].revenue += amount;
          points[idx].profit += profit;
          points[idx].orderCount += 1;
          if (ord.type === "VIP") points[idx].vipRevenue += amount;
          else if (ord.type === "CLONE") points[idx].cloneRevenue += amount;
          else points[idx].serviceRevenue += amount;
        }
      }
    } else if (timeRange === "30d") {
      const diffDays = Math.floor((now.getTime() - ordDate.getTime()) / (24 * 3600 * 1000));
      if (diffDays >= 0 && diffDays < 30) {
        const idx = 29 - diffDays;
        if (points[idx]) {
          points[idx].revenue += amount;
          points[idx].profit += profit;
          points[idx].orderCount += 1;
          if (ord.type === "VIP") points[idx].vipRevenue += amount;
          else if (ord.type === "CLONE") points[idx].cloneRevenue += amount;
          else points[idx].serviceRevenue += amount;
        }
      }
    } else {
      if (ordDate.getFullYear() === now.getFullYear()) {
        const monthIdx = ordDate.getMonth();
        if (points[monthIdx]) {
          points[monthIdx].revenue += amount;
          points[monthIdx].profit += profit;
          points[monthIdx].orderCount += 1;
          if (ord.type === "VIP") points[monthIdx].vipRevenue += amount;
          else if (ord.type === "CLONE") points[monthIdx].cloneRevenue += amount;
          else points[monthIdx].serviceRevenue += amount;
        }
      }
    }
  });

  // Tích hợp thêm các tài khoản đang RENTED trong kho vào ngày "Hôm nay"
  if (extraRentedAccounts.length > 0) {
    const todayPoint = timeRange === "12m" ? points[now.getMonth()] : points[points.length - 1];
    if (todayPoint) {
      extraRentedAccounts.forEach((acc) => {
        todayPoint.revenue += acc.amount;
        todayPoint.profit += acc.profit;
        todayPoint.orderCount += 1;
        if (acc.category === "VIP") {
          todayPoint.vipRevenue += acc.amount;
        } else {
          todayPoint.cloneRevenue += acc.amount;
        }
      });
    }
  }

  // Tính tổng kết
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalOrders = 0;
  let vipTotal = 0;
  let cloneTotal = 0;
  let serviceTotal = 0;
  let peakDay = { label: "Hôm nay", profit: 0 };

  points.forEach((p) => {
    totalRevenue += p.revenue;
    totalProfit += p.profit;
    totalOrders += p.orderCount;
    vipTotal += p.vipRevenue;
    cloneTotal += p.cloneRevenue;
    serviceTotal += p.serviceRevenue;

    if (p.profit > peakDay.profit) {
      peakDay = { label: p.label, profit: p.profit };
    }
  });

  const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 100;

  const vipPercentage = totalRevenue > 0 ? Math.round((vipTotal / totalRevenue) * 100) : 60;
  const clonePercentage = totalRevenue > 0 ? Math.round((cloneTotal / totalRevenue) * 100) : 30;
  const servicePercentage = totalRevenue > 0 ? Math.round((serviceTotal / totalRevenue) * 100) : 10;

  return {
    totalRevenue,
    totalProfit,
    profitMargin,
    totalOrders,
    peakDay,
    categoryBreakdown: {
      vip: { amount: vipTotal, profit: vipTotal, percentage: vipPercentage },
      clone: { amount: cloneTotal, profit: cloneTotal, percentage: clonePercentage },
      service: { amount: serviceTotal, profit: serviceTotal, percentage: servicePercentage },
    },
    chartPoints: points,
  };
}
