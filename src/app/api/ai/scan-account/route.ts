import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ScanAccountRequest {
  images: string[]; // Base64 data URLs or image URLs
  apiKey?: string;
  provider?: "gemini" | "openai" | "groq";
}

export async function POST(req: NextRequest) {
  try {
    const body: ScanAccountRequest = await req.json();
    const { images, apiKey: clientApiKey } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp ít nhất một hình ảnh để quét!" },
        { status: 400 }
      );
    }

    const key = (
      clientApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      ""
    ).trim();

    if (!key) {
      return NextResponse.json(
        {
          error:
            "Chưa có API Key! Bạn hãy nhập Google Gemini API Key (từ aistudio.google.com) hoặc Groq API Key (từ console.groq.com) vào ô cài đặt.",
          needsApiKey: true,
        },
        { status: 400 }
      );
    }

    // Auto-detect provider by API key prefix
    if (key.startsWith("gsk_")) {
      return await handleGroqVision(images, key);
    }

    if (key.startsWith("sk-proj-") || (key.startsWith("sk-") && !key.startsWith("sk-ant-"))) {
      return await handleOpenAiVision(images, key);
    }

    // Default to Google Gemini
    return await handleGeminiVision(images, key);
  } catch (error: any) {
    console.error("Lỗi khi xử lý quét AI:", error);
    return NextResponse.json(
      { error: error.message || "Đã xảy ra lỗi khi quét ảnh bằng AI!" },
      { status: 500 }
    );
  }
}

// ============================================================
// 1. GEMINI VISION HANDLER (RESILIENT & MULTI-MODEL)
// ============================================================
async function handleGeminiVision(images: string[], apiKey: string) {
  const systemPrompt = `Bạn là chuyên gia thẩm định và nhận diện tài khoản game Đấu Trường Chân Lý (TFT / ĐTCL Việt Nam).
Nhiệm vụ: Phân tích kỹ các ảnh chụp màn hình game ĐTCL (kho tướng tí nị / chibi, kho sân đấu, bậc rank...) và trả về DUY NHẤT một chuỗi JSON hợp lệ theo định dạng sau:
{
  "category": "VIP",
  "code": "",
  "mainChibi": "Tên Tướng Tí Nị / Linh Thú Chính chuẩn ĐTCL Việt Nam (VD: Tí Nị Ahri Chiêu Hồn)",
  "allChibi": ["Tên Linh Thú 1", "Tên Linh Thú 2"],
  "mainArena": "Tên Sân Đấu Thần Thoại Chính chuẩn ĐTCL Việt Nam (VD: Sân Đấu Tiệm Trà Tâm Linh EDM)",
  "allArenas": ["Tên Sân Đấu 1"],
  "rank": "THÁCH ĐẤU",
  "accountValue": 850000,
  "title": "Ahri Chiêu Hồn + Sân Tiệm Trà EDM",
  "description": "Tài khoản VIP chất lượng cao"
}

Quy tắc:
- rank: chọn 1 trong ["THÁCH ĐẤU", "ĐẠI CAO THỦ", "CAO THỦ", "KIM CƯƠNG", "LỤC BẢO", "VÀNG/BẠCH KIM", "BẠC", "ĐỒNG", "KHÔNG RANK"].
- Chỉ trả về chuỗi JSON, không viết lời dẫn hay markdown thừa.`;

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

  // Danh sách model Gemini ưu tiên
  const candidateModels = [
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-001",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro",
  ];

  let lastError = "";
  let lastStatus = 500;
  let parsedResult = null;
  let usedModel = "";

  for (const model of candidateModels) {
    const modelName = model.startsWith("models/") ? model : `models/${model}`;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = rawText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

          const jsonStart = cleaned.indexOf("{");
          const jsonEnd = cleaned.lastIndexOf("}");
          if (jsonStart !== -1 && jsonEnd !== -1) {
            parsedResult = JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
          } else {
            parsedResult = JSON.parse(cleaned);
          }
          usedModel = model;
          break;
        }
      } else {
        lastStatus = response.status;
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.error?.message || (await response.text().catch(() => "Unknown error"));
        lastError = `[${response.status}] ${errMsg}`;

        // 404 nghĩa là model không có trong project/version, thử model kế tiếp
        if (response.status === 404) {
          continue;
        }
      }
    } catch (err: any) {
      lastError = err.message || String(err);
    }
  }

  if (!parsedResult) {
    return NextResponse.json(
      {
        error: `Lỗi Google Gemini API (${lastStatus}): ${lastError}. Hãy kiểm tra lại API Key hoặc tạo key mới tại aistudio.google.com.`,
      },
      { status: lastStatus }
    );
  }

  return NextResponse.json({
    success: true,
    provider: "gemini",
    model: usedModel,
    data: parsedResult,
  });
}

// ============================================================
// 2. GROQ VISION HANDLER (100% FREE & ULTRA FAST)
// ============================================================
async function handleGroqVision(images: string[], apiKey: string) {
  const contentArray: any[] = [
    {
      type: "text",
      text: `Bạn là trợ lý AI chuyên gia về game Đấu Trường Chân Lý (TFT / ĐTCL Việt Nam).
Hãy phân tích hình ảnh và trả về DUY NHẤT chuỗi JSON (không kèm markdown):
{
  "category": "VIP",
  "code": "",
  "mainChibi": "Tên Tướng Tí Nị chính (VD: Tí Nị Ahri Chiêu Hồn)",
  "allChibi": ["Tên Linh Thú 1", "Tên Linh Thú 2"],
  "mainArena": "Tên Sân Đấu chính (VD: Sân Tiệm Trà Tâm Linh)",
  "allArenas": ["Tên Sân Đấu 1"],
  "rank": "THÁCH ĐẤU",
  "accountValue": 850000,
  "title": "Ahri Chiêu Hồn + Sân Tiệm Trà EDM",
  "description": "Tài khoản VIP chất lượng cao"
}`,
    },
  ];

  for (const img of images) {
    contentArray.push({
      type: "image_url",
      image_url: { url: img },
    });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.2-11b-vision-preview",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: contentArray }],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return NextResponse.json(
      { error: `Groq API lỗi: ${errText}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  const parsedResult = JSON.parse(rawText);

  return NextResponse.json({
    success: true,
    provider: "groq",
    model: "llama-3.2-11b-vision-preview",
    data: parsedResult,
  });
}

// ============================================================
// 3. OPENAI GPT-4O-MINI VISION HANDLER
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
  "rank": "THÁCH ĐẤU",
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
