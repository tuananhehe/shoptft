import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/utils/supabase/client";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { determinePackageFromAccount, OrderItem } from "@/utils/orders-service";

const ORDERS_FILE_PATH = path.join(process.cwd(), "src", "data", "orders.json");

function syncOrdersOnAccountChange(updatedAccounts: any[]) {
  try {
    if (!fs.existsSync(ORDERS_FILE_PATH)) return;
    const fileData = fs.readFileSync(ORDERS_FILE_PATH, "utf8");
    let orders: OrderItem[] = JSON.parse(fileData);
    if (!Array.isArray(orders)) return;

    let modified = false;

    for (const acc of updatedAccounts) {
      if (!acc || !acc.code) continue;
      const codeKey = acc.code.toLowerCase().trim();

      const existingRentingIndex = orders.findIndex(
        (o) => o.accountCode.toLowerCase().trim() === codeKey && o.status === "RENTING"
      );

      if (acc.status === "RENTED") {
        const pkg = determinePackageFromAccount(
          acc,
          existingRentingIndex !== -1 ? orders[existingRentingIndex] : undefined
        );
        if (existingRentingIndex !== -1) {
          orders[existingRentingIndex] = {
            ...orders[existingRentingIndex],
            package: pkg.packageName,
            durationHours: pkg.durationHours,
            amount: pkg.amount,
            expiresAt: acc.rented_until || orders[existingRentingIndex].expiresAt,
            accountTitle: acc.title || orders[existingRentingIndex].accountTitle,
            accountCode: acc.code,
          };
          modified = true;
        } else {
          const codeNum = acc.code.replace(/[^0-9]/g, "") || Math.floor(1000 + Math.random() * 9000);
          const newOrder: OrderItem = {
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
            notes: "Đơn tự động đồng bộ khi cập nhật trạng thái Cho Thuê.",
          };
          orders = [newOrder, ...orders];
          modified = true;
        }
      } else if (acc.status === "AVAILABLE") {
        if (existingRentingIndex !== -1) {
          orders[existingRentingIndex] = {
            ...orders[existingRentingIndex],
            status: "COMPLETED",
            notes: `${orders[existingRentingIndex].notes || ""}\n[Tài khoản đã hoàn tất & thu hồi về kho]`.trim(),
          };
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Lỗi sync orders khi sửa account:", err);
  }
}

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
 * Helper tự động lọc bỏ các cột chưa tồn tại trong Supabase schema và thử lại truy vấn
 */
async function executeSupabaseWithSchemaFallback<T>(
  action: (payload: Record<string, any>) => Promise<{ data: T | null; error: any }>,
  initialPayload: Record<string, any>
): Promise<{ data: T | null; error: any }> {
  let currentPayload = { ...initialPayload };
  let attempts = 0;

  while (attempts < 10) {
    attempts++;
    const result = await action(currentPayload);
    if (!result.error) {
      return result;
    }

    const errorMsg = result.error.message || "";
    // Match 1: Could not find the 'xyz' column of 'accounts' in the schema cache
    const match1 = errorMsg.match(/Could not find the '([^']+)' column of/i);
    // Match 2: column "xyz" of relation "accounts" does not exist
    const match2 = errorMsg.match(/column "([^"]+)" of relation/i);
    // Match 3: column xyz of relation accounts does not exist
    const match3 = errorMsg.match(/column ([a-zA-Z0-9_]+) of relation/i);

    const missingCol = match1?.[1] || match2?.[1] || match3?.[1];

    if (missingCol && Object.prototype.hasOwnProperty.call(currentPayload, missingCol)) {
      console.warn(
        `[Supabase Auto-Fallback] Cột '${missingCol}' chưa có trong bảng Supabase. Đang tự động loại bỏ và thử lại...`
      );
      delete currentPayload[missingCol];
      continue;
    }

    return result;
  }

  return { data: null, error: { message: "Đã vượt quá số lần thử lại kết nối Supabase." } };
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

    const accountPrice = Number(body.price) || Number(body.period_price) || 850000;
    const computedHourly = Number(body.hourly_price) > 0
      ? Number(body.hourly_price)
      : body.type === "VIP"
      ? Math.round((((accountPrice * 0.03) + 20000) / 2) / 1000) * 1000
      : 0;

    // Chuẩn bị payload khớp 100% với schema DB
    const newAccountData: Record<string, any> = {
      code: body.code.trim(),
      type: body.type,
      title: body.title || `${body.rank || "VIP"} - ${body.code}`,
      rank: body.rank || (body.type === "VIP" ? "THÁCH ĐẤU" : "UNRANKED"),
      price: accountPrice,
      hourly_price: computedHourly,
      daily_price: Number(body.daily_price) || Math.round((((accountPrice * 0.12) + 20000) / 2) / 1000) * 1000,
      weekly_price: Number(body.weekly_price) || 0,
      period_price: Number(body.period_price) || accountPrice,
      period_unit: body.period_unit || (body.type === "CLONE" ? " / ∞" : " / Giờ"),
      price_display_type: body.price_display_type || (body.type === "CLONE" ? "LONG_TERM" : "HOURLY"),
      custom_price: body.custom_price ? Number(body.custom_price) : null,
      custom_price_unit: body.custom_price_unit || null,
      champions: Array.isArray(body.champions) ? body.champions.filter(Boolean) : [],
      arenas: Array.isArray(body.arenas) ? body.arenas.filter(Boolean) : [],
      features: Array.isArray(body.features) ? body.features.filter(Boolean) : [],
      image_url:
        body.image_url ||
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
      status: body.status === "RENTED" ? "RENTED" : "AVAILABLE",
      rented_until: body.rented_until || null,
      description: body.description || "Tài khoản chính chủ chất lượng cao.",
    };

    // Insert vào Supabase kèm cơ chế tự động thử lại nếu DB chưa có cột mới
    const { data, error } = await executeSupabaseWithSchemaFallback(async (payload) => {
      return await supabase.from("accounts").insert([payload]).select().single();
    }, newAccountData);

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
      if (body.daily_price !== undefined) batchPayload.daily_price = Number(body.daily_price);
      if (body.price !== undefined) batchPayload.price = Number(body.price);
      if (body.weekly_price !== undefined) batchPayload.weekly_price = Number(body.weekly_price);
      if (body.period_price !== undefined) batchPayload.period_price = Number(body.period_price);
      if (body.period_unit !== undefined) batchPayload.period_unit = body.period_unit;
      if (body.price_display_type !== undefined) batchPayload.price_display_type = body.price_display_type;
      if (body.custom_price !== undefined) batchPayload.custom_price = body.custom_price ? Number(body.custom_price) : null;
      if (body.custom_price_unit !== undefined) batchPayload.custom_price_unit = body.custom_price_unit;

      const { error } = await executeSupabaseWithSchemaFallback(async (payload) => {
        const res = await supabase.from("accounts").update(payload).in("id", body.ids);
        return { data: null, error: res.error };
      }, batchPayload);

      if (error) {
        console.error("Lỗi cập nhật hàng loạt Supabase:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      // Tự động đồng bộ sang orders.json
      try {
        const { data: updatedList } = await supabase.from("accounts").select("*").in("id", body.ids);
        if (Array.isArray(updatedList) && updatedList.length > 0) {
          syncOrdersOnAccountChange(updatedList);
        }
      } catch (syncErr) {
        console.warn("Lỗi sync orders batch:", syncErr);
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
    if (body.price !== undefined) {
      updatePayload.price = Number(body.price);
      if (body.type === "VIP" && (!body.hourly_price || Number(body.hourly_price) === 0)) {
        updatePayload.hourly_price = Math.round((((Number(body.price) * 0.03) + 20000) / 2) / 1000) * 1000;
      }
    }
    if (body.hourly_price !== undefined && Number(body.hourly_price) > 0) {
      updatePayload.hourly_price = Number(body.hourly_price);
    }
    if (body.daily_price !== undefined) updatePayload.daily_price = Number(body.daily_price);
    if (body.weekly_price !== undefined) updatePayload.weekly_price = Number(body.weekly_price);
    if (body.period_price !== undefined) updatePayload.period_price = Number(body.period_price);
    if (body.period_unit !== undefined) updatePayload.period_unit = body.period_unit;
    if (body.price_display_type !== undefined) updatePayload.price_display_type = body.price_display_type;
    if (body.custom_price !== undefined) updatePayload.custom_price = body.custom_price ? Number(body.custom_price) : null;
    if (body.custom_price_unit !== undefined) updatePayload.custom_price_unit = body.custom_price_unit;
    if (body.champions !== undefined) updatePayload.champions = Array.isArray(body.champions) ? body.champions.filter(Boolean) : [];
    if (body.arenas !== undefined) updatePayload.arenas = Array.isArray(body.arenas) ? body.arenas.filter(Boolean) : [];
    if (body.features !== undefined) updatePayload.features = Array.isArray(body.features) ? body.features.filter(Boolean) : [];
    if (body.image_url !== undefined) updatePayload.image_url = body.image_url;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.rented_until !== undefined) updatePayload.rented_until = body.rented_until;
    if (body.description !== undefined) updatePayload.description = body.description;

    // Update vào Supabase kèm cơ chế tự động thử lại nếu DB chưa có cột mới
    const { data, error } = await executeSupabaseWithSchemaFallback(async (payload) => {
      let query = supabase.from("accounts").update(payload);
      if (body.id) {
        query = query.eq("id", body.id);
      } else {
        query = query.eq("code", body.code);
      }
      return await query.select().single();
    }, updatePayload);

    if (error) {
      console.error("Lỗi khi cập nhật tài khoản trên Supabase:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Tự động đồng bộ ngay vào orders.json
    if (data) {
      try {
        syncOrdersOnAccountChange([data]);
      } catch (syncErr) {
        console.warn("Lỗi sync orders single:", syncErr);
      }
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
