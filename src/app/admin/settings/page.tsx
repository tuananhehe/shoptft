"use client";

import React, { useState } from "react";
import { PROFILE_INFO } from "@/data/tft-data";
import { Settings, ShieldCheck, CheckCircle2, Save, Phone, MessageCircle, CreditCard, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  const [phoneZalo, setPhoneZalo] = useState(PROFILE_INFO.phoneZalo);
  const [bankName, setBankName] = useState(PROFILE_INFO.bankInfo.bankName);
  const [accountNumber, setAccountNumber] = useState(PROFILE_INFO.bankInfo.accountNumber);
  const [accountName, setAccountName] = useState(PROFILE_INFO.bankInfo.accountName);
  const [checkscamFund, setCheckscamFund] = useState("30.000.000đ");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {saved && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">Đã lưu cài đặt hệ thống thành công!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Cấu Hình Kênh Hỗ Trợ & Thông Tin Shop
            </h2>
            <p className="text-xs text-slate-500">
              Cập nhật số điện thoại Hotline, Zalo và STK nhận thanh toán tự động.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="pt-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>Số Điện Thoại / Hotline Zalo:</span>
              </label>
              <input
                type="text"
                value={phoneZalo}
                onChange={(e) => setPhoneZalo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quỹ Bảo Hiểm Checkscam:</span>
              </label>
              <input
                type="text"
                value={checkscamFund}
                onChange={(e) => setCheckscamFund(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Tài Khoản Ngân Hàng Nhận Tiền</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Ngân hàng:</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Số tài khoản:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Chủ tài khoản:</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 uppercase"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-orange-600/20 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cài Đặt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
