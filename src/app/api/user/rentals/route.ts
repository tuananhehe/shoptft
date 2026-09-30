import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { OrderItem } from "@/utils/orders-service";
import { verifyMemberSessionToken, getMemberById } from "@/utils/members-service";

const ORDERS_FILE_PATH = path.join(process.cwd(), "src", "data", "orders.json");

function readOrdersFromFile(): OrderItem[] {
  try {
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const data = fs.readFileSync(ORDERS_FILE_PATH, "utf8");
      return JSON.parse(data) as OrderItem[];
    }
  } catch (err) {
    console.error("Lỗi đọc file orders.json:", err);
  }
  return [];
}

/**
 * GET /api/user/rentals
 * Trả về danh sách tài khoản mà thành viên đang thuê và lịch sử thuê của riêng mình
 */
export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("member_session")?.value;
    const headerToken = req.headers.get("x-member-token");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập thành viên (Unauthorized)", data: [] },
        { status: 401 }
      );
    }

    const session = verifyMemberSessionToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Phiên đăng nhập hết hạn hoặc không hợp lệ", data: [] },
        { status: 401 }
      );
    }

    const member = await getMemberById(session.id);
    if (!member || member.status === "LOCKED") {
      return NextResponse.json(
        { success: false, error: "Tài khoản không tồn tại hoặc bị khóa", data: [] },
        { status: 403 }
      );
    }

    const allOrders = readOrdersFromFile();
    allOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const memberZalo = (member.zalo || "").trim().toLowerCase();
    const cleanMemberZalo = memberZalo.replace(/[^0-9]/g, "");
    const memberUser = (member.username || "").trim().toLowerCase();

    const userOrders = allOrders.filter((ord) => {
      // 1. Direct member ID match (100% accurate)
      if (ord.memberId && ord.memberId === member.id) return true;

      // 2. Exact phone/Zalo match (at least 9 digits to prevent collision)
      const cleanPz = (ord.phoneZalo || "").replace(/[^0-9]/g, "");
      if (cleanMemberZalo && cleanMemberZalo.length >= 9 && cleanPz === cleanMemberZalo) {
        return true;
      }

      // 3. Exact username match
      const cust = (ord.customer || "").trim().toLowerCase();
      if (memberUser && cust === memberUser) {
        return true;
      }

      return false;
    });

    const mappedRentals = userOrders.map((ord) => ({
      orderId: ord.id,
      accountCode: ord.accountCode,
      accountTitle: ord.accountTitle,
      accountType: ord.type,
      accountLogin: ord.accountLogin,
      accountPass: ord.accountPass,
      packageName: ord.package,
      amount: ord.amount,
      startedAt: ord.startedAt || ord.createdAt,
      expiresAt: ord.expiresAt,
      status: ord.status,
      notes: ord.notes?.includes("[Admin") || ord.notes?.includes("Ghi chú nội bộ")
        ? "Tài khoản đang thuê"
        : ord.notes,
    }));

    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    return NextResponse.json({
      success: true,
      data: mappedRentals,
      totalOrders,
      totalSpent,
    });
  } catch (err: any) {
    console.error("Lỗi GET /api/user/rentals:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ", data: [] },
      { status: 500 }
    );
  }
}
