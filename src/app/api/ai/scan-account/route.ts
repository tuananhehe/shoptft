import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ScanAccountRequest {
  images: string[]; // Base64 data URLs or image URLs
  apiKey?: string;
  provider?: "gemini" | "openai";
}

export async function POST(req: NextRequest) {
  try {
    const body: ScanAccountRequest = await req.json();
    const { images, apiKey: clientApiKey, provider = "gemini" } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp ít nhất một hình ảnh để quét!" },
        { status: 400 }
      );
    }

    // Resolve API Key: client provided > environment variable
    const geminiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const openAiKey = clientApiKey || process.env.OPENAI_API_KEY;

    if (provider === "openai") {
      if (!openAiKey) {
        return NextResponse.json(
          { error: "Chưa cấu hình OpenAI API Key! Vui lòng nhập API Key hoặc chọn Gemini." },
          { status: 400 }
        );
      }
      return await handleOpenAiVision(images, openAiKey);
    }

    // Default to Gemini
    if (!geminiKey) {
      return NextResponse.json(
        {
          error:
            "Chưa có Google Gemini API Key! Bạn hãy nhập API Key (miễn phí từ aistudio.google.com) vào ô cài đặt hoặc thêm GEMINI_API_KEY vào .env.local.",
          needsApiKey: true,
        },
        { status: 400 }
      );
    }

    return await handleGeminiVision(images, geminiKey);
  } catch (error: any) {
    console.error("Lỗi khi xử lý quét AI:", error);
    return NextResponse.json(
      { error: error.message || "Đã xảy ra lỗi khi quét ảnh bằng AI!" },
      { status: 500 }
    );
  }
}

