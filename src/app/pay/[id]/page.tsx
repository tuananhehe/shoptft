"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
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
import { PaymentLinkData } from "@/utils/payment-links-service";

interface PayPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerPaymentPage({ params }: PayPageProps) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;

  const [linkData, setLinkData] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDoneModal, setShowDoneModal] = useState(false);

  // Fetch dữ liệu thanh toán từ API
  useEffect(() => {
    let isMounted = true;

    async function fetchPaySession() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pay?id=${encodeURIComponent(paymentId)}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (!isMounted) return;

        if (json.success && json.data) {
          setLinkData(json.data);
          setIsExpired(json.isExpired || json.data.status === "EXPIRED");
          setSecondsRemaining(json.remainingSeconds || 0);
        } else {
          setError(json.error || "Không tìm thấy mã link thanh toán này");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Lỗi tải thông tin thanh toán");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (paymentId) {
      fetchPaySession();
    }

    return () => {
      isMounted = false;
    };
  }, [paymentId]);

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
    `Chào Tuấn Thái Bình! Mình vừa chuyển khoản ${linkData?.amount.toLocaleString("vi-VN")}đ thuê acc ${linkData?.accountCode} (${linkData?.packageName}) theo đơn ${paymentId}. Shop kiểm tra bàn giao acc giúp mình với nhé!`
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
          /* TRƯỜNG HỢP LINK ĐÃ HẾT HẠN (QUÁ 5 PHÚT) */
          <div className="p-6 sm:p-8 text-center space-y-4 bg-slate-900/90 rounded-3xl border border-amber-500/30 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Đã Hết Hạn 5 Phút
              </span>
              <h2 className="text-xl font-black text-white">Link Thanh Toán Đã Hết Hiệu Lực</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Để tránh giữ tài khoản ảo và đảm bảo độ chính xác cho đơn thuê acc{" "}
                <strong className="text-white">{linkData.accountCode}</strong>, link thanh toán tạm thời đã tự động khóa sau 5 phút.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-left flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-700">
                {linkData.thumbnail ? (
                  <img src={linkData.thumbnail} alt={linkData.accountCode} className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-5 h-5 text-orange-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-white truncate">{linkData.accountTitle}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Mã: <strong className="text-orange-400 font-mono">{linkData.accountCode}</strong></span>
                  <span>•</span>
                  <span>{linkData.packageName}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
              <a
                href={`https://zalo.me/0352867283?text=${encodeURIComponent(`Chào Tuấn Thái Bình, link thanh toán thuê acc ${linkData.accountCode} (${paymentId}) của mình vừa hết hạn. Shop tạo lại link mới cho mình với nhé!`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Zalo Lấy Link Mới Ngay</span>
              </a>
              <Link
                href="/"
                className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors text-center"
              >
                Về Xem Danh Sách Acc
              </Link>
            </div>
          </div>
        ) : (
          /* TRƯỜNG HỢP LINK ĐANG HOẠT ĐỘNG (< 5 PHÚT) */
          <>
            {/* Countdown Banner */}
            <div
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                secondsRemaining < 60
                  ? "bg-rose-950/60 border-rose-500/50 text-rose-200 animate-pulse"
                  : "bg-orange-950/40 border-orange-500/40 text-orange-200"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    secondsRemaining < 60 ? "bg-rose-500/20 text-rose-400" : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium opacity-90 truncate">Thời gian giữ đơn thanh toán:</div>
                  <div className="text-xs font-bold text-white">
                    {secondsRemaining < 60 ? "Sắp hết hạn! Vui lòng quét mã ngay" : "Link có hiệu lực trong 5 phút"}
                  </div>
                </div>
              </div>

              {/* Đồng hồ số */}
              <div
                className={`font-mono font-black text-xl px-3 py-1 rounded-xl border flex items-center justify-center tracking-wider ${
                  secondsRemaining < 60
                    ? "bg-rose-900/80 text-rose-100 border-rose-500"
                    : "bg-slate-900 text-amber-300 border-amber-500/40 shadow-inner"
                }`}
              >
                {formatCountdown(secondsRemaining)}
              </div>
            </div>

            {/* Card 1: Tóm Tắt Thông Tin Đơn Hàng */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700 relative">
                {linkData.thumbnail ? (
                  <img src={linkData.thumbnail} alt={linkData.accountCode} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-orange-400 font-black text-xs">
                    TFT
                  </div>
                )}
                <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[8px] font-black uppercase bg-black/80 text-orange-400 border border-orange-500/30">
                  {linkData.accountCategory || "VIP"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                    {linkData.accountCode}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {linkData.packageName}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-white truncate pt-0.5">{linkData.accountTitle}</h3>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Mã đơn: <span className="font-mono text-slate-300">{paymentId}</span></span>
                  <span className="font-mono font-black text-sm text-amber-400">
                    {linkData.amount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Khu Vực Quét Mã VietQR Chuyển Khoản */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-black text-sm text-white">Quét Mã VietQR Ngân Hàng</h2>
                    <p className="text-[10px] text-slate-400">Chuyển nhanh 24/7 từ mọi ngân hàng & ví điện tử</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Chính Chủ {linkData.bankId}</span>
                </span>
              </div>

              {/* VietQR Image Card */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
                <div className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-200 text-center flex-shrink-0">
                  <img
                    src={linkData.qrUrl}
                    alt={`VietQR ${linkData.bankId}`}
                    className="w-48 sm:w-44 h-auto object-contain mx-auto rounded"
                  />
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <a
                      href={linkData.qrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Xem Cỡ Lớn</span>
                    </a>
                    <a
                      href={linkData.qrUrl}
                      download={`vietqr-${paymentId}.png`}
                      className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-orange-200 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải Mã QR</span>
                    </a>
                  </div>
                </div>

                {/* Bank Details Table with 1-click copy */}
                <div className="flex-1 w-full space-y-2 text-xs">
                  {/* Ngân hàng */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ngân hàng thụ hưởng:</span>
                      <strong className="text-xs font-extrabold text-white block">
                        {linkData.bankName}
                      </strong>
                    </div>
                    <span className="font-black text-xs font-mono text-orange-400 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                      {linkData.bankId}
                    </span>
                  </div>

                  {/* Số tài khoản */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Số tài khoản:</span>
                      <strong className="font-mono text-sm font-black text-sky-400 tracking-wider">
                        {linkData.accountNumber}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(linkData.accountNumber, "accNo")}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                    >
                      {copiedField === "accNo" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Chủ tài khoản */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tên chủ tài khoản:</span>
                      <strong className="text-xs font-extrabold text-slate-200 uppercase">
                        {linkData.accountHolder}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(linkData.accountHolder, "holder")}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Sao chép tên chủ tài khoản"
                    >
                      {copiedField === "holder" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Số tiền */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Số tiền chính xác:</span>
                      <strong className="font-mono text-base font-black text-amber-400">
                        {linkData.amount.toLocaleString("vi-VN")}đ
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(linkData.amount.toString(), "amount")}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                    >
                      {copiedField === "amount" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Nội dung chuyển khoản */}
                  <div className="bg-orange-950/40 p-2.5 rounded-xl border border-orange-500/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-orange-300">Nội Dung Chuyển Khoản (Bắt buộc):</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(linkData.transferContent, "content")}
                        className="px-2 py-0.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-orange-500/40"
                      >
                        {copiedField === "content" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Chép nội dung</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono font-black text-sm text-white bg-black/50 px-2.5 py-1.5 rounded-lg border border-orange-500/20">
                      {linkData.transferContent}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lưu ý thanh toán */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200 leading-relaxed flex items-start gap-2">
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
