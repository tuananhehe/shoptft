import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  PaymentLinkData,
  PAYMENT_LINK_DURATION_MS,
  generatePaymentLinkId,
  encodePaymentToken,
  decodePaymentToken,
} from "@/utils/payment-links-service";
import { buildVietQRUrl, DEFAULT_BANK_CONFIG } from "@/utils/vietqr-helper";
import { supabase } from "@/utils/supabase/client";

const PRIMARY_PAYMENT_LINKS_FILE = path.join(process.cwd(), "src", "data", "payment-links.json");
const TMP_PAYMENT_LINKS_FILE = path.join("/tmp", "payment-links.json");

let memoryPaymentLinks: PaymentLinkData[] = [];

function readPaymentLinks(): PaymentLinkData[] {
  // 1. Thử đọc từ src/data
  try {
    if (fs.existsSync(PRIMARY_PAYMENT_LINKS_FILE)) {
      const content = fs.readFileSync(PRIMARY_PAYMENT_LINKS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryPaymentLinks = parsed;
        return memoryPaymentLinks;
      }
    }
  } catch {
    // Bỏ qua lỗi read-only
  }

  // 2. Thử đọc từ /tmp (Vercel serverless writable storage)
  try {
    if (fs.existsSync(TMP_PAYMENT_LINKS_FILE)) {
      const content = fs.readFileSync(TMP_PAYMENT_LINKS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryPaymentLinks = parsed;
        return memoryPaymentLinks;
      }
    }
  } catch {
    // Bỏ qua
  }

  return memoryPaymentLinks;
}

function writePaymentLinks(links: PaymentLinkData[]) {
  memoryPaymentLinks = links;

  // Thử ghi vào src/data
  let primarySuccess = false;
  try {
    const dir = path.dirname(PRIMARY_PAYMENT_LINKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_PAYMENT_LINKS_FILE, JSON.stringify(links, null, 2), "utf-8");
    primarySuccess = true;
  } catch {
    // Môi trường read-only như Vercel
  }

  // Nếu không ghi được vào src/data, ghi vào /tmp
  if (!primarySuccess) {
    try {
      fs.writeFileSync(TMP_PAYMENT_LINKS_FILE, JSON.stringify(links, null, 2), "utf-8");
    } catch {
      // Bỏ qua
    }
  }
}

// Nạp sẵn cache
readPaymentLinks();

