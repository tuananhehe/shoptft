import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { OrderItem, OrdersStats } from "@/utils/orders-service";

const ORDERS_FILE_PATH = path.join(process.cwd(), "src", "data", "orders.json");

let memoryOrders: OrderItem[] = [];

// Đọc danh sách đơn hàng từ file JSON
function readOrdersFromFile(): OrderItem[] {
  try {
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const fileData = fs.readFileSync(ORDERS_FILE_PATH, "utf8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        memoryOrders = parsed;
        return memoryOrders;
      }
    }
  } catch (err) {
    console.error("Lỗi đọc file orders.json:", err);
  }
  return memoryOrders;
}

// Ghi danh sách đơn hàng vào file JSON
function writeOrdersToFile(orders: OrderItem[]) {
  try {
    memoryOrders = orders;
    const dir = path.dirname(ORDERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf8");
  } catch (err) {
    console.error("Lỗi ghi file orders.json:", err);
  }
}

// Khởi tạo nạp dữ liệu
readOrdersFromFile();

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

// Tính toán thống kê đơn hàng
function calculateStats(orders: OrderItem[]): OrdersStats {
  const now = Date.now();
  let totalRevenue = 0;
  let rentingOrders = 0;
  let completedOrders = 0;
  let expiredOrders = 0;

  orders.forEach((o) => {
    totalRevenue += Number(o.amount) || 0;
    if (o.status === "COMPLETED") {
      completedOrders++;
    } else if (o.status === "RENTING") {
      rentingOrders++;
      if (o.expiresAt && new Date(o.expiresAt).getTime() < now) {
        expiredOrders++;
      }
    }
  });

  return {
    totalRevenue,
    totalOrders: orders.length,
    rentingOrders,
    completedOrders,
    expiredOrders,
  };
}

/**
 * GET /api/orders
 * Lấy toàn bộ danh sách đơn hàng & số liệu thống kê
 */
export async function GET(req: NextRequest) {
  try {
    const orders = readOrdersFromFile();
    const stats = calculateStats(orders);

    return NextResponse.json({
      success: true,
      data: orders,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, data: [], stats: { totalRevenue: 0, totalOrders: 0, rentingOrders: 0, completedOrders: 0, expiredOrders: 0 } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Tạo mới một đơn hàng
 */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const currentOrders = readOrdersFromFile();
    const newId = body.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const durationHours = Number(body.durationHours) || 2;
    const now = new Date();
    let expiresAt: string | null = null;

    if (body.expiresAt) {
      expiresAt = body.expiresAt;
    } else if (durationHours > 0) {
      const expDate = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
      expiresAt = expDate.toISOString();
    }

    const newOrder: OrderItem = {
      id: newId,
      type: body.type || "VIP",
      customer: body.customer?.trim() || "Khách hàng ẩn danh",
      deliveredBy: body.deliveredBy?.trim() || "Admin",
      phoneZalo: body.phoneZalo?.trim() || "09xx.xxx.xxx",
      accountCode: body.accountCode?.trim() || "MS: 8899",
      accountTitle: body.accountTitle?.trim() || "Tài khoản TFT VIP",
      package: body.package?.trim() || "2 Giờ Trải Nghiệm",
      durationHours: durationHours,
      amount: Number(body.amount) || 30000,
      paymentMethod: body.paymentMethod || "TRANSFER",
      status: body.status || "RENTING",
      createdBy: body.createdBy || "ADMIN",
      source: body.source || "ADMIN",
      createdAt: now.toISOString(),
      startedAt: body.startedAt || now.toISOString(),
      expiresAt,
      accountLogin: body.accountLogin?.trim() || `tft_${body.accountCode?.toLowerCase().replace(/[^a-z0-9]/g, "") || "vip"}`,
      accountPass: body.accountPass?.trim() || `TuanTFT@${Math.floor(1000 + Math.random() * 9000)}`,
      notes: body.notes?.trim() || "Đơn hàng tạo từ hệ thống quản trị (Admin).",
    };

    const updatedOrders = [newOrder, ...currentOrders];
    writeOrdersToFile(updatedOrders);

    return NextResponse.json({
      success: true,
      message: `Đã tạo đơn hàng ${newId} thành công!`,
      data: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi tạo đơn hàng" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders?id=ORD-xxxx
 * Cập nhật, gia hạn hoặc đổi trạng thái đơn hàng
 */
export async function PUT(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã đơn hàng (id)!" },
        { status: 400 }
      );
    }

    const currentOrders = readOrdersFromFile();
    const orderIndex = currentOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy đơn hàng ${id}!` },
        { status: 404 }
      );
    }

    const currentOrder = currentOrders[orderIndex];
    const body = await req.json().catch(() => ({}));

    // Action 1: Gia hạn thời gian thuê
    if (action === "extend") {
      const extraHours = Number(body.extraHours) || 2;
      const extraPrice = Number(body.extraPrice) || 0;

      const baseTime = currentOrder.expiresAt ? new Date(currentOrder.expiresAt).getTime() : Date.now();
      const currentExpiry = Math.max(baseTime, Date.now());
      const newExpiry = new Date(currentExpiry + extraHours * 60 * 60 * 1000).toISOString();

      const updatedOrder: OrderItem = {
        ...currentOrder,
        status: "RENTING",
        amount: currentOrder.amount + extraPrice,
        durationHours: (currentOrder.durationHours || 0) > 0 ? (currentOrder.durationHours || 0) + extraHours : extraHours,
        expiresAt: newExpiry,
        notes: `${currentOrder.notes || ""}\n[${new Date().toLocaleTimeString("vi-VN")}] Gia hạn thêm +${extraHours}h (+${extraPrice.toLocaleString("vi-VN")}đ).`.trim(),
      };

      currentOrders[orderIndex] = updatedOrder;
      writeOrdersToFile(currentOrders);

      return NextResponse.json({
        success: true,
        message: `Đã gia hạn đơn hàng ${id} thêm ${extraHours} giờ!`,
        data: updatedOrder,
      });
    }

    // Action 2: Cập nhật thông thường
    const updatedOrder: OrderItem = {
      ...currentOrder,
      ...body,
      id: currentOrder.id, // giữ nguyên ID gốc
      createdAt: currentOrder.createdAt, // giữ nguyên ngày tạo gốc
    };

    currentOrders[orderIndex] = updatedOrder;
    writeOrdersToFile(currentOrders);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật đơn hàng ${id} thành công!`,
      data: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi cập nhật đơn hàng" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders?id=ORD-xxxx
 * Xóa một đơn hàng
 */
export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã đơn hàng (id)!" },
        { status: 400 }
      );
    }

    const currentOrders = readOrdersFromFile();
    const filteredOrders = currentOrders.filter((o) => o.id !== id);

    if (filteredOrders.length === currentOrders.length) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy đơn hàng ${id}!` },
        { status: 404 }
      );
    }

    writeOrdersToFile(filteredOrders);

    return NextResponse.json({
      success: true,
      message: `Đã xóa đơn hàng ${id} thành công!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi xóa đơn hàng" },
      { status: 500 }
    );
  }
}