// ============================================================
// GEMINI 1.5 FLASH VISION HANDLER
// ============================================================
async function handleGeminiVision(images: string[], apiKey: string) {
  const systemPrompt = `Bạn là chuyên gia thẩm định và nhận diện tài khoản game Đấu Trường Chân Lý (TFT / ĐTCL Việt Nam).
Nhiệm vụ của bạn: Phân tích kỹ lưỡng các hình ảnh chụp màn hình game ĐTCL (kho tướng tí nị / chibi, kho sân đấu, bậc rank, hoặc bảng tổng hợp thông tin acc) được cung cấp, sau đó bóc tách thông tin tài khoản và trả về DUY NHẤT một chuỗi JSON hợp lệ.

QUY TẮC NHẬN DIỆN ĐTCL VIỆT NAM:
1. "category": "VIP" (nếu có tướng tí nị / sân đấu thần thoại / thuê theo giờ) hoặc "CLONE" (acc trắng thông tin, cày rank dài hạn). Mặc định là "VIP".
2. "code": Nếu trên ảnh có ghi mã số acc (ví dụ: "MS: 8899", "MÃ: 1234", "CLONE-01") thì lấy, nếu không hãy để chuỗi rỗng "".
3. "mainChibi": Tên Tướng Tí Nị / Linh Thú NỔI BẬT & ĐẮT GIÁ NHẤT tìm thấy trên ảnh theo tên chuẩn tiếng Việt ĐTCL (ví dụ: "Tí Nị Ahri Chiêu Hồn", "Tí Nị Yasuo Chân Long Kiếm", "Tí Nị Aatrox Đoạt Mệnh", "Tí Nị Lee Sin Quyền Thái", "Tí Nị Yone Ẩn Ma", "Tí Nị Zed Tử Thần", "Tí Nị Kaisa Vệ Binh Tinh Tú", "Tí Nị Akali K/DA", "Tí Nị Gwen Soi Sáng", "Tí Nị Morgana", "Linh Thú Poro Siêu Sao"...). Nếu không có, để chuỗi rỗng.
4. "allChibi": Mảng danh sách TẤT CẢ các Tướng Tí Nị và Linh Thú nhìn thấy trong ảnh (bao gồm cả mainChibi và các pet khác).
5. "mainArena": Tên Sân Đấu Thần Thoại / Tối Thượng ĐẸP & ĐẮT NHẤT tìm thấy trên ảnh theo tên chuẩn tiếng Việt (ví dụ: "Sân Đấu Tiệm Trà Tâm Linh (Đổi Nhạc EDM)", "Sân Đấu Võ Đài Tinh Võ", "Sân Đấu Tàu Trục Vớt của Jinx", "Sân Đấu Đền Thờ Quán Quân", "Sân Đấu Đấu Trường Quái Vật", "Sân Đấu Chợ Tết Nguyên Đán"...). Nếu không có, để chuỗi rỗng.
6. "allArenas": Mảng danh sách TẤT CẢ các Sân Đấu nhìn thấy trong các ảnh.
7. "rank": Bậc Rank nhận diện được trên ảnh. CHỈ CHỌN 1 TRONG CÁC GIÁ TRỊ SAU: "THÁCH ĐẤU", "ĐẠI CAO THỦ", "CAO THỦ", "KIM CƯƠNG", "LỤC BẢO", "VÀNG/BẠCH KIM", "BẠC", "ĐỒNG", "KHÔNG RANK". Nếu không thấy rank, mặc định chọn "CAO THỦ" hoặc "THÁCH ĐẤU".
8. "accountValue": Ước tính định giá acc bằng số nguyên VNĐ dựa vào độ hiếm của Pet và Sân (VD: Acc có 1 Tí Nị Thần Thoại + 1 Sân Thần Thoại ~ 850000 đến 1500000, acc nhiều đồ ~ 2000000 đến 4000000).
9. "title": Tạo một tiêu đề ngắn gọn, bắt mắt, cuốn hút người thuê (VD: "Ahri Chiêu Hồn + Sân Tiệm Trà EDM", "Yasuo Chân Long Kiếm + Võ Đài Tinh Võ").
10. "description": Viết mô tả ngắn 1-2 câu tóm tắt điểm mạnh của tài khoản này.

ĐỊNH DẠNG JSON BẮT BUỘC TRẢ VỀ:
{
  "category": "VIP",
  "code": "",
  "mainChibi": "",
  "allChibi": [],
  "mainArena": "",
  "allArenas": [],
  "rank": "CAO THỦ",
  "accountValue": 850000,
  "title": "",
  "description": ""
}`;

  // Build image parts for Gemini
  const parts: any[] = [{ text: systemPrompt }];

  for (const img of images) {
    if (img.startsWith("data:")) {
      const commaIdx = img.indexOf(",");
      if (commaIdx !== -1) {
        const header = img.substring(0, commaIdx);
        const mimeMatch = header.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const base64Data = img.substring(commaIdx + 1);
        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64Data,
          },
        });
      }
    } else if (img.startsWith("http")) {
      // For remote images, try fetching and converting to base64
      try {
        const fetchRes = await fetch(img);
        if (fetchRes.ok) {
          const buffer = await fetchRes.arrayBuffer();
          const mimeType = fetchRes.headers.get("content-type") || "image/jpeg";
          const base64 = Buffer.from(buffer).toString("base64");
          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          });
        }
      } catch (err) {
        console.warn("Không thể tải ảnh từ URL:", img, err);
      }
    }
  }

  // Use Gemini 1.5 Flash (fastest vision model)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API Error:", response.status, errText);
    if (response.status === 400 || response.status === 403) {
      return NextResponse.json(
        { error: "Gemini API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại khóa API." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Gemini API lỗi (${response.status}): ${errText}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    return NextResponse.json(
      { error: "AI không trả về kết quả phân tích. Vui lòng thử lại với ảnh rõ hơn." },
      { status: 500 }
    );
  }

  let parsedResult;
  try {
    parsedResult = JSON.parse(rawText);
  } catch (err) {
    // Attempt cleaning markdown JSON formatting if present
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    parsedResult = JSON.parse(cleaned);
  }

  return NextResponse.json({
    success: true,
    provider: "gemini",
    data: parsedResult,
  });
}

// ============================================================
// OPENAI GPT-4O-MINI VISION HANDLER (FALLBACK PROVIDER)
// ============================================================
async function handleOpenAiVision(images: string[], apiKey: string) {
  const contentArray: any[] = [
    {
      type: "text",
      text: `Bạn là trợ lý AI chuyên gia về game Đấu Trường Chân Lý (TFT / ĐTCL Việt Nam).
Hãy phân tích hình ảnh và trả về JSON thuần túy (không kèm markdown):
{
  "category": "VIP",
  "code": "",
  "mainChibi": "Tên Tướng Tí Nị chính (VD: Tí Nị Ahri Chiêu Hồn)",
  "allChibi": ["Tên Linh Thú 1", "Tên Linh Thú 2"],
  "mainArena": "Tên Sân Đấu chính (VD: Sân Tiệm Trà Tâm Linh)",
  "allArenas": ["Tên Sân Đấu 1"],
  "rank": "THÁCH ĐẤU" | "ĐẠI CAO THỦ" | "CAO THỦ" | "KIM CƯƠNG" | "LỤC BẢO" | "VÀNG/BẠCH KIM" | "BẠC" | "ĐỒNG" | "KHÔNG RANK",
  "accountValue": 850000,
  "title": "Tiêu đề hấp dẫn",
  "description": "Mô tả ngắn"
}`,
    },
  ];

  for (const img of images) {
    contentArray.push({
      type: "image_url",
      image_url: { url: img },
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: contentArray }],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return NextResponse.json(
      { error: `OpenAI API lỗi: ${errText}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  const parsedResult = JSON.parse(rawText);

  return NextResponse.json({
    success: true,
    provider: "openai",
    data: parsedResult,
  });
}
