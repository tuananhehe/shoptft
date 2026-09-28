import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/utils/supabase/client";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { TFT_RENTAL_ACCOUNTS, TFT_CLONE_ACCOUNTS } from "@/data/tft-data";
import {
  OrderItem,
  getRentalTimeRemaining,
  formatOrderDateTime,
} from "@/utils/orders-service";
import { getMembers } from "@/utils/members-service";

function checkAdminAuth(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(sessionCookie || headerToken);
  return !!session;
}

export interface DashboardResponseData {
  accounts: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    hidden: number;
    vip: number;
    clone: number;
    vipAvailable: number;
    cloneAvailable: number;
  };
  rentals: {
    total: number;
    active: number;
    expiring: number;
    overdue: number;
    completed: number;
  };
  customers: {
    total: number;
    complete: number;
    incomplete: number;
    missingName: number;
    missingZalo: number;
    activeRentalCustomers: number;
  };
  actionRequiredCount: number;
  issues: Array<{
    id: string;
    priority: number;
    severity: "urgent" | "attention" | "info";
    title: string;
    description: string;
    link: string;
    linkText: string;
    count: number;
  }>;
  activeRentalsPreview: Array<{
    id: string;
    accountCode: string;
    accountTitle: string;
    type: string;
    customer: string;
    phoneZalo?: string;
    memberId?: string;
    package: string;
    startedAt: string;
    expiresAt?: string | null;
    isOverdue: boolean;
    isExpiringSoon: boolean;
    timeRemainingFormatted: string;
    status: string;
  }>;
  recentAccounts: Array<{
    id: string;
    code: string;
    title: string;
    type: "VIP" | "CLONE";
    status: string;
    createdAt: string;
  }>;
  recentUpdates: Array<{
    id: string;
    type: "RENTAL" | "ACCOUNT" | "MEMBER";
    title: string;
    description: string;
    timestamp: string;
    link: string;
  }>;
}

