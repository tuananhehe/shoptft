"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  getVipAndCloneAccounts,
  createAccountApi,
  updateAccountApi,
  deleteAccountApi,
  bulkUpdateAccountsApi,
  bulkDeleteAccountsApi,
  toLocalDatetimeInputString,
  formatRentalExpiry,
} from "@/utils/supabase/accounts-service";
import { getHomepageConfig, PricingConfig } from "@/utils/homepage-service";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  X,
  Layers,
  Crown,
  Gamepad2,
  Loader2,
  RefreshCw,
  ArrowUpDown,
  CheckSquare,
  Square,
  Check,
  Zap,
} from "lucide-react";

export type AccountCategoryType = "VIP" | "CLONE";

export interface UnifiedAdminAccount {
  id: string;
  category: AccountCategoryType;
  code: string;
  title: string;
  thumbnail: string;
  status: "AVAILABLE" | "RENTED";
  rentedUntil?: string | null; // ISO string format thời gian trả acc
  price?: number;

  // Thuộc tính riêng cho Acc VIP
  mainChibi?: string;
  allChibi?: string[];
  mainArena?: string;
  allArenas?: string[];
  rank?:
    | "THÁCH ĐẤU"
    | "ĐẠI CAO THỦ"
    | "CAO THỦ"
    | "KIM CƯƠNG"
    | "LỤC BẢO"
    | "VÀNG/BẠCH KIM"
    | "BẠC"
    | "ĐỒNG"
    | "SẮT"
    | "KHÔNG RANK"
    | string;
  accountValue?: number;
  hourlyPrice?: number;
  dailyPrice?: number;

  // Thuộc tính riêng cho Acc Clone / Smurf
  rankBadge?: string;
  features?: string[];
  periodPrice?: number;
  periodUnit?: string;
  weeklyPrice?: number;
  monthlyPrice?: number;
  description?: string;
}

