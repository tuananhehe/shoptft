"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { PROFILE_INFO } from "@/data/tft-data";
import {
  submitSurveyApi,
  getSurveyConfigApi,
  SurveyConfig,
  SurveyQuestion,
} from "@/utils/surveys-service";
import toast from "react-hot-toast";
import {
  ClipboardCheck,
  Star,
  CheckCircle2,
  Sparkles,
  Send,
  Loader2,
  Gift,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  MessageCircle,
  HelpCircle,
  Zap,
} from "lucide-react";

export default function KhaoSatPage() {
  const [config, setConfig] = useState<SurveyConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);

  // Form answers state
  const [answers, setAnswers] = useState<Record<string, any>>({
    q_services: ["Thuê Acc VIP theo giờ / ngày"],
    q_satisfaction: 5,
    q_speed: "⚡ Siêu nhanh (< 1 phút sau khi nhắn)",
    q_attitude: "🌟 Rất nhiệt tình, chu đáo và thân thiện",
    q_quality: "🎯 Đúng 100% như hình & mô tả trên web",
    q_additions: "",
    q_pricing: "👍 Hợp lý, vừa túi tiền học sinh sinh viên",
    q_suggestion: "",
    q_recommend: 10,
  });

  const [hoverRating, setHoverRating] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState<string>("");
  const [customerZalo, setCustomerZalo] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [rewardCode, setRewardCode] = useState<string>("TRIAN-TFT20");
  const [rewardTitle, setRewardTitle] = useState<string>("Mã Ưu Đãi Tri Ân Dành Riêng Cho Bạn");
  const [rewardDescription, setRewardDescription] = useState<string>(
    "⚡ Giảm ngay 20.000đ khi gửi mã này kèm đơn thuê acc qua Zalo Tuấn Thái Bình!"
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    getSurveyConfigApi()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setConfig(res.data);
          if (res.data.reward?.voucherCode) {
            setRewardCode(res.data.reward.voucherCode);
          }
          if (res.data.reward?.rewardTitle) {
            setRewardTitle(res.data.reward.rewardTitle);
          }
          if (res.data.reward?.rewardDescription) {
            setRewardDescription(res.data.reward.rewardDescription);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoadingConfig(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMultipleChoiceToggle = (questionId: string, option: string) => {
    const currentList = Array.isArray(answers[questionId]) ? answers[questionId] : [];
    if (currentList.includes(option)) {
      if (currentList.length > 1) {
        setAnswers({ ...answers, [questionId]: currentList.filter((item: string) => item !== option) });
      }
    } else {
      setAnswers({ ...answers, [questionId]: [...currentList, option] });
    }
  };

  const handleCopyDiscount = () => {
    navigator.clipboard.writeText(rewardCode);
    setCopiedCode(true);
    toast.success("Đã sao chép mã ưu đãi!", { icon: "🎁" });
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check required questions
    const questionsList = config?.questions || [];
    for (const q of questionsList) {
      if (!q.enabled) continue;
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || (typeof val === "string" && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
          toast.error(`Vui lòng hoàn thành câu hỏi: "${q.title}"!`);
          return;
        }
      }
    }

    setSubmitting(true);
    const toastId = toast.loading("Đang gửi ý kiến khảo sát...");

    try {
      const payload = {
        servicesUsed: Array.isArray(answers.q_services) ? answers.q_services : ["Thuê Acc VIP"],
        satisfactionRating: Number(answers.q_satisfaction) || 5,
        deliverySpeed: answers.q_speed || "Siêu nhanh (< 1 phút)",
        supportAttitude: answers.q_attitude || "Rất nhiệt tình & chu đáo",
        accountQuality: answers.q_quality || "Đúng 100% như hình & mô tả",
        requestedAdditions: answers.q_additions ? String(answers.q_additions).trim() : undefined,
        pricingPerception: answers.q_pricing || "Hợp lý, vừa túi tiền",
        improvementSuggestion: answers.q_suggestion ? String(answers.q_suggestion).trim() : "Dịch vụ rất tốt!",
        recommendScore: Number(answers.q_recommend) || 10,
        customerName: customerName.trim() || undefined,
        customerZalo: customerZalo.trim() || undefined,
        customAnswers: answers,
      };

      const res = await submitSurveyApi(payload);

      if (res.success) {
        toast.success("Cảm ơn bạn! Ý kiến đóng góp đã được gửi đến Admin!", {
          id: toastId,
          icon: "🎉",
        });
        if (res.discountCode) setRewardCode(res.discountCode);
        if (res.reward) {
          if (res.reward.rewardTitle) setRewardTitle(res.reward.rewardTitle);
          if (res.reward.rewardDescription) setRewardDescription(res.reward.rewardDescription);
        }
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(res.error || "Gửi khảo sát thất bại!", { id: toastId });
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ!", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Group enabled questions by section
  const activeQuestions = (config?.questions || []).filter((q) => q.enabled !== false);
  const sectionsMap: Record<string, SurveyQuestion[]> = {};
  activeQuestions.forEach((q) => {
    const sec = q.section || "Khảo Sát Chung";
    if (!sectionsMap[sec]) sectionsMap[sec] = [];
    sectionsMap[sec].push(q);
  });

  const headerInfo = config?.header || {
    title: "Khảo Sát Ý Kiến & Đóng Góp Cải Tiến",
    subtitle: "Shop TFT Tuấn Thái Bình • Cựu Thách Đấu ĐTCL",
    description:
      "Nhằm nâng cao chất lượng kho tài khoản và dịch vụ chăm sóc khách hàng ngày càng chu đáo, Tuấn rất mong nhận được những góp ý thẳng thắn từ bạn. Hoàn thành khảo sát để nhận ngay Mã giảm giá tri ân nhé!",
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white font-sans">
      <TFTNavbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1">
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Trang Chủ Shop</span>
          </Link>
        </div>

        {/* GOOGLE FORM CARD CONTAINER */}
        {isSubmitted ? (
          /* SUCCESS SCREEN (GOOGLE FORM THANK YOU + DISCOUNT REWARD) */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10 text-center space-y-6 animate-scaleUp">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-gaming">
                CẢM ƠN BẠN ĐÃ GÓP Ý!
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
                Mọi ý kiến đóng góp của bạn đều được <strong>Tuấn Thái Bình</strong> đọc và ghi nhận trực tiếp để nâng cấp chất lượng phục vụ ngày một tốt hơn.
              </p>
            </div>

            {/* Reward Voucher Box */}
            {config?.reward?.enabled !== false && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 border-2 border-dashed border-orange-300 max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <span>{rewardTitle}</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-orange-600 tracking-wider bg-white px-4 py-2 rounded-xl border border-orange-200 shadow-xs">
                    {rewardCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDiscount}
                    className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors cursor-pointer active:scale-95 shadow-xs"
                    title="Sao chép mã"
                  >
                    {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">{rewardDescription}</p>
              </div>
            )}

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-all"
              >
                Về Trang Chủ Khám Phá Acc
              </Link>
              <a
                href={PROFILE_INFO.zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Zalo Tuấn Thái Bình</span>
              </a>
            </div>
          </div>
        ) : (
          /* GOOGLE FORM FILLING FORM */
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* 1. Header Banner Card (Google Form Style Header) */}
            <div className="bg-white rounded-3xl border-t-8 border-t-orange-600 border-x border-b border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm flex-shrink-0">
                  <img
                    src={PROFILE_INFO.avatarUrl}
                    alt="Tuấn Thái Bình"
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-gaming leading-tight">
                    {headerInfo.title}
                  </h1>
                  <span className="text-xs font-semibold text-orange-600">
                    {headerInfo.subtitle}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {headerInfo.description}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <span className="text-red-500 font-bold">*</span>
                <span>Biểu thị câu hỏi bắt buộc</span>
              </div>
            </div>

            {/* DYNAMIC SECTIONS & QUESTIONS */}
            {Object.entries(sectionsMap).map(([sectionTitle, sectionQuestions], secIdx) => (
              <div
                key={secIdx}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-orange-700 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>{sectionTitle}</span>
                </div>

                <div className="space-y-6">
                  {sectionQuestions.map((q) => {
                    const currentVal = answers[q.id];

                    return (
                      <div key={q.id} className="space-y-2.5">
                        <label className="text-xs sm:text-sm font-bold text-slate-900 block">
                          <span>{q.title}</span> {q.required && <span className="text-red-500">*</span>}
                          {q.subtitle && (
                            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                              {q.subtitle}
                            </span>
                          )}
                        </label>

                        {/* 1. MULTIPLE CHOICE (CHECKBOXES) */}
                        {q.type === "MULTIPLE_CHOICE" && q.options && (
                          <div className="space-y-2">
                            {q.options.map((opt) => {
                              const isChecked = Array.isArray(currentVal) && currentVal.includes(opt);
                              return (
                                <label
                                  key={opt}
                                  onClick={() => handleMultipleChoiceToggle(q.id, opt)}
                                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    isChecked
                                      ? "bg-orange-50/70 border-orange-400 text-orange-950 font-semibold"
                                      : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                                  />
                                  <span className="text-xs sm:text-sm">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* 2. SINGLE CHOICE (RADIO BUTTONS) */}
                        {q.type === "SINGLE_CHOICE" && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt) => {
                              const isSelected = currentVal === opt;
                              return (
                                <label
                                  key={opt}
                                  onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                                    isSelected
                                      ? "bg-orange-50/80 border-orange-400 text-orange-950 font-semibold ring-1 ring-orange-400/30"
                                      : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500 cursor-pointer accent-orange-600"
                                  />
                                  <span className="text-xs sm:text-sm">{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* 3. 5-STAR RATING */}
                        {q.type === "RATING_5" && (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const activeHover = hoverRating[q.id] || 0;
                                const currentRating = Number(currentVal) || 5;
                                const isFilled = star <= (activeHover || currentRating);
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setAnswers({ ...answers, [q.id]: star })}
                                    onMouseEnter={() => setHoverRating({ ...hoverRating, [q.id]: star })}
                                    onMouseLeave={() => setHoverRating({ ...hoverRating, [q.id]: 0 })}
                                    aria-label={`${star} sao`}
                                    className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                                  >
                                    <Star
                                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                                        isFilled
                                          ? "text-amber-500 fill-amber-500 drop-shadow-sm"
                                          : "text-slate-200 fill-slate-100"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                            <span className="text-xs font-bold text-amber-700">
                              {Number(currentVal) === 5 && "⭐ 5/5 - Cực kỳ hài lòng & tin tưởng"}
                              {Number(currentVal) === 4 && "⭐ 4/5 - Rất tốt, hài lòng"}
                              {Number(currentVal) === 3 && "⭐ 3/5 - Bình thường, tạm ổn"}
                              {Number(currentVal) === 2 && "⭐ 2/5 - Chưa hài lòng lắm"}
                              {Number(currentVal) === 1 && "⭐ 1/5 - Kém / Thất vọng"}
                            </span>
                          </div>
                        )}

                        {/* 4. 1-10 NPS SCALE */}
                        {q.type === "RATING_10" && (
                          <div className="space-y-1.5 pt-1">
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                                const isSelected = Number(currentVal) === score;
                                return (
                                  <button
                                    key={score}
                                    type="button"
                                    onClick={() => setAnswers({ ...answers, [q.id]: score })}
                                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                                      isSelected
                                        ? "bg-orange-600 text-white border-orange-600 shadow-sm ring-2 ring-orange-400/30 scale-105"
                                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                    }`}
                                  >
                                    {score}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                              <span>1: Chắc chắn không</span>
                              <span>10: Chắc chắn giới thiệu</span>
                            </div>
                          </div>
                        )}

                        {/* 5. SHORT TEXT INPUT */}
                        {q.type === "TEXT" && (
                          <input
                            type="text"
                            value={currentVal || ""}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            placeholder={q.placeholder || "Nhập câu trả lời của bạn..."}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          />
                        )}

                        {/* 6. LONG TEXTAREA */}
                        {q.type === "TEXTAREA" && (
                          <textarea
                            rows={4}
                            value={currentVal || ""}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            placeholder={q.placeholder || "Nhập ý kiến đóng góp của bạn..."}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none leading-relaxed"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* SECTION: THÔNG TIN NHẬN QUÀ TRI ÂN */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Thông Tin Nhận Quà Tri Ân (Tùy Chọn)</span>
              </div>

              <p className="text-xs text-slate-500">
                Nhập Tên và Zalo nếu bạn muốn Admin Tuấn Thái Bình gửi thêm mã giảm giá đặc biệt và quà tặng tri ân qua Zalo nhé:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tên / Nickname của bạn:</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="VD: Hoàng Long"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Số Zalo nhận quà:</label>
                  <input
                    type="text"
                    value={customerZalo}
                    onChange={(e) => setCustomerZalo(e.target.value)}
                    placeholder="VD: 0987.xxx.xxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all font-gaming cursor-pointer ${
                  submitting
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang Gửi Ý Kiến...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Gửi Đóng Góp Ý Kiến & Nhận Quà Tri Ân</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <TFTFooter />
    </div>
  );
}