/**
 * GET /api/pay?id=PAY-XXXXXX&d=...
 * Lấy chi tiết link thanh toán và tự động tính toán thời hạn 5 phút
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const token = searchParams.get("d");

    // 1. Ưu tiên giải mã token tự thân 'd' nếu có trong URL (Hoạt động 100% trên Vercel/Web Thật)
    if (token) {
      const decoded = decodePaymentToken(token);
      if (decoded) {
        const now = Date.now();
        const isExpired = now > decoded.expiresAt;
        const remainingSeconds = isExpired ? 0 : Math.max(0, Math.floor((decoded.expiresAt - now) / 1000));

        // Lưu vào memory cache
        const links = readPaymentLinks();
        if (!links.some((l) => l.id.toUpperCase() === decoded.id.toUpperCase())) {
          writePaymentLinks([decoded, ...links.slice(0, 499)]);
        }

        return NextResponse.json({
          success: true,
          data: decoded,
          isExpired,
          remainingSeconds,
          token,
        });
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã link thanh toán (id)" },
        { status: 400 }
      );
    }

    // 2. Tra cứu trong bộ nhớ và file JSON
    const links = readPaymentLinks();
    let item = links.find((l) => l.id.toUpperCase() === id.trim().toUpperCase());

    // 3. Fallback: Nếu không thấy, tra cứu mã tài khoản trong Supabase (phòng trường hợp khách vào trực tiếp qua mã acc)
    if (!item) {
      const cleanCode = id.trim().replace(/^PAY-/i, "").replace(/^MS-?/i, "").trim();
      const { data: dbAccs } = await supabase
        .from("accounts")
        .select("*")
        .or(`code.ilike.%${cleanCode}%,id.eq.${id}`)
        .limit(1);

      if (dbAccs && dbAccs.length > 0) {
        const acc = dbAccs[0];
        const now = Date.now();
        const amount = Number(acc.daily_price) || Number(acc.price) || 35000;
        const accCode = acc.code || `MS: ${cleanCode}`;
        const transferContent = `THUE ACC ${accCode.replace(/^MS:\s*/i, "")}`;

        const fallbackItem: PaymentLinkData = {
          id: id.toUpperCase().startsWith("PAY-") ? id.toUpperCase() : `PAY-${id.toUpperCase()}`,
          accountCode: accCode,
          accountTitle: acc.title || accCode,
          accountCategory: acc.type === "CLONE" ? "CLONE" : "VIP",
          thumbnail: acc.image_url || "",
          packageName: "Gói Thuê 24 Giờ",
          durationHours: 24,
          amount,
          bankId: DEFAULT_BANK_CONFIG.bankId,
          bankName: DEFAULT_BANK_CONFIG.bankName,
          accountNumber: DEFAULT_BANK_CONFIG.accountNumber,
          accountHolder: DEFAULT_BANK_CONFIG.accountHolder,
          qrTemplate: DEFAULT_BANK_CONFIG.qrTemplate,
          transferContent,
          qrUrl: buildVietQRUrl({
            bankId: DEFAULT_BANK_CONFIG.bankId,
            accountNumber: DEFAULT_BANK_CONFIG.accountNumber,
            accountHolder: DEFAULT_BANK_CONFIG.accountHolder,
            amount,
            description: transferContent,
            template: DEFAULT_BANK_CONFIG.qrTemplate,
          }),
          createdAt: now,
          expiresAt: now + PAYMENT_LINK_DURATION_MS,
          status: "ACTIVE",
        };

        item = fallbackItem;
        writePaymentLinks([fallbackItem, ...links.slice(0, 499)]);
      }
    }

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Link thanh toán không tồn tại hoặc đã bị xóa" },
        { status: 404 }
      );
    }

    const now = Date.now();
    let isExpired = false;

    if (item.status === "ACTIVE" && now > item.expiresAt) {
      item.status = "EXPIRED";
      isExpired = true;
      writePaymentLinks(links);
    } else if (item.status === "EXPIRED") {
      isExpired = true;
    }

    const remainingSeconds = isExpired
      ? 0
      : Math.max(0, Math.floor((item.expiresAt - now) / 1000));

    const tokenGenerated = encodePaymentToken(item);

    return NextResponse.json({
      success: true,
      data: item,
      isExpired,
      remainingSeconds,
      token: tokenGenerated,
    });
  } catch (err: any) {
    console.error("Lỗi GET /api/pay:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pay
 * Tạo mới link thanh toán tạm thời có hạn đúng 5 phút
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      accountCode,
      accountTitle,
      accountCategory,
      thumbnail,
      packageName,
      durationHours,
      amount,
      customerName,
      customerPhone,
      bankId,
      bankName,
      accountNumber,
      accountHolder,
      qrTemplate,
      transferContent,
    } = body;

    if (!accountCode || !amount) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin tài khoản hoặc số tiền" },
        { status: 400 }
      );
    }

    const links = readPaymentLinks();
    const now = Date.now();
    const expiresAt = now + PAYMENT_LINK_DURATION_MS; // Đúng 5 phút

    const newId = generatePaymentLinkId();

    const finalQrUrl = buildVietQRUrl({
      bankId: bankId || "ACB",
      accountNumber: accountNumber || "23456789",
      accountHolder: accountHolder || "TUAN THAI BINH",
      amount: Number(amount) || 0,
      description: transferContent || `THUE ACC ${accountCode}`,
      template: qrTemplate || "compact2",
    });

    const newLink: PaymentLinkData = {
      id: newId,
      accountCode: String(accountCode).trim(),
      accountTitle: String(accountTitle || accountCode).trim(),
      accountCategory: accountCategory === "CLONE" ? "CLONE" : "VIP",
      thumbnail: thumbnail || "",
      packageName: packageName || "Gói Thuê Acc",
      durationHours: Number(durationHours) || 2,
      amount: Number(amount) || 0,
      customerName: customerName ? String(customerName).trim() : undefined,
      customerPhone: customerPhone ? String(customerPhone).trim() : undefined,
      bankId: (bankId || "ACB").trim().toUpperCase(),
      bankName: bankName || "Ngân hàng TMCP Á Châu (ACB)",
      accountNumber: String(accountNumber || "23456789").trim(),
      accountHolder: String(accountHolder || "TUAN THAI BINH").trim().toUpperCase(),
      qrTemplate: qrTemplate || "compact2",
      transferContent: transferContent || `THUE ACC ${accountCode}`,
      qrUrl: finalQrUrl,
      createdAt: now,
      expiresAt: expiresAt,
      status: "ACTIVE",
    };

    // Tạo token URL an toàn chứa toàn bộ dữ liệu phiên thanh toán
    const token = encodePaymentToken(newLink);

    // Giữ tối đa 500 link gần nhất
    const updatedLinks = [newLink, ...links.slice(0, 499)];
    writePaymentLinks(updatedLinks);

    return NextResponse.json({
      success: true,
      data: newLink,
      token,
      payUrl: `/pay/${newId}?d=${token}`,
    });
  } catch (err: any) {
    console.error("Lỗi POST /api/pay:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi tạo link thanh toán" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pay
 * Cập nhật trạng thái link (vd: COMPLETED khi đã thanh toán)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Thiếu id hoặc status" },
        { status: 400 }
      );
    }

    const links = readPaymentLinks();
    const index = links.findIndex((l) => l.id.toUpperCase() === id.trim().toUpperCase());

    if (index !== -1) {
      links[index].status = status;
      writePaymentLinks(links);
      return NextResponse.json({
        success: true,
        data: links[index],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật trạng thái",
    });
  } catch (err: any) {
    console.error("Lỗi PUT /api/pay:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi cập nhật trạng thái link" },
      { status: 500 }
    );
  }
}
