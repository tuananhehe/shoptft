"use client";

import React, { useState } from "react";
import { PROFILE_INFO } from "@/data/tft-data";
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

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  // Demo tính giá mẫu dựa trên cấu hình
  const sampleAccValue = 850000;
  const sample2h = Math.round(((sampleAccValue * (rate2Hours / 100)) + passChangeFee) / 1000) * 1000;
  const sample7d = Math.round(((sampleAccValue * (rate7Days / 100)) + passChangeFee) / 1000) * 1000;
  const sample30d = Math.round((sampleAccValue * (rate30Days / 100)) / 1000) * 1000;

  return (
    <div className="max-w-4xl space-y-6">
      {/* TOAST THÔNG BÁO */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold">
            Đã lưu toàn bộ cài đặt hệ thống thành công!
          </span>
          <button
            onClick={() => setSaved(false)}
            className="p-1 hover:bg-emerald-700 rounded-lg text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

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
        {/* NÚT LƯU CỐ ĐỊNH Ở GÓC DƯỚI CÙNG BÊN PHẢI                     */}
        {/* ============================================================ */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            className="px-7 py-3 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-600/25 transition-all hover:scale-105 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Cài Đặt Hệ Thống</span>
          </button>
        </div>
      </form>
    </div>
  );
}
