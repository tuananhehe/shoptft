"use client";

import React, { useState, useEffect } from "react";
import {
  CommunityChannelItem,
  ChannelPlatform,
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  resetChannelsToDefault,
  getPlatformMeta,
} from "@/utils/channels-service";
import toast from "react-hot-toast";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  Save,
  Globe,
  Loader2,
  HelpCircle,
  Eye,
  AlertTriangle,
} from "lucide-react";

export default function AdminChannelsPage() {
  const [channels, setChannels] = useState<CommunityChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommunityChannelItem | null>(null);

  // Form State
  const [formPlatform, setFormPlatform] = useState<ChannelPlatform>("tiktok");
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formButtonText, setFormButtonText] = useState("Tham Gia ➔");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formOrder, setFormOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    const data = await getChannels(false);
    setChannels(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormPlatform("tiktok");
    setFormTitle("Kênh TikTok ShopTFT Mobile");
    setFormSubtitle("Xem highlight & test acc VIP");
    setFormBadge("50K+ Followers");
    setFormLink("https://tiktok.com/@shoptftmobile");
    setFormButtonText("Xem TikTok ➔");
    setFormIsActive(true);
    setFormOrder(channels.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (item: CommunityChannelItem) => {
    setEditingItem(item);
    setFormPlatform(item.platform);
    setFormTitle(item.title);
    setFormSubtitle(item.subtitle);
    setFormBadge(item.badge);
    setFormLink(item.link);
    setFormButtonText(item.buttonText);
    setFormIsActive(item.isActive !== false);
    setFormOrder(item.order || 1);
    setModalOpen(true);
  };

  const handleToggleActive = async (item: CommunityChannelItem) => {
    const updatedStatus = !item.isActive;
    const toastId = toast.loading(`Đang cập nhật ${item.title}...`);

    const res = await updateChannel({
      id: item.id,
      isActive: updatedStatus,
    });

    if (res.success) {
      toast.success(
        `Đã ${updatedStatus ? "BẬT" : "TẮT"} hiển thị kênh ${item.title}!`,
        { id: toastId }
      );
      fetchList();
    } else {
      toast.error(`Lỗi: ${res.error}`, { id: toastId });
    }
  };

  const handleDelete = async (item: CommunityChannelItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa kênh "${item.title}" khỏi hệ sinh thái?`)) {
      return;
    }

    const toastId = toast.loading(`Đang xóa ${item.title}...`);
    const res = await deleteChannel(item.id);

    if (res.success) {
      toast.success(`Đã xóa kênh ${item.title}!`, { id: toastId });
      fetchList();
    } else {
      toast.error(`Lỗi: ${res.error}`, { id: toastId });
    }
  };

  const handleResetDefault = async () => {
    if (!window.confirm("Khôi phục danh sách về 4 kênh mặc định của Tuấn Thái Bình?")) {
      return;
    }

    const toastId = toast.loading("Đang khôi phục mặc định...");
    const res = await resetChannelsToDefault();

    if (res.success) {
      toast.success("Đã khôi phục 4 kênh mặc định thành công!", { id: toastId });
      fetchList();
    } else {
      toast.error(`Lỗi: ${res.error}`, { id: toastId });
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formLink.trim()) {
      toast.error("Vui lòng điền tiêu đề và đường dẫn link!");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editingItem ? "Đang cập nhật..." : "Đang thêm kênh...");

    if (editingItem) {
      const res = await updateChannel({
        id: editingItem.id,
        platform: formPlatform,
        title: formTitle,
        subtitle: formSubtitle,
        badge: formBadge,
        link: formLink,
        buttonText: formButtonText,
        isActive: formIsActive,
        order: Number(formOrder),
      });

      if (res.success) {
        toast.success("✅ Cập nhật kênh thành công!", { id: toastId });
        setModalOpen(false);
        fetchList();
      } else {
        toast.error(`Lỗi: ${res.error}`, { id: toastId });
      }
    } else {
      const res = await createChannel({
        platform: formPlatform,
        title: formTitle,
        subtitle: formSubtitle,
        badge: formBadge,
        link: formLink,
        buttonText: formButtonText,
        isActive: formIsActive,
        order: Number(formOrder),
      });

      if (res.success) {
        toast.success("✅ Thêm kênh truyền thông mới thành công!", { id: toastId });
        setModalOpen(false);
        fetchList();
      } else {
        toast.error(`Lỗi: ${res.error}`, { id: toastId });
      }
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Hệ Sinh Thái & Kênh Truyền Thông
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Quản lý các kênh TikTok, Zalo, Discord, Facebook hiển thị ở mục Giới Thiệu ngoài trang chủ.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Khôi phục danh sách 4 kênh chuẩn mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khôi Phục Mặc Định</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-orange-600/25 flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Kênh Mới</span>
          </button>
        </div>
      </div>

      {/* 2. Channels List / Cards */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Đang tải danh sách kênh truyền thông...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Chưa Có Kênh Truyền Thông Nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Bạn có thể bấm &quot;Thêm Kênh Mới&quot; hoặc &quot;Khôi Phục Mặc Định&quot; để tạo các kênh cộng đồng.
            </p>
          </div>
          <button
            onClick={handleResetDefault}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
          >
            Nạp 4 Kênh Mặc Định
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((item) => {
            const meta = getPlatformMeta(item.platform);

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm relative group ${
                  item.isActive ? "border-slate-200/90 hover:shadow-md" : "border-dashed border-slate-300 opacity-60 bg-slate-50/50"
                }`}
              >
                {/* Top Action Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-11 h-11 rounded-xl p-2.5 flex items-center justify-center border ${meta.iconBg}`}>
                    {meta.icon}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      title={item.isActive ? "Đang BẬT - Nhấn để ẨN" : "Đang TẮT - Nhấn để HIỆN"}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.isActive ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.isActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => openEditModal(item)}
                      title="Chỉnh sửa kênh"
                      className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      title="Xóa kênh"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badge & Order */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeBg}`}>
                    {item.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Thứ tự: #{item.order || 1}
                  </span>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.subtitle || "Chưa có mô tả phụ"}
                  </p>
                </div>

                {/* Link Preview Button */}
                <div className="mt-auto space-y-2">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${meta.buttonStyle}`}
                  >
                    <span>{item.buttonText || "Tham Gia ➔"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="text-[10px] text-slate-400 font-mono truncate px-1" title={item.link}>
                    {item.link}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Modal Thêm / Sửa Kênh */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Users className="w-5 h-5 text-orange-600" />
                <span>{editingItem ? "Chỉnh Sửa Kênh Truyền Thông" : "Thêm Kênh Truyền Thông Mới"}</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* Platform Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Nền Tảng / Icon Kênh:</label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value as ChannelPlatform)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="tiktok">TikTok (Màu Hồng/Đỏ)</option>
                  <option value="zalo">Zalo / Nhóm Zalo (Màu Xanh Dương)</option>
                  <option value="discord">Discord (Màu Tím Indigo)</option>
                  <option value="facebook">Facebook Group / Fanpage (Màu Xanh Lam)</option>
                  <option value="youtube">YouTube (Màu Đỏ)</option>
                  <option value="telegram">Telegram (Màu Xanh Cyan)</option>
                  <option value="website">Website / Link Khác (Màu Xanh Lá)</option>
                </select>
              </div>

              {/* Tên Kênh */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Tiêu Đề Kênh: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="VD: Kênh TikTok ShopTFT Mobile"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Mô Tả Phụ */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Mô Tả Ngắn / Chức Năng:</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="VD: Xem highlight & test acc VIP"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Huy Hiệu & Thứ Tự */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Huy Hiệu / Số Lượng:</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="VD: 50K+ Followers"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Thứ Tự Hiển Thị:</label>
                  <input
                    type="number"
                    min={1}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Đường Dẫn Link */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Đường Dẫn Liên Kết (URL): <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="https://zalo.me/g/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Chữ Trên Nút Bấm */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Chữ Trên Nút Bấm:</label>
                <input
                  type="text"
                  value={formButtonText}
                  onChange={(e) => setFormButtonText(e.target.value)}
                  placeholder="VD: Xem TikTok ➔, Tham Gia Zalo ➔"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Trạng Thái Bật/Tắt */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Hiển Thị Trên Website:</span>
                  <span className="text-[11px] text-slate-500">Bật để hiển thị ở mục Giới Thiệu trang chủ</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsActive ? "bg-orange-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Nút bấm Lưu / Hủy */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold uppercase tracking-wider transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingItem ? "Lưu Thay Đổi" : "Thêm Kênh"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
