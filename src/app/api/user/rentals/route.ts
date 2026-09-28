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
    const memberName = (member.full_name || "").trim().toLowerCase();
    const memberUser = (member.username || "").trim().toLowerCase();

    const userOrders = allOrders.filter((ord) => {
      const cust = (ord.customer || "").toLowerCase().trim();
      const pz = (ord.phoneZalo || "").toLowerCase().trim();
      const notes = (ord.notes || "").toLowerCase();

      const matchZalo = memberZalo && memberZalo.length >= 6 && (pz.includes(memberZalo) || notes.includes(memberZalo));
      const matchName = memberName && memberName.length >= 2 && cust.includes(memberName);
      const matchUser = memberUser && (cust.includes(memberUser) || notes.includes(memberUser));

      return matchZalo || matchName || matchUser;
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
      notes: ord.notes,
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
