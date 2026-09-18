import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/utils/supabase/client";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { OrderItem, OrdersStats, OrderStatus, determinePackageFromAccount } from "@/utils/orders-service";

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
 * Lấy danh sách toàn bộ đơn hàng & tự động đồng bộ 100% với kho Supabase
 */
export async function GET(req: NextRequest) {
  try {
    let orders = readOrdersFromFile();

    // 1. Truy vấn toàn bộ tài khoản thực tế từ Supabase
    try {
      const { data: dbAccounts } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (Array.isArray(dbAccounts) && dbAccounts.length > 0) {
        const dbMap = new Map<string, any>();
        dbAccounts.forEach((acc) => {
          if (acc.code) {
            dbMap.set(acc.code.toLowerCase().trim(), acc);
          }
        });

        const rentedCodesWithActiveOrder = new Set<string>();

        // 2. Cập nhật các đơn hàng hiện có theo trạng thái thật & đúng gói thuê set trong Quản lý acc
        orders = orders.map((ord) => {
          const acc = dbMap.get(ord.accountCode.toLowerCase().trim());
          if (acc) {
            if (acc.status === "RENTED") {
              if (ord.status === "RENTING") {
                rentedCodesWithActiveOrder.add(acc.code.toLowerCase().trim());
                const pkg = determinePackageFromAccount(acc, ord);
                return {
                  ...ord,
                  package: pkg.packageName,
                  durationHours: pkg.durationHours,
                  amount: pkg.amount,
                  expiresAt: acc.rented_until || ord.expiresAt,
                  accountTitle: acc.title || ord.accountTitle,
                  accountCode: acc.code,
                  customer: ord.customer || "Khách hàng ẩn danh",
                  deliveredBy: ord.deliveredBy || "Admin",
                };
              }
            } else if (acc.status === "AVAILABLE" && ord.status === "RENTING") {
              // Acc trong kho đã về AVAILABLE => đánh dấu đơn COMPLETED
              return {
                ...ord,
                status: "COMPLETED" as OrderStatus,
                notes: `${ord.notes || ""}\n[Tài khoản đã hoàn tất & thu hồi về kho]`.trim(),
              };
            }
          }
          return ord;
        });

        // 3. Tự động sinh đơn cho các tài khoản đang RENTED trong DB mà chưa có trong danh sách đơn RENTING
        const newRentingOrders: OrderItem[] = [];
        dbAccounts.forEach((acc) => {
          if (acc.status === "RENTED") {
            const codeKey = acc.code.toLowerCase().trim();
            if (!rentedCodesWithActiveOrder.has(codeKey)) {
              const codeNum = acc.code.replace(/[^0-9]/g, "") || Math.floor(1000 + Math.random() * 9000);
              const pkg = determinePackageFromAccount(acc);

              const autoOrder: OrderItem = {
                id: `ORD-${codeNum}`,
                type: acc.type === "CLONE" ? "CLONE" : "VIP",
                customer: "Khách hàng ẩn danh",
                deliveredBy: "Admin",
                phoneZalo: "0352.867.283",
                accountCode: acc.code,
                accountTitle: acc.title || `Tài khoản ${acc.code}`,
                package: pkg.packageName,
                durationHours: pkg.durationHours,
                amount: pkg.amount,
                paymentMethod: "TRANSFER",
                status: "RENTING",
                createdBy: "ADMIN",
                source: "ADMIN",
                createdAt: acc.created_at || new Date().toISOString(),
                startedAt: acc.created_at || new Date().toISOString(),
                expiresAt: acc.rented_until || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                accountLogin: `tft_${acc.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
                accountPass: `TuanTFT@${Math.floor(1000 + Math.random() * 9000)}`,
                notes: "Đơn tự động đồng bộ từ kho tài khoản đang cho thuê.",
              };
              newRentingOrders.push(autoOrder);
              rentedCodesWithActiveOrder.add(codeKey);
            }
          }
        });

        if (newRentingOrders.length > 0) {
          orders = [...newRentingOrders, ...orders];
        }

        writeOrdersToFile(orders);
      }
    } catch (syncErr) {
      console.warn("Lưu ý đồng bộ Supabase accounts:", syncErr);
    }

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
 * Tạo mới một đơn hàng (đồng thời cập nhật Supabase account status)
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

    // Cập nhật trạng thái sang RENTED trong Supabase nếu đơn là RENTING
    if (newOrder.status === "RENTING" && newOrder.accountCode) {
      try {
        await supabase
          .from("accounts")
          .update({
            status: "RENTED",
            rented_until: expiresAt,
          })
          .ilike("code", newOrder.accountCode);
      } catch (dbErr) {
        console.warn("Không thể cập nhật trạng thái account trên DB:", dbErr);
      }
    }

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
 * Cập nhật, gia hạn hoặc đổi trạng thái đơn hàng (đồng bộ Supabase)
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

      // Đồng bộ thời gian hết hạn sang Supabase
      if (currentOrder.accountCode) {
        try {
          await supabase
            .from("accounts")
            .update({
              status: "RENTED",
              rented_until: newExpiry,
            })
            .ilike("code", currentOrder.accountCode);
        } catch (dbErr) {
          console.warn("Lỗi đồng bộ gia hạn Supabase:", dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Đã gia hạn đơn hàng ${id} thêm ${extraHours} giờ!`,
        data: updatedOrder,
      });
    }

    // Action 2: Cập nhật thông thường (ví dụ: Chốt hoàn thành đơn)
    const updatedOrder: OrderItem = {
      ...currentOrder,
      ...body,
      id: currentOrder.id, // giữ nguyên ID gốc
      createdAt: currentOrder.createdAt, // giữ nguyên ngày tạo gốc
    };

    currentOrders[orderIndex] = updatedOrder;
    writeOrdersToFile(currentOrders);

    // Nếu đơn hàng chuyển sang COMPLETED => Trả acc về AVAILABLE trong Supabase
    if (body.status === "COMPLETED" && currentOrder.accountCode) {
      try {
        await supabase
          .from("accounts")
          .update({
            status: "AVAILABLE",
            rented_until: null,
          })
          .ilike("code", currentOrder.accountCode);
      } catch (dbErr) {
        console.warn("Lỗi đồng bộ hoàn thành Supabase:", dbErr);
      }
    } else if (body.status === "RENTING" && currentOrder.accountCode) {
      // Nếu đơn chuyển sang RENTING => Đặt RENTED trong Supabase
      try {
        await supabase
          .from("accounts")
          .update({
            status: "RENTED",
            rented_until: updatedOrder.expiresAt || null,
          })
          .ilike("code", currentOrder.accountCode);
      } catch (dbErr) {
        console.warn("Lỗi đồng bộ mở lại Supabase:", dbErr);
      }
    }

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
