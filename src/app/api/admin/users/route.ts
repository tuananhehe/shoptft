import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import {
  getMembers,
  createMember,
  toSafeMember,
} from "@/utils/members-service";

function checkAdminAuth(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(sessionCookie || headerToken);
  return !!session;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const status = searchParams.get("status") || "ALL"; // ALL | ACTIVE | LOCKED
    const profileStatus = searchParams.get("profileStatus") || "ALL"; // ALL | COMPLETED | INCOMPLETE
    const sort = searchParams.get("sort") || "newest"; // newest | oldest | name | lastLogin

    let members = await getMembers();

    // Search filter
    if (search) {
      members = members.filter((m) => {
        const u = m.username?.toLowerCase() || "";
        const f = m.full_name?.toLowerCase() || "";
        const z = m.zalo?.toLowerCase() || "";
        const n = m.notes?.toLowerCase() || "";
        return u.includes(search) || f.includes(search) || z.includes(search) || n.includes(search);
      });
    }

    // Status filter
    if (status && status !== "ALL") {
      members = members.filter((m) => m.status === status);
    }

    // Profile completion filter
    if (profileStatus === "COMPLETED") {
      members = members.filter((m) => Boolean(m.full_name?.trim() && m.zalo?.trim()));
    } else if (profileStatus === "INCOMPLETE") {
      members = members.filter((m) => !m.full_name?.trim() || !m.zalo?.trim());
    }

    // Sorting
    if (sort === "oldest") {
      members.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sort === "name") {
      members.sort((a, b) => (a.full_name || a.username).localeCompare(b.full_name || b.username));
    } else if (sort === "lastLogin") {
      members.sort((a, b) => new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime());
    } else {
      // newest
      members.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    const safeMembers = members.map((m) => toSafeMember(m, true));
    return NextResponse.json({
      success: true,
      data: safeMembers,
      total: safeMembers.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách thành viên." },
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
      data: result.member,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tạo thành viên." },
      { status: 500 }
    );
  }
}
