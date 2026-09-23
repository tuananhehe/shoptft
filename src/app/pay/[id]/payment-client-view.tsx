"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Zap,
} from "lucide-react";
import { PaymentLinkData, decodePaymentToken } from "@/utils/payment-links-service";

interface PaymentClientViewProps {
  paymentId: string;
  initialToken?: string;
}

export function PaymentClientView({ paymentId, initialToken }: PaymentClientViewProps) {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("d") || initialToken || "";

  // Thử giải mã token ngay từ URL để hiển thị tức thì 0ms không phụ thuộc server
  const initialData = tokenParam ? decodePaymentToken(tokenParam) : null;
  const initialExpired = initialData ? Date.now() > initialData.expiresAt : false;
  const initialSeconds = initialData
    ? initialExpired
      ? 0
      : Math.max(0, Math.floor((initialData.expiresAt - Date.now()) / 1000))
    : 300;

  const [linkData, setLinkData] = useState<PaymentLinkData | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(initialExpired);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDoneModal, setShowDoneModal] = useState(false);

  // Fetch dữ liệu thanh toán từ API để cập nhật trạng thái mới nhất
  useEffect(() => {
    let isMounted = true;

    async function fetchPaySession() {
      try {
        const queryParams = new URLSearchParams();
        if (paymentId) queryParams.set("id", paymentId);
        if (tokenParam) queryParams.set("d", tokenParam);

        const res = await fetch(`/api/pay?${queryParams.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (!isMounted) return;

        if (json.success && json.data) {
          setLinkData(json.data);
          setIsExpired(json.isExpired || json.data.status === "EXPIRED");
          setSecondsRemaining(json.remainingSeconds || 0);
          setError(null);
        } else if (!initialData) {
          setError(json.error || "Không tìm thấy mã link thanh toán này");
        }
      } catch (err: any) {
        if (!isMounted) return;
        if (!initialData) {
          setError(err.message || "Lỗi tải thông tin thanh toán");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPaySession();

    return () => {
      isMounted = false;
    };
  }, [paymentId, tokenParam]);

  // Bộ đếm ngược thời gian thực (5:00 -> 0:00)
  useEffect(() => {
    if (loading || isExpired || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isExpired, secondsRemaining]);

  const copyToClipboard = async (text: string, fieldKey: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Lỗi copy:", err);
    }
  };

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Tin nhắn soạn sẵn gửi Zalo khi khách thanh toán xong
  const zaloPreMessage = encodeURIComponent(
    `Chào Tuấn Thái Bình! Mình vừa chuyển khoản ${linkData?.amount?.toLocaleString("vi-VN") || "0"}đ thuê acc ${linkData?.accountCode || paymentId} (${linkData?.packageName || "Gói thuê"}) theo đơn ${paymentId}. Shop kiểm tra bàn giao acc giúp mình với nhé!`
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white pb-16">
      {/* Header tối giản chuyên nghiệp */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-600/30">
              TFT
            </div>
            <div>
              <div className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>Tuấn Thái Bình</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                  Chính Chủ
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Cổng Thanh Toán Thuê Acc ĐTCL</div>
            </div>
          </Link>

          <a
            href="https://zalo.me/0352867283"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 bg-sky-950/60 px-2.5 py-1.5 rounded-lg border border-sky-800/60 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Zalo Hỗ Trợ</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full px-4 pt-4 sm:pt-6 flex-1 space-y-4">
        {loading ? (
          <div className="p-12 text-center space-y-3 bg-slate-900/60 rounded-3xl border border-slate-800">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-300">Đang khởi tạo cổng thanh toán bảo mật...</p>
          </div>
        ) : error || !linkData ? (
          <div className="p-8 text-center space-y-4 bg-slate-900 rounded-3xl border border-slate-800">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">Không Tìm Thấy Đơn Thanh Toán</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">{error || "Mã link thanh toán không hợp lệ hoặc đã bị gỡ khỏi hệ thống."}</p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Về Trang Chủ
              </Link>
              <a
                href="https://zalo.me/0352867283"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Liên Hệ Zalo Shop</span>
              </a>
            </div>
          </div>
        ) : isExpired ? (
          /* TRẠNG THÁI LINK HẾT HẠN (QUÁ 5 PHÚT) */
          <div className="p-8 text-center space-y-4 bg-slate-900 rounded-3xl border border-rose-900/40">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <Clock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-white">Link Thanh Toán Đã Hết Hạn (5 Phút)</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Vì lý do bảo mật và giữ chỗ tài khoản, link thanh toán tạm thời có hiệu lực tối đa 5 phút. Vui lòng liên hệ Tuấn Thái Bình qua Zalo để nhận mã thanh toán mới.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <a
                href="https://zalo.me/0352867283"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-orange-600/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Zalo Lấy Link Mới (30s)</span>
              </a>
              <Link
                href="/"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Về Trang Chủ
              </Link>
            </div>
          </div>
        ) : (
          /* TRẠNG THÁI THANH TOÁN ACTIVE */
          <>
            {/* Top Bar: Đồng hồ đếm ngược 5 phút */}
            <div className="p-3.5 bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 border border-orange-500/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">
                  Link Có Hiệu Lực Trong:
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-base font-black text-orange-400 bg-slate-900/80 px-3 py-1 rounded-xl border border-orange-500/40 shadow-inner">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>{formatCountdown(secondsRemaining)}</span>
              </div>
            </div>

            {/* Card 1: Khung Quét QR Thanh Toán ACB */}
            <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Quét Mã VietQR Chuyển Khoản Tự Động
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {linkData.amount.toLocaleString("vi-VN")} <span className="text-orange-500">VNĐ</span>
                </h1>
                <p className="text-xs text-slate-400">
                  {linkData.accountCode} • {linkData.accountTitle} ({linkData.packageName})
                </p>
              </div>

              {/* Ảnh Mã QR */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl max-w-[280px] mx-auto shadow-md">
                <img
                  src={linkData.qrUrl}
                  alt={`Mã QR Thanh Toán ${linkData.accountCode}`}
                  className="w-full h-auto aspect-square object-contain rounded-lg"
                />
                <span className="text-[10px] font-bold text-slate-600 mt-1">
                  Mở App Ngân Hàng Hoặc Ví Điện Tử Để Quét
                </span>
              </div>

              {/* Nút Tải QR */}
              <div className="flex justify-center">
                <a
                  href={linkData.qrUrl}
                  download={`VietQR-${linkData.id}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh mã QR về máy</span>
                </a>
              </div>
            </div>

            {/* Card 2: Thông Tin Chuyển Khoản Thủ Công */}
            <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span>Hoặc Chuyển Khoản Thủ Công</span>
                <span className="text-[10px] text-emerald-400 font-normal">Bảo chứng Checkscam 30M</span>
              </div>

              {/* Ngân hàng */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-400">Ngân hàng:</span>
                <span className="font-bold text-white font-mono">{linkData.bankName} ({linkData.bankId})</span>
              </div>

              {/* Số tài khoản */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Số tài khoản (STK):</span>
                  <span className="font-mono text-base font-black text-amber-400">{linkData.accountNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(linkData.accountNumber, "accountNumber")}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  {copiedField === "accountNumber" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã Chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao Chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Chủ tài khoản */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="text-slate-400">Chủ tài khoản:</span>
                <span className="font-bold text-white font-mono uppercase">{linkData.accountHolder}</span>
              </div>

              {/* Số tiền */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Số tiền cần chuyển:</span>
                  <span className="font-mono text-base font-black text-red-500">
                    {linkData.amount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(linkData.amount.toString(), "amount")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedField === "amount" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đã Chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao Chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Nội dung chuyển khoản */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px]">Nội dung chuyển khoản (bắt buộc):</span>
                  <span className="font-mono text-sm font-black text-emerald-400">{linkData.transferContent}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(linkData.transferContent, "transferContent")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  {copiedField === "transferContent" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã Chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao Chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Cảnh báo quan trọng */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Lưu ý quan trọng:</strong> Vui lòng giữ nguyên <strong>nội dung chuyển khoản</strong> và chuyển đúng <strong>số tiền</strong> để hệ thống tự động kích hoạt tài khoản trong vòng 30 giây.
                </div>
              </div>
            </div>

            {/* Card 3: Nút Hành Động Cho Khách */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDoneModal(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Tôi Đã Chuyển Khoản Xong</span>
              </button>

              <div className="flex gap-2">
                <a
                  href={`https://zalo.me/0352867283?text=${zaloPreMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-sky-400" />
                  <span>Nhắn Zalo Tuấn Thái Bình</span>
                </a>

                <Link
                  href="/"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center transition-colors border border-slate-800"
                >
                  Trang Chủ
                </Link>
              </div>
            </div>
          </>
        )}
      </main>

      {/* MODAL XÁC NHẬN ĐÃ CHUYỂN KHOẢN XONG */}
      {showDoneModal && linkData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-black text-lg text-white">Đã Ghi Nhận Thanh Toán!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cảm ơn bạn đã thuê acc tại Tuấn Thái Bình. Để nhận ID và Mật Khẩu bàn giao trong 30 giây, vui lòng bấm nút bên dưới để gửi tin nhắn xác nhận qua Zalo.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-1 font-mono">
              <div className="text-slate-400 text-[10px]">Đơn thanh toán:</div>
              <div className="font-bold text-white">{paymentId} • {linkData.accountCode}</div>
              <div className="text-amber-400 font-bold">{linkData.amount.toLocaleString("vi-VN")}đ ({linkData.packageName})</div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://zalo.me/0352867283?text=${zaloPreMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhận Tài Khoản Qua Zalo</span>
              </a>

              <button
                type="button"
                onClick={() => setShowDoneModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
