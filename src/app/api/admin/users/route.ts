import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import {
  getMembers,
  createMember,
  toSafeMember,
  Member,
  SafeMember,
} from "@/utils/members-service";
import { OrderItem } from "@/utils/orders-service";

function checkAdminAuth(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(sessionCookie || headerToken);
  return !!session;
}

export interface CustomerListItem extends SafeMember {
  rentalCount: number;
  activeRentalCount: number;
  profileStatus: "COMPLETE" | "MISSING_NAME" | "MISSING_ZALO" | "MISSING_BOTH";
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status") || "ALL"; // ALL | ACTIVE | LOCKED
    const profileStatusFilter = searchParams.get("profileStatus") || "ALL"; // ALL | COMPLETE | INCOMPLETE
    const rentalFilter = searchParams.get("rentalFilter") || "ALL"; // ALL | HAS_RENTALS | NO_RENTALS
    const sort = searchParams.get("sort") || "newest"; // newest | oldest | name | lastLogin | rentals
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const members = await getMembers();

    // Load orders once to calculate real rental relation
    let orders: OrderItem[] = [];
    try {
      const ordersPath = path.join(process.cwd(), "src", "data", "orders.json");
      if (fs.existsSync(ordersPath)) {
        orders = JSON.parse(fs.readFileSync(ordersPath, "utf8"));
      }
    } catch {}

    // Map each member to CustomerListItem with derived status
    const mappedCustomers: CustomerListItem[] = members.map((m) => {
      const safe = toSafeMember(m, true);
      const cleanZalo = m.zalo ? m.zalo.replace(/\D/g, "") : "";

      const linkedRentals = orders.filter((o) => {
        if (o.memberId && o.memberId === m.id) return true;
        if (cleanZalo && o.phoneZalo && o.phoneZalo.replace(/\D/g, "") === cleanZalo) return true;
        return false;
      });

      const validRentals = linkedRentals.filter((r) => r.status !== "CANCELLED");
      const activeRentals = validRentals.filter((r) => r.status === "RENTING");

      const hasName = Boolean(m.full_name && m.full_name.trim().length >= 2);
      const hasZalo = Boolean(m.zalo && m.zalo.trim().length >= 6);

      let pStatus: CustomerListItem["profileStatus"] = "COMPLETE";
      if (!hasName && !hasZalo) pStatus = "MISSING_BOTH";
      else if (!hasName) pStatus = "MISSING_NAME";
      else if (!hasZalo) pStatus = "MISSING_ZALO";

      return {
        ...safe,
        rentalCount: validRentals.length,
        activeRentalCount: activeRentals.length,
        profileStatus: pStatus,
      };
    });

    // Summary stats for Dashboard (Requirement 33)
    const totalMembers = mappedCustomers.length;
    const activeMembers = mappedCustomers.filter((m) => m.status === "ACTIVE").length;
    const lockedMembers = mappedCustomers.filter((m) => m.status === "LOCKED").length;
    const incompleteProfiles = mappedCustomers.filter((m) => m.profileStatus !== "COMPLETE").length;
    const membersWithActiveRentals = mappedCustomers.filter((m) => m.activeRentalCount > 0).length;

    let filtered = [...mappedCustomers];

    // Search filter
    if (search) {
      filtered = filtered.filter((m) => {
        const u = m.username?.toLowerCase() || "";
        const f = m.full_name?.toLowerCase() || "";
        const z = m.zalo?.toLowerCase() || "";
        const n = m.notes?.toLowerCase() || "";
        return u.includes(search) || f.includes(search) || z.includes(search) || n.includes(search);
      });
    }

    // Status filter
    if (status && status !== "ALL") {
      filtered = filtered.filter((m) => m.status === status);
    }

    // Profile completion filter
    if (profileStatusFilter === "COMPLETE") {
      filtered = filtered.filter((m) => m.profileStatus === "COMPLETE");
    } else if (profileStatusFilter === "INCOMPLETE") {
      filtered = filtered.filter((m) => m.profileStatus !== "COMPLETE");
    }

    // Rental filter
    if (rentalFilter === "HAS_RENTALS") {
      filtered = filtered.filter((m) => m.rentalCount > 0);
    } else if (rentalFilter === "NO_RENTALS") {
      filtered = filtered.filter((m) => m.rentalCount === 0);
    }

    // Sorting
    if (sort === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sort === "name") {
      filtered.sort((a, b) => (a.full_name || a.username).localeCompare(b.full_name || b.username));
    } else if (sort === "lastLogin") {
      filtered.sort((a, b) => new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime());
    } else if (sort === "rentals") {
      filtered.sort((a, b) => b.rentalCount - a.rentalCount);
    } else {
      // newest
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    const totalFiltered = filtered.length;
    const totalPages = limit > 0 ? Math.ceil(totalFiltered / limit) : 1;
    const pagedData = limit > 0 ? filtered.slice((page - 1) * limit, page * limit) : filtered;

    return NextResponse.json({
      success: true,
      data: pagedData,
      total: totalFiltered,
      page,
      totalPages,
      limit,
      stats: {
        totalMembers,
        activeMembers,
        lockedMembers,
        incompleteProfiles,
        membersWithActiveRentals,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách khách hàng." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { username, password, full_name, zalo, notes, status } = body;

    // Check duplicate Zalo warning (Requirement 17)
    let duplicateZaloWarning: string | null = null;
    const cleanZalo = zalo ? zalo.replace(/\D/g, "") : "";
    if (cleanZalo && cleanZalo.length >= 6) {
      const allMembers = await getMembers();
      const existingZaloMember = allMembers.find(
        (m) => m.zalo && m.zalo.replace(/\D/g, "") === cleanZalo
      );
      if (existingZaloMember) {
        duplicateZaloWarning = `Zalo này đã tồn tại ở khách hàng "${existingZaloMember.full_name || existingZaloMember.username}".`;
      }
    }

    const result = await createMember({
      username,
      password,
      full_name,
      zalo,
      notes,
      status,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Tạo tài khoản thất bại." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tạo tài khoản thành viên thành công!",
      warning: duplicateZaloWarning,
      data: result.member,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tạo thành viên." },
      { status: 500 }
    );
  }
}
