import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/utils/admin-auth";
import { supabase } from "@/utils/supabase/client";

export async function POST(req: NextRequest) {
  try {
    // 1. Xác thực quyền Admin
    const authHeader = req.headers.get("x-admin-token");
    const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = verifyAdminSessionToken(authHeader || cookieToken);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền thực hiện hành động này!" },
        { status: 401 }
      );
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (formData.get("type") as string) || "general"; // favicon | background | accounts | general

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy file tải lên!" },
        { status: 400 }
      );
    }

    // 3. Kiểm tra định dạng & kích thước file (tối đa 10MB)
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".gif"];
    const ext = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, error: `Định dạng ${ext} không được hỗ trợ! Chỉ chấp nhận: PNG, JPG, WEBP, SVG, ICO.` },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File quá lớn! Dung lượng tối đa là 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const cleanFileName = `${uploadType}-${timestamp}${ext}`;

    // 4. Ưu tiên upload thẳng lên Supabase Cloud Storage (Bucket 'images')
    try {
      const mimeType = file.type || "image/jpeg";
      const { data: storageData, error: storageError } = await supabase.storage
        .from("images")
        .upload(cleanFileName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!storageError && storageData) {
        const { data: publicUrlData } = supabase.storage
          .from("images")
          .getPublicUrl(cleanFileName);

        const cloudUrl = publicUrlData?.publicUrl;
        if (cloudUrl) {
          console.log("Uploaded successfully to Supabase Storage:", cloudUrl);
          return NextResponse.json({
            success: true,
            url: cloudUrl,
            fileName: cleanFileName,
            size: file.size,
            storage: "supabase",
          });
        }
      } else if (storageError) {
        console.warn("Supabase Storage upload warning:", storageError.message);
      }
    } catch (storageErr) {
      console.warn("Supabase storage exception:", storageErr);
    }

    // 5. Fallback: Lưu file vào public/uploads nếu Cloud Storage chưa cấu hình Policy
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, cleanFileName);
    fs.writeFileSync(filePath, buffer);

    // Nếu là favicon và là .ico, ghi đè public/favicon.ico
    if (uploadType === "favicon" && ext === ".ico") {
      try {
        fs.writeFileSync(path.join(process.cwd(), "public", "favicon.ico"), buffer);
      } catch {
        // ignore fallback
      }
    }

    const publicUrl = `/uploads/${cleanFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: cleanFileName,
      size: file.size,
      storage: "local",
    });
  } catch (error: any) {
    console.error("Lỗi upload file:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý tải file lên!" },
      { status: 500 }
    );
  }
}
