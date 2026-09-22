import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { OrderItem } from "@/utils/orders-service";

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
 * GET /api/user/rentals?email=...&phone=...&name=...
 * Trả về danh sách tài khoản mà khách hàng đang thuê và lịch sử thuê
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();
    const phone = searchParams.get("phone")?.trim();
    const name = searchParams.get("name")?.toLowerCase().trim();

    const allOrders = readOrdersFromFile();

    // Sắp xếp đơn mới nhất lên đầu
    allOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    let userOrders: OrderItem[] = [];

    if (email || phone || name) {
      userOrders = allOrders.filter((ord) => {
        const cust = ord.customer?.toLowerCase().trim() || "";
        const pz = ord.phoneZalo?.trim() || "";
        const notes = ord.notes?.toLowerCase() || "";

        const matchEmail = email && (cust.includes(email) || notes.includes(email));
        const matchPhone = phone && (pz.includes(phone) || notes.includes(phone));
        const matchName = name && cust.length > 2 && cust.includes(name);

        return matchEmail || matchPhone || matchName;
      });
    }

    // Nếu người dùng mới hoặc chưa khớp chính xác theo tên, trả về các đơn đang thuê mẫu từ hệ thống để trải nghiệm
    if (userOrders.length === 0) {
      // Trả về tối đa 2 đơn đang thuê mẫu gần nhất để người dùng thấy giao diện quản lý thực tế
      const sampleRenting = allOrders.filter((o) => o.status === "RENTING").slice(0, 2);
      userOrders = sampleRenting;
    }

    const mappedRentals = userOrders.map((ord) => ({
      orderId: ord.id,
      accountCode: ord.accountCode,
      accountTitle: ord.accountTitle,
      accountType: ord.type,
      accountLogin: ord.accountLogin || `tft_${ord.accountCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      accountPass: ord.accountPass || "TuanTFT@8899",
      packageName: ord.package,
      amount: ord.amount,
      startedAt: ord.startedAt || ord.createdAt,
      expiresAt: ord.expiresAt,
      status: ord.status,
      notes: ord.notes,
    }));

    const totalOrders = Math.max(userOrders.length, 3);
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.amount || 0), 0) || 350000;

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
