"use client";

import React, { useState, useMemo } from "react";
import {
  TFT_PETS_DATABASE,
  TFTPetPreset,
} from "@/data/tft-pets-data";
import toast from "react-hot-toast";
import {
  Search,
  Sparkles,
  Check,
  Plus,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Wand2,
  Zap,
} from "lucide-react";

interface PetPresetSelectorProps {
  category: "VIP" | "CLONE";
  defaultOpen?: boolean;
  selectedFeatures?: string[];
  onToggleFeature?: (featureName: string) => void;
  onSetFeatures?: (features: string[]) => void;
  currentTitle?: string;
  onSetTitle?: (title: string) => void;
  currentThumbnail?: string;
  onSetThumbnail?: (url: string) => void;
  // VIP specific props
  currentMainChibi?: string;
  onSetMainChibi?: (chibi: string) => void;
  currentMainArena?: string;
  onSetMainArena?: (arena: string) => void;
  currentAllChibi?: string[];
  onAddAllChibi?: (chibi: string) => void;
  currentAllArenas?: string[];
  onAddAllArena?: (arena: string) => void;
}

export default function PetPresetSelector({
  category,
  defaultOpen,
  selectedFeatures = [],
  onToggleFeature,
  onSetFeatures,
  currentTitle = "",
  onSetTitle,
  currentThumbnail = "",
  onSetThumbnail,
  currentMainChibi = "",
  onSetMainChibi,
  currentMainArena = "",
  onSetMainArena,
  currentAllChibi = [],
  onAddAllChibi,
  currentAllArenas = [],
  onAddAllArena,
}: PetPresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(
    defaultOpen !== undefined ? defaultOpen : category === "CLONE"
  );
  const [activeTab, setActiveTab] = useState<
    "ALL" | "UNBOUND" | "CHIBI" | "PRESTIGE" | "ARENA" | "FEATURE"
  >(category === "VIP" ? "PRESTIGE" : "ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Lọc danh sách theo Tab và Search Query
  const filteredPets = useMemo(() => {
    let list = TFT_PETS_DATABASE;

    if (activeTab === "PRESTIGE") {
      list = list.filter(
        (item) => item.badge === "HÀNG HIỆU" || item.name.includes("Hàng Hiệu")
      );
    } else if (activeTab !== "ALL") {
      list = list.filter((item) => item.category === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q) ||
          (item.badge && item.badge.toLowerCase().includes(q))
      );
    }

    // Sắp xếp theo bảng chữ cái A-Z
    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
    );
  }, [activeTab, searchQuery]);

  // Kiểm tra item đã được chọn chưa
  const isItemSelected = (item: TFTPetPreset) => {
    if (category === "CLONE") {
      return selectedFeatures.some(
        (f) => f.toLowerCase().trim() === item.name.toLowerCase().trim()
      );
    } else {
      // VIP
      if (item.category === "UNBOUND" || item.category === "CHIBI" || item.category === "LITTLE_LEGEND") {
        return (
          currentMainChibi.toLowerCase().trim() ===
            item.name.toLowerCase().trim() ||
          currentAllChibi.some(
            (c) => c.toLowerCase().trim() === item.name.toLowerCase().trim()
          )
        );
      }
      if (item.category === "ARENA") {
        return (
          currentMainArena.toLowerCase().trim() ===
            item.name.toLowerCase().trim() ||
          currentAllArenas.some(
            (a) => a.toLowerCase().trim() === item.name.toLowerCase().trim()
          )
        );
      }
      return selectedFeatures.some(
        (f) => f.toLowerCase().trim() === item.name.toLowerCase().trim()
      );
    }
  };

  // Click vào item
  const handleItemClick = (item: TFTPetPreset) => {
    if (category === "CLONE") {
      if (onToggleFeature) {
        onToggleFeature(item.name);
      }
      // Cập nhật tiêu đề bằng chính xác tên Pet/Sân Đấu
      if (
        onSetTitle &&
        (!currentTitle ||
          currentTitle === "Acc Clone" ||
          currentTitle.includes("Acc Unranked") ||
          currentTitle.includes("Acc "))
      ) {
        if (item.category === "UNBOUND" || item.category === "CHIBI" || item.category === "LITTLE_LEGEND" || item.category === "ARENA") {
          onSetTitle(item.name);
        }
      }
      if (item.thumbnail && onSetThumbnail && !currentThumbnail) {
        onSetThumbnail(item.thumbnail);
      }
    } else {
      // VIP category
      if (item.category === "UNBOUND" || item.category === "CHIBI" || item.category === "LITTLE_LEGEND") {
        if (onSetMainChibi) {
          onSetMainChibi(item.name);
        }
        if (item.thumbnail && onSetThumbnail) {
          onSetThumbnail(item.thumbnail);
        }
        toast.success(`Đã chọn: ${item.name} & gán ảnh đại diện!`);
      } else if (item.category === "ARENA") {
        if (onSetMainArena) {
          onSetMainArena(item.name);
        }
        toast.success(`Đã chọn sân đấu chính: ${item.name}`);
      } else if (onToggleFeature) {
        onToggleFeature(item.name);
      }
    }
  };

  // Quick Preset Packs
  const applyPresetPack = (
    packType:
      | "JINX_UNBOUND"
      | "WARWICK_UNBOUND"
      | "STANDARD_CLONE"
      | "FULL_LEVEL"
      | "AHRI_COMBO"
      | "YASUO_COMBO"
      | "YASUO_PRESTIGE"
      | "YONE_PRESTIGE"
      | "LEESIN_PRESTIGE"
      | "ANNIE_PRESTIGE"
  ) => {
    if (packType === "YASUO_PRESTIGE") {
      const name = "Yasuo Long Kiếm Tí Nị - Hàng Hiệu";
      const thumb = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyasuo_prestige_prestige1_tier1.png";
      if (category === "VIP" && onSetMainChibi) onSetMainChibi(name);
      if (category === "CLONE" && onSetTitle) onSetTitle(name);
      if (onSetThumbnail) onSetThumbnail(thumb);
      if (onSetFeatures) onSetFeatures(Array.from(new Set([...selectedFeatures, name, "Tài Khoản Trắng Thông Tin 100%"])));
      toast.success("Đã áp dụng mẫu: Yasuo Long Kiếm Hàng Hiệu!");
    } else if (packType === "YONE_PRESTIGE") {
      const name = "Yone Thần Kiếm Tí Nị - Hàng Hiệu";
      const thumb = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyone_dawnbringer_dawnbringer_tier1.png";
      if (category === "VIP" && onSetMainChibi) onSetMainChibi(name);
      if (category === "CLONE" && onSetTitle) onSetTitle(name);
      if (onSetThumbnail) onSetThumbnail(thumb);
      if (onSetFeatures) onSetFeatures(Array.from(new Set([...selectedFeatures, name, "Tài Khoản Trắng Thông Tin 100%"])));
      toast.success("Đã áp dụng mẫu: Yone Thần Kiếm Hàng Hiệu!");
    } else if (packType === "LEESIN_PRESTIGE") {
      const name = "Lee Tiểu Long Tí Nị - Hàng Hiệu";
      const thumb = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibileesin_dragonfist_dragonfist1_tier1.png";
      if (category === "VIP" && onSetMainChibi) onSetMainChibi(name);
      if (category === "CLONE" && onSetTitle) onSetTitle(name);
      if (onSetThumbnail) onSetThumbnail(thumb);
      if (onSetFeatures) onSetFeatures(Array.from(new Set([...selectedFeatures, name, "Tài Khoản Trắng Thông Tin 100%"])));
      toast.success("Đã áp dụng mẫu: Lee Tiểu Long Hàng Hiệu!");
    } else if (packType === "ANNIE_PRESTIGE") {
      const name = "Arcane Annie Fan Cứng Tí Nị - Hàng Hiệu";
      const thumb = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiannie_bluehaired_bluehaired_tier1.png";
      if (category === "VIP" && onSetMainChibi) onSetMainChibi(name);
      if (category === "CLONE" && onSetTitle) onSetTitle(name);
      if (onSetThumbnail) onSetThumbnail(thumb);
      if (onSetFeatures) onSetFeatures(Array.from(new Set([...selectedFeatures, name, "Tài Khoản Trắng Thông Tin 100%"])));
      toast.success("Đã áp dụng mẫu: Annie Fan Cứng Hàng Hiệu!");
    } else if (packType === "JINX_UNBOUND") {
      const jinxPack = [
        "Arcane Jinx Đột Phá",
        "Tài Khoản Trắng Thông Tin 100%",
        "Bảo Hành Vĩnh Viễn Trọn Đời Uy Tín",
      ];
      if (onSetFeatures) {
        onSetFeatures(Array.from(new Set([...selectedFeatures, ...jinxPack])));
      }
      if (onSetTitle) {
        onSetTitle("Arcane Jinx Đột Phá");
      }
      if (onSetThumbnail) {
        onSetThumbnail(
          "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwojinx_carbs2_carbs2_tier1.png"
        );
      }
      if (category === "VIP" && onSetMainChibi) {
        onSetMainChibi("Arcane Jinx Đột Phá");
      }
      toast.success("Đã áp dụng mẫu: Arcane Jinx Đột Phá!");
    } else if (packType === "WARWICK_UNBOUND") {
      const warwickPack = [
        "Arcane Warwick Đột Phá",
        "Tài Khoản Trắng Thông Tin 100%",
        "Bảo Hành Vĩnh Viễn Trọn Đời Uy Tín",
      ];
      if (onSetFeatures) {
        onSetFeatures(Array.from(new Set([...selectedFeatures, ...warwickPack])));
      }
      if (onSetTitle) {
        onSetTitle("Arcane Warwick Đột Phá");
      }
      if (onSetThumbnail) {
        onSetThumbnail(
          "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_styletwowarwick_carbs2_carbs2_tier1.png"
        );
      }
      if (category === "VIP" && onSetMainChibi) {
        onSetMainChibi("Arcane Warwick Đột Phá");
      }
      toast.success("Đã áp dụng mẫu: Arcane Warwick Đột Phá!");
    } else if (packType === "STANDARD_CLONE") {
      const standard = [
        "Tài Khoản Trắng Thông Tin 100%",
        "Rank Unranked Sạch Đẹp MMR",
        "Bảo Hành Vĩnh Viễn Trọn Đời Uy Tín",
      ];
      if (onSetFeatures) {
        onSetFeatures(Array.from(new Set([...selectedFeatures, ...standard])));
      }
      if (onSetTitle && (!currentTitle || currentTitle === "Acc Clone")) {
        onSetTitle("Unranked Trắng Thông Tin");
      }
    } else if (packType === "FULL_LEVEL") {
      const full = [
        "Tài Khoản Trắng Thông Tin 100%",
        "Acc Level 30+ Đầy Đủ Tính Năng",
        "Sẵn 20.000+ Tinh Hoa Lam Đổi Tên",
        "Bảo Hành Vĩnh Viễn Trọn Đời Uy Tín",
      ];
      if (onSetFeatures) {
        onSetFeatures(Array.from(new Set([...selectedFeatures, ...full])));
      }
      if (onSetTitle && (!currentTitle || currentTitle === "Acc Clone")) {
        onSetTitle("Level 30+ 20k Tinh Hoa Lam");
      }
    } else if (packType === "AHRI_COMBO") {
      const ahriPack = [
        "Ahri Chiêu Hồn Thiên Hồ Tí Nị",
        "Tài Khoản Trắng Thông Tin 100%",
        "Bảo Hành Vĩnh Viễn Trọn Đời Uy Tín",
      ];
      if (onSetFeatures) {
        onSetFeatures(Array.from(new Set([...selectedFeatures, ...ahriPack])));
      }
      if (onSetTitle) {
        onSetTitle("Ahri Chiêu Hồn Thiên Hồ Tí Nị");
      }
      if (onSetThumbnail) {
        onSetThumbnail(
          "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiahri_blossom_blossom1_tier1.png"
        );
      }
      if (category === "VIP" && onSetMainChibi) {
        onSetMainChibi("Ahri Chiêu Hồn Thiên Hồ Tí Nị");
      }
    } else if (packType === "YASUO_COMBO") {
      const yasuoPack = [
        "Yasuo Long Kiếm Tí Nị",
        "Tài Khoản Trắng Thông Tin 100%",
        "Bảo Hành Vĩnh Viễn Trọn Đời Uy Tín",
      ];
      if (onSetFeatures) {
        onSetFeatures(Array.from(new Set([...selectedFeatures, ...yasuoPack])));
      }
      if (onSetTitle) {
        onSetTitle("Yasuo Long Kiếm Tí Nị");
      }
      if (onSetThumbnail) {
        onSetThumbnail(
          "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/loadouts/companions/tooltip_chibiyasuo_dragonmancer_dragonmancer1_tier1.png"
        );
      }
      if (category === "VIP" && onSetMainChibi) {
        onSetMainChibi("Yasuo Long Kiếm Tí Nị");
      }
    }
  };

  return (
    <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-amber-50/50 shadow-sm overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-3 sm:p-3.5 bg-gradient-to-r from-amber-100/90 via-orange-100/80 to-amber-100/90 border-b border-amber-200/80 flex items-center justify-between gap-2">
        <div
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-black text-xs sm:text-sm text-slate-900 tracking-tight">
                {category === "VIP"
                  ? "🐾 Kho Pet, Linh Thú & Ảnh Hàng Hiệu"
                  : "🐾 Kho Pet / Linh Thú / Sân Đấu Có Sẵn"}
              </h4>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-600 text-white font-bold text-[9px]">
                {category === "VIP" ? "💎 PHỤ TRỢ VIP & HÀNG HIỆU" : `${TFT_PETS_DATABASE.length} MẪU`}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] ${
                  isOpen
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isOpen ? "ĐANG HIỆN" : "ĐANG ẨN (BẤM ĐỂ MỞ)"}
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium truncate">
              {category === "VIP"
                ? "Công cụ phụ trợ: Bấm chọn Pet / Hàng Hiệu để tự động lấy ảnh đẹp & điền Tướng chính"
                : "Bấm 1-chạm để thêm nhanh vào danh sách đặc điểm & tiêu đề tài khoản"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-amber-300 shadow-xs cursor-pointer transition-all flex items-center gap-1 flex-shrink-0"
        >
          <span>{isOpen ? "Ẩn Phụ Trợ" : "Hiện Phụ Trợ"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-3 sm:p-3.5 space-y-3">
          {/* Quick Preset Packs Bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-orange-600" />
              <span>Gói Thiết Lập Nhanh 1-Chạm (Quick Presets):</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
              {category === "VIP" ? (
                <>
                  <button
                    type="button"
                    onClick={() => applyPresetPack("YASUO_PRESTIGE")}
                    className="p-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-amber-900 group-hover:text-amber-700 truncate flex items-center gap-1">
                      <span>💎 Yasuo HH</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Long Kiếm + Ảnh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("YONE_PRESTIGE")}
                    className="p-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-amber-900 group-hover:text-amber-700 truncate flex items-center gap-1">
                      <span>💎 Yone HH</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Thần Kiếm + Ảnh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("LEESIN_PRESTIGE")}
                    className="p-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-amber-900 group-hover:text-amber-700 truncate flex items-center gap-1">
                      <span>💎 Lee Sin HH</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Tiểu Long + Ảnh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("ANNIE_PRESTIGE")}
                    className="p-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-400 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-amber-900 group-hover:text-amber-700 truncate flex items-center gap-1">
                      <span>💎 Annie HH</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Fan Cứng + Ảnh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("JINX_UNBOUND")}
                    className="p-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 group-hover:text-rose-700 truncate flex items-center gap-1">
                      <span>⚡ Jinx ĐP</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Arcane + Ảnh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("WARWICK_UNBOUND")}
                    className="p-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 group-hover:text-purple-700 truncate flex items-center gap-1">
                      <span>🐺 Warwick ĐP</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Arcane + Ảnh
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => applyPresetPack("JINX_UNBOUND")}
                    className="p-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 group-hover:text-rose-700 truncate flex items-center gap-1">
                      <span>⚡ Jinx Đột Phá</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Arcane + Ảnh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("WARWICK_UNBOUND")}
                    className="p-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 group-hover:text-purple-700 truncate flex items-center gap-1">
                      <span>🐺 Warwick ĐP</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Arcane + Ảnh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("AHRI_COMBO")}
                    className="p-1.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 group-hover:text-orange-700 truncate flex items-center gap-1">
                      <span>🦊 Tí Nị Ahri</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Chiêu Hồn + Ảnh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("YASUO_COMBO")}
                    className="p-1.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 group-hover:text-orange-700 truncate flex items-center gap-1">
                      <span>🗡️ Tí Nị Yasuo</span>
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Long Kiếm + Ảnh
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("STANDARD_CLONE")}
                    className="p-1.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 group-hover:text-orange-700 truncate">
                      🛡️ Clone Trắng
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Trắng TT + Sạch
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPresetPack("FULL_LEVEL")}
                    className="p-1.5 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-left cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="text-[10px] font-bold text-slate-900 group-hover:text-orange-700 truncate">
                      ⭐ Clone Level 30+
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      Sẵn 20k THL
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search & Category Filter Tabs */}
          <div className="space-y-2 pt-1 border-t border-amber-200/60">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh: Đột Phá, Jinx, Warwick, Ahri, Yasuo, Pengu, EDM..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Category Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === "ALL"
                    ? "bg-orange-600 text-white shadow-2xs"
                    : "bg-white/90 text-slate-700 hover:bg-white border border-slate-200"
                }`}
              >
                🌟 Tất Cả ({TFT_PETS_DATABASE.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("UNBOUND")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === "UNBOUND"
                    ? "bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-2xs"
                    : "bg-white/90 text-rose-700 hover:bg-rose-50 border border-rose-200"
                }`}
              >
                ⚡ Đột Phá (
                {
                  TFT_PETS_DATABASE.filter((p) => p.category === "UNBOUND")
                    .length
                }
                )
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("CHIBI")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === "CHIBI"
                    ? "bg-orange-600 text-white shadow-2xs"
                    : "bg-white/90 text-slate-700 hover:bg-white border border-slate-200"
                }`}
              >
                👑 Tí Nị (
                {TFT_PETS_DATABASE.filter((p) => p.category === "CHIBI").length}
                )
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PRESTIGE")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === "PRESTIGE"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 shadow-2xs font-black"
                    : "bg-white/90 text-amber-800 hover:bg-amber-50 border border-amber-200"
                }`}
              >
                💎 Hàng Hiệu (
                {
                  TFT_PETS_DATABASE.filter(
                    (p) =>
                      p.badge === "HÀNG HIỆU" || p.name.includes("Hàng Hiệu")
                  ).length
                }
                )
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ARENA")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === "ARENA"
                    ? "bg-orange-600 text-white shadow-2xs"
                    : "bg-white/90 text-slate-700 hover:bg-white border border-slate-200"
                }`}
              >
                🏛️ Sân Đấu (
                {TFT_PETS_DATABASE.filter((p) => p.category === "ARENA").length}
                )
              </button>
              {category !== "VIP" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("FEATURE")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                    activeTab === "FEATURE"
                      ? "bg-orange-600 text-white shadow-2xs"
                      : "bg-white/90 text-slate-700 hover:bg-white border border-slate-200"
                  }`}
                >
                  🛡️ Đặc Điểm (
                  {
                    TFT_PETS_DATABASE.filter((p) => p.category === "FEATURE")
                      .length
                  }
                  )
                </button>
              )}
            </div>
          </div>

          {/* Pets & Items Grid */}
          <div className="max-h-56 sm:max-h-64 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
            {filteredPets.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                Không tìm thấy linh thú hoặc đặc điểm nào phù hợp với &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredPets.map((item) => {
                  const selected = isItemSelected(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group select-none ${
                        selected
                          ? "bg-orange-600 text-white border-orange-700 shadow-xs"
                          : "bg-white hover:bg-orange-50/80 border-slate-200 text-slate-800 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {item.thumbnail ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/10 flex-shrink-0 border border-black/10 relative">
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-orange-100/80 flex items-center justify-center flex-shrink-0 text-base">
                            {item.category === "UNBOUND"
                              ? "⚡"
                              : item.category === "CHIBI"
                              ? "👑"
                              : item.category === "LITTLE_LEGEND"
                              ? "🐧"
                              : item.category === "ARENA"
                              ? "🏟️"
                              : "🛡️"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-xs font-bold truncate ${
                                selected ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[8px] font-black px-1 py-0.2 rounded uppercase ${
                                  selected
                                    ? "bg-white/20 text-white"
                                    : item.category === "UNBOUND"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[9px] block ${
                              selected ? "text-orange-100" : "text-slate-400"
                            }`}
                          >
                            {item.categoryLabel}
                          </span>
                        </div>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.thumbnail && onSetThumbnail && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetThumbnail(item.thumbnail!);
                              toast.success(`Đã lấy ảnh đại diện: ${item.name}`);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                              selected
                                ? "bg-white/20 text-white hover:bg-white/30"
                                : "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300/80 shadow-2xs"
                            }`}
                            title="Lấy link ảnh này làm Thumbnail tài khoản"
                          >
                            <ImageIcon className="w-3 h-3 text-amber-700" />
                            <span className="hidden sm:inline text-[9px]">Lấy Ảnh</span>
                          </button>
                        )}

                        {category === "VIP" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.category === "ARENA") {
                                if (onAddAllArena) onAddAllArena(item.name);
                                toast.success(`Đã thêm sân đấu: ${item.name}`);
                              } else {
                                if (onAddAllChibi) onAddAllChibi(item.name);
                                toast.success(`Đã thêm tướng: ${item.name}`);
                              }
                            }}
                            className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              selected
                                ? "bg-white/20 text-white hover:bg-white/30"
                                : "bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-700 border border-slate-200"
                            }`}
                            title="Thêm vào danh sách Linh Thú / Sân Đấu kèm theo"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}

                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                            selected
                              ? "bg-white text-orange-600 shadow-xs"
                              : "bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600"
                          }`}
                          title={selected ? "Đã chọn" : "Bấm để chọn"}
                        >
                          {selected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
