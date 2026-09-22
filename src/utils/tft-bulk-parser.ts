import { TFT_PETS_DATABASE, TFTPetPreset } from "@/data/tft-pets-data";

export interface ParsedCloneAccount {
  id: string;
  rawLine: string;
  code: string;
  title: string;
  petName: string;
  category: "UNBOUND" | "CHIBI" | "LITTLE_LEGEND" | "ARENA";
  categoryLabel: string;
  badge?: string;
  thumbnail: string;
  price: number;
  weeklyPrice: number;
  monthlyPrice: number;
  periodPrice: number;
  periodUnit: string;
  priceDisplayType: "LONG_TERM" | "HOURLY" | "DAILY" | "CUSTOM" | "AUTO";
  rankBadge: string;
  features: string[];
  description: string;
  matchedPreset?: TFTPetPreset;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Remove Vietnamese accents/diacritics for flexible fuzzy searching
 */
export function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * Smart price parser: supports 150k, 150.000đ, 150000, 150 vnđ, 180, 250k...
 */
export function parseTftPrice(rawPrice: string | number): number {
  if (typeof rawPrice === "number") {
    if (rawPrice > 0 && rawPrice < 1000) return rawPrice * 1000;
    return rawPrice;
  }

  if (!rawPrice) return 150000;

  const cleaned = rawPrice
    .toString()
    .toLowerCase()
    .replace(/đ|vnd|vnđ|d|\$|\s/g, "")
    .replace(/,/g, "")
    .trim();

  // If contains 'k' or 'cành'
  if (cleaned.endsWith("k") || cleaned.endsWith("c") || cleaned.includes("k")) {
    const numPart = parseFloat(cleaned.replace(/[^\d.]/g, ""));
    if (!isNaN(numPart)) {
      return Math.round(numPart * 1000);
    }
  }

  // If contains dots as thousand separators (e.g., 150.000)
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    const withoutDots = cleaned.replace(/\./g, "");
    const parsed = parseInt(withoutDots, 10);
    if (!isNaN(parsed)) return parsed;
  }

  const numericOnly = parseFloat(cleaned.replace(/[^\d.]/g, ""));
  if (isNaN(numericOnly)) return 150000;

  // If user typed 150 (meaning 150k)
  if (numericOnly > 0 && numericOnly < 1000) {
    return Math.round(numericOnly * 1000);
  }

  return Math.round(numericOnly);
}

/**
 * Match a raw query string against the 199 items in TFT_PETS_DATABASE
 */
