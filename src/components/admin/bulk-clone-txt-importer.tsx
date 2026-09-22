"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  parseBulkTxtContent,
  ParsedCloneAccount,
  SAMPLE_BULK_TXT_DATA,
} from "@/utils/tft-bulk-parser";

interface BulkCloneTxtImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkCloneTxtImporter: React.FC<BulkCloneTxtImporterProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rawText, setRawText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live parse parsed accounts
  const parsedAccounts = useMemo(() => {
    return parseBulkTxtContent(rawText);
  }, [rawText]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt") && file.type !== "text/plain") {
      toast.error("Vui lòng tải lên file định dạng text (.txt)!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawText(text);
        toast.success(`Đã đọc file ${file.name} với ${text.split(/\r?\n/).filter(Boolean).length} dòng!`);
      }
    };
    reader.onerror = () => {
      toast.error("Không thể đọc file .txt!");
    };
    reader.readAsText(file, "UTF-8");

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAccount = (id: string) => {
    // Find the item and remove its rawLine from rawText
    const target = parsedAccounts.find((a) => a.id === id);
    if (!target) return;

    const lines = rawText.split(/\r?\n/);
    const newLines = lines.filter((l) => l.trim() !== target.rawLine.trim());
    setRawText(newLines.join("\n"));
    toast.success("Đã xóa 1 mục khỏi danh sách chờ!");
  };

  const handleApplySample = () => {
    setRawText(SAMPLE_BULK_TXT_DATA);
    toast.success("Đã dán dữ liệu mẫu 10 tài khoản Đột Phá, Tí Nị & Sân Đấu!");
  };

  const handleClearAll = () => {
    setRawText("");
    toast.success("Đã xóa trắng danh sách!");
  };

  const handleSubmitBulk = async () => {
    if (parsedAccounts.length === 0) {
      toast.error("Chưa có tài khoản nào hợp lệ để đăng!");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      `Đang đăng ${parsedAccounts.length} tài khoản lên Kho Clone...`
    );

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("admin_session_token") || ""
          : "";

      const accountsPayload = parsedAccounts.map((acc) => ({
        code: acc.code,
        type: "CLONE",
        title: acc.title,
        rank: acc.rankBadge || "UNRANKED",
        price: acc.monthlyPrice,
        weekly_price: acc.weeklyPrice,
        period_price: acc.periodPrice,
        period_unit: acc.periodUnit || " / ∞",
        price_display_type: acc.priceDisplayType || "LONG_TERM",
        champions:
          acc.category === "UNBOUND" || acc.category === "CHIBI" || acc.category === "LITTLE_LEGEND"
            ? [acc.petName]
            : [],
        arenas: acc.category === "ARENA" ? [acc.petName] : [],
        features: acc.features,
        image_url: acc.thumbnail,
        status: "AVAILABLE",
        description: acc.description,
      }));

      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accounts: accountsPayload }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể đăng tài khoản hàng loạt");
      }

      toast.success(
        `🎉 Đã đăng thành công ${parsedAccounts.length} tài khoản Clone lên hệ thống!`,
        { id: toastId, duration: 4000 }
      );

      setRawText("");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Lỗi đăng bulk:", err);
      toast.error(`Lỗi đăng tài khoản: ${err.message || "Lỗi không xác định"}`, {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-indigo-50/40 to-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 flex-shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Đăng SLL Kho Clone Bằng File TXT
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-600 text-white shadow-xs">
                  SLL TỰ ĐỘNG
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                Nhận diện tên Pet / Sân Đấu + Tự gán ảnh Riot Games CDN chính thức
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-800">
          {/* ACTION BUTTONS & GUIDE */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,text/plain"
                onChange={handleFileUpload}
                className="hidden"
                id="bulk-txt-file-input"
              />
              <label
                htmlFor="bulk-txt-file-input"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm hover:shadow active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn File .TXT Từ Máy</span>
              </label>

              <button
                type="button"
                onClick={handleApplySample}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all border border-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Dán Mẫu Thử (10 Acc)</span>
              </button>

              {rawText && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl cursor-pointer transition-all border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Hết</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? "Ẩn cú pháp" : "Xem định dạng hỗ trợ"}</span>
            </button>
          </div>

          {/* GUIDE BOX */}
          {showGuide && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 animate-fadeIn">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>💡 Các định dạng dòng text được hỗ trợ (Mỗi acc 1 dòng):</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 font-mono text-[11px] pl-1">
                <li><code className="text-sky-700 font-bold">Tên Pet | Giá</code> (VD: <span className="text-slate-800">Arcane Jinx Đột Phá | 180k</span>)</li>
                <li><code className="text-sky-700 font-bold">Tên Pet - Giá</code> (VD: <span className="text-slate-800">Tí Nị Ahri Chiêu Hồn - 160.000đ</span>)</li>
                <li><code className="text-sky-700 font-bold">Tên Sân | Giá | Rank | Mã</code> (VD: <span className="text-slate-800">Sân Khấu K/DA Neon | 200k | UNRANKED | CLONE-88</span>)</li>
                <li>Hỗ trợ copy/paste trực tiếp từ file Notepad, Excel, Google Sheets. Giá viết tắt: <code className="text-emerald-700 font-bold">150k, 180.000, 150000, 150</code> đều hiểu tự động!</li>
              </ul>
            </div>
          )}

          {/* TEXTAREA INPUT */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Nhập hoặc dán nội dung (Mỗi dòng 1 tài khoản):
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                {rawText.split(/\r?\n/).filter((l) => l.trim()).length} dòng nhập vào
              </span>
            </div>

            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Ví dụ:\nArcane Jinx Đột Phá | 180k\nArcane Warwick Đột Phá | 180.000đ\nTí Nị Ahri Chiêu Hồn | 160k\nSân Khấu K/DA Đồng Quy Giới | 190k\nPengu Cánh Cụt Bụ Bẫm | 120k`}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white resize-y min-h-[120px]"
            />
          </div>

          {/* LIVE PREVIEW TABLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kết Quả Nhận Diện Tự Động:</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {parsedAccounts.length} Tài Khoản Hợp Lệ
                </span>
              </div>

              {parsedAccounts.length > 0 && (
                <span className="text-[11px] text-slate-500 font-medium">
                  Tổng giá trị: <strong className="text-orange-700 font-mono">{parsedAccounts.reduce((acc, a) => acc + a.monthlyPrice, 0).toLocaleString("vi-VN")} đ</strong>
                </span>
              )}
            </div>

            {parsedAccounts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  Chưa có dữ liệu. Hãy tải file .txt hoặc dán nội dung ở trên!
                </p>
                <button
                  type="button"
                  onClick={handleApplySample}
                  className="text-xs text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer"
                >
                  Bấm vào đây để thử ngay 10 tài khoản mẫu
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs max-h-[280px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 sticky top-0 z-10 border-b border-slate-200 text-slate-700 font-extrabold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3">Ảnh Game Thật</th>
                      <th className="py-2.5 px-3">Tên Pet / Sân Đấu Đã Nhận Diện</th>
                      <th className="py-2.5 px-3">Mã & Tiêu Đề</th>
                      <th className="py-2.5 px-3 text-right">Giá Thuê</th>
                      <th className="py-2.5 px-3 text-center">Rank</th>
                      <th className="py-2.5 px-3 w-10 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {parsedAccounts.map((acc, idx) => (
                      <tr key={acc.id} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs flex-shrink-0">
                            <img
                              src={acc.thumbnail}
                              alt={acc.petName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {acc.badge && (
                              <span className="absolute bottom-0 right-0 left-0 bg-slate-950/80 text-[8px] font-black text-amber-300 text-center py-0.2">
                                {acc.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{acc.petName}</span>
                          </div>
                          <span className="text-[10px] text-sky-700 font-medium">
                            {acc.categoryLabel}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-mono font-bold text-[11px] text-indigo-700 block">
                            {acc.code}
                          </span>
                          <span className="text-[11px] text-slate-600 line-clamp-1">
                            {acc.title}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-orange-700">
                          {acc.monthlyPrice.toLocaleString("vi-VN")}đ
                          <span className="text-[9px] text-slate-400 block font-normal">
                            Sở Hữu Vô Cực
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                            {acc.rankBadge}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveAccount(acc.id)}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer mx-auto"
                            title="Xóa mục này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleSubmitBulk}
            disabled={isSubmitting || parsedAccounts.length === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 active:scale-98 text-white text-xs font-extrabold shadow-lg shadow-sky-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang Tải Lên Database...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Đăng Ngay {parsedAccounts.length} Tài Khoản Lên Web</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
