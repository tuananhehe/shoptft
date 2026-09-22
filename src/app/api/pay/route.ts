import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  PaymentLinkData,
  PAYMENT_LINK_DURATION_MS,
  generatePaymentLinkId,
} from "@/utils/payment-links-service";
import { buildVietQRUrl } from "@/utils/vietqr-helper";

const PAYMENT_LINKS_FILE = path.join(process.cwd(), "src", "data", "payment-links.json");

let memoryPaymentLinks: PaymentLinkData[] = [];

function readPaymentLinks(): PaymentLinkData[] {
  try {
    if (fs.existsSync(PAYMENT_LINKS_FILE)) {
      const content = fs.readFileSync(PAYMENT_LINKS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        memoryPaymentLinks = parsed;
        return memoryPaymentLinks;
      }
    }
  } catch (err) {
    console.error("Lỗi đọc file payment-links.json:", err);
  }
  return memoryPaymentLinks;
}

function writePaymentLinks(links: PaymentLinkData[]) {
  try {
    memoryPaymentLinks = links;
    const dir = path.dirname(PAYMENT_LINKS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PAYMENT_LINKS_FILE, JSON.stringify(links, null, 2), "utf-8");
  } catch (err) {
    console.error("Lỗi ghi file payment-links.json:", err);
  }
}

// Khởi tạo nạp dữ liệu ban đầu
readPaymentLinks();

/**
 * GET /api/pay?id=PAY-XXXXXX
 * Lấy chi tiết link thanh toán và tự động tính toán thời hạn 5 phút
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã link thanh toán (id)" },
        { status: 400 }
      );
    }

    const links = readPaymentLinks();
    const item = links.find((l) => l.id.toUpperCase() === id.trim().toUpperCase());

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

    return NextResponse.json({
      success: true,
      data: item,
      isExpired,
      remainingSeconds,
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

    // Giữ tối đa 500 link gần nhất trong file
    const updatedLinks = [newLink, ...links.slice(0, 499)];
    writePaymentLinks(updatedLinks);

    return NextResponse.json({
      success: true,
      data: newLink,
      payUrl: `/pay/${newId}`,
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

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy link thanh toán" },
        { status: 404 }
      );
    }

    links[index].status = status;
    writePaymentLinks(links);

    return NextResponse.json({
      success: true,
      data: links[index],
    });
  } catch (err: any) {
    console.error("Lỗi PUT /api/pay:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi cập nhật trạng thái link" },
      { status: 500 }
    );
  }
}