export function matchTftPetOrArena(query: string): {
  preset: TFTPetPreset;
  confidence: number;
} {
  const normQuery = removeVietnameseTones(query);
  const words = normQuery.split(/[\s\-_\/|:,]+/).filter((w) => w.length > 1);

  let bestMatch: TFTPetPreset = TFT_PETS_DATABASE[0];
  let highestScore = -1;

  for (const item of TFT_PETS_DATABASE) {
    if (item.category === "FEATURE") continue;

    const normName = removeVietnameseTones(item.name);
    let score = 0;

    // 1. Exact match
    if (normName === normQuery) {
      score += 1000;
    }
    // 2. Contains full query or item name
    else if (normName.includes(normQuery) || normQuery.includes(normName)) {
      score += 200;
      // Penalize if the length difference is too large to avoid generic partial matches winning
      const lenDiff = Math.abs(normName.length - normQuery.length);
      score -= lenDiff * 2;
    }

    // 3. Word matching & key terms bonus
    let matchedWordCount = 0;
    for (const w of words) {
      // Use word boundaries or whole word matches if possible, but basic includes is okay since we split by words
      if (normName.includes(w)) {
        matchedWordCount++;
        score += 10;
      }
    }
    
    // Penalize unmatched words in the target pet name
    const itemWords = normName.split(/[\s\-_\/|:,]+/).filter((w) => w.length > 1);
    const unmatchedItemWords = Math.max(0, itemWords.length - matchedWordCount);
    score -= unmatchedItemWords * 5;

    // Bonus for category match
    if (
      (normQuery.includes("dot pha") || normQuery.includes("unbound") || normQuery.includes("arcane")) &&
      item.category === "UNBOUND"
    ) {
      score += 25;
    }
    if (
      (normQuery.includes("chibi") || normQuery.includes("ti ni")) &&
      item.category === "CHIBI"
    ) {
      score += 20;
    }
    if (
      (normQuery.includes("san") || normQuery.includes("arena") || normQuery.includes("san dau")) &&
      item.category === "ARENA"
    ) {
      score += 25;
    }
    if (
      (normQuery.includes("linh thu") || normQuery.includes("pet") || normQuery.includes("3 sao")) &&
      item.category === "LITTLE_LEGEND"
    ) {
      score += 15;
    }

    // Specific key character matching
    const keyChampions = [
      "jinx", "warwick", "yasuo", "jhin", "lee sin", "garen", "darius", "irelia",
      "vayne", "pyke", "katarina", "leblanc", "lucian", "senna", "thresh", "mordekaiser",
      "aphelios", "ahri", "kaisa", "gwen", "aatrox", "akali", "yone", "zed", "lux",
      "morgana", "sona", "teemo", "sett", "caitlyn", "vi", "ezreal", "ashe", "tristana",
      "malphite", "sivir", "annie", "ekko", "pengu", "choncc", "poro", "dowsie", "ao shin",
      "fuwa", "shisa", "dango", "kda", "k/da", "edm", "urf"
    ];

    for (const champ of keyChampions) {
      const normChamp = removeVietnameseTones(champ);
      // Check word boundaries for champ to avoid false positives (e.g. "vi" matching "sivir")
      const champRegex = new RegExp(`\\b${normChamp}\\b`, 'i');
      if (champRegex.test(normQuery) && champRegex.test(normName)) {
        score += 30;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return {
    preset: bestMatch,
    confidence: Math.min(100, Math.max(10, highestScore)),
  };
}

/**
 * Parse a single line from text or TXT file into a Clone Account
 */
export function parseSingleTxtLine(
  line: string,
  index: number
): ParsedCloneAccount | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
    return null;
  }

  // Split by common delimiters: | or \t or ; or - or , or :
  let parts: string[] = [];

  if (trimmed.includes("|")) {
    parts = trimmed.split("|").map((p) => p.trim());
  } else if (trimmed.includes("\t")) {
    parts = trimmed.split("\t").map((p) => p.trim());
  } else if (trimmed.includes(";")) {
    parts = trimmed.split(";").map((p) => p.trim());
  } else if (trimmed.includes(" - ")) {
    parts = trimmed.split(" - ").map((p) => p.trim());
  } else if (trimmed.includes(":")) {
    const colonIdx = trimmed.indexOf(":");
    parts = [trimmed.slice(0, colonIdx).trim(), trimmed.slice(colonIdx + 1).trim()];
  } else if (trimmed.includes(",")) {
    parts = trimmed.split(",").map((p) => p.trim());
  } else {
    // If no delimiter, look for price pattern at the end (e.g. "Arcane Jinx Đột Phá 150k")
    const match = trimmed.match(/^(.+?)\s+([\d.,]+[kKđĐ]?|\d{5,})$/);
    if (match) {
      parts = [match[1].trim(), match[2].trim()];
    } else {
      parts = [trimmed, "150000"];
    }
  }

  const rawPetName = parts[0] || "";
  const rawPrice = parts[1] || "150000";
  const rawRank = parts[2] || "UNRANKED";
  const rawCode = parts[3] || "";

  if (!rawPetName) return null;

  const { preset } = matchTftPetOrArena(rawPetName);
  const parsedPrice = parseTftPrice(rawPrice);

  const code = rawCode.trim() || `CLONE-${Math.floor(1000 + Math.random() * 9000)}`;
  const rankBadge = rawRank.trim() || "UNRANKED";
  const category = (preset.category === "FEATURE" ? "CHIBI" : preset.category) as
    | "UNBOUND"
    | "CHIBI"
    | "LITTLE_LEGEND"
    | "ARENA";

  const petDisplayName = preset.name || rawPetName;
  const title = petDisplayName;
  const thumbnail =
    preset.thumbnail ||
    "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyasuo_dragonmancer_dragonmancer1_tier1.png";

  const weeklyPrice = Math.round((parsedPrice * 0.35) / 1000) * 1000 || 50000;
  const monthlyPrice = parsedPrice;
  const periodPrice = parsedPrice;

  const defaultFeatures: string[] = [];

  return {
    id: `temp-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    rawLine: trimmed,
    code,
    title,
    petName: petDisplayName,
    category,
    categoryLabel: preset.categoryLabel || "Tướng Tí Nị",
    badge: preset.badge,
    thumbnail,
    price: parsedPrice,
    weeklyPrice,
    monthlyPrice,
    periodPrice,
    periodUnit: " / ∞",
    priceDisplayType: "LONG_TERM",
    rankBadge,
    features: defaultFeatures,
    description: `Tài khoản Clone ĐTCL sở hữu ${petDisplayName}, tài khoản sạch sẽ, bảo mật trọn đời.`,
    matchedPreset: preset,
    isValid: true,
  };
}

/**
 * Parse an entire text block or .txt file contents into list of Clone Accounts
 */
export function parseBulkTxtContent(rawText: string): ParsedCloneAccount[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/);
  const results: ParsedCloneAccount[] = [];

  lines.forEach((line, idx) => {
    const parsed = parseSingleTxtLine(line, idx);
    if (parsed) {
      results.push(parsed);
    }
  });

  return results;
}

/**
 * Sample template for 1-click test in UI
 */
export const SAMPLE_BULK_TXT_DATA = `Arcane Jinx Đột Phá | 180k | UNRANKED
Arcane Warwick Đột Phá | 180.000đ | UNRANKED
Tí Nị Ahri Chiêu Hồn | 160k | RANK ĐỒNG
Tí Nị Yasuo Long Kiếm | 150k | UNRANKED
Sân Khấu K/DA Đồng Quy Giới | 190.000 | ACC TRẮNG TT 100%
Tí Nị Gwen Búp Bê Trà Sữa | 150k | UNRANKED
Pengu Cánh Cụt Bụ Bẫm 3 Sao | 120.000đ | UNRANKED
Warwick Đột Phá | 170k | UNRANKED
Sân Đấu Tiệm Trà Tâm Linh EDM | 195k | UNRANKED
Tí Nị Aatrox Cuồng Kiếm Sát Thần | 160k | UNRANKED`;