export async function GET(req: NextRequest) {
  // 1. Admin authorization check
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const now = Date.now();

    // 2. Fetch Accounts (from Supabase with fallback to local seed data)
    let accounts: Array<{
      id: string;
      code: string;
      title: string;
      type: "VIP" | "CLONE";
      status: string;
      rented_until?: string | null;
      created_at?: string;
      updated_at?: string;
    }> = [];

    try {
      const { data: dbAccounts, error: dbErr } = await supabase
        .from("accounts")
        .select("id, code, type, title, status, rented_until, created_at")
        .order("created_at", { ascending: false });

      if (!dbErr && Array.isArray(dbAccounts) && dbAccounts.length > 0) {
        accounts = dbAccounts.map((a) => ({
          id: String(a.id),
          code: String(a.code || "").trim(),
          title: a.title || `Tài khoản ${a.code}`,
          type: (String(a.type || "").toUpperCase() === "CLONE" ? "CLONE" : "VIP") as "VIP" | "CLONE",
          status: (a.status || "AVAILABLE").toUpperCase(),
          rented_until: a.rented_until || null,
          created_at: a.created_at || new Date().toISOString(),
          updated_at: a.created_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Lưu ý truy vấn Supabase accounts cho Dashboard:", err);
    }

    // Fallback if DB query was empty or failed
    if (accounts.length === 0) {
      accounts = [
        ...TFT_RENTAL_ACCOUNTS.map((v) => ({
          id: v.id,
          code: v.code,
          title: v.title,
          type: "VIP" as const,
          status: (v.status || "AVAILABLE").toUpperCase(),
          rented_until: v.rentedUntil || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        ...TFT_CLONE_ACCOUNTS.map((c) => ({
          id: c.id,
          code: c.code,
          title: c.title,
          type: "CLONE" as const,
          status: (c.status || "AVAILABLE").toUpperCase(),
          rented_until: c.rentedUntil || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      ];
    }

    // Accounts statistics
    const totalAccounts = accounts.length;
    const availableAccounts = accounts.filter((a) => a.status === "AVAILABLE").length;
    const rentedAccounts = accounts.filter((a) => a.status === "RENTED").length;
    const maintenanceAccounts = accounts.filter((a) => a.status === "MAINTENANCE").length;
    const hiddenAccounts = accounts.filter((a) => a.status === "HIDDEN").length;

    const vipAccounts = accounts.filter((a) => a.type === "VIP").length;
    const cloneAccounts = accounts.filter((a) => a.type === "CLONE").length;
    const vipAvailable = accounts.filter((a) => a.type === "VIP" && a.status === "AVAILABLE").length;
    const cloneAvailable = accounts.filter((a) => a.type === "CLONE" && a.status === "AVAILABLE").length;

    // 3. Fetch Rentals (orders.json)
    let orders: OrderItem[] = [];
    try {
      const ordersPath = path.join(process.cwd(), "src", "data", "orders.json");
      if (fs.existsSync(ordersPath)) {
        const fileContent = fs.readFileSync(ordersPath, "utf8").trim();
        if (fileContent) {
          orders = JSON.parse(fileContent);
        }
      }
    } catch (err) {
      console.warn("Lỗi đọc orders.json trong dashboard:", err);
    }

    const activeRentals = orders.filter((o) => o.status === "RENTING");
    const completedRentals = orders.filter((o) => o.status === "COMPLETED").length;

    // Evaluate active rentals timing
    const activeRentalsWithTiming = activeRentals.map((ord) => {
      const timeRemaining = getRentalTimeRemaining(ord.expiresAt);
      return {
        order: ord,
        isOverdue: timeRemaining.isExpired,
        isExpiringSoon: timeRemaining.isExpiringSoon,
        formatted: timeRemaining.formatted,
      };
    });

    const overdueRentals = activeRentalsWithTiming.filter((r) => r.isOverdue);
    const expiringRentals = activeRentalsWithTiming.filter((r) => r.isExpiringSoon);

    // 4. Fetch Members (members.json)
    let members: any[] = [];
    try {
      members = await getMembers();
    } catch (err) {
      console.warn("Lỗi lấy danh sách members trong dashboard:", err);
    }

    const totalMembers = members.length;
    const incompleteMembers = members.filter(
      (m) => !m.full_name || m.full_name.trim().length < 2 || !m.zalo || m.zalo.trim().length < 6
    );
    const missingNameCount = members.filter((m) => !m.full_name || m.full_name.trim().length < 2).length;
    const missingZaloCount = members.filter((m) => !m.zalo || m.zalo.trim().length < 6).length;
    const completeMembersCount = totalMembers - incompleteMembers.length;

    // Members with active rentals
    const activeRentalMemberIds = new Set<string>();
    activeRentals.forEach((ord) => {
      if (ord.memberId) {
        activeRentalMemberIds.add(ord.memberId);
      }
      if (ord.phoneZalo) {
        const cleanPhone = ord.phoneZalo.replace(/\D/g, "");
        if (cleanPhone) {
          const matched = members.find((m) => m.zalo && m.zalo.replace(/\D/g, "") === cleanPhone);
          if (matched) activeRentalMemberIds.add(matched.id);
        }
      }
    });

    // 5. Account/Rental Status Mismatch Detection
    const rentedAccountCodes = new Set(
      accounts.filter((a) => a.status === "RENTED").map((a) => a.code.toLowerCase().trim())
    );
    const activeRentalOrderCodes = new Set(
      activeRentals.map((o) => (o.accountCode || "").toLowerCase().trim()).filter(Boolean)
    );

    const accountsRentedWithoutOrder: string[] = [];
    rentedAccountCodes.forEach((code) => {
      if (!activeRentalOrderCodes.has(code)) {
        accountsRentedWithoutOrder.push(code);
      }
    });

    const ordersRentingWithAvailableAccount: string[] = [];
    activeRentalOrderCodes.forEach((code) => {
      const matchAcc = accounts.find((a) => a.code.toLowerCase().trim() === code);
      if (matchAcc && matchAcc.status === "AVAILABLE") {
        ordersRentingWithAvailableAccount.push(matchAcc.code);
      }
    });

    const allMismatchedCodes = Array.from(
      new Set([...accountsRentedWithoutOrder, ...ordersRentingWithAvailableAccount])
    );

    // 6. Build Actionable Issues ("Cần xử lý") in strict priority order:
    // 1. Quá hạn (Urgent - Red)
    // 2. Rental/account state conflict (Urgent - Red/Amber)
    // 3. Sắp hết hạn (Attention - Amber)
    // 4. Acc bảo trì (Attention - Amber)
    // 5. Member thiếu thông tin (Informational - Blue/Gray)
    const issues: DashboardResponseData["issues"] = [];

    // Priority 1: Overdue rentals
    if (overdueRentals.length > 0) {
      issues.push({
        id: "issue-overdue",
        priority: 1,
        severity: "urgent",
        title: `${overdueRentals.length} lượt thuê đã quá hạn`,
        description: "Cần thu hồi tài khoản hoặc liên hệ khách gia hạn.",
        link: "/admin/rentals?tab=OVERDUE",
        linkText: "Xem lượt thuê quá hạn →",
        count: overdueRentals.length,
      });
    }

    // Priority 2: Account/Rental state conflict
    if (allMismatchedCodes.length > 0) {
      const sampleCodes = allMismatchedCodes.slice(0, 3).join(", ");
      const more = allMismatchedCodes.length > 3 ? "..." : "";
      issues.push({
        id: "issue-mismatch",
        priority: 2,
        severity: "urgent",
        title: `${allMismatchedCodes.length} tài khoản có trạng thái thuê không đồng bộ`,
        description: `Chênh lệch trạng thái giữa Kho Acc và Lượt Thuê (${sampleCodes}${more}).`,
        link: "/admin/rentals",
        linkText: "Kiểm tra lượt thuê →",
        count: allMismatchedCodes.length,
      });
    }

    // Priority 3: Expiring rentals
    if (expiringRentals.length > 0) {
      issues.push({
        id: "issue-expiring",
        priority: 3,
        severity: "attention",
        title: `${expiringRentals.length} lượt thuê sắp hết hạn`,
        description: "Thời gian thuê còn dưới 24 giờ. Chuẩn bị liên hệ hỗ trợ hoặc thu hồi.",
        link: "/admin/rentals?tab=EXPIRING",
        linkText: "Xem sắp hết hạn →",
        count: expiringRentals.length,
      });
    }

    // Priority 4: Maintenance accounts
    if (maintenanceAccounts > 0) {
      issues.push({
        id: "issue-maintenance",
        priority: 4,
        severity: "attention",
        title: `${maintenanceAccounts} tài khoản đang bảo trì`,
        description: "Tài khoản đang tạm dừng cho thuê để kiểm tra mật khẩu hoặc cập nhật.",
        link: "/admin/accounts",
        linkText: "Xem kho acc →",
        count: maintenanceAccounts,
      });
    }

    // Priority 5: Incomplete Member profiles
    if (incompleteMembers.length > 0) {
      issues.push({
        id: "issue-incomplete-members",
        priority: 5,
        severity: "info",
        title: `${incompleteMembers.length} khách hàng chưa đủ Zalo / Họ tên`,
        description: "Cần cập nhật thông tin để thuận tiện liên hệ chăm sóc và bàn giao.",
        link: "/admin/customers?profileStatus=INCOMPLETE",
        linkText: "Xem khách hàng →",
        count: incompleteMembers.length,
      });
    }

    // Aggregate Action Required Count (sum of distinct actionable problems)
    const actionRequiredCount =
      overdueRentals.length +
      allMismatchedCodes.length +
      expiringRentals.length +
      maintenanceAccounts +
      incompleteMembers.length;

    // 7. Active Rentals Preview (Sorted: Overdue first, Expiring soon next, nearest end time)
    const sortedRentals = [...activeRentalsWithTiming].sort((a, b) => {
      const aExp = a.order.expiresAt ? new Date(a.order.expiresAt).getTime() : Infinity;
      const bExp = b.order.expiresAt ? new Date(b.order.expiresAt).getTime() : Infinity;

      // Overdue first (longest overdue first)
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isOverdue && b.isOverdue) return aExp - bExp;

      // Expiring soon next
      if (a.isExpiringSoon && !b.isExpiringSoon) return -1;
      if (!a.isExpiringSoon && b.isExpiringSoon) return 1;

      // Nearest end time
      return aExp - bExp;
    });

    const activeRentalsPreview = sortedRentals.slice(0, 8).map((item) => ({
      id: item.order.id,
      accountCode: item.order.accountCode,
      accountTitle: item.order.accountTitle,
      type: item.order.type || "VIP",
      customer: item.order.customer || "Khách hàng ẩn danh",
      phoneZalo: item.order.phoneZalo,
      memberId: item.order.memberId,
      package: item.order.package || "Gói thuê",
      startedAt: item.order.startedAt || item.order.createdAt,
      expiresAt: item.order.expiresAt,
      isOverdue: item.isOverdue,
      isExpiringSoon: item.isExpiringSoon,
      timeRemainingFormatted: item.formatted,
      status: item.order.status,
    }));

    // 8. Recent Accounts Preview (Last 5 accounts)
    const recentAccounts = accounts.slice(0, 5).map((a) => ({
      id: a.id,
      code: a.code,
      title: a.title,
      type: a.type,
      status: a.status,
      createdAt: a.created_at || new Date().toISOString(),
    }));

    // 9. Recent Updates (Based on real timestamps from orders, accounts, and members)
    const updates: Array<{
      id: string;
      type: "RENTAL" | "ACCOUNT" | "MEMBER";
      title: string;
      description: string;
      timestamp: string;
      link: string;
    }> = [];

    // Latest orders
    orders.slice(0, 5).forEach((o) => {
      updates.push({
        id: `ord-${o.id}`,
        type: "RENTAL",
        title: `Lượt thuê ${o.accountCode} (${o.package || "Gói thuê"})`,
        description: `Khách: ${o.customer}${o.phoneZalo ? ` • ${o.phoneZalo}` : ""} • ${
          o.status === "RENTING" ? "Đang thuê" : "Hoàn tất"
        }`,
        timestamp: o.createdAt || o.startedAt || new Date().toISOString(),
        link: "/admin/rentals",
      });
    });

    // Latest accounts
    accounts.slice(0, 4).forEach((a) => {
      updates.push({
        id: `acc-${a.id}`,
        type: "ACCOUNT",
        title: `Tài khoản ${a.code} [${a.type}]`,
        description: `${a.title} • Trạng thái: ${
          a.status === "AVAILABLE" ? "Còn Acc" : a.status === "RENTED" ? "Đang Thuê" : a.status
        }`,
        timestamp: a.created_at || a.updated_at || new Date().toISOString(),
        link: "/admin/accounts",
      });
    });

    // Latest members
    members.slice(0, 3).forEach((m) => {
      updates.push({
        id: `mem-${m.id}`,
        type: "MEMBER",
        title: `Khách hàng: ${m.full_name || m.username}`,
        description: `Tài khoản: ${m.username}${m.zalo ? ` • Zalo: ${m.zalo}` : " • Chưa có Zalo"}`,
        timestamp: m.createdAt || m.updatedAt || new Date().toISOString(),
        link: "/admin/customers",
      });
    });

    // Sort descending by timestamp, take top 6
    const recentUpdates = updates
      .filter((u) => u.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);

    const payload: DashboardResponseData = {
      accounts: {
        total: totalAccounts,
        available: availableAccounts,
        rented: rentedAccounts,
        maintenance: maintenanceAccounts,
        hidden: hiddenAccounts,
        vip: vipAccounts,
        clone: cloneAccounts,
        vipAvailable,
        cloneAvailable,
      },
      rentals: {
        total: orders.length,
        active: activeRentals.length,
        expiring: expiringRentals.length,
        overdue: overdueRentals.length,
        completed: completedRentals,
      },
      customers: {
        total: totalMembers,
        complete: completeMembersCount,
        incomplete: incompleteMembers.length,
        missingName: missingNameCount,
        missingZalo: missingZaloCount,
        activeRentalCustomers: activeRentalMemberIds.size,
      },
      actionRequiredCount,
      issues,
      activeRentalsPreview,
      recentAccounts,
      recentUpdates,
    };

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (err: any) {
    console.error("Lỗi Server GET /api/admin/dashboard:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Lỗi xử lý bảng điều khiển.",
      },
      { status: 500 }
    );
  }
}
