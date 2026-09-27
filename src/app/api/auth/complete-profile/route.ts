import { NextRequest, NextResponse } from "next/server";
import {
  verifyMemberSessionToken,
  getMemberById,
  updateMember,
} from "@/utils/members-service";

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("member_session")?.value;
    const headerToken = req.headers.get("x-member-token");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Vui lòng đăng nhập để thực hiện thao tác này." },
        { status: 401 }
      );
    }

    const session = verifyMemberSessionToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
        { status: 401 }
      );
    }

    const member = await getMemberById(session.id);
    if (!member) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy thông tin tài khoản." },
        { status: 404 }
      );
    }

    if (member.status === "LOCKED") {
      return NextResponse.json(
        { success: false, message: "Tài khoản của bạn đã bị khóa." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const full_name = (body.full_name || "").trim();
    const zalo = (body.zalo || "").trim();

    if (!full_name || full_name.length < 2) {
      return NextResponse.json(
        { success: false, message: "Họ và tên phải có ít nhất 2 ký tự." },
        { status: 400 }
      );
    }

    if (full_name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Họ và tên không được vượt quá 100 ký tự." },
        { status: 400 }
      );
    }

    if (!zalo || zalo.length < 6) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp số điện thoại hoặc Zalo hợp lệ (tối thiểu 6 số/ký tự)." },
        { status: 400 }
      );
    }

    const result = await updateMember(member.id, { full_name, zalo });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Không thể cập nhật hồ sơ." },
        { status: 500 }
      );
    }

    const updatedFullMember = await getMemberById(member.id);
    const response = NextResponse.json({
      success: true,
      message: "Hoàn tất thông tin tài khoản thành công!",
      user: result.member,
    });

    if (updatedFullMember) {
      const { generateMemberSessionToken } = await import("@/utils/members-service");
      const { token, maxAgeSeconds } = generateMemberSessionToken(updatedFullMember);
      response.cookies.set({
        name: "member_session",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: maxAgeSeconds,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Lỗi hoàn tất profile:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi máy chủ, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
