"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PROFILE_INFO } from "@/data/tft-data";
import { getHomepageConfig, updateHomepageConfig } from "@/utils/homepage-service";
import toast from "react-hot-toast";
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  Save,
  Phone,
  Percent,
  Megaphone,
  Sparkles,
  Calculator,
  HelpCircle,
  Users,
  Loader2,
} from "lucide-react";

export default function AdminSettingsPage() {
  // 1. Kênh hỗ trợ & Hotline
  const [phoneZalo, setPhoneZalo] = useState(PROFILE_INFO.phoneZalo);
  const [checkscamFund, setCheckscamFund] = useState("30.000.000đ");

  // 2. Cấu hình tỷ lệ giá thuê
  const [passChangeFee, setPassChangeFee] = useState<number>(20000);
  const [rate2Hours, setRate2Hours] = useState<number>(3);
  const [rate7Days, setRate7Days] = useState<number>(12);
  const [rate30Days, setRate30Days] = useState<number>(30);

  // 3. Banner thông báo trang chủ (State chuẩn theo thiết kế)
  const [isBannerActive, setIsBannerActive] = useState<boolean>(true);
  const [bannerContent, setBannerContent] = useState<string>(
    "🎁 Ưu đãi đặc biệt: Tặng thêm 1 giờ chơi và miễn phí phí đổi pass cố định cho khách hàng thuê lần đầu qua Zalo Tuấn Thái Bình!"
  );

  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // 4. Đổi Mật Khẩu Quản Trị
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Fetch cấu hình hiện tại từ backend
  useEffect(() => {
    let isMounted = true;
    getHomepageConfig().then((cfg) => {
      if (isMounted && cfg) {
        if (cfg.pricing) {
          setPassChangeFee(cfg.pricing.passChangeFee ?? 20000);
          setRate2Hours(cfg.pricing.rate2Hours ?? 3);
          setRate7Days(cfg.pricing.rate7Days ?? 12);
          setRate30Days(cfg.pricing.rate30Days ?? 30);
        }
        if (cfg.contact) {
          setPhoneZalo(cfg.contact.phoneZalo || PROFILE_INFO.phoneZalo);
          setCheckscamFund(cfg.contact.checkscamFund || "30.000.000đ");
        }
        if (cfg.alertBanner) {
          setIsBannerActive(cfg.alertBanner.active ?? true);
          setBannerContent(cfg.alertBanner.content || "");
        }
        setIsLoadingConfig(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin đổi mật khẩu!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }

    setIsChangingPass(true);
    const toastId = toast.loading("Đang cập nhật mật khẩu mới...");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("✅ Đã đổi mật khẩu quản trị thành công!", { id: toastId });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Không thể đổi mật khẩu!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ!", { id: toastId });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    const toastId = toast.loading("Đang lưu cài đặt hệ thống...");

    try {
      const res = await updateHomepageConfig({
        pricing: {
          passChangeFee: Number(passChangeFee) || 20000,
          rate2Hours: Number(rate2Hours) || 3,
          rate7Days: Number(rate7Days) || 12,
          rate30Days: Number(rate30Days) || 30,
        },
        contact: {
          phoneZalo: phoneZalo.trim() || PROFILE_INFO.phoneZalo,
          checkscamFund: checkscamFund.trim() || "30.000.000đ",
        },
        alertBanner: {
          active: isBannerActive,
          content: bannerContent.trim(),
        },
      });

      if (res.success) {
        toast.success("✅ Đã lưu toàn bộ cài đặt hệ thống thành công!", { id: toastId });
      } else {
        toast.error(`Lỗi: ${res.error || "Không thể lưu cài đặt!"}`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(`Lỗi kết nối: ${err.message}`, { id: toastId });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Demo tính giá mẫu dựa trên cấu hình
  const sampleAccValue = 850000;
  const sample2h = Math.round(((sampleAccValue * (rate2Hours / 100)) + passChangeFee) / 1000) * 1000;
  const sample7d = Math.round(((sampleAccValue * (rate7Days / 100)) + passChangeFee) / 1000) * 1000;
  const sample30d = Math.round((sampleAccValue * (rate30Days / 100)) / 1000) * 1000;

  return (
    <div className="max-w-4xl space-y-6">

      <form onSubmit={handleSave} className="space-y-6">
        {/* ============================================================ */}
        {/* CARD 1: CẤU HÌNH KÊNH HỖ TRỢ & QUỸ BẢO HIỂM                  */}
        {/* ============================================================ */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Kênh Hỗ Trợ & Định Danh Thương Hiệu
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Cập nhật số Hotline Zalo và mức Quỹ bảo hiểm Checkscam hiển thị trên Website.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Số Điện Thoại / Hotline Zalo:
              </label>
              <input
                type="text"
                value={phoneZalo}
                onChange={(e) => setPhoneZalo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Quỹ Bảo Hiểm Checkscam.vn:
              </label>
              <input
                type="text"
                value={checkscamFund}
                onChange={(e) => setCheckscamFund(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="p-3.5 bg-orange-50/80 border border-orange-200/90 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-orange-900">
              <Users className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>Quản lý các kênh <strong>TikTok, Nhóm Zalo, Discord, Group Facebook</strong> tại:</span>
            </div>
            <Link
              href="/admin/channels"
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Quản Lý Kênh Truyền Thông ➔</span>
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD 2: CẤU HÌNH TỶ LỆ & PHÍ DỊCH VỤ (TỰ ĐỘNG)               */}
        {/* ============================================================ */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Cấu Hình Tỷ Lệ & Phí Dịch Vụ
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Thiết lập công thức tính giá tự động cho các gói thuê dựa trên Giá Trị Gốc của tài khoản.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Phí Đổi Pass Cố Định */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <label className="font-bold text-slate-800 block">
                Phí Đổi Pass (Cố định):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1000"
                  value={passChangeFee}
                  onChange={(e) => setPassChangeFee(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-orange-500 pr-8"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  đ
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">Phí hoàn trả pass cho chủ acc</span>
            </div>

            {/* Tỷ lệ Gói 2 Giờ */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <label className="font-bold text-slate-800 block">
                Tỷ lệ Gói 2 Giờ:
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={rate2Hours}
                  onChange={(e) => setRate2Hours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-orange-600 focus:outline-none focus:border-orange-500 pr-8"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  %
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">Công thức: (Giá acc * 3%) + 20k</span>
            </div>

            {/* Tỷ lệ Gói 7 Ngày */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <label className="font-bold text-slate-800 block">
                Tỷ lệ Gói 7 Ngày:
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={rate7Days}
                  onChange={(e) => setRate7Days(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-orange-600 focus:outline-none focus:border-orange-500 pr-8"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  %
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">Công thức: (Giá acc * 12%) + 20k</span>
            </div>

            {/* Tỷ lệ Gói 30 Ngày */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <label className="font-bold text-slate-800 block">
                Tỷ lệ Gói 30 Ngày:
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={rate30Days}
                  onChange={(e) => setRate30Days(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-orange-600 focus:outline-none focus:border-orange-500 pr-8"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  %
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">Công thức: Giá acc * 30% (Free pass)</span>
            </div>
          </div>

          {/* Minh Họa Trực Quan Mức Giá Tự Động */}
          <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-orange-900">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Xem trước giá mẫu tự động (Đối với Acc giá gốc 850.000đ):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                <span className="text-slate-500 block">Gói 2 Giờ:</span>
                <strong className="text-red-600 font-mono font-bold">{sample2h.toLocaleString("vi-VN")}đ</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                <span className="text-slate-500 block">Gói 7 Ngày:</span>
                <strong className="text-red-600 font-mono font-bold">{sample7d.toLocaleString("vi-VN")}đ</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                <span className="text-slate-500 block">Gói 30 Ngày:</span>
                <strong className="text-red-600 font-mono font-bold">{sample30d.toLocaleString("vi-VN")}đ</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD 3: THÔNG BÁO TRANG CHỦ (ALERT BANNER) - THIẾT KẾ CHUẨN UX*/}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* Header (Tiêu đề & Nút bật/tắt) */}
          <div className="flex justify-between items-start gap-4">
            {/* Cụm bên trái */}
            <div className="flex items-center gap-3.5">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  Thông Báo Trang Chủ (Alert Banner)
                </h3>
                <p className="text-sm text-slate-500 mt-0.5 font-normal">
                  Hiển thị thanh banner nổi bật ở đầu trang chủ để thông báo khuyến mãi hoặc tin khẩn.
                </p>
              </div>
            </div>

            {/* Cụm bên phải: Nút gạt Toggle Switch & Nhãn text động */}
            <div className="flex items-center gap-3 flex-shrink-0 pt-1">
              <button
                type="button"
                onClick={() => setIsBannerActive(!isBannerActive)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isBannerActive ? "bg-orange-500" : "bg-slate-300"
                }`}
                title="Bật/Tắt banner thông báo"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isBannerActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>

              {isBannerActive ? (
                <span className="font-bold text-sm text-slate-900 min-w-[60px]">
                  Đang Bật
                </span>
              ) : (
                <span className="font-medium text-sm text-slate-400 min-w-[60px]">
                  Đang Tắt
                </span>
              )}
            </div>
          </div>

          {/* Đường kẻ phân cách */}
          <div className="border-t border-slate-100 my-5" />

          {/* Phần nhập Nội dung (Textarea) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-sm text-slate-800">
                Nội Dung Thông Báo:
              </label>
              <span className="text-xs text-slate-400 font-normal">
                Hiển thị trên đầu website
              </span>
            </div>

            <textarea
              rows={3}
              disabled={!isBannerActive}
              value={bannerContent}
              onChange={(e) => setBannerContent(e.target.value)}
              placeholder="Nhập nội dung thông báo hiển thị cho khách hàng..."
              className={`w-full p-4 border border-slate-200 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                isBannerActive
                  ? "bg-white text-slate-900"
                  : "bg-slate-50 text-slate-400 opacity-50 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARD 4: BẢO MẬT & ĐỔI MẬT KHẨU QUẢN TRỊ                      */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            <div className="bg-amber-100 text-amber-700 p-3 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Bảo Mật & Đổi Mật Khẩu Quản Trị
              </h3>
              <p className="text-sm text-slate-500 mt-0.5 font-normal">
                Mật khẩu bảo mật dùng để đăng nhập vào trang quản trị Admin ShopTFT.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Mật Khẩu Hiện Tại:
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu cũ..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Mật Khẩu Mới:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Xác Nhận Mật Khẩu Mới:
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              disabled={isChangingPass || !newPassword}
              onClick={handleChangePassword}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Cập Nhật Mật Khẩu Mới</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* NÚT LƯU CỐ ĐỊNH Ở GÓC DƯỚI CÙNG BÊN PHẢI                     */}
        {/* ============================================================ */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSavingConfig}
            className="px-7 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-600/25 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
          >
            {isSavingConfig ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSavingConfig ? "Đang Lưu Cài Đặt..." : "Lưu Cài Đặt Hệ Thống"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
