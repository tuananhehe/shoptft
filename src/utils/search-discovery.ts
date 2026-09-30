/**
 * ShopTFTMobile - Smart Search & Product Discovery Engine (Phase 10)
 * 
 * Strict Guidelines:
 * - NO AI recommendation or external search engine dependency.
 * - Deterministic, lightweight, and blazing-fast scoring.
 * - Exact match priority > Prefix match > Contains match > Tag/Description match.
 * - Real keyword suggestions based strictly on verified active inventory.
 */

export interface ScorableAccount {
  id: string;
  code: string;
  title: string;
  rank?: string;
  mainPet?: string;
  allPets?: string[];
  arena?: string;
  allArenas?: string[];
  features?: string[];
  description?: string;
  status: "AVAILABLE" | "RENTED" | string;
  type?: "VIP" | "CLONE" | string;
  price?: number;
  hourlyPrice?: number;
  createdAt?: string;
}

/**
 * 1. Chuẩn hóa chuỗi tìm kiếm đầu vào:
 * - Trim khoảng trắng đầu/cuối
 * - Bỏ khoảng trắng dư thừa
 * - Chuyển chữ thường
 * - Chuẩn hóa ký tự đặc biệt nguy hiểm cho regex / SQL
 */
export function normalizeSearchQuery(raw?: string | null): string {
  if (!raw) return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/[%,()]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Bỏ dấu tiếng Việt chuẩn UTF-8, chuyển đổi đ/Đ thành d
 */
export function removeVietnameseAccents(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 2. Từ điển Synonym / Alias gọn gàng, có căn cứ thực tế
 */
export const SYNONYM_MAP: Record<string, string[]> = {
  // Pet / Chibi
  "chibi": ["ti ni", "tí nị", "linh thu", "linh thú"],
  "pet": ["ti ni", "tí nị", "chibi"],
  "linh thu": ["ti ni", "tí nị", "chibi"],
  "ti ni": ["chibi", "pet"],
  "tí nị": ["chibi", "pet"],

  // Sân đấu
  "san dau": ["san", "arena", "map", "sân đấu"],
  "sân đấu": ["san dau", "arena", "map"],
  "arena": ["san dau", "sân đấu", "san"],
  "map": ["san dau", "sân đấu"],

  // Hàng hiệu / Ngoại trang cao cấp
  "hang hieu": ["hàng hiệu", "prestige"],
  "hàng hiệu": ["hang hieu", "prestige"],
  "prestige": ["hang hieu", "hàng hiệu"],

  // Clone / Smurf / Acc rác
  "smurf": ["clone", "unranked", "trang thong tin"],
  "clone": ["smurf", "unranked"],
  "acc clone": ["clone", "smurf"],
  "unranked": ["clone", "smurf"],

  // Rank
  "thach dau": ["thách đấu", "challenger"],
  "thách đấu": ["thach dau", "challenger"],
  "challenger": ["thach dau", "thách đấu"],
  "dai cao thu": ["đại cao thủ", "grandmaster"],
  "đại cao thủ": ["dai cao thu", "grandmaster"],
  "cao thu": ["cao thủ", "master"],
  "cao thủ": ["cao thu", "master"],
};

/**
 * Mở rộng query thành tập hợp các từ khóa liên quan (gồm cả synonym)
 */
export function expandSearchKeywords(query: string): string[] {
  const norm = normalizeSearchQuery(query);
  if (!norm) return [];

  const unaccented = removeVietnameseAccents(norm);
  const result = new Set<string>([norm, unaccented]);

  for (const [key, aliases] of Object.entries(SYNONYM_MAP)) {
    const keyUnaccent = removeVietnameseAccents(key);
    if (norm.includes(key) || unaccented.includes(keyUnaccent)) {
      aliases.forEach((a) => {
        result.add(a);
        result.add(removeVietnameseAccents(a));
      });
    }
  }

  return Array.from(result).filter(Boolean);
}

/**
 * 3 & 4. Tính toán Search Relevance Score theo mức ưu tiên:
 * 1. Mã acc / MS exact match (+150)
 * 2. Exact Title match (+80)
 * 3. Exact Pet / Chibi match (+70)
 * 4. Prefix match trên title / pet (+45)
 * 5. Contains match trên title / pet (+30)
 * 6. Sân Đấu match (+25)
 * 7. Tag / Features / Description match (+15)
 * 8. Trạng thái AVAILABLE (+5 ưu tiên acc còn hàng khi cùng điểm)
 */
export function calculateSearchRelevance(
  account: ScorableAccount,
  query: string
): number {
  const cleanQ = normalizeSearchQuery(query);
  if (!cleanQ) return 0;

  const queryNorm = removeVietnameseAccents(cleanQ);
  const words = queryNorm.split(" ").filter(Boolean);
  if (words.length === 0) return 0;

  let score = 0;

  // Normalized product fields
  const codeNorm = removeVietnameseAccents(account.code);
  const cleanCodeOnly = removeVietnameseAccents(account.code.replace(/[^a-zA-Z0-9]/g, ""));
  const titleNorm = removeVietnameseAccents(account.title);
  const petNorm = removeVietnameseAccents(
    `${account.mainPet || ""} ${(account.allPets || []).join(" ")}`
  );
  const arenaNorm = removeVietnameseAccents(
    `${account.arena || ""} ${(account.allArenas || []).join(" ")}`
  );
  const rankNorm = removeVietnameseAccents(account.rank || "");
  const featuresNorm = removeVietnameseAccents((account.features || []).join(" "));
  const descNorm = removeVietnameseAccents(account.description || "");

  // 1. EXACT MÃ ACC / MS MATCH
  if (
    cleanQ === codeNorm ||
    cleanQ === cleanCodeOnly ||
    queryNorm === codeNorm ||
    queryNorm === cleanCodeOnly ||
    codeNorm.replace("ms", "").trim() === queryNorm.replace("ms", "").trim()
  ) {
    score += 150;
  } else if (codeNorm.includes(queryNorm) || cleanCodeOnly.includes(queryNorm)) {
    score += 90;
  }

  // 2. EXACT TITLE MATCH
  if (titleNorm === queryNorm) {
    score += 80;
  }

  // 3. EXACT PET / CHIBI MATCH
  if (petNorm && (petNorm === queryNorm || petNorm.split(" ").includes(queryNorm))) {
    score += 70;
  }

  // 4. PREFIX MATCH TRÊN TITLE HOẶC PET
  if (titleNorm.startsWith(queryNorm) || (petNorm && petNorm.startsWith(queryNorm))) {
    score += 45;
  }

  // 5. CONTAINS MATCH TRÊN TITLE HOẶC PET
  if (titleNorm.includes(queryNorm)) {
    score += 30;
  }
  if (petNorm && petNorm.includes(queryNorm)) {
    score += 30;
  }

  // 6. SÂN ĐẤU MATCH
  if (arenaNorm) {
    if (arenaNorm === queryNorm) {
      score += 40;
    } else if (arenaNorm.includes(queryNorm)) {
      score += 25;
    }
  }

  // 7. RANK MATCH
  if (rankNorm && (rankNorm === queryNorm || rankNorm.includes(queryNorm))) {
    score += 20;
  }

  // 8. FEATURES / TAG / DESCRIPTION MATCH
  if (featuresNorm.includes(queryNorm)) {
    score += 15;
  }
  if (descNorm.includes(queryNorm)) {
    score += 10;
  }

  // Kiểm tra từng từ (All words match bonus)
  const fullTextNorm = `${codeNorm} ${titleNorm} ${petNorm} ${arenaNorm} ${rankNorm} ${featuresNorm} ${descNorm}`;
  const allWordsMatch = words.every((w) => fullTextNorm.includes(w));
  if (allWordsMatch) {
    score += 20;
  } else {
    // Nếu không khớp toàn bộ từ và cũng không có điểm khớp nào phía trên -> loại bỏ
    if (score === 0) return 0;
  }

  // 9. Ưu tiên acc AVAILABLE nếu điểm ngang bằng
  if (account.status === "AVAILABLE") {
    score += 5;
  }

  return score;
}

/**
 * 5. Danh sách các gợi ý từ khóa có cơ sở thật trong kho (Phase 9 ground truth)
 */
export const VERIFIED_INVENTORY_SUGGESTIONS = [
  { label: "Gwen Tí Nị", query: "Gwen" },
  { label: "Yasuo Tí Nị", query: "Yasuo" },
  { label: "Yone Tí Nị", query: "Yone" },
  { label: "Ahri Tí Nị", query: "Ahri" },
  { label: "Tí Nị Hàng Hiệu", query: "Hàng Hiệu" },
  { label: "Sân Đấu Thần Thoại", query: "Sân Đấu" },
  { label: "Acc Clone", query: "Clone" },
];

/**
 * Gợi ý thông minh khi khách gõ sai hoặc tìm không ra kết quả
 */
export function getSmartSearchSuggestions(failedQuery: string): string[] {
  const norm = removeVietnameseAccents(normalizeSearchQuery(failedQuery));
  if (!norm) {
    return ["Gwen", "Yasuo", "Yone", "Hàng Hiệu", "Sân Đấu"];
  }

  // Kiểm tra typo nhẹ hoặc chuỗi con
  const candidates: { word: string; priority: number }[] = [
    { word: "Gwen", priority: norm.includes("gw") || norm.includes("gen") ? 10 : 1 },
    { word: "Yasuo", priority: norm.includes("ya") || norm.includes("suo") ? 10 : 1 },
    { word: "Yone", priority: norm.includes("yo") || norm.includes("one") ? 10 : 1 },
    { word: "Ahri", priority: norm.includes("ah") || norm.includes("ari") ? 10 : 1 },
    { word: "Hàng Hiệu", priority: norm.includes("hang") || norm.includes("hieu") || norm.includes("pres") ? 10 : 1 },
    { word: "Sân Đấu", priority: norm.includes("san") || norm.includes("dau") || norm.includes("map") ? 10 : 1 },
    { word: "Clone", priority: norm.includes("clo") || norm.includes("smur") ? 10 : 1 },
  ];

  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.slice(0, 4).map((c) => c.word);
}
