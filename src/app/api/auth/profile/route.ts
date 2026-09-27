import { NextRequest, NextResponse } from "next/server";
import {
  verifyMemberSessionToken,
  getMemberById,
  updateMember,
  toSafeMember,
} from "@/utils/members-service";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("member_session")?.value;
    const headerToken = req.headers.get("x-member-token");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập." }, { status: 401 });
    }

    const session = verifyMemberSessionToken(token);
    if (!session) {
      return NextResponse.json({ success: false, message: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
    }

    const member = await getMemberById(session.id);
    if (!member) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: toSafeMember(member) });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Lỗi máy chủ." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("member_session")?.value;
    const headerToken = req.headers.get("x-member-token");
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ success: false, message: "Chưa đăng nhập." }, { status: 401 });
    }

    const session = verifyMemberSessionToken(token);
    if (!session) {
      return NextResponse.json({ success: false, message: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
    }

    const member = await getMemberById(session.id);
    if (!member) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng." }, { status: 404 });
    }

    if (member.status === "LOCKED") {
      return NextResponse.json({ success: false, message: "Tài khoản của bạn đã bị khóa." }, { status: 403 });
    }

    const body = await req.json();
    const full_name = (body.full_name || "").trim();
    const zalo = (body.zalo || "").trim();

    if (!full_name || full_name.length < 2 || full_name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Họ và tên phải từ 2 đến 100 ký tự." },
        { status: 400 }
      );
    }

    if (!zalo || zalo.length < 3 || zalo.length > 100) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp số điện thoại hoặc Zalo hợp lệ." },
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
      message: "Đã cập nhật thông tin.",
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
    return NextResponse.json({ success: false, message: "Lỗi máy chủ." }, { status: 500 });
  }
}
