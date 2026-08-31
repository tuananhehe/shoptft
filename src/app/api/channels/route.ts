import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { CommunityChannelItem } from "@/utils/channels-service";

const CHANNELS_FILE_PATH = path.join(process.cwd(), "src", "data", "channels.json");

const DEFAULT_CHANNELS: CommunityChannelItem[] = [
  {
    id: "tiktok",
    platform: "tiktok",
    title: "Kênh TikTok ShopTFT Mobile",
    subtitle: "Xem highlight & test acc VIP",
    badge: "45K+ Followers",
    link: "https://tiktok.com/@shoptftmobile",
    buttonText: "Xem TikTok ➔",
    isActive: true,
    order: 1,
  },
  {
    id: "zalo",
    platform: "zalo",
    title: "Nhóm Zalo Trao Đổi Acc",
    subtitle: "Giao lưu, mua bán & hỗ trợ 24/7",
    badge: "1,000+ Thành viên",
    link: "https://zalo.me/g/shoptftmobile",
    buttonText: "Tham Gia Zalo ➔",
    isActive: true,
    order: 2,
  },
  {
    id: "discord",
    platform: "discord",
    title: "Cộng Đồng Discord Game",
    subtitle: "Voice chat, tìm đồng đội leo rank",
    badge: "850+ Online",
    link: "https://discord.gg/shoptftmobile",
    buttonText: "Vào Discord ➔",
    isActive: true,
    order: 3,
  },
  {
    id: "fb-group",
    platform: "facebook",
    title: "Hội Cờ Thủ ĐTCL Việt Nam",
    subtitle: "Chia sẻ giáo án meta, chia sẻ kinh nghiệm",
    badge: "12K+ Cờ thủ",
    link: "https://facebook.com/groups/shoptftmobile",
    buttonText: "Gia Nhập Nhóm ➔",
    isActive: true,
    order: 4,
  },
];

let memoryChannels: CommunityChannelItem[] = [...DEFAULT_CHANNELS];

// Helper đọc channels từ file
function readChannelsFromFile(): CommunityChannelItem[] {
  try {
    if (fs.existsSync(CHANNELS_FILE_PATH)) {
      const content = fs.readFileSync(CHANNELS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryChannels = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Lỗi đọc channels.json:", err);
  }
  return memoryChannels;
}

// Helper ghi channels vào file
function writeChannelsToFile(channels: CommunityChannelItem[]): void {
  memoryChannels = channels;
  try {
    const dir = path.dirname(CHANNELS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CHANNELS_FILE_PATH, JSON.stringify(channels, null, 2), "utf-8");
  } catch (err) {
    console.error("Lỗi ghi channels.json:", err);
  }
}

// Khởi tạo nạp dữ liệu ban đầu
readChannelsFromFile();

function isAuthorizedAdmin(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerVal =
    req.headers.get("x-admin-token") ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const session = verifyAdminSessionToken(cookieVal || headerVal);
  return !!session;
}

/**
 * GET /api/channels
 * Lấy danh sách kênh truyền thông
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get("active") === "true";

    const channels = readChannelsFromFile();
    const sorted = [...channels].sort((a, b) => (a.order || 0) - (b.order || 0));
    const result = onlyActive ? sorted.filter((c) => c.isActive !== false) : sorted;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, data: memoryChannels },
      { status: 500 }
    );
  }
}

/**
 * POST /api/channels
 * Thêm một kênh truyền thông mới (Admin)
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

    if (!body.title || !body.link) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề kênh và Đường dẫn liên kết là bắt buộc!" },
        { status: 400 }
      );
    }

    const currentChannels = readChannelsFromFile();
    const newId = body.id || `channel-${Date.now()}`;

    const newChannel: CommunityChannelItem = {
      id: newId,
      platform: body.platform || "other",
      title: body.title.trim(),
      subtitle: body.subtitle || "",
      badge: body.badge || "Mới",
      link: body.link.trim(),
      buttonText: body.buttonText || "Tham Gia ➔",
      isActive: body.isActive !== false,
      order: body.order || currentChannels.length + 1,
    };

    const updatedList = [...currentChannels, newChannel];
    writeChannelsToFile(updatedList);

    return NextResponse.json(
      {
        success: true,
        message: "Đã thêm kênh truyền thông mới!",
        data: newChannel,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi thêm kênh mới" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/channels
 * Cập nhật kênh truyền thông hoặc Khôi phục mặc định (Admin)
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

    // Trường hợp Reset to default
    if (searchParams.get("action") === "reset") {
      writeChannelsToFile(DEFAULT_CHANNELS);
      return NextResponse.json({
        success: true,
        message: "Đã khôi phục danh sách kênh mặc định!",
        data: DEFAULT_CHANNELS,
      });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID kênh cần cập nhật!" },
        { status: 400 }
      );
    }

    const currentChannels = readChannelsFromFile();
    const index = currentChannels.findIndex((c) => c.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy kênh cần sửa!" },
        { status: 404 }
      );
    }

    const existing = currentChannels[index];
    const updatedChannel: CommunityChannelItem = {
      ...existing,
      platform: body.platform !== undefined ? body.platform : existing.platform,
      title: body.title !== undefined ? body.title.trim() : existing.title,
      subtitle: body.subtitle !== undefined ? body.subtitle.trim() : existing.subtitle,
      badge: body.badge !== undefined ? body.badge.trim() : existing.badge,
      link: body.link !== undefined ? body.link.trim() : existing.link,
      buttonText: body.buttonText !== undefined ? body.buttonText.trim() : existing.buttonText,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      order: body.order !== undefined ? Number(body.order) : existing.order,
    };

    currentChannels[index] = updatedChannel;
    writeChannelsToFile(currentChannels);

    return NextResponse.json({
      success: true,
      message: "Cập nhật kênh thành công!",
      data: updatedChannel,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi cập nhật kênh" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/channels?id=...
 * Xóa một kênh truyền thông (Admin)
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
        { success: false, error: "Vui lòng cung cấp ID kênh cần xóa!" },
        { status: 400 }
      );
    }

    const currentChannels = readChannelsFromFile();
    const filtered = currentChannels.filter((c) => c.id !== id);

    if (filtered.length === currentChannels.length) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy kênh cần xóa!" },
        { status: 404 }
      );
    }

    writeChannelsToFile(filtered);

    return NextResponse.json({
      success: true,
      message: "Đã xóa kênh thành công!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi xóa kênh" },
      { status: 500 }
    );
  }
}
