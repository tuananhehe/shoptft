import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal = req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

/**
 * GET /api/accounts
 * Lấy danh sách toàn bộ tài khoản từ bảng accounts trên Supabase
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Lỗi truy vấn Supabase accounts:", error.message);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          data: [],
        },
        { status: 200 } // Trả về 200 kèm data rỗng để frontend không crash nếu chưa tạo bảng
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    console.error("Lỗi Server GET /api/accounts:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ nội bộ", data: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounts
 * Thêm một tài khoản mới vào bảng accounts trên Supabase
 */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên để thêm tài khoản (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    // Validate các trường bắt buộc
    if (!body.code) {
      return NextResponse.json(
        { success: false, error: "Mã số tài khoản (code) là bắt buộc!" },
        { status: 400 }
      );
    }

    if (!body.type || !["VIP", "CLONE"].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: "Loại tài khoản (type) phải là VIP hoặc CLONE!" },
        { status: 400 }
      );
    }

    // Chuẩn bị payload khớp 100% với schema DB
    const newAccountData = {
      code: body.code.trim(),
      type: body.type,
      title: body.title || `${body.rank || "VIP"} - ${body.code}`,
      rank: body.rank || (body.type === "VIP" ? "THÁCH ĐẤU" : "UNRANKED"),
      price: Number(body.price) || Number(body.period_price) || 0,
      hourly_price: Number(body.hourly_price) || (body.type === "VIP" ? 15000 : 0),
      weekly_price: 0,
      period_price: Number(body.period_price) || Number(body.price) || 0,
      champions: Array.isArray(body.champions) ? body.champions : [],
      arenas: Array.isArray(body.arenas) ? body.arenas : [],
      features: Array.isArray(body.features) ? body.features : [],
      image_url:
        body.image_url ||
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
      status: body.status === "RENTED" ? "RENTED" : "AVAILABLE",
      rented_until: body.rented_until || null,
      description: body.description || "Tài khoản chính chủ chất lượng cao.",
    };

    // Insert vào Supabase
    const { data, error } = await supabase
      .from("accounts")
      .insert([newAccountData])
      .select()
      .single();

    if (error) {
      console.error("Lỗi khi thêm tài khoản vào Supabase:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thêm tài khoản thành công!",
        data,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Lỗi Server POST /api/accounts:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ khi thêm tài khoản" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/accounts
 * Cập nhật thông tin hoặc trạng thái tài khoản trên Supabase (Hỗ trợ đơn lẻ và hàng loạt)
 */
export async function PUT(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên để cập nhật tài khoản (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    // 1. XỬ LÝ CẬP NHẬT HÀNG LOẠT (BATCH UPDATE NẾU CÓ MẢNG IDS)
    if (Array.isArray(body.ids) && body.ids.length > 0) {
      const batchPayload: any = {};
      if (body.status !== undefined) batchPayload.status = body.status;
      if (body.rented_until !== undefined) batchPayload.rented_until = body.rented_until;
      if (body.type !== undefined) batchPayload.type = body.type;
      if (body.rank !== undefined) batchPayload.rank = body.rank;
      if (body.hourly_price !== undefined) batchPayload.hourly_price = Number(body.hourly_price);
      if (body.price !== undefined) batchPayload.price = Number(body.price);
      if (body.weekly_price !== undefined) batchPayload.weekly_price = Number(body.weekly_price);
      if (body.period_price !== undefined) batchPayload.period_price = Number(body.period_price);

      const { error } = await supabase
        .from("accounts")
        .update(batchPayload)
        .in("id", body.ids);

      if (error) {
        console.error("Lỗi cập nhật hàng loạt Supabase:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Đã cập nhật hàng loạt ${body.ids.length} tài khoản thành công!`,
      });
    }

    // 2. XỬ LÝ CẬP NHẬT ĐƠN LẺ
    if (!body.id && !body.code) {
      return NextResponse.json(
        { success: false, error: "Cần cung cấp id hoặc code để cập nhật!" },
        { status: 400 }
      );
    }

    const updatePayload: any = {};
    if (body.code !== undefined) updatePayload.code = body.code.trim();
    if (body.type !== undefined) updatePayload.type = body.type;
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.rank !== undefined) updatePayload.rank = body.rank;
    if (body.price !== undefined) updatePayload.price = Number(body.price);
    if (body.hourly_price !== undefined) updatePayload.hourly_price = Number(body.hourly_price);
    if (body.weekly_price !== undefined) updatePayload.weekly_price = Number(body.weekly_price);
    if (body.period_price !== undefined) updatePayload.period_price = Number(body.period_price);
    if (body.champions !== undefined) updatePayload.champions = body.champions;
    if (body.arenas !== undefined) updatePayload.arenas = body.arenas;
    if (body.features !== undefined) updatePayload.features = body.features;
    if (body.image_url !== undefined) updatePayload.image_url = body.image_url;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.rented_until !== undefined) updatePayload.rented_until = body.rented_until;
    if (body.description !== undefined) updatePayload.description = body.description;

    let query = supabase.from("accounts").update(updatePayload);

    if (body.id) {
      query = query.eq("id", body.id);
    } else {
      query = query.eq("code", body.code);
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error("Lỗi khi cập nhật tài khoản trên Supabase:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản thành công!",
      data,
    });
  } catch (err: any) {
    console.error("Lỗi Server PUT /api/accounts:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ khi cập nhật" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounts?id=... hoặc /api/accounts?ids=id1,id2,id3
 * Xóa một hoặc nhiều tài khoản khỏi bảng accounts trên Supabase
 */
export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu quyền Quản Trị Viên để xóa tài khoản (Unauthorized)!" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    const id = searchParams.get("id");
    const code = searchParams.get("code");

    // Xóa hàng loạt theo danh sách IDs
    if (idsParam) {
      const ids = idsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (ids.length > 0) {
        const { error } = await supabase.from("accounts").delete().in("id", ids);

        if (error) {
          console.error("Lỗi khi xóa hàng loạt tài khoản khỏi Supabase:", error);
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: `Đã xóa hàng loạt ${ids.length} tài khoản thành công!`,
        });
      }
    }

    // Xóa đơn lẻ
    if (!id && !code) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp id hoặc code để xóa!" },
        { status: 400 }
      );
    }

    let query = supabase.from("accounts").delete();
    if (id) {
      query = query.eq("id", id);
    } else if (code) {
      query = query.eq("code", code);
    }

    const { error } = await query;

    if (error) {
      console.error("Lỗi khi xóa tài khoản khỏi Supabase:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa tài khoản thành công!",
    });
  } catch (err: any) {
    console.error("Lỗi Server DELETE /api/accounts:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ khi xóa" },
      { status: 500 }
    );
  }
}
