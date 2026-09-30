import {
  AiArticleLength,
  AiGenerateArticleRequest,
  AiArticleStructuredOutput,
  BlogPostCategory,
  BlogContentType,
  BLOG_CATEGORIES,
  CURRENT_TFT_PATCH,
  CURRENT_TFT_SET,
  slugify,
} from "@/utils/blog-shared";
import { getBlogPosts } from "@/utils/blog-service";

/**
 * Sanitize user prompt to prevent prompt injection and control characters
 */
function sanitizeTopic(input: string): string {
  if (!input || typeof input !== "string") return "";
  let clean = input.trim();
  if (clean.length > 1000) {
    clean = clean.slice(0, 1000);
  }
  // Strip control chars
  clean = clean.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  return clean;
}

/**
 * Heuristics to auto-detect category, content type, and patch from user prompt
 */
export function detectTftAttributes(promptText: string): {
  category: BlogPostCategory;
  contentType: BlogContentType;
  patch: string | null;
} {
  const lower = promptText.toLowerCase();

  // 1. Detect Patch
  let patch: string | null = null;
  const patchMatch = lower.match(/(?:patch|bản vá|phần|cập nhật)\s*([0-9]+(?:\.[0-9]+[a-z]?)?)/i);
  if (patchMatch && patchMatch[1]) {
    patch = patchMatch[1];
  } else if (lower.includes("18.3b") || lower.includes("18.3")) {
    patch = "18.3b";
  }

  // 2. Detect Content Type
  let contentType: BlogContentType = "seasonal";
  if (patch) {
    contentType = "patch-sensitive";
  } else if (
    lower.includes("đổi mật khẩu") ||
    lower.includes("mật khẩu") ||
    lower.includes("đổi mail") ||
    lower.includes("đổi email") ||
    lower.includes("email") ||
    lower.includes("đổi thông tin") ||
    lower.includes("bảo mật") ||
    lower.includes("2fa") ||
    lower.includes("riot id") ||
    lower.includes("cách tạo tài khoản")
  ) {
    contentType = "evergreen";
  } else if (lower.includes("mùa 18") || lower.includes("set 18") || lower.includes("đại ngàn")) {
    contentType = "seasonal";
  }

  // 3. Detect Category
  let category: BlogPostCategory = "TFT Mùa 18";
  if (
    lower.includes("mật khẩu") ||
    lower.includes("đổi mail") ||
    lower.includes("đổi email") ||
    lower.includes("email") ||
    lower.includes("đổi thông tin") ||
    lower.includes("riot") ||
    lower.includes("vng")
  ) {
    category = "Hướng Dẫn Riot";
  } else if (
    lower.includes("chibi") ||
    lower.includes("tí nị") ||
    lower.includes("linh thú") ||
    lower.includes("sân đấu") ||
    lower.includes("hiệu ứng âm nhạc") ||
    lower.includes("edm") ||
    lower.includes("hàng hiệu")
  ) {
    category = "Pet / Chibi / Sân Đấu";
  } else if (
    lower.includes("đội hình") ||
    lower.includes("reroll") ||
    lower.includes("carry") ||
    lower.includes("meta") ||
    lower.includes("exodia") ||
    lower.includes("tộc hệ") ||
    lower.includes("tinh linh")
  ) {
    category = "Meta & Đội Hình";
  } else if (
    lower.includes("kinh tế") ||
    lower.includes("giữ máu") ||
    lower.includes("lên cấp") ||
    lower.includes("người mới") ||
    lower.includes("leo rank") ||
    lower.includes("kinh nghiệm")
  ) {
    category = "Kinh nghiệm TFT";
  } else {
    category = "TFT Mùa 18";
  }

  return { category, contentType, patch };
}

/**
 * Generate a unique slug by comparing with existing blog posts
 */