// Helper format thời gian: "22:30, 15/10/2026" hoặc "Vô Cực (999 Ngày)"
const formatRentedUntil = (isoDateStr?: string | null) => {
  if (!isoDateStr) return "";
  const info = formatRentalExpiry(isoDateStr);
  return info ? info.expiryFormatted : "";
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<UnifiedAdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkRentalModalOpen, setBulkRentalModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkQuickHours, setBulkQuickHours] = useState<number>(2);
  const [bulkCustomEndTime, setBulkCustomEndTime] = useState<string>("");

  // Tab lọc danh mục kho hàng: "ALL" | "VIP" | "CLONE"
  const [activeTab, setActiveTab] = useState<"ALL" | "VIP" | "CLONE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "RENTED">("ALL");
  const [rankFilter, setRankFilter] = useState("ALL");
  const [sortFilter, setSortFilter] = useState<"DEFAULT" | "PRICE_ASC" | "PRICE_DESC">("DEFAULT");

  // State cho Modal "Thiết lập thời gian cho thuê đơn lẻ"
  const [statusModalAccount, setStatusModalAccount] = useState<UnifiedAdminAccount | null>(null);
  const [quickDurationHours, setQuickDurationHours] = useState<number>(2);
  const [customEndTime, setCustomEndTime] = useState<string>("");

  // State cho Modal Confirm Xóa Acc đơn lẻ
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<UnifiedAdminAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State cho Drawer Thêm / Sửa Acc
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UnifiedAdminAccount | null>(null);

  // Form State bên trong Drawer
  const [formCategory, setFormCategory] = useState<AccountCategoryType>("VIP");
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Fields for VIP
  const [formRank, setFormRank] = useState<UnifiedAdminAccount["rank"]>("THÁCH ĐẤU");
  const [formAccountValue, setFormAccountValue] = useState<number>(850000);
  const [formHourlyPrice, setFormHourlyPrice] = useState<number>(15000);
  const [isAutoPricing, setIsAutoPricing] = useState<boolean>(true);
  const [pricingRates, setPricingRates] = useState<PricingConfig>({
    passChangeFee: 20000,
    rate2Hours: 3,
    rate7Days: 12,
    rate30Days: 30,
  });

  const [formMainChibi, setFormMainChibi] = useState("");
  const [formMainArena, setFormMainArena] = useState("");
  const [formAllChibi, setFormAllChibi] = useState<string[]>([]);
  const [formAllArenas, setFormAllArenas] = useState<string[]>([]);
  const [extraChibiInput, setExtraChibiInput] = useState("");
  const [extraArenaInput, setExtraArenaInput] = useState("");

  // Helper tính giá thuê 1 giờ tự động theo % định giá acc: [(Giá acc * 3%) + 20k] / 2
  const calcHourlyFromValue = (val: number, rate2h = pricingRates.rate2Hours, passFee = pricingRates.passChangeFee) => {
    if (!val || isNaN(val) || val <= 0) return 15000;
    const pkg2h = (val * (rate2h / 100)) + passFee;
    return Math.round((pkg2h / 2) / 1000) * 1000;
  };

  const handleAccountValueChange = (val: number) => {
    setFormAccountValue(val);
    if (isAutoPricing) {
      const calculated = calcHourlyFromValue(val, pricingRates.rate2Hours, pricingRates.passChangeFee);
      setFormHourlyPrice(calculated);
    }
  };

  // Fields for Clone
  const [formRankBadge, setFormRankBadge] = useState("UNRANKED");
  const [formWeeklyPrice, setFormWeeklyPrice] = useState<number>(50000);
  const [formMonthlyPrice, setFormMonthlyPrice] = useState<number>(150000);
  const [formFeatures, setFormFeatures] = useState<string[]>([
    "Tài Khoản An Toàn 100%",
    "Hỗ Trợ Bàn Giao Thông Về Khách",
    "Sẵn Sản Phẩm Như Mô Tả 100%",
  ]);
  const [formFeatureInput, setFormFeatureInput] = useState("");

  // ============================================================
  // 1. FETCH DANH SÁCH TÀI KHOẢN TỪ BACKEND / SUPABASE
  // ============================================================
  const fetchAccounts = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    try {
      const { vipAccounts, cloneAccounts } = await getVipAndCloneAccounts();
      const vipList: UnifiedAdminAccount[] = (vipAccounts || []).map((acc) => ({
        ...acc,
        category: "VIP" as const,
      }));
      const cloneList: UnifiedAdminAccount[] = (cloneAccounts || []).map((acc) => ({
        ...acc,
        category: "CLONE" as const,
      }));
      setAccounts([...vipList, ...cloneList]);
    } catch (err) {
      console.error("Lỗi khi tải danh sách tài khoản:", err);
      toast.error("Không thể kết nối với Database!");
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(true);
    getHomepageConfig().then((cfg) => {
      if (cfg?.pricing) {
        setPricingRates(cfg.pricing);
      }
    });
  }, []);

  // Thống kê số liệu nhanh
  const stats = useMemo(() => {
    const total = accounts.length;
    const vipCount = accounts.filter((a) => a.category === "VIP").length;
    const cloneCount = accounts.filter((a) => a.category === "CLONE").length;
    const available = accounts.filter((a) => a.status === "AVAILABLE").length;
    const rented = accounts.filter((a) => a.status === "RENTED").length;
    const totalValue = accounts.reduce((sum, a) => {
      if (a.category === "VIP") {
        return sum + (a.accountValue || (a.dailyPrice || 60000) * 16 || 850000);
      }
      return sum + (a.monthlyPrice || 150000);
    }, 0);

    return { total, vipCount, cloneCount, available, rented, totalValue };
  }, [accounts]);

  // Bộ lọc danh sách tài khoản theo tab, tìm kiếm, trạng thái, rank, sắp xếp giá
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter((acc) => {
        if (activeTab === "VIP" && acc.category !== "VIP") return false;
        if (activeTab === "CLONE" && acc.category !== "CLONE") return false;

        if (statusFilter !== "ALL") {
          const isRented = (acc.status || "").toUpperCase() === "RENTED";
          if (statusFilter === "RENTED" && !isRented) return false;
          if (statusFilter === "AVAILABLE" && isRented) return false;
        }

        if (rankFilter !== "ALL") {
          const rankStr = ((acc.category === "VIP" ? acc.rank : acc.rankBadge) || "").toUpperCase();
          if (rankFilter === "VÀNG/BẠCH KIM") {
            if (!rankStr.includes("VÀNG") && !rankStr.includes("BẠCH KIM")) return false;
          } else if (rankFilter === "ĐỒNG") {
            if (!rankStr.includes("ĐỒNG") && !rankStr.includes("SẮT")) return false;
          } else if (!rankStr.includes(rankFilter.toUpperCase())) {
            return false;
          }
        }

        if (searchTerm.trim() !== "") {
          const query = searchTerm.toLowerCase();
          const codeMatch = acc.code.toLowerCase().includes(query);
          const titleMatch = acc.title.toLowerCase().includes(query);
          const chibiMatch = acc.mainChibi?.toLowerCase().includes(query);
          const arenaMatch = acc.mainArena?.toLowerCase().includes(query);
          const badgeMatch = acc.rankBadge?.toLowerCase().includes(query);

          if (!codeMatch && !titleMatch && !chibiMatch && !arenaMatch && !badgeMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const getPrice = (item: UnifiedAdminAccount) => {
          if (item.category === "VIP") return item.hourlyPrice || 0;
          return item.price || item.periodPrice || item.monthlyPrice || 0;
        };

        if (sortFilter === "PRICE_ASC") {
          return getPrice(a) - getPrice(b);
        }
        if (sortFilter === "PRICE_DESC") {
          return getPrice(b) - getPrice(a);
        }
        return 0;
      });
  }, [accounts, activeTab, statusFilter, rankFilter, sortFilter, searchTerm]);

  // ============================================================
  // 2. MULTI-SELECT & BATCH ACTIONS (THAO TÁC HÀNG LOẠT)
  // ============================================================
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (filteredAccounts.length === 0) return;
    const allVisibleIds = filteredAccounts.map((a) => a.id);
    const isAllSelected = allVisibleIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      // Bỏ chọn tất cả các acc đang hiển thị
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      // Chọn tất cả các acc đang hiển thị
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allVisibleIds])));
    }
  };

  const handleSelectAvailable = () => {
    const availableIds = filteredAccounts
      .filter((a) => a.status === "AVAILABLE")
      .map((a) => a.id);
    setSelectedIds(availableIds);
    toast.success(`Đã chọn ${availableIds.length} tài khoản SẴN SÀNG!`);
  };

  const handleSelectRented = () => {
    const rentedIds = filteredAccounts
      .filter((a) => a.status === "RENTED")
      .map((a) => a.id);
    setSelectedIds(rentedIds);
    toast.success(`Đã chọn ${rentedIds.length} tài khoản ĐANG CHO THUÊ!`);
  };

  // 2.1 BATCH MARK AVAILABLE (TRẢ ACC / ĐẶT SẴN SÀNG HÀNG LOẠT)
  const handleBulkMarkAvailable = async () => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(`Đang chuyển ${selectedIds.length} tài khoản sang SẴN SÀNG...`);
    setIsBulkUpdating(true);

    const res = await bulkUpdateAccountsApi(selectedIds, {
      status: "AVAILABLE",
      rented_until: null,
    });

    if (res.success) {
      toast.success(`✅ Đã chuyển ${selectedIds.length} tài khoản sang trạng thái SẴN SÀNG!`, {
        id: toastId,
      });
      setSelectedIds([]);
      await fetchAccounts(false);
    } else {
      toast.error(`Lỗi cập nhật: ${res.error}`, { id: toastId });
    }
    setIsBulkUpdating(false);
  };

  // 2.2 BATCH OPEN RENTAL MODAL
  const handleBulkOpenRentalModal = () => {
    if (selectedIds.length === 0) return;
    setBulkQuickHours(2);
    const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
    setBulkCustomEndTime(toLocalDatetimeInputString(d));
    setBulkRentalModalOpen(true);
  };

  // 2.3 BATCH APPLY RENTAL DURATION
  const handleBulkApplyRentalDuration = async () => {
    if (selectedIds.length === 0) return;
    let targetIso = "";
    if (bulkQuickHours > 0) {
      const d = new Date(Date.now() + bulkQuickHours * 60 * 60 * 1000);
      targetIso = d.toISOString();
    } else if (bulkCustomEndTime) {
      const d = new Date(bulkCustomEndTime);
      targetIso = d.toISOString();
    }

    const toastId = toast.loading(`Đang đặt thời gian thuê cho ${selectedIds.length} tài khoản...`);
    setIsBulkUpdating(true);

    const res = await bulkUpdateAccountsApi(selectedIds, {
      status: "RENTED",
      rented_until: targetIso,
    });

    if (res.success) {
      toast.success(`✅ Đã chuyển ${selectedIds.length} tài khoản sang trạng thái ĐANG THUÊ!`, {
        id: toastId,
      });
      setBulkRentalModalOpen(false);
      setSelectedIds([]);
      await fetchAccounts(false);
    } else {
      toast.error(`Lỗi cập nhật: ${res.error}`, { id: toastId });
    }
    setIsBulkUpdating(false);
  };

  // 2.4 BATCH SWITCH CATEGORY (VIP <-> CLONE)
  const handleBulkSwitchCategory = async (targetCategory: AccountCategoryType) => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(
      `Đang chuyển ${selectedIds.length} tài khoản sang kho ${targetCategory}...`
    );
    setIsBulkUpdating(true);

    const res = await bulkUpdateAccountsApi(selectedIds, {
      type: targetCategory,
    });

    if (res.success) {
      toast.success(`✅ Đã chuyển ${selectedIds.length} tài khoản sang kho ${targetCategory}!`, {
        id: toastId,
      });
      setSelectedIds([]);
      await fetchAccounts(false);
    } else {
      toast.error(`Lỗi cập nhật: ${res.error}`, { id: toastId });
    }
    setIsBulkUpdating(false);
  };

  // 2.5 BATCH CONFIRM DELETE
  const handleBulkConfirmDelete = async () => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(`Đang xóa ${selectedIds.length} tài khoản khỏi Database...`);
    setIsBulkUpdating(true);

    const res = await bulkDeleteAccountsApi(selectedIds);

    if (res.success) {
      toast.success(`✅ Đã xóa ${selectedIds.length} tài khoản thành công!`, { id: toastId });
      setBulkDeleteModalOpen(false);
      setSelectedIds([]);
      await fetchAccounts(false);
    } else {
      toast.error(`Lỗi khi xóa: ${res.error}`, { id: toastId });
    }
    setIsBulkUpdating(false);
  };

  // ============================================================
  // 3. XỬ LÝ GẠT SWITCH TRẠNG THÁI ĐƠN LẺ
  // ============================================================
  const handleToggleChange = async (account: UnifiedAdminAccount) => {
    if (account.status === "AVAILABLE") {
      setStatusModalAccount(account);
      const defaultDurationHours = account.category === "CLONE" ? 23976 : 24;
      const defaultDate = new Date(Date.now() + defaultDurationHours * 60 * 60 * 1000);
      setCustomEndTime(toLocalDatetimeInputString(defaultDate));
      setQuickDurationHours(defaultDurationHours);
    } else {
      // Chuyển về AVAILABLE
      const toastId = toast.loading(`Đang cập nhật ${account.code}...`);
      const res = await updateAccountApi({
        id: account.id,
        code: account.code,
        status: "AVAILABLE",
        rented_until: null,
      });

      if (res.success) {
        toast.success(`Đã chuyển ${account.code} sang trạng thái SẴN SÀNG!`, { id: toastId });
        await fetchAccounts(false);
      } else {
        toast.error(`Lỗi cập nhật: ${res.error}`, { id: toastId });
      }
    }
  };

  const handleApplyDuration = async () => {
    if (!statusModalAccount) return;
    let targetIso = "";
    if (quickDurationHours > 0) {
      const d = new Date(Date.now() + quickDurationHours * 60 * 60 * 1000);
      targetIso = d.toISOString();
    } else if (customEndTime) {
      const d = new Date(customEndTime);
      targetIso = d.toISOString();
    }

    const toastId = toast.loading(`Đang cập nhật ${statusModalAccount.code}...`);
    const res = await updateAccountApi({
      id: statusModalAccount.id,
      code: statusModalAccount.code,
      status: "RENTED",
      rented_until: targetIso,
    });

    if (res.success) {
      toast.success(`Đã chuyển ${statusModalAccount.code} sang trạng thái ĐANG THUÊ!`, {
        id: toastId,
      });
      setStatusModalAccount(null);
      await fetchAccounts(false);
    } else {
      toast.error(`Lỗi cập nhật: ${res.error}`, { id: toastId });
    }
  };

  // ============================================================
  // 4. MỞ DRAWER THÊM MỚI & CHỈNH SỬA
  // ============================================================
  const openAddDrawer = (defaultCategory: AccountCategoryType = "VIP") => {
    setEditingAccount(null);
    setFormCategory(defaultCategory);
    setFormCode(defaultCategory === "VIP" ? "MS: " : "CLONE-");
    setFormTitle("");
    setFormThumbnail("");
    setFormDescription("Tài khoản chính chủ hoạt động tốt.");

    // Reset VIP fields
    const defaultAccVal = 850000;
    setFormRank("THÁCH ĐẤU");
    setFormAccountValue(defaultAccVal);
    setFormHourlyPrice(calcHourlyFromValue(defaultAccVal, pricingRates.rate2Hours, pricingRates.passChangeFee));
    setIsAutoPricing(true);
    setFormMainChibi("");
    setFormMainArena("");
    setFormAllChibi([]);
    setFormAllArenas([]);
    setExtraChibiInput("");
    setExtraArenaInput("");

    // Reset Clone fields
    setFormRankBadge("UNRANKED");
    setFormWeeklyPrice(50000);
    setFormMonthlyPrice(150000);
    setFormFeatures([
      "Tài Khoản An Toàn 100%",
      "Hỗ Trợ Bàn Giao Thông Về Khách",
      "Sẵn Sản Phẩm Như Mô Tả 100%",
    ]);
    setFormFeatureInput("");

    setDrawerOpen(true);
  };

  const openEditDrawer = (account: UnifiedAdminAccount) => {
    setEditingAccount(account);
    setFormCategory(account.category);
    setFormCode(account.code);
    setFormTitle(account.title);
    setFormThumbnail(account.thumbnail);
    setFormDescription(account.description || "");

    if (account.category === "VIP") {
      const accVal = account.accountValue || 850000;
      const mainChibi = account.mainChibi || account.allChibi?.[0] || "";
      const mainArena = account.mainArena || account.allArenas?.[0] || "";
      const allChibi = Array.isArray(account.allChibi) && account.allChibi.length > 0
        ? account.allChibi
        : (mainChibi ? [mainChibi] : []);
      const allArenas = Array.isArray(account.allArenas) && account.allArenas.length > 0
        ? account.allArenas
        : (mainArena ? [mainArena] : []);

      setFormRank(account.rank || "THÁCH ĐẤU");
      setFormAccountValue(accVal);
      setFormHourlyPrice(account.hourlyPrice || calcHourlyFromValue(accVal, pricingRates.rate2Hours, pricingRates.passChangeFee));
      setIsAutoPricing(false);
      setFormMainChibi(mainChibi);
      setFormMainArena(mainArena);
      setFormAllChibi(allChibi);
      setFormAllArenas(allArenas);
      setExtraChibiInput("");
      setExtraArenaInput("");
    } else {
      setFormRankBadge(account.rankBadge || "UNRANKED");
      setFormWeeklyPrice(account.weeklyPrice || 50000);
      setFormMonthlyPrice(account.monthlyPrice || account.periodPrice || 150000);
      setFormFeatures(
        Array.isArray(account.features) && account.features.length > 0
          ? account.features
          : [
              "Tài Khoản An Toàn 100%",
              "Hỗ Trợ Bàn Giao Thông Về Khách",
              "Sẵn Sản Phẩm Như Mô Tả 100%",
            ]
      );
      setFormFeatureInput("");
    }

    setDrawerOpen(true);
  };

  // ============================================================
  // 5. XỬ LÝ SUBMIT (GỌI API POST / PUT LƯU VÀO DATABASE)
  // ============================================================
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCode.trim()) {
      toast.error("Vui lòng nhập Mã Số tài khoản!");
      return;
    }

    if (formCategory === "VIP" && !formMainChibi.trim()) {
      toast.error("Vui lòng nhập Tướng Tí Nị / Linh Thú chính!");
      return;
    }

    // Xử lý danh sách Linh Thú: Đảm bảo Linh Thú chính luôn đứng đầu tiên và không bị lặp
    const cleanedMainChibi = formMainChibi.trim();
    const otherChibis = formAllChibi
      .map((c) => (c || "").trim())
      .filter((c) => c && c.toLowerCase() !== cleanedMainChibi.toLowerCase());
    const finalChibis = cleanedMainChibi ? [cleanedMainChibi, ...otherChibis] : otherChibis;

    // Xử lý danh sách Sân Đấu: Đảm bảo Sân Đấu chính luôn đứng đầu tiên và không bị lặp
    const cleanedMainArena = formMainArena.trim() || "Sân Đấu Thần Thoại";
    const otherArenas = formAllArenas
      .map((a) => (a || "").trim())
      .filter((a) => a && a.toLowerCase() !== cleanedMainArena.toLowerCase());
    const finalArenas = [cleanedMainArena, ...otherArenas];

    // Xử lý giá theo giờ tự động nếu không nhập
    const finalHourlyPrice = formHourlyPrice > 0
      ? formHourlyPrice
      : calcHourlyFromValue(formAccountValue, pricingRates.rate2Hours, pricingRates.passChangeFee);

    const effectiveTitle =
      formCategory === "VIP"
        ? formTitle.trim() || `${formRank} - ${cleanedMainChibi || "Tí Nị VIP"}`
        : formTitle.trim() || `Acc Clone ${formRankBadge}`;

    const payload: any = {
      code: formCode.trim(),
      type: formCategory,
      title: effectiveTitle,
      rank: formCategory === "VIP" ? formRank : formRankBadge,
      price: formCategory === "VIP" ? formAccountValue : formMonthlyPrice,
      hourly_price: formCategory === "VIP" ? finalHourlyPrice : 0,
      weekly_price: formCategory === "CLONE" ? formWeeklyPrice : 0,
      period_price: formCategory === "CLONE" ? formMonthlyPrice : 0,
      champions: formCategory === "VIP" ? finalChibis : [],
      arenas: formCategory === "VIP" ? finalArenas : [],
      features: formCategory === "CLONE" ? formFeatures : [],
      image_url:
        formThumbnail.trim() ||
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
      status: "AVAILABLE",
      description: formDescription.trim() || "Tài khoản chính chủ chất lượng cao.",
    };

    setIsSubmitting(true);

    try {
      if (editingAccount) {
        // CẬP NHẬT TÀI KHOẢN (PUT)
        payload.id = editingAccount.id;
        const res = await updateAccountApi(payload);

        if (res.success) {
          toast.success(`Đã cập nhật tài khoản ${formCode} thành công!`);
          setDrawerOpen(false);
          await fetchAccounts(false);
        } else {
          toast.error(`Lỗi cập nhật: ${res.error}`);
        }
      } else {
        // THÊM TÀI KHOẢN MỚI (POST)
        const res = await createAccountApi(payload);

        if (res.success) {
          toast.success(`Đã thêm tài khoản mới ${formCode} vào Database thành công!`);
          setDrawerOpen(false);
          await fetchAccounts(false);
        } else {
          toast.error(`Lỗi thêm tài khoản: ${res.error}`);
        }
      }
    } catch (err: any) {
      console.error("Lỗi submit tài khoản:", err);
      toast.error(err.message || "Đã xảy ra lỗi khi gửi yêu cầu lên máy chủ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // 6. XỬ LÝ XÓA TÀI KHOẢN ĐƠN LẺ
  // ============================================================
  const handleConfirmDelete = async () => {
    if (!deleteConfirmAccount) return;
    setIsDeleting(true);

    try {
      const res = await deleteAccountApi(deleteConfirmAccount.id, deleteConfirmAccount.code);
      if (res.success) {
        toast.success(`Đã xóa tài khoản ${deleteConfirmAccount.code} khỏi Database!`);
        setDeleteConfirmAccount(null);
        await fetchAccounts(false);
      } else {
        toast.error(`Lỗi khi xóa: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa tài khoản!");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAllVisibleSelected =
    filteredAccounts.length > 0 &&
    filteredAccounts.every((a) => selectedIds.includes(a.id));

  return (
    <div className="space-y-6">
      {/* 1. THỐNG KÊ NHANH KHO HÀNG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Tổng Tài Khoản
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1 block">
              {stats.total}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              👑 {stats.vipCount} VIP • 🎮 {stats.cloneCount} Clone
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-100/70 text-orange-700 flex items-center justify-center flex-shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Sẵn Sàng Thuê (Trống)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono mt-1 block">
              {stats.available}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">
              Đang hiển thị trên Shop
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Đang Cho Thuê
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-600 font-mono mt-1 block">
              {stats.rented}
            </span>
            <span className="text-[11px] text-rose-600 font-medium block mt-1">
              Khách đang trải nghiệm
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100/70 text-rose-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
              Tổng Giá Trị Kho
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
              {stats.totalValue.toLocaleString("vi-VN")}đ
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Ước tính định giá tài sản
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. THANH ĐIỀU HƯỚNG TABS KHO HÀNG & NÚT THÊM ACC */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Cụm Tabs Kho Hàng */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit flex-wrap">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ALL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tất Cả ({stats.total})</span>
            </button>

            <button
              onClick={() => setActiveTab("VIP")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "VIP"
                  ? "bg-orange-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-orange-700"
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Kho Acc VIP ({stats.vipCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("CLONE")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "CLONE"
                  ? "bg-sky-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-sky-700"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Kho Clone / Smurf ({stats.cloneCount})</span>
            </button>
          </div>

          {/* Cụm Nút Thêm Mới & Reload */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAccounts(true)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Làm mới danh sách từ Database"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-orange-600" : ""}`} />
            </button>

            <button
              onClick={() => openAddDrawer(activeTab === "CLONE" ? "CLONE" : "VIP")}
              className="px-4 py-2.5 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-700/20 flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Tài Khoản Mới</span>
            </button>
          </div>
        </div>

        {/* Thanh Bộ Lọc & Tìm Kiếm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="lg:col-span-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mã số (MS: 8899, CLONE-01), Tướng Tí Nị, Sân Đấu, Rank..."
              className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="lg:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">Tất Cả Trạng Thái</option>
              <option value="AVAILABLE">🟢 Sẵn Sàng ({stats.available})</option>
              <option value="RENTED">🔴 Đang Cho Thuê ({stats.rented})</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">Tất Cả Bậc Rank</option>
              <option value="THÁCH ĐẤU">Thách Đấu</option>
              <option value="ĐẠI CAO THỦ">Đại Cao Thủ</option>
              <option value="CAO THỦ">Cao Thủ</option>
              <option value="KIM CƯƠNG">Kim Cương</option>
              <option value="LỤC BẢO">Lục Bảo</option>
              <option value="VÀNG/BẠCH KIM">Vàng / Bạch Kim</option>
              <option value="BẠC">Bạc</option>
              <option value="ĐỒNG">Đồng</option>
              <option value="KHÔNG RANK">Không Rank / Unranked</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value as any)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="DEFAULT">Sắp Xếp Giá</option>
              <option value="PRICE_ASC">Giá: Thấp ↗ Cao</option>
              <option value="PRICE_DESC">Giá: Cao ↘ Thấp</option>
            </select>
          </div>
        </div>

        {/* Thanh Chọn Nhanh (Quick Select Helpers) */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[11px] text-slate-700">Chọn nhanh:</span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
            >
              {isAllVisibleSelected ? "Bỏ chọn tất cả" : "Chọn tất cả hiển thị"}
            </button>

            <button
              type="button"
              onClick={handleSelectAvailable}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold cursor-pointer border border-emerald-200"
            >
              Chọn Acc Trống ({stats.available})
            </button>

            <button
              type="button"
              onClick={handleSelectRented}
              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold cursor-pointer border border-rose-200"
            >
              Chọn Acc Đang Thuê ({stats.rented})
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 font-bold text-[11px] cursor-pointer"
              >
                Hủy chọn
              </button>
            )}
          </div>

          <div className="text-[11px] font-mono font-semibold">
            Hiển thị <span className="text-slate-900 font-bold">{filteredAccounts.length}</span> tài khoản
          </div>
        </div>
      </div>

      {/* 2.5 THANH THAO TÁC HÀNG LOẠT NỔI BẬT (BULK ACTION FLOATING TOOLBAR) */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn sticky top-4 z-30">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              {selectedIds.length}
            </span>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Đã chọn {selectedIds.length} tài khoản</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  Hàng loạt
                </span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Thực hiện thao tác đồng thời 1 lần giúp tiết kiệm tối đa thời gian
              </span>
            </div>
          </div>

          {/* Cụm nút thao tác hàng loạt */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            {/* 1. Đặt Sẵn Sàng (Trống) */}
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={handleBulkMarkAvailable}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
              title="Chuyển tất cả acc đã chọn sang trạng thái SẴN SÀNG"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đặt Sẵn Sàng</span>
            </button>

            {/* 2. Cho Thuê Đồng Loạt */}
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={handleBulkOpenRentalModal}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
              title="Đặt thời gian cho thuê đồng loạt cho các acc đã chọn"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Cho Thuê Đồng Loạt</span>
            </button>

            {/* 3. Chuyển sang VIP */}
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => handleBulkSwitchCategory("VIP")}
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
              title="Chuyển sang kho Acc VIP"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Sang VIP</span>
            </button>

            {/* 4. Chuyển sang Clone */}
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => handleBulkSwitchCategory("CLONE")}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
              title="Chuyển sang kho Acc Clone"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Sang Clone</span>
            </button>

            {/* 5. Xóa Hàng Loạt */}
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => setBulkDeleteModalOpen(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
              title="Xóa tất cả tài khoản đã chọn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ({selectedIds.length})</span>
            </button>

            {/* Bỏ chọn */}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Bỏ chọn tất cả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. BẢNG QUẢN LÝ TÀI KHOẢN TỔNG HỢP (KẾT NỐI DATABASE) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                {/* Checkbox Header */}
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                    title="Chọn / Bỏ chọn tất cả"
                  />
                </th>
                <th className="py-3.5 px-4">Loại & Mã</th>
                <th className="py-3.5 px-4">Hình Ảnh</th>
                <th className="py-3.5 px-4 min-w-[260px]">Thông Tin Tài Khoản</th>
                <th className="py-3.5 px-4">Giá Thuê</th>
                <th className="py-3.5 px-4 min-w-[180px]">Trạng Thái (Gạt Bật/Tắt)</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-slate-700 text-xs">
                        Đang tải danh sách tài khoản từ Database...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => {
                  const isRented = account.status === "RENTED";
                  const isVip = account.category === "VIP";
                  const isSelected = selectedIds.includes(account.id);

                  return (
                    <tr
                      key={account.id}
                      className={`transition-colors group ${
                        isSelected
                          ? "bg-orange-50/70 hover:bg-orange-50"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* Cột Checkbox */}
                      <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(account.id)}
                          className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                        />
                      </td>

                      {/* Cột 1: Loại Kho & Mã Acc */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              isVip
                                ? "bg-orange-100 text-orange-800 border border-orange-200"
                                : "bg-sky-100 text-sky-800 border border-sky-200"
                            }`}
                          >
                            {isVip ? "👑 VIP" : "🎮 CLONE"}
                          </span>
                          <div className="font-bold text-xs text-slate-800 font-mono">
                            {account.code}
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Hình Ảnh Vuông */}
                      <td className="py-4 px-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0 shadow-sm">
                          <img
                            src={account.thumbnail}
                            alt={account.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Cột 3: THÔNG TIN TÀI KHOẢN */}
                      <td className="py-4 px-4">
                        {isVip ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-700 border border-orange-200">
                                {account.rank}
                              </span>
                              {account.allChibi && account.allChibi.length > 1 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  +{account.allChibi.length} Tí Nị
                                </span>
                              )}
                            </div>

                            <strong className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-orange-700 transition-colors block">
                              {account.mainChibi}
                            </strong>

                            <p className="text-xs text-slate-500 line-clamp-1 font-medium flex items-center gap-1">
                              <span>🏟️</span>
                              <span>{account.mainArena}</span>
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-100 text-sky-700 border border-sky-200">
                                {account.rankBadge}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                Dài Hạn
                              </span>
                            </div>

                            <strong className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-sky-700 transition-colors block">
                              {account.title}
                            </strong>

                            <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                              • {account.features?.[0] || "Tài Khoản An Toàn 100%"}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Cột 4: Giá Thuê */}
                      <td className="py-4 px-4">
                        {isVip ? (
                          <div className="space-y-1">
                            <div className="font-mono font-bold text-sm text-slate-900">
                              {(account.hourlyPrice || 15000).toLocaleString("vi-VN")}đ
                              <span className="text-[10px] text-slate-500 font-normal">/h</span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {(account.dailyPrice || (account.hourlyPrice || 15000) * 4).toLocaleString("vi-VN")}đ/ngày
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-mono font-bold text-sm text-sky-700">
                              {(account.monthlyPrice || account.periodPrice || 150000).toLocaleString("vi-VN")}đ
                              <span className="text-[10px] text-slate-500 font-normal"> / ∞</span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {(account.weeklyPrice || 50000).toLocaleString("vi-VN")}đ/tuần
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Cột 5: Trạng Thái Cho Thuê (Gạt Switch) */}
                      <td className="py-4 px-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleToggleChange(account)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isRented ? "bg-rose-500" : "bg-emerald-500"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isRented ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>

                            <span
                              className={`font-bold text-xs ${
                                isRented ? "text-rose-600" : "text-emerald-700"
                              }`}
                            >
                              {isRented ? "Đang Cho Thuê" : "Sẵn Sàng"}
                            </span>
                          </div>

                          {/* Hiển thị thời gian hết hạn */}
                          {isRented && account.rentedUntil && (
                            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md max-w-fit">
                              <Clock className="w-3 h-3 text-rose-500 flex-shrink-0" />
                              <span>Đến: {formatRentedUntil(account.rentedUntil)}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cột 6: Thao Tác Chỉnh Sửa & Xóa */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditDrawer(account)}
                            className="p-2 text-slate-400 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                            title="Chỉnh sửa tài khoản"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmAccount(account)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Xóa tài khoản khỏi Database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <p className="text-sm font-semibold text-slate-700">
                      Không tìm thấy tài khoản nào phù hợp với bộ lọc!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("ALL");
                        setSearchTerm("");
                        setStatusFilter("ALL");
                        setRankFilter("ALL");
                      }}
                      className="mt-2 text-xs font-bold text-orange-700 hover:underline cursor-pointer"
                    >
                      Đặt lại bộ lọc tìm kiếm
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MODAL CHO THUÊ ĐỒNG LOẠT (BULK RENTAL DURATION MODAL) */}
      {/* ============================================================ */}
      {bulkRentalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Cho Thuê Đồng Loạt ({selectedIds.length} Acc)
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Thiết lập thời gian trả acc cho toàn bộ acc đã chọn
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBulkRentalModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Chọn Nhanh Thời Gian Thuê Chung:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "2 Giờ", hours: 2 },
                  { label: "4 Giờ", hours: 4 },
                  { label: "12 Giờ (Qua Đêm)", hours: 12 },
                  { label: "24 Giờ (1 Ngày)", hours: 24 },
                  { label: "7 Ngày (1 Tuần)", hours: 168 },
                  { label: "30 Ngày (1 Tháng)", hours: 720 },
                  { label: "999 Ngày (Vô Cực ∞)", hours: 23976 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setBulkQuickHours(item.hours);
                      const d = new Date(Date.now() + item.hours * 60 * 60 * 1000);
                      setBulkCustomEndTime(toLocalDatetimeInputString(d));
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      bulkQuickHours === item.hours
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Hoặc Chọn Ngày Giờ Hết Hạn Tùy Chỉnh:
              </label>
              <input
                type="datetime-local"
                value={bulkCustomEndTime}
                onChange={(e) => {
                  setBulkCustomEndTime(e.target.value);
                  setBulkQuickHours(0);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkRentalModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isBulkUpdating}
                onClick={handleBulkApplyRentalDuration}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isBulkUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Áp Dụng Cho {selectedIds.length} Acc</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4.1 MODAL CHO THUÊ ĐƠN LẺ */}
      {/* ============================================================ */}
      {statusModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Thiết Lập Thời Gian Cho Thuê
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Tài khoản: {statusModalAccount.code} ({statusModalAccount.title})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStatusModalAccount(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Chọn Nhanh Gói Thuê:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "2 Giờ", hours: 2 },
                  { label: "4 Giờ", hours: 4 },
                  { label: "12 Giờ (Qua Đêm)", hours: 12 },
                  { label: "24 Giờ (1 Ngày)", hours: 24 },
                  { label: "7 Ngày (1 Tuần)", hours: 168 },
                  { label: "30 Ngày (1 Tháng)", hours: 720 },
                  { label: "+999 Ngày (Vô Cực ∞)", hours: 23976 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setQuickDurationHours(item.hours);
                      const d = new Date(Date.now() + item.hours * 60 * 60 * 1000);
                      setCustomEndTime(toLocalDatetimeInputString(d));
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      quickDurationHours === item.hours
                        ? "bg-orange-700 text-white border-orange-700 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Hoặc Chọn Hạn Trả Tùy Chỉnh:
              </label>
              <input
                type="datetime-local"
                value={customEndTime}
                onChange={(e) => {
                  setCustomEndTime(e.target.value);
                  setQuickDurationHours(0);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalAccount(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleApplyDuration}
                className="flex-1 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shadow-orange-700/20"
              >
                Xác Nhận Cho Thuê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL CONFIRM XÓA NHIỀU TÀI KHOẢN (BULK DELETE MODAL) */}
      {/* ============================================================ */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">
                Xóa {selectedIds.length} Tài Khoản?
              </h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa vĩnh viễn <strong>{selectedIds.length} tài khoản</strong> đã chọn khỏi Database Supabase? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isBulkUpdating}
                onClick={() => setBulkDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isBulkUpdating}
                onClick={handleBulkConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isBulkUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xóa {selectedIds.length} Acc</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5.1 MODAL CONFIRM XÓA ĐƠN LẺ */}
      {/* ============================================================ */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">
                Xác Nhận Xóa Tài Khoản?
              </h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa tài khoản <strong>{deleteConfirmAccount.code}</strong> khỏi Database? Hành động này sẽ xóa vĩnh viễn trên Supabase.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmAccount(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Đang Xóa..." : "Xóa Vĩnh Viễn"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. DRAWER THÊM / SỬA TÀI KHOẢN (GỌI API POST / PUT LƯU VÀO DB) */}
      {/* ============================================================ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              <form onSubmit={handleSaveAccount} className="flex flex-col h-full">
                {/* Header Drawer */}
                <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {editingAccount ? "Chỉnh Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        Lưu trực tiếp vào Database Supabase
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Drawer */}
                <div className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
                  {/* Chọn Loại Kho: VIP vs CLONE */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">
                      Phân Loại Kho Hàng: <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormCategory("VIP");
                          if (!editingAccount && (!formCode || formCode.startsWith("CLONE-") || formCode === "CLONE-")) {
                            setFormCode("MS: ");
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formCategory === "VIP"
                            ? "bg-orange-50 border-orange-600 text-orange-950 font-bold shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                        }`}
                      >
                        <Crown className="w-4 h-4 text-orange-600 mb-1" />
                        <div>Acc VIP (Theo Giờ)</div>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Tướng Tí Nị + Sân Đấu Thần Thoại
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormCategory("CLONE");
                          if (!editingAccount && (!formCode || formCode.startsWith("MS: ") || formCode === "MS: ")) {
                            setFormCode("CLONE-");
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formCategory === "CLONE"
                            ? "bg-sky-50 border-sky-600 text-sky-950 font-bold shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                        }`}
                      >
                        <Gamepad2 className="w-4 h-4 text-sky-600 mb-1" />
                        <div>Acc Clone / Smurf</div>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Thuê Dài Hạn Full Info
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Mã Số & Tiêu Đề */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">
                        Mã Số (Code): <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value)}
                        placeholder={formCategory === "VIP" ? "MS: 8899" : "CLONE-01"}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">
                        {formCategory === "VIP" ? "Bậc Rank:" : "Loại Rank:"}
                      </label>
                      {formCategory === "VIP" ? (
                        <select
                          value={formRank}
                          onChange={(e) => setFormRank(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                        >
                          <option value="THÁCH ĐẤU">Thách Đấu</option>
                          <option value="ĐẠI CAO THỦ">Đại Cao Thủ</option>
                          <option value="CAO THỦ">Cao Thủ</option>
                          <option value="KIM CƯƠNG">Kim Cương</option>
                          <option value="LỤC BẢO">Lục Bảo</option>
                          <option value="VÀNG/BẠCH KIM">Vàng / Bạch Kim</option>
                          <option value="BẠC">Bạc</option>
                          <option value="ĐỒNG">Đồng</option>
                          <option value="KHÔNG RANK">Không Rank / Unranked</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={formRankBadge}
                          onChange={(e) => setFormRankBadge(e.target.value)}
                          placeholder="UNRANKED / RANK ĐỒNG"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* THUỘC TÍNH RIÊNG ACC VIP */}
                  {formCategory === "VIP" && (
                    <div className="space-y-4 p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80">
                      {/* 1. TƯỚNG TÍ NỊ / LINH THÚ CHÍNH */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-800 block">
                            Tướng Tí Nị / Linh Thú Chính: <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] text-orange-700 font-bold">
                            Hiển thị chính trên thẻ
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          value={formMainChibi}
                          onChange={(e) => setFormMainChibi(e.target.value)}
                          placeholder="vd: Tí Nị Ahri Chiêu Hồn, Tí Nị Yasuo..."
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* 1.1 DANH SÁCH LINH THÚ KÈM THEO */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-800 block">
                          Linh Thú / Tí Nị Kèm Theo (Nhiều Linh Thú):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={extraChibiInput}
                            onChange={(e) => setExtraChibiInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (extraChibiInput.trim()) {
                                  setFormAllChibi((prev) => [...prev, extraChibiInput.trim()]);
                                  setExtraChibiInput("");
                                }
                              }
                            }}
                            placeholder="Nhập tên Linh Thú rồi bấm Enter hoặc Thêm..."
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (extraChibiInput.trim()) {
                                setFormAllChibi((prev) => [...prev, extraChibiInput.trim()]);
                                setExtraChibiInput("");
                              }
                            }}
                            className="px-3 py-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            + Thêm
                          </button>
                        </div>

                        {formAllChibi.filter((c) => c && c.trim().toLowerCase() !== formMainChibi.trim().toLowerCase()).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {formAllChibi
                              .filter((c) => c && c.trim().toLowerCase() !== formMainChibi.trim().toLowerCase())
                              .map((chibi, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-100 text-orange-900 text-[11px] font-bold border border-orange-200"
                                >
                                  <span>{chibi}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormAllChibi((prev) =>
                                        prev.filter((_, i) => i !== idx)
                                      )
                                    }
                                    className="text-orange-600 hover:text-red-700 font-black cursor-pointer ml-1"
                                    title="Xóa linh thú này"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* 2. SÂN ĐẤU THẦN THOẠI CHÍNH */}
                      <div className="space-y-1.5 pt-1 border-t border-orange-200/50">
                        <label className="font-bold text-slate-800 block">
                          Sân Đấu Thần Thoại Chính:
                        </label>
                        <input
                          type="text"
                          value={formMainArena}
                          onChange={(e) => setFormMainArena(e.target.value)}
                          placeholder="vd: Sân Đấu Tiệm Trà Tâm Linh (Đổi Nhạc EDM)..."
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      {/* 2.1 DANH SÁCH SÂN ĐẤU KÈM THEO */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-800 block">
                          Sân Đấu Kèm Theo (Nhiều Sân Đấu):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={extraArenaInput}
                            onChange={(e) => setExtraArenaInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (extraArenaInput.trim()) {
                                  setFormAllArenas((prev) => [...prev, extraArenaInput.trim()]);
                                  setExtraArenaInput("");
                                }
                              }
                            }}
                            placeholder="Nhập tên Sân Đấu rồi bấm Enter hoặc Thêm..."
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (extraArenaInput.trim()) {
                                setFormAllArenas((prev) => [...prev, extraArenaInput.trim()]);
                                setExtraArenaInput("");
                              }
                            }}
                            className="px-3 py-2 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            + Thêm
                          </button>
                        </div>

                        {formAllArenas.filter((a) => a && a.trim().toLowerCase() !== formMainArena.trim().toLowerCase()).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {formAllArenas
                              .filter((a) => a && a.trim().toLowerCase() !== formMainArena.trim().toLowerCase())
                              .map((arena, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-300"
                                >
                                  <span>{arena}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormAllArenas((prev) =>
                                        prev.filter((_, i) => i !== idx)
                                      )
                                    }
                                    className="text-slate-500 hover:text-red-700 font-black cursor-pointer ml-1"
                                    title="Xóa sân đấu này"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* 3. ĐỊNH GIÁ ACC & TỰ ĐỘNG TÍNH GIÁ THUÊ */}
                      <div className="space-y-3 pt-2 border-t border-orange-200/60">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-orange-600" />
                            <span>Định Giá & Tính Giá Thuê Tự Động</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const nextState = !isAutoPricing;
                              setIsAutoPricing(nextState);
                              if (nextState) {
                                const calculated = calcHourlyFromValue(
                                  formAccountValue,
                                  pricingRates.rate2Hours,
                                  pricingRates.passChangeFee
                                );
                                setFormHourlyPrice(calculated);
                                toast.success("Đã bật tự động tính giá theo % định giá!");
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isAutoPricing
                                ? "bg-orange-600 text-white shadow-xs"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                          >
                            <span>⚡ Tự động tính: {isAutoPricing ? "BẬT" : "TẮT"}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-800 block">
                              Định Giá Acc (VNĐ): <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="50000"
                              value={formAccountValue}
                              onChange={(e) => handleAccountValueChange(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                            />
                            <span className="text-[10px] text-slate-500 block">
                              Giá trị gốc của tài khoản
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-slate-800 block">
                                Giá Thuê / Giờ:
                              </label>
                              {isAutoPricing && (
                                <span className="text-[9px] font-bold text-orange-600 uppercase">
                                  Tự động
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              step="1000"
                              value={formHourlyPrice}
                              onChange={(e) => {
                                setFormHourlyPrice(Number(e.target.value));
                                setIsAutoPricing(false);
                              }}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-orange-700 focus:outline-none focus:border-orange-500"
                            />
                            <span className="text-[10px] text-slate-500 block">
                              Hiển thị trên Shop
                            </span>
                          </div>
                        </div>

                        {/* Bảng Minh Họa Xem Trước Các Gói Giá Tự Động */}
                        <div className="bg-white p-3 rounded-xl border border-orange-200/80 space-y-2 text-[11px]">
                          <span className="font-bold text-orange-950 block">
                            📊 Giá các gói thuê tự động (Theo định giá {(Number(formAccountValue) || 0).toLocaleString("vi-VN")}đ):
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-slate-700 font-mono">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <span className="text-[10px] text-slate-500 block font-sans">Gói 2 Giờ (3% + 20k):</span>
                              <strong className="text-red-600 font-bold">
                                {(Math.round(((formAccountValue * (pricingRates.rate2Hours / 100)) + pricingRates.passChangeFee) / 1000) * 1000).toLocaleString("vi-VN")}đ
                              </strong>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <span className="text-[10px] text-slate-500 block font-sans">Gói 7 Ngày (12% + 20k):</span>
                              <strong className="text-red-600 font-bold">
                                {(Math.round(((formAccountValue * (pricingRates.rate7Days / 100)) + pricingRates.passChangeFee) / 1000) * 1000).toLocaleString("vi-VN")}đ
                              </strong>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <span className="text-[10px] text-slate-500 block font-sans">Gói 30 Ngày (30%):</span>
                              <strong className="text-red-600 font-bold">
                                {(Math.round((formAccountValue * (pricingRates.rate30Days / 100)) / 1000) * 1000).toLocaleString("vi-VN")}đ
                              </strong>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <span className="text-[10px] text-slate-500 block font-sans">Gói 999 Ngày (Vô Cực):</span>
                              <strong className="text-purple-700 font-bold">
                                {(Number(formAccountValue) || 0).toLocaleString("vi-VN")}đ
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* THUỘC TÍNH RIÊNG ACC CLONE */}
                  {formCategory === "CLONE" && (
                    <div className="space-y-3 p-3.5 bg-sky-50/60 rounded-2xl border border-sky-200/80">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-800 block">Tiêu Đề Acc Clone:</label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="Acc Unranked Trắng Thông Tin"
                          className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-800 block">Giá Theo Tuần (VNĐ):</label>
                          <input
                            type="number"
                            step="5000"
                            value={formWeeklyPrice}
                            onChange={(e) => setFormWeeklyPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-800 block">Giá Trọn Gói / Vô Cực:</label>
                          <input
                            type="number"
                            step="10000"
                            value={formMonthlyPrice}
                            onChange={(e) => setFormMonthlyPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-sky-700 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Đặc Điểm & Tính Năng Acc Clone */}
                      <div className="space-y-1.5 pt-1 border-t border-sky-200/60">
                        <label className="font-bold text-slate-800 block">
                          Đặc Điểm & Tính Năng Tài Khoản:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formFeatureInput}
                            onChange={(e) => setFormFeatureInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (formFeatureInput.trim()) {
                                  setFormFeatures((prev) => [...prev, formFeatureInput.trim()]);
                                  setFormFeatureInput("");
                                }
                              }
                            }}
                            placeholder="vd: Tài Khoản An Toàn 100%..."
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (formFeatureInput.trim()) {
                                setFormFeatures((prev) => [...prev, formFeatureInput.trim()]);
                                setFormFeatureInput("");
                              }
                            }}
                            className="px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            + Thêm
                          </button>
                        </div>

                        {formFeatures.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {formFeatures.map((feat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 text-[11px] font-bold border border-sky-200"
                              >
                                <span>{feat}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormFeatures((prev) => prev.filter((_, i) => i !== idx))
                                  }
                                  className="text-sky-600 hover:text-red-700 font-black cursor-pointer ml-1"
                                  title="Xóa đặc điểm này"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Link Hình Ảnh Thumbnail */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">Link Ảnh Bìa (Image URL):</label>
                      <input
                        type="text"
                        value={formThumbnail}
                        onChange={(e) => setFormThumbnail(e.target.value)}
                        placeholder="Dán link ảnh bìa tại đây (để trống nếu chưa có)..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-orange-500 text-[11px]"
                      />
                    </div>

                  {/* Mô Tả Chi Tiết */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">Mô Tả Tài Khoản:</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Nhập ghi chú hoặc mô tả nổi bật..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-500 leading-relaxed text-xs"
                    />
                  </div>
                </div>

                {/* Footer Drawer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setDrawerOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-700/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingAccount ? "Lưu Cập Nhật" : "Thêm Vào Database"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
