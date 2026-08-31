"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HomepageConfig,
  HomepageSections,
  HeroConfig,
  HomepageImagesConfig,
  AlertBannerConfig,
  ServicePackageItem,
  FAQConfigItem,
  getHomepageConfig,
  updateHomepageConfig,
  resetHomepageConfig,
} from "@/utils/homepage-service";
import toast from "react-hot-toast";
import {
  Layout,
  Sliders,
  Sparkles,
  Zap,
  Phone,
  HelpCircle,
  Award,
  Users,
  Eye,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Megaphone,
  Layers,
  Star,
  MessageCircle,
  Flame,
  Image as ImageIcon,
  Check,
} from "lucide-react";

export default function AdminHomepageManagerPage() {
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "sections" | "hero" | "images" | "banner" | "services" | "faq"
  >("sections");

  // Form states
  const [sections, setSections] = useState<HomepageSections>({
    hero: true,
    alertBanner: true,
    vipShop: true,
    cloneShop: true,
    about: true,
    services: true,
    reviews: true,
    faq: true,
    floatingChat: true,
  });

  const [hero, setHero] = useState<HeroConfig>({
    badge: "",
    titleLine1: "",
    titleLine2: "",
    titleHighlight: "",
    subtitle: "",
    stats: [],
  });

  const [images, setImages] = useState<HomepageImagesConfig>({
    heroCardImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    heroCardCode: "MS: 8899",
    heroCardChibi: "Tí Nị Ahri Chiêu Hồn + Yasuo Chân Long",
    heroCardArena: "Sân Đấu Thần Thoại Tiệm Trà Tâm Linh (Đổi Nhạc EDM)",
    heroCardPrice: "15.000đ/h",
    avatarUrl: "/avatar.jpg",
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop",
  });

  const [alertBanner, setAlertBanner] = useState<AlertBannerConfig>({
    active: true,
    content: "",
  });

  const [servicePackages, setServicePackages] = useState<ServicePackageItem[]>([]);
  const [faqs, setFaqs] = useState<FAQConfigItem[]>([]);

  // Modal FAQ / Service Package
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQConfigItem | null>(null);
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  const [faqBadge, setFaqBadge] = useState("");
  const [faqCategory, setFaqCategory] = useState("THUE_ACC");

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServicePackageItem | null>(null);
  const [srvTitle, setSrvTitle] = useState("");
  const [srvBadge, setSrvBadge] = useState("");
  const [srvPrice, setSrvPrice] = useState("");
  const [srvPopular, setSrvPopular] = useState(false);
  const [srvFeaturesText, setSrvFeaturesText] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await getHomepageConfig();
    if (data) {
      setConfig(data);
      setSections(data.sections);
      setHero(data.hero);
      if (data.images) {
        setImages(data.images);
      }
      setAlertBanner(data.alertBanner);
      setServicePackages(data.servicePackages || []);
      setFaqs(data.faqs || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    const toastId = toast.loading("Đang lưu toàn bộ cấu hình trang chủ...");

    const payload: HomepageConfig = {
      sections,
      hero,
      images,
      alertBanner,
      servicePackages,
      faqs,
    };

    const res = await updateHomepageConfig(payload);

    if (res.success && res.data) {
      toast.success("✅ Đã lưu cấu hình trang chủ thành công!", { id: toastId });
      setConfig(res.data);
    } else {
      toast.error(`Lỗi: ${res.error}`, { id: toastId });
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!window.confirm("Khôi phục toàn bộ cấu hình trang chủ về mặc định ban đầu?")) {
      return;
    }

    const toastId = toast.loading("Đang khôi phục mặc định...");
    const res = await resetHomepageConfig();

    if (res.success && res.data) {
      toast.success("Đã khôi phục trang chủ về mặc định thành công!", { id: toastId });
      loadData();
    } else {
      toast.error(`Lỗi: ${res.error}`, { id: toastId });
    }
  };

  // Section Switch Handler
  const toggleSection = (key: keyof HomepageSections) => {
    setSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Preset Presets cho Tướng Tí Nị & Sân Đấu
  const tftPresets = [
    {
      name: "Ahri Chiêu Hồn + Yasuo Chân Long",
      arena: "Sân Đấu Thần Thoại Tiệm Trà Tâm Linh (Đổi Nhạc EDM)",
      code: "MS: 8899",
      price: "15.000đ/h",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    },
    {
      name: "Lee Sin Long Thần + Sông Băng",
      arena: "Sân Đấu Điện Thờ Long Tộc Thần Thoại",
      code: "MS: 9966",
      price: "15.000đ/h",
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop",
    },
    {
      name: "Yone Kiếm Khách Bóng Ma + Akali K/DA",
      arena: "Sân Đấu Sàn Nhảy Neon K/DA Vũ Trụ",
      code: "MS: 7788",
      price: "18.000đ/h",
      imageUrl: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1000&auto=format&fit=crop",
    },
    {
      name: "Zed Siêu Phẩm + Aatrox Đoạt Mệnh",
      arena: "Sân Đấu Thành Phố Công Nghệ Hextech 3.0",
      code: "MS: 6688",
      price: "16.000đ/h",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    },
  ];

  const applyPreset = (p: typeof tftPresets[0]) => {
    setImages((prev) => ({
      ...prev,
      heroCardImage: p.imageUrl,
      heroCardCode: p.code,
      heroCardChibi: p.name,
      heroCardArena: p.arena,
      heroCardPrice: p.price,
    }));
    toast.success(`Đã áp dụng mẫu: ${p.name}`);
  };

  // FAQ Modal Handlers
  const openAddFaq = () => {
    setEditingFaq(null);
    setFaqQ("");
    setFaqA("");
    setFaqBadge("Mới");
    setFaqCategory("THUE_ACC");
    setFaqModalOpen(true);
  };

  const openEditFaq = (f: FAQConfigItem) => {
    setEditingFaq(f);
    setFaqQ(f.q);
    setFaqA(f.a);
    setFaqBadge(f.badge || "");
    setFaqCategory(f.category);
    setFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQ.trim() || !faqA.trim()) {
      toast.error("Vui lòng nhập câu hỏi và câu trả lời!");
      return;
    }

    if (editingFaq) {
      setFaqs((prev) =>
        prev.map((item) =>
          item.id === editingFaq.id
            ? { ...item, q: faqQ.trim(), a: faqA.trim(), badge: faqBadge.trim(), category: faqCategory }
            : item
        )
      );
      toast.success("Đã cập nhật câu hỏi FAQ!");
    } else {
      const newFaq: FAQConfigItem = {
        id: `faq-${Date.now()}`,
        q: faqQ.trim(),
        a: faqA.trim(),
        badge: faqBadge.trim() || "Giải đáp",
        category: faqCategory,
      };
      setFaqs((prev) => [...prev, newFaq]);
      toast.success("Đã thêm câu hỏi FAQ mới!");
    }
    setFaqModalOpen(false);
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast.success("Đã xóa câu hỏi FAQ!");
  };

  // Service Package Handlers
  const openAddService = () => {
    setEditingService(null);
    setSrvTitle("");
    setSrvBadge("HOT");
    setSrvPrice("Từ 50.000đ / Bậc");
    setSrvPopular(false);
    setSrvFeaturesText("Cày tay 100% bởi Cựu Thách Đấu\nBảo mật IP sạch\nBáo cáo tiến độ qua Zalo");
    setServiceModalOpen(true);
  };

  const openEditService = (s: ServicePackageItem) => {
    setEditingService(s);
    setSrvTitle(s.title);
    setSrvBadge(s.badge);
    setSrvPrice(s.price);
    setSrvPopular(!!s.popular);
    setSrvFeaturesText((s.features || []).join("\n"));
    setServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitle.trim() || !srvPrice.trim()) {
      toast.error("Vui lòng nhập tên gói và giá!");
      return;
    }

    const featuresArray = srvFeaturesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (editingService) {
      setServicePackages((prev) =>
        prev.map((item) =>
          item.id === editingService.id
            ? {
                ...item,
                title: srvTitle.trim(),
                badge: srvBadge.trim(),
                price: srvPrice.trim(),
                popular: srvPopular,
                features: featuresArray,
              }
            : item
        )
      );
      toast.success("Đã cập nhật gói dịch vụ!");
    } else {
      const newService: ServicePackageItem = {
        id: `srv-${Date.now()}`,
        title: srvTitle.trim(),
        badge: srvBadge.trim() || "HOT",
        price: srvPrice.trim(),
        popular: srvPopular,
        features: featuresArray,
      };
      setServicePackages((prev) => [...prev, newService]);
      toast.success("Đã thêm gói dịch vụ mới!");
    }
    setServiceModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    setServicePackages((prev) => prev.filter((s) => s.id !== id));
    toast.success("Đã xóa gói dịch vụ!");
  };

  if (loading) {
    return (
      <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-mono">Đang tải cấu hình trang chủ...</p>
      </div>
    );
  }

  const sectionList = [
    {
      key: "hero" as keyof HomepageSections,
      name: "1. Hero Banner & Giới Thiệu Đầu Trang",
      desc: "Banner tiêu đề chính, lời chào mở đầu và 4 chỉ số thống kê uy tín.",
      icon: Zap,
    },
    {
      key: "alertBanner" as keyof HomepageSections,
      name: "2. Thanh Thông Báo Nổi (Alert Banner)",
      desc: "Thanh thông báo khuyến mãi / tin khẩn hiển thị ngay dưới Menu.",
      icon: Megaphone,
    },
    {
      key: "vipShop" as keyof HomepageSections,
      name: "3. Kho Acc VIP (Thuê Theo Giờ & Ngày)",
      desc: "Khu vực hiển thị danh sách Acc Tí Nị VIP & Sân đấu thần thoại.",
      icon: Award,
    },
    {
      key: "cloneShop" as keyof HomepageSections,
      name: "4. Kho Acc Clone / Smurf (Thuê Dài Hạn)",
      desc: "Khu vực hiển thị Acc Clone Trắng Thông Tin & Smurf rank thấp.",
      icon: Flame,
    },
    {
      key: "about" as keyof HomepageSections,
      name: "5. Giới Thiệu Tuấn Thái Bình & Cam Kết",
      desc: "Mốc lịch sử cờ thủ các mùa, 4 cam kết dịch vụ & Kênh truyền thông.",
      icon: Users,
    },
    {
      key: "services" as keyof HomepageSections,
      name: "6. Bảng Giá Cày Rank & Coaching 1-1",
      desc: "Khu vực các gói dịch vụ cày thuê và kèm chơi trực tiếp.",
      icon: Sliders,
    },
    {
      key: "reviews" as keyof HomepageSections,
      name: "7. Đánh Giá Khách Hàng (Customer Reviews)",
      desc: "Khu vực feedback 5 sao kèm hình ảnh giao dịch từ khách hàng.",
      icon: Star,
    },
    {
      key: "faq" as keyof HomepageSections,
      name: "8. Câu Hỏi Thường Gặp (FAQ)",
      desc: "Giải đáp thắc mắc về quy trình thuê, bảo mật và đổi pass.",
      icon: HelpCircle,
    },
    {
      key: "floatingChat" as keyof HomepageSections,
      name: "9. Nút Chat Zalo Nổi (Floating Chat)",
      desc: "Nút tròn hỗ trợ Zalo ghim cố định ở góc dưới bên phải màn hình.",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Quản Lý & Tự Setup Trang Chủ</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                CMS
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Bật/tắt các khối giao diện, tùy chỉnh hình ảnh, Hero Banner, bảng giá cày rank và giải đáp FAQ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">Xem Trang Chủ ↗</span>
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Khôi phục toàn bộ cấu hình về mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khôi Phục Mặc Định</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-orange-600/25 flex items-center gap-2 cursor-pointer hover:scale-105 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </div>

      {/* 2. Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("sections")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "sections"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4 text-orange-400" />
          <span>Bật / Tắt Khối Giao Diện</span>
        </button>

        <button
          onClick={() => setActiveTab("images")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "images"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-pink-400" />
          <span>Hình Ảnh & Thẻ Hero VIP</span>
        </button>

        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "hero"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Hero Tiêu Đề & Số Liệu</span>
        </button>

        <button
          onClick={() => setActiveTab("banner")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "banner"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Megaphone className="w-4 h-4 text-purple-400" />
          <span>Thông Báo Khẩn (Banner)</span>
        </button>

        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "services"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Gói Cày Rank ({servicePackages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("faq")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "faq"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Câu Hỏi FAQ ({faqs.length})</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* 3.1 TAB: BẬT / TẮT KHỐI GIAO DIỆN */}
      {activeTab === "sections" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-600" />
              <span>Quản Lý Bật / Tắt Các Khối Trên Trang Chủ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gạt công tắc để ẩn hoặc hiện bất kỳ khu vực nào ngoài trang chủ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionList.map((sec) => {
              const IconComp = sec.icon;
              const isEnabled = sections[sec.key];

              return (
                <div
                  key={sec.key}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEnabled
                      ? "bg-white border-slate-200 shadow-xs"
                      : "bg-slate-50 border-dashed border-slate-300 opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isEnabled
                              ? "bg-orange-50 text-orange-600"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">{sec.name}</h4>
                      </div>

                      {/* Switch */}
                      <button
                        type="button"
                        onClick={() => toggleSection(sec.key)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">{sec.desc}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">Trạng thái:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        isEnabled
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isEnabled ? "Đang Hiển Thị" : "Đã Ẩn"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3.2 TAB: TÙY CHỈNH HÌNH ẢNH TRANG CHỦ & THẺ HERO */}
      {activeTab === "images" && (
        <div className="space-y-6">
          {/* Card 1: Thẻ Acc VIP Hero Nổi Bật */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-600" />
                  <span>Tùy Chỉnh Thẻ Acc VIP Hero (Cột Phải Đầu Trang Chủ)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tùy chỉnh ảnh bìa Tướng Tí Nị, mã số, tên Tướng Tí Nị và Sân Đấu Thần Thoại hiển thị nổi bật ở Hero Banner.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form cài đặt ảnh & chi tiết */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Link Ảnh Bìa Thẻ Hero (Image URL):</label>
                  <input
                    type="text"
                    value={images.heroCardImage}
                    onChange={(e) => setImages({ ...images, heroCardImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">Mã Số Thẻ (Code):</label>
                    <input
                      type="text"
                      value={images.heroCardCode}
                      onChange={(e) => setImages({ ...images, heroCardCode: e.target.value })}
                      placeholder="MS: 8899"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">Giá Thuê Hiển Thị:</label>
                    <input
                      type="text"
                      value={images.heroCardPrice}
                      onChange={(e) => setImages({ ...images, heroCardPrice: e.target.value })}
                      placeholder="15.000đ/h"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-red-600 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Tên Tướng Tí Nị (Chibi Name):</label>
                  <input
                    type="text"
                    value={images.heroCardChibi}
                    onChange={(e) => setImages({ ...images, heroCardChibi: e.target.value })}
                    placeholder="Tí Nị Ahri Chiêu Hồn + Yasuo Chân Long"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Tên Sân Đấu (Arena Name):</label>
                  <input
                    type="text"
                    value={images.heroCardArena}
                    onChange={(e) => setImages({ ...images, heroCardArena: e.target.value })}
                    placeholder="Sân Đấu Thần Thoại Tiệm Trà Tâm Linh (Đổi Nhạc EDM)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Presets Box: 1 chạm áp dụng */}
                <div className="pt-2">
                  <span className="font-bold text-slate-800 block mb-2">
                    ⚡ Chọn Nhanh Mẫu Tướng Tí Nị & Sân Đấu Đẹp (1 Chạm):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tftPresets.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="p-2.5 bg-slate-50 hover:bg-orange-50/80 border border-slate-200 hover:border-orange-300 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2 group"
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <strong className="block text-[11px] text-slate-900 truncate group-hover:text-orange-600">
                            {p.name}
                          </strong>
                          <span className="text-[10px] text-slate-500 font-mono">{p.code} • {p.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Khung Live Preview */}
              <div className="lg:col-span-5 bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block text-center">
                  Xem Trước Thẻ Hero Ngoài Trang Chủ
                </span>

                <div className="w-full max-w-sm mx-auto bg-white border border-slate-200 rounded-2xl p-4 shadow-md space-y-3">
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
                    <div className="bg-emerald-50 rounded-lg py-1">
                      <span className="text-emerald-800 font-bold block">Bảo Hiểm</span>
                      <strong className="text-emerald-600 font-mono font-bold block">30M</strong>
                    </div>
                    <div className="bg-amber-50 rounded-lg py-1">
                      <span className="text-amber-800 font-bold block">Rank ĐTCL</span>
                      <strong className="text-amber-600 font-bold block">1.134 ĐNG</strong>
                    </div>
                    <div className="bg-orange-50 rounded-lg py-1">
                      <span className="text-orange-800 font-bold block">Bàn Giao</span>
                      <strong className="text-orange-600 font-bold block">30s Zalo</strong>
                    </div>
                  </div>

                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-900">
                    <img
                      src={images.heroCardImage}
                      alt={images.heroCardChibi}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-mono font-bold text-[10px]">
                        {images.heroCardCode}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                        SẴN SÀNG
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 text-white text-left">
                      <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span className="truncate">{images.heroCardChibi}</span>
                      </div>
                      <div className="text-xs font-bold truncate text-slate-100">
                        {images.heroCardArena}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={images.avatarUrl || "/avatar.jpg"}
                        alt="Avatar"
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <span className="text-xs font-bold text-slate-900">Tuấn Thái Bình</span>
                    </div>
                    <span className="text-sm font-black text-red-600 font-mono">
                      {images.heroCardPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Avatar & Nhận Diện Cá Nhân */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Ảnh Đại Diện (Avatar) & Nhận Diện Thương Hiệu</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật link ảnh đại diện hiển thị trên Menu Navbar, Hero Card và Chân Trang Footer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Link Ảnh Đại Diện (Avatar URL):</label>
                <input
                  type="text"
                  value={images.avatarUrl}
                  onChange={(e) => setImages({ ...images, avatarUrl: e.target.value })}
                  placeholder="/avatar.jpg hoặc https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                />
                <span className="text-[10px] text-slate-400">
                  Mặc định: <code className="text-orange-600">/avatar.jpg</code> (ảnh trong thư mục public).
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Link Ảnh Bìa Cover (Tùy Chọn):</label>
                <input
                  type="text"
                  value={images.coverUrl}
                  onChange={(e) => setImages({ ...images, coverUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3.3 TAB: HERO BANNER & SỐ LIỆU */}
      {activeTab === "hero" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Cấu Hình Hero Banner & Số Liệu Uy Tín</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tùy chỉnh các dòng chữ tiêu đề lớn và 4 thông số vàng hiển thị ở đầu trang chủ.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Top Badge */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">Huy Hiệu Nhỏ (Top Badge):</label>
              <input
                type="text"
                value={hero.badge}
                onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Title Lines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Tiêu Đề Dòng 1:</label>
                <input
                  type="text"
                  value={hero.titleLine1}
                  onChange={(e) => setHero({ ...hero, titleLine1: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Tiêu Đề Dòng 2:</label>
                <input
                  type="text"
                  value={hero.titleLine2}
                  onChange={(e) => setHero({ ...hero, titleLine2: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Chữ Nổi Bật (Gradient Cam):</label>
                <input
                  type="text"
                  value={hero.titleHighlight}
                  onChange={(e) => setHero({ ...hero, titleHighlight: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-orange-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">Đoạn Mô Tả Giới Thiệu (Subtitle):</label>
              <textarea
                rows={3}
                value={hero.subtitle}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 leading-relaxed"
              />
            </div>

            {/* 4 Stats Cards */}
            <div className="pt-2">
              <label className="font-bold text-slate-800 block mb-2">4 Chỉ Số Thống Kê Uy Tín:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(hero.stats || []).map((st, index) => (
                  <div key={st.id || index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono">Tên chỉ số #{index + 1}:</span>
                      <input
                        type="text"
                        value={st.label}
                        onChange={(e) => {
                          const updated = [...hero.stats];
                          updated[index] = { ...st, label: e.target.value };
                          setHero({ ...hero, stats: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono">Giá trị hiển thị:</span>
                      <input
                        type="text"
                        value={st.value}
                        onChange={(e) => {
                          const updated = [...hero.stats];
                          updated[index] = { ...st, value: e.target.value };
                          setHero({ ...hero, stats: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-orange-600 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3.4 TAB: THÔNG BÁO NỔI (ALERT BANNER) */}
      {activeTab === "banner" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-600" />
                <span>Thanh Thông Báo Nổi (Alert Banner)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hiển thị dải thông báo ưu đãi hoặc tin tức quan trọng ở đầu website.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                {alertBanner.active ? "Đang Bật" : "Đang Tắt"}
              </span>
              <button
                type="button"
                onClick={() => setAlertBanner({ ...alertBanner, active: !alertBanner.active })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  alertBanner.active ? "bg-orange-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    alertBanner.active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-800 block">Nội Dung Thông Báo:</label>
            <textarea
              rows={3}
              value={alertBanner.content}
              onChange={(e) => setAlertBanner({ ...alertBanner, content: e.target.value })}
              placeholder="Nhập nội dung thông báo hiển thị cho khách..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 leading-relaxed"
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-xs space-y-1">
            <span className="text-[10px] font-mono text-orange-600 font-bold uppercase tracking-wider block">
              Xem trước ngoài trang chủ:
            </span>
            <div className="text-orange-950 font-medium py-1">{alertBanner.content || "Chưa có nội dung"}</div>
          </div>
        </div>
      )}

      {/* 3.5 TAB: GÓI CÀY RANK & COACHING */}
      {activeTab === "services" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-600" />
                <span>Quản Lý Bảng Giá Cày Rank & Coaching</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thêm, sửa, xóa các gói dịch vụ cày thuê rank và coaching meta 1-1.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddService}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Gói Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {servicePackages.map((srv) => (
              <div
                key={srv.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between relative ${
                  srv.popular ? "bg-orange-50/50 border-orange-300 shadow-sm" : "bg-white border-slate-200"
                }`}
              >
                {srv.popular && (
                  <span className="absolute -top-2.5 right-4 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    HOT NHẤT
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {srv.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditService(srv)}
                        className="p-1 text-slate-400 hover:text-orange-600 rounded cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(srv.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 mb-1">{srv.title}</h4>
                  <div className="text-base font-black text-orange-600 font-mono mb-3">{srv.price}</div>

                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {(srv.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3.6 TAB: CÂU HỎI FAQ */}
      {activeTab === "faq" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <span>Quản Lý Câu Hỏi Thường Gặp (FAQ)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thêm, sửa, xóa các câu hỏi giải đáp thắc mắc cho khách thuê.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddFaq}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Câu Hỏi FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.badge || "FAQ"}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">
                      {idx + 1}. {item.q}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-1">{item.a}</p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                  <button
                    onClick={() => openEditFaq(item)}
                    className="px-3 py-1.5 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(item.id)}
                    className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MODALS */}

      {/* 4.1 FAQ MODAL */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>{editingFaq ? "Chỉnh Sửa Câu Hỏi FAQ" : "Thêm Câu Hỏi FAQ Mới"}</span>
            </h3>

            <form onSubmit={handleSaveFaq} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Câu Hỏi (Question):</label>
                <input
                  type="text"
                  required
                  value={faqQ}
                  onChange={(e) => setFaqQ(e.target.value)}
                  placeholder="VD: Sau khi gửi đơn qua Zalo bao lâu nhận được pass?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Câu Trả Lời (Answer):</label>
                <textarea
                  rows={4}
                  required
                  value={faqA}
                  onChange={(e) => setFaqA(e.target.value)}
                  placeholder="Nhập câu trả lời giải đáp chi tiết..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Huy Hiệu Ngắn (Badge):</label>
                  <input
                    type="text"
                    value={faqBadge}
                    onChange={(e) => setFaqBadge(e.target.value)}
                    placeholder="VD: Bàn giao 30s"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Danh Mục:</label>
                  <select
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="THUE_ACC">Thuê Acc</option>
                    <option value="BAO_MAT">Bảo Mật</option>
                    <option value="THANH_TOAN">Thanh Toán</option>
                    <option value="CAY_RANK">Cày Rank</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {editingFaq ? "Lưu FAQ" : "Thêm FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.2 SERVICE MODAL */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-600" />
              <span>{editingService ? "Chỉnh Sửa Gói Dịch Vụ" : "Thêm Gói Dịch Vụ Mới"}</span>
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Tên Gói Dịch Vụ:</label>
                <input
                  type="text"
                  required
                  value={srvTitle}
                  onChange={(e) => setSrvTitle(e.target.value)}
                  placeholder="VD: Cày Rank ĐTCL Siêu Tốc (Cày Tay 100%)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Giá Dịch Vụ:</label>
                  <input
                    type="text"
                    required
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(e.target.value)}
                    placeholder="VD: Từ 50.000đ / Bậc"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-orange-600 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">Huy Hiệu (Badge):</label>
                  <input
                    type="text"
                    value={srvBadge}
                    onChange={(e) => setSrvBadge(e.target.value)}
                    placeholder="VD: CAM KẾT TOP 1-2-3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Danh Sách Quyền Lợi (Mỗi dòng là 1 gạch đầu dòng):
                </label>
                <textarea
                  rows={4}
                  required
                  value={srvFeaturesText}
                  onChange={(e) => setSrvFeaturesText(e.target.value)}
                  placeholder="Cày tay 100% bởi Tuấn Thái Bình&#10;Bảo mật tuyệt đối&#10;Cập nhật tiến độ qua Zalo"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-800">Đánh dấu gói Nổi Bật / Bán Chạy:</span>
                <input
                  type="checkbox"
                  checked={srvPopular}
                  onChange={(e) => setSrvPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {editingService ? "Lưu Gói" : "Thêm Gói"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
