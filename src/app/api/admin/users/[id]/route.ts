import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import {
  getMembers,
  saveMembers,
  updateMember,
  resetMemberPassword,
} from "@/utils/members-service";

function checkAdminAuth(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(sessionCookie || headerToken);
  return !!session;
}

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
        message: "Cập nhật thành viên thành công!",
        data: updateRes.member,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thành viên thành công!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi cập nhật thành viên." },
      { status: 500 }
    );
  }
}

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
        { success: false, message: "Không tìm thấy thành viên để xóa." },
        { status: 404 }
      );
    }

    await saveMembers(filtered);
    return NextResponse.json({
      success: true,
      message: "Đã xóa thành viên thành công!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi xóa thành viên." },
      { status: 500 }
    );
  }
}