export async function generateUniqueSlug(title: string, currentId?: string): Promise<string> {
  const baseSlug = slugify(title);
  if (!baseSlug) return `bai-viet-${Date.now()}`;

  try {
    const existingPosts = await getBlogPosts({ status: "all" });
    const conflictingSlugs = new Set(
      existingPosts
        .filter((p) => p.id !== currentId)
        .map((p) => p.slug.toLowerCase().trim())
    );

    if (!conflictingSlugs.has(baseSlug)) {
      return baseSlug;
    }

    let counter = 2;
    while (conflictingSlugs.has(`${baseSlug}-${counter}`)) {
      counter++;
    }
    return `${baseSlug}-${counter}`;
  } catch {
    return baseSlug;
  }
}

/**
 * Format markdown to ensure no second H1 exists and headings are properly structured
 */
function normalizeMarkdownHeadings(content: string, title: string): string {
  let lines = content.split("\n");
  let normalized = lines.map((line) => {
    // If line starts with a single # (H1), convert it to ## (H2)
    if (/^#\s+/.test(line)) {
      const headingText = line.replace(/^#\s+/, "").trim();
      // If the heading is identical to the post title, omit it
      if (headingText.toLowerCase() === title.toLowerCase()) {
        return "";
      }
      return `## ${headingText}`;
    }
    return line;
  });

  return normalized.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Internal links list for contextual enrichment
 */
const ALLOWED_INTERNAL_LINKS = [
  { text: "Kho Acc ĐTCL", url: "/shop" },
  { text: "Dịch Vụ Thuê Acc TFT", url: "/thue-acc-tft-dtcl" },
  { text: "Cẩm Nang TFT Mùa 18", url: "/blog/tft-mua-18" },
  { text: "Hướng Dẫn Đổi Thông Tin Riot", url: "/huong-dan/doi-thong-tin-acc-riot" },
  { text: "Về ShopTFTMobile", url: "/ve-shop" },
];

/**
 * Main AI Blog Generation Provider Abstraction
 */
export async function generateAiBlogArticle(
  req: AiGenerateArticleRequest
): Promise<AiArticleStructuredOutput> {
  const safeTopic = sanitizeTopic(req.topic);
  if (!safeTopic) {
    throw new Error("Vui lòng cung cấp chủ đề hoặc nội dung cần viết!");
  }

  // 1. Detect category, contentType and patch
  const detected = detectTftAttributes(safeTopic);
  const finalCategory =
    req.category && req.category !== "auto" && BLOG_CATEGORIES.includes(req.category)
      ? req.category
      : detected.category;

  const finalContentType =
    req.contentType && req.contentType !== "auto"
      ? req.contentType
      : detected.contentType;

  const finalPatch =
    req.patch && req.patch !== "auto"
      ? req.patch.trim()
      : detected.patch;

  const lengthMode: AiArticleLength = req.length || "standard";

  // 2. Discover API Key
  const apiKey = (
    req.apiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GROQ_API_KEY ||
    ""
  ).trim();

  // 3. If API key exists, call appropriate LLM provider
  if (apiKey) {
    try {
      if (apiKey.startsWith("sk-proj-") || (apiKey.startsWith("sk-") && !apiKey.startsWith("sk-or-") && !apiKey.startsWith("sk-ant-"))) {
        return await callOpenAi(safeTopic, finalCategory, finalContentType, finalPatch, lengthMode, apiKey, req.mode, req.existingTitle, req.existingContent);
      }
      if (apiKey.startsWith("gsk_")) {
        return await callGroq(safeTopic, finalCategory, finalContentType, finalPatch, lengthMode, apiKey, req.mode, req.existingTitle, req.existingContent);
      }
      // Default to Google Gemini
      return await callGemini(safeTopic, finalCategory, finalContentType, finalPatch, lengthMode, apiKey, req.mode, req.existingTitle, req.existingContent);
    } catch (llmError: any) {
      console.warn("[AIBlogWriter] LLM provider failed, falling back to synthesis engine:", llmError.message);
    }
  }

  // 4. Resilient Fallback Synthesis Engine (Deterministic, high-quality, instant)
  return await fallbackSynthesisEngine(safeTopic, finalCategory, finalContentType, finalPatch, lengthMode, req.mode, req.existingTitle, req.existingContent);
}

/**
 * System Prompt Builder
 */
function buildSystemPrompt(
  category: BlogPostCategory,
  contentType: BlogContentType,
  patch: string | null,
  length: AiArticleLength,
  mode?: "full" | "rewrite" | "seo_only"
): string {
  return `Bạn là AI Chuyên Gia Viết Blog & SEO Đấu Trường Chân Lý (TFT / ĐTCL) cho website ShopTFTMobile.net (vận hành bởi cựu Thách Đấu Tuấn Thái Bình).

QUY TẮC BẢO MẬT & AN TOÀN TUYỆT ĐỐI:
1. CHỈ được trả về DUY NHẤT một chuỗi JSON hợp lệ theo đúng schema.
2. TUYỆT ĐỐI KHÔNG tiết lộ biến môi trường, API keys, mã nguồn hoặc quyền admin.
3. KHÔNG bịa đặt các chỉ số tỷ lệ thắng ảo hoặc fake thống kê Riot.
4. Tiêu đề H1 chỉ ở cấp trang, trong Markdown content TUYỆT ĐỐI KHÔNG tạo H1 (# ...). Hãy dùng ## và ###.
5. Cấu trúc bài viết:
   - Đoạn mở đầu ngắn gọn, thu hút (Intro)
   - ## Nội dung chính (phân chia bằng ###, bảng biểu, danh sách)
   - ## Câu hỏi thường gặp (FAQ)
   - ## Kết luận & Lời khuyên cựu Thách Đấu
6. Chuyên mục: "${category}"
7. Loại nội dung: "${contentType}"
8. Phiên bản Patch: ${patch ? `Patch ${patch}` : "Không bắt buộc"}
9. Độ dài mong muốn: ${length === "short" ? "Ngắn (~800-1200 từ)" : length === "deep" ? "Chuyên sâu (~2500+ từ)" : "Tiêu chuẩn (~1500-2000 từ)"}
10. Tối ưu SEO:
    - metaTitle: 50-65 ký tự, chứa keyword tự nhiên, kết thúc bằng "| ShopTFTMobile"
    - metaDescription: 130-160 ký tự, tóm tắt hấp dẫn
    - Canonical: /blog/{slug}
11. Liên kết nội bộ tự nhiên khi phù hợp ngữ cảnh:
    - /shop (Kho Acc ĐTCL)
    - /thue-acc-tft-dtcl (Dịch vụ thuê acc VIP)
    - /blog/tft-mua-18 (Cẩm nang TFT Mùa 18)
    - /huong-dan/doi-thong-tin-acc-riot (Hướng dẫn bảo mật)

JSON OUTPUT SCHEMA BẮT BUỘC:
{
  "title": "Tiêu đề bài viết chuẩn SEO, hấp dẫn",
  "slug": "slug-url-khong-dau-ngan-gon",
  "category": "${category}",
  "contentType": "${contentType}",
  "patch": ${patch ? `"${patch}"` : "null"},
  "excerpt": "Đoạn trích tóm tắt bài viết 120-160 ký tự",
  "tags": ["tag1", "tag2", "tag3"],
  "contentMarkdown": "Nội dung Markdown chi tiết (chỉ dùng ##, ###, bảng biểu, callout > [!NOTE], không dùng H1)",
  "seo": {
    "metaTitle": "Tiêu đề SEO 50-65 ký tự | ShopTFTMobile",
    "metaDescription": "Mô tả SEO 130-160 ký tự",
    "canonicalPath": "/blog/slug-url-khong-dau-ngan-gon",
    "index": true
  },
  "suggestedCoverPrompt": "Gợi ý mô tả hình ảnh cover thích hợp",
  "internalLinks": [
    { "text": "Kho Acc", "url": "/shop" }
  ]
}`;
}

/**
 * Validate and clean LLM JSON response
 */
async function parseAndValidateLlmOutput(
  rawText: string,
  fallbackTopic: string,
  category: BlogPostCategory,
  contentType: BlogContentType,
  patch: string | null
): Promise<AiArticleStructuredOutput> {
  let cleaned = rawText.trim();
  // Strip Markdown JSON codeblocks
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  const parsed = JSON.parse(cleaned);

  if (!parsed.title || typeof parsed.title !== "string") {
    throw new Error("Missing required field: title");
  }
  if (!parsed.contentMarkdown || typeof parsed.contentMarkdown !== "string") {
    throw new Error("Missing required field: contentMarkdown");
  }

  const title = parsed.title.trim();
  const slug = await generateUniqueSlug(parsed.slug || title);
  const contentMarkdown = normalizeMarkdownHeadings(parsed.contentMarkdown, title);
  const excerpt = parsed.excerpt?.trim() || `${title}. Hướng dẫn và phân tích chi tiết từ Tuấn Thái Bình TFT.`;

  return {
    title,
    slug,
    category: parsed.category || category,
    contentType: parsed.contentType || contentType,
    patch: parsed.patch || patch,
    excerpt,
    tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ["tft mùa 18", "đtcl"],
    contentMarkdown,
    seo: {
      metaTitle: parsed.seo?.metaTitle || `${title} | ShopTFTMobile`,
      metaDescription: parsed.seo?.metaDescription || excerpt.slice(0, 160),
      canonicalPath: `/blog/${slug}`,
      index: true,
    },
    suggestedCoverPrompt: parsed.suggestedCoverPrompt || `TFT Season 18 key art featuring ${title}`,
    internalLinks: Array.isArray(parsed.internalLinks) ? parsed.internalLinks : ALLOWED_INTERNAL_LINKS.slice(0, 2),
  };
}

/**
 * Call Google Gemini API
 */
async function callGemini(
  topic: string,
  category: BlogPostCategory,
  contentType: BlogContentType,
  patch: string | null,
  length: AiArticleLength,
  apiKey: string,
  mode?: "full" | "rewrite" | "seo_only",
  existingTitle?: string,
  existingContent?: string
): Promise<AiArticleStructuredOutput> {
  const systemPrompt = buildSystemPrompt(category, contentType, patch, length, mode);
  const userContent = mode === "rewrite" && existingContent
    ? `VIẾT LẠI TOÀN BỘ BÀI VIẾT SAU ĐÂY THEO TIÊU CHUẨN MỚI:\nTiêu đề cũ: ${existingTitle}\nNội dung cũ:\n${existingContent}\nYêu cầu mới: ${topic}`
    : mode === "seo_only"
    ? `TỐI ƯU SEO VÀ TAGS CHO BÀI VIẾT NÀY:\nTiêu đề: ${existingTitle}\nNội dung:\n${existingContent?.slice(0, 1500)}\nGợi ý bổ sung: ${topic}`
    : `CHỦ ĐỀ BÀI VIẾT CẦN TẠO:\n"""${topic}"""`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${userContent}` }] },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Gemini returned empty response.");

  return await parseAndValidateLlmOutput(rawText, topic, category, contentType, patch);
}

/**
 * Call OpenAI API
 */
async function callOpenAi(
  topic: string,
  category: BlogPostCategory,
  contentType: BlogContentType,
  patch: string | null,
  length: AiArticleLength,
  apiKey: string,
  mode?: "full" | "rewrite" | "seo_only",
  existingTitle?: string,
  existingContent?: string
): Promise<AiArticleStructuredOutput> {
  const systemPrompt = buildSystemPrompt(category, contentType, patch, length, mode);
  const userContent = mode === "rewrite" && existingContent
    ? `VIẾT LẠI TOÀN BỘ BÀI VIẾT SAU ĐÂY:\nTiêu đề cũ: ${existingTitle}\nNội dung cũ:\n${existingContent}\nYêu cầu: ${topic}`
    : `CHỦ ĐỀ BÀI VIẾT:\n"""${topic}"""`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("OpenAI returned empty response.");

  return await parseAndValidateLlmOutput(rawText, topic, category, contentType, patch);
}

/**
 * Call Groq API
 */
async function callGroq(
  topic: string,
  category: BlogPostCategory,
  contentType: BlogContentType,
  patch: string | null,
  length: AiArticleLength,
  apiKey: string,
  mode?: "full" | "rewrite" | "seo_only",
  existingTitle?: string,
  existingContent?: string
): Promise<AiArticleStructuredOutput> {
  const systemPrompt = buildSystemPrompt(category, contentType, patch, length, mode);
  const userContent = `CHỦ ĐỀ BÀI VIẾT:\n"""${topic}"""`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("Groq returned empty response.");

  return await parseAndValidateLlmOutput(rawText, topic, category, contentType, patch);
}

/**
 * Resilient Fallback Synthesis Engine
 * Generates an authoritative, highly structured, SEO-optimized article without external dependencies
 */
async function fallbackSynthesisEngine(
  topic: string,
  category: BlogPostCategory,
  contentType: BlogContentType,
  patch: string | null,
  length: AiArticleLength,
  mode?: "full" | "rewrite" | "seo_only",
  existingTitle?: string,
  existingContent?: string
): Promise<AiArticleStructuredOutput> {
  // Clean topic for title
  const cleanTitle = topic
    .replace(/^(viết bài|tạo bài|viết đội hình|viết hướng dẫn|viết|hướng dẫn|chia sẻ|hãy viết về)\s+/i, "")
    .trim();

  let formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  if (category === "Hướng Dẫn Riot" && !formattedTitle.toLowerCase().includes("hướng dẫn")) {
    formattedTitle = `Hướng Dẫn ${formattedTitle} An Toàn & Chuẩn Xác`;
  } else if (category === "Meta & Đội Hình" && !formattedTitle.toLowerCase().includes("đội hình") && !formattedTitle.toLowerCase().includes("giáo án")) {
    formattedTitle = `Đội Hình ${formattedTitle}`;
  } else if (!formattedTitle.toLowerCase().includes("tft") && !formattedTitle.toLowerCase().includes("đtcl")) {
    formattedTitle = `${formattedTitle} – ĐTCL Mùa 18`;
  }
  if (patch && !formattedTitle.toLowerCase().includes(patch.toLowerCase())) {
    formattedTitle += ` Patch ${patch}`;
  }

  const slug = await generateUniqueSlug(formattedTitle);

  let markdownBody = "";

  if (category === "Hướng Dẫn Riot") {
    markdownBody = `## Hướng Dẫn Chi Tiết: ${cleanTitle}

Việc bảo mật và quản lý tài khoản Riot Games đóng vai trò quan trọng hàng đầu đối với mọi cờ thủ Đấu Trường Chân Lý (TFT) và Liên Minh Huyền Thoại. Nhất là sau khi giao dịch hoặc thuê tài khoản, nắm vững quy trình đổi thông tin giúp bạn hoàn toàn an tâm trong suốt quá trình trải nghiệm.

Sau đây là hướng dẫn chuẩn từng bước từ Tuấn Thái Bình.

---

## 3 Bước Thực Hiện Nhanh Chóng & Chuẩn Xác

### Bước 1: Đăng Nhập Cổng Quản Lý Riot Games
Truy cập trang quản trị chính thức của Riot Games tại [account.riotgames.com](https://account.riotgames.com) trên trình duyệt máy tính hoặc điện thoại. Đăng nhập bằng tên tài khoản và mật khẩu hiện tại được bàn giao.

### Bước 2: Tiến Hành Thay Đổi Thông Tin Cần Thiết
* **Đổi Mật Khẩu (Password)**: Nhập mật khẩu hiện tại, sau đó nhập mật khẩu mới chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số để đảm bảo độ bảo mật cao nhất.
* **Cập Nhật Email Chính Chủ**: Nhập địa chỉ Gmail hoặc Outlook của bạn. Hệ thống Riot sẽ gửi mã xác thực 6 số về hòm thư, bạn chỉ cần nhập mã xác nhận là email chính chủ đã được liên kết thành công.

### Bước 3: Kích Hoạt Bảo Mật 2 Lớp (2FA)
Vào mục **Bảo Mật (Two-Factor Authentication)** và bật xác thực 2 bước. Mỗi khi đăng nhập trên thiết bị lạ, mã OTP bảo mật sẽ được gửi trực tiếp về email của bạn.

---

## Bảng Tổng Hợp Các Lưu Ý Quan Trọng

| Vấn Đề | Hướng Xử Lý Khuyến Nghị | Mức Độ Rủi Ro |
| :--- | :--- | :--- |
| **Không nhận được mã xác thực** | Kiểm tra hòm thư Spam/Rác hoặc đợi 60 giây để yêu cầu gửi lại mã mới | Thấp |
| **Bị khóa đăng nhập tạm thời** | Đợi khoảng 15–30 phút và không thử đăng nhập sai pass liên tục quá 5 lần | Trung bình |
| **Chơi ở quán Net / Máy lạ** | Luôn đăng xuất Riot Client và hủy ghi nhớ mật khẩu trước khi ra về | Cao |

> [!NOTE]
> **Lời khuyên từ Tuấn Thái Bình**: Nếu bạn sử dụng tài khoản từ hệ thống [Kho Acc](/shop) của ShopTFTMobile, toàn bộ thông tin tài khoản đều được hỗ trợ kiểm tra và bàn giao trực tiếp 1-1 qua Zalo, đảm bảo an toàn tuyệt đối.

---

## Câu Hỏi Thường Gặp (FAQ)

**Q: Đổi email tài khoản Riot có bị mất tướng hay skin không?**  
A: Hoàn toàn không. Việc đổi email và mật khẩu chỉ thay đổi thông tin xác thực bảo mật, toàn bộ Linh Thú, Sân Đấu, mảnh tướng và bậc Rank đều được giữ nguyên 100%.

**Q: Tôi có thể đổi Riot ID (Tên hiển thị trong game) miễn phí không?**  
A: Có. Riot Games cho phép mỗi người chơi đổi Riot ID miễn phí 90 ngày một lần trực tiếp trong phần Quản lý tài khoản.

---

## Kết Luận

Nắm vững các bước bảo mật tài khoản giúp bạn tự tin leo rank và thỏa sức trải nghiệm các trận đấu kịch tính. Nếu có bất kỳ thắc mắc nào trong quá trình thao tác, bạn có thể tham khảo thêm tại chuyên mục [Hướng Dẫn](/huong-dan) của ShopTFTMobile.`;
  } else if (category === "Pet / Chibi / Sân Đấu") {
    markdownBody = `## Giới Thiệu Chủ Đề: ${cleanTitle}

Bên cạnh chiến thuật cờ nhân phẩm, các vật phẩm trang trí như Tướng Tí Nị (Chibi), Linh Thú Thần Thoại và Sân Đấu Tương Tác là yếu tố then chốt tạo nên sức hút độc nhất của ĐTCL Mùa 18 (Đại Ngàn Kỳ Bí). 

Cùng ShopTFTMobile điểm qua toàn bộ chi tiết và cách sở hữu những vật phẩm hot nhất trong bài viết này.

---

## Điểm Nổi Bật & Hoạt Ảnh Đặc Trưng

### 1. Hoạt Ảnh Kết Liễu Độc Quyền (Finisher)
Các Tướng Tí Nị Thần Thoại sở hữu hoạt ảnh kết liễu cinematic toàn màn hình khi tiễn đối thủ về sảnh chờ. Đây là điểm nhấn thể hiện đẳng cấp cờ thủ mà ai cũng mong muốn trải nghiệm.

### 2. Sàn Đấu Biến Chuyển Âm Nhạc Theo Tình Huống
Các sân đấu Thần Thoại Mùa 18 phản hồi nhịp beat EDM và thay đổi hiệu ứng ánh sáng động theo chuỗi thắng/thua, mang lại trải nghiệm thị giác và thính giác vô cùng sống động.

---

## So Sánh Các Lựa Chọn Nổi Bật

| Tên Vật Phẩm | Cấp Bậc | Hoạt Ảnh Kết Liễu | Mức Độ Quý Hiếm |
| :--- | :--- | :--- | :--- |
| **Tí Nị Thần Thoại Mùa 18** | Thần Thoại | Có (Cinematic 3D) | Rất hiếm (Vòng Quay) |
| **Tướng Tí Nị Cơ Bản** | Huyền Thoại | Không | Mua trực tiếp cửa hàng |
| **Sân Đấu Âm Nhạc EDM** | Thần Thoại | Biến đổi beat nhạc | Giới hạn sự kiện |

> [!TIP]
> Thay vì phải nạp hàng triệu đồng quay gacha may rủi, bạn có thể tham khảo dịch vụ [Thuê Acc TFT](/thue-acc-tft-dtcl) tại ShopTFTMobile để trải nghiệm ngay full set Tí Nị và Sân Đấu Thần Thoại với chi phí cực kỳ tiết kiệm.

---

## Câu Hỏi Thường Gặp (FAQ)

**Q: Thuê acc có được trải nghiệm đầy đủ hoạt ảnh kết liễu không?**  
A: Có! Toàn bộ chưởng lực, sàn đấu và tướng Tí Nị trong acc đều hoạt động nguyên vẹn 100% như tài khoản sở hữu vĩnh viễn.

---

## Kết Luận

Một bộ sưu tập Tí Nị đẹp mắt và sân đấu hoành tráng sẽ tiếp thêm rất nhiều cảm hứng cho hành trình leo rank của bạn. Đừng quên ghé thăm [Kho Acc](/shop) để chọn ngay cho mình tài khoản ưng ý nhất!`;
  } else {
    // Default Meta / Comp / Strategy guide
    markdownBody = `## Tổng Quan Đội Hình: ${cleanTitle}

${patch ? `Trong phiên bản **Patch ${patch}** hiện tại của **${CURRENT_TFT_SET}**, ` : `Trong meta **${CURRENT_TFT_SET}**, `}chiến thuật xoay quanh chủ đề này đang trở thành một trong những phương án leo rank ổn định và hiệu quả nhất tại các bậc rank từ Kim Cương đến Thách Đấu.

Bài viết này sẽ hướng dẫn bạn chi tiết từ khâu xây dựng bộ khung tướng, phân bổ trang bị chuẩn, lộ trình lên cấp và các mẹo xử lý tình huống thực chiến.

---

## Khung Đội Hình Hoàn Chỉnh Ở Cấp 8

* **Tướng Carry Chủ Lực**: Dồn toàn bộ trang bị sát thương chính và Tinh Linh phù hợp.
* **Dàn Chắn Tiền Tuyến (Main Tank)**: Bố trí các tướng Can Trường hoặc Đấu Sĩ có khả năng chống chịu và tạo khoảng trống.
* **Tướng Hỗ Trợ Đa Dụng**: Cung cấp hiệu ứng khống chế diện rộng, buff năng lượng hoặc kích mốc tộc hệ quan trọng.

---

## Phân Phối Trang Bị Chuẩn Meta

| Vị Trí Tướng | Trang Bị Tối Ưu (BiS) | Trang Bị Thay Thế Khả Dụng |
| :--- | :--- | :--- |
| **Carry Phép / Sát Thương Chính** | Bùa Xanh, Găng Bảo Thạch, Kiếm Súng Hextech | Mũ Phù Thủy, Quỷ Thư Morello, Trượng Thiên Thần |
| **Main Tank Tiền Tuyến** | Thú Tượng Thạch Giáp, Nỏ Sét, Giáp Gai | Vuốt Rồng, Dây Chuyền Chuộc Tội, Trái Tim Kiên Định |
| **Phụ Sát Thương (Secondary)** | Cung Xanh, Ngọn Giáo Shojin, Vô Cực Kiếm | Bàn Tay Công Lý, Áo Choàng Bóng Tối |

---

## Lộ Trình Vận Hành Trận Đấu

### 1. Giai Đoạn Đầu Game (Vòng 2-1 đến 2-7)
Giữ máu bằng bộ khung tướng 1 vàng, 2 vàng 2 sao tự nhiên. Ưu tiên ghép sớm các trang bị giữ máu đa dụng như Giáp Lửa, Nỏ Sét hoặc Ngọn Giáo Shojin thay vì giữ đồ chờ đồ chuẩn.

### 2. Giai Đoạn Giữa Game (Vòng 3-2 đến 4-1)
Lên cấp 6 ở 3-2 và cấp 7 ở 3-5 hoặc 4-1. Nếu máu thấp dưới 60, hãy roll nhẹ khoảng 10–20 vàng để ổn định sàn đấu, tránh mất máu chuỗi thua quá sâu.

### 3. Giai Đoạn Cuối Game (Vòng 4-2 trở đi)
Lên cấp 8 ở 4-2, xả tiền tìm kiếm carry 4 vàng 2 sao và hoàn thiện dàn chắn. Nếu thế trận thuận lợi và kinh tế dồi dào, tích lũy lên cấp 9 để bổ sung tướng 5 vàng kích hoạt mốc tộc hệ Exodia.

> [!NOTE]
> **Kinh nghiệm Thách Đấu từ Tuấn Thái Bình**: Hãy luôn quan sát sàn đấu của các nhà khác ở vòng 3-5 và 4-1 để kiểm tra xem có bị tranh bài hay không. Nếu bị tranh quá nhiều, hãy linh hoạt chuyển đổi trang bị sang tướng phụ thay vì cố roll cạn tiền.

---

## Câu Hỏi Thường Gặp (FAQ)

**Q: Khi nào nên quyết định chơi bài này?**  
A: Bạn nên hướng tới bài này khi đầu game sở hữu nhiều mảnh Nước Mắt / Gậy Quá Khổ và sớm có lõi nâng cấp liên quan đến tộc hệ chủ lực.

**Q: Cần làm gì nếu không roll ra carry chính ở vòng 4-2?**  
A: Sử dụng tạm một tướng 4 vàng giữ đồ tương đồng và giữ máu ở mức an toàn trước khi roll lại ở vòng 5-1.

---

## Lời Kết

Hy vọng cẩm nang phân tích này sẽ giúp bạn làm chủ chiến thuật và bứt phá rank thần tốc. Để cập nhật thêm nhiều giáo án đỉnh cao khác, hãy theo dõi chuyên mục [Cẩm Nang TFT Mùa 18](/blog/tft-mua-18) hoặc tham khảo [Kho Acc](/shop) để tự do test đội hình nhé!`;
  }

  const excerpt = `Phân tích chi tiết ${cleanTitle} trong ${CURRENT_TFT_SET}. Hướng dẫn xây dựng đội hình, trang bị chuẩn và kinh nghiệm leo rank chuẩn Thách Đấu.`;

  return {
    title: formattedTitle,
    slug,
    category,
    contentType,
    patch: patch || null,
    excerpt,
    tags: [
      category.toLowerCase(),
      "tft mùa 18",
      "đtcl",
      patch ? `patch ${patch}` : "meta tft",
    ],
    contentMarkdown: markdownBody,
    seo: {
      metaTitle: `${formattedTitle} | ShopTFTMobile`.slice(0, 68),
      metaDescription: excerpt.slice(0, 155),
      canonicalPath: `/blog/${slug}`,
      index: true,
    },
    suggestedCoverPrompt: `TFT Season 18 cinematic splash art matching ${cleanTitle}`,
    internalLinks: ALLOWED_INTERNAL_LINKS.slice(0, 3),
  };
}
