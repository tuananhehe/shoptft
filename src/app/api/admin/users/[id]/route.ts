import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import {
  getMembers,
  saveMembers,
  updateMember,
  resetMemberPassword,
  getMemberById,
  toSafeMember,
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

/**
 * GET /api/admin/users/[id]
 * Lấy chi tiết thông tin khách hàng và toàn bộ lịch sử thuê liên kết
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const member = await getMemberById(id);

    if (!member) {
      return NextResponse.json({ success: false, message: "Không tìm thấy khách hàng." }, { status: 404 });
    }

    // Load linked rentals from orders.json
    let orders: OrderItem[] = [];
    try {
      const ordersPath = path.join(process.cwd(), "src", "data", "orders.json");
      if (fs.existsSync(ordersPath)) {
        orders = JSON.parse(fs.readFileSync(ordersPath, "utf8"));
      }
    } catch {}

    const cleanZalo = member.zalo ? member.zalo.replace(/\D/g, "") : "";
    const linkedRentals = orders.filter((o) => {
      if (o.memberId && o.memberId === member.id) return true;
      if (cleanZalo && o.phoneZalo && o.phoneZalo.replace(/\D/g, "") === cleanZalo) return true;
      return false;
    });

    // Sort newest first
    linkedRentals.sort(
      (a, b) => new Date(b.startedAt || b.createdAt).getTime() - new Date(a.startedAt || a.createdAt).getTime()
    );

    const validRentals = linkedRentals.filter((r) => r.status !== "CANCELLED");
    const rentalCount = validRentals.length;
    const totalRentalSpent = validRentals.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const lastRentalDate = validRentals[0]?.startedAt || validRentals[0]?.createdAt || null;

    return NextResponse.json({
      success: true,
      data: {
        member: toSafeMember(member, true),
        rentals: linkedRentals,
        stats: {
          rentalCount,
          totalRentalSpent,
          lastRentalDate,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy chi tiết khách hàng." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Cập nhật thông tin khách hàng, đổi mật khẩu, hoặc đổi trạng thái khóa/mở
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Reset mật khẩu nếu có newPassword
    if (body.newPassword) {
      const resetRes = await resetMemberPassword(id, body.newPassword);
      if (!resetRes.success) {
        return NextResponse.json(
          { success: false, message: resetRes.error || "Đổi mật khẩu thất bại." },
          { status: 400 }
        );
      }
    }

    // 2. Cập nhật thông tin khác
    const updatePayload: any = {};
    if (body.full_name !== undefined) updatePayload.full_name = body.full_name;
    if (body.zalo !== undefined) updatePayload.zalo = body.zalo;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.notes !== undefined) updatePayload.notes = body.notes;

    if (Object.keys(updatePayload).length > 0) {
      const updateRes = await updateMember(id, updatePayload);
      if (!updateRes.success) {
        return NextResponse.json(
          { success: false, message: updateRes.error || "Cập nhật thông tin thất bại." },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Cập nhật thông tin khách hàng thành công!",
        data: updateRes.member,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin khách hàng thành công!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi cập nhật khách hàng." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Xóa tài khoản khách hàng (khuyến nghị dùng khóa thay vì xóa)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const members = await getMembers();
    const filtered = members.filter((m) => m.id !== id);

    if (filtered.length === members.length) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khách hàng để xóa." },
        { status: 404 }
      );
    }

    await saveMembers(filtered);
    return NextResponse.json({
      success: true,
      message: "Đã xóa khách hàng thành công!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi xóa khách hàng." },
      { status: 500 }
    );
  }
}
