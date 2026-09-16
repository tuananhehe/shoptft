"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ArrowRight,
  MessageCircle,
  HelpCircle,
  Zap,
  Gamepad2,
  RotateCcw,
  User,
  Phone,
} from "lucide-react";

type BranchType = "THUE_ACC" | "GDTG" | "CAY_THUE";

const BRANCH_CONFIG: Record<
  BranchType,
  { title: string; subtitle: string; icon: any; color: string; badgeBg: string; borderHover: string }
> = {
  THUE_ACC: {
    title: "Thuê Acc TFT",
    subtitle: "Tướng Tí Nị, Sân Đấu, Bậc Rank, Tốc độ giao acc...",
    icon: Gamepad2,
    color: "from-orange-500 to-amber-500",
    badgeBg: "bg-orange-100 text-orange-700 border-orange-200",
    borderHover: "hover:border-orange-500 hover:ring-2 hover:ring-orange-400/20",
  },
  GDTG: {
    title: "GDTG TFT (Giao Dịch Trung Gian)",
    subtitle: "Độ an toàn, check mail ẩn, phí trung gian, giải ngân tiền...",
    icon: ShieldCheck,
    color: "from-blue-600 to-cyan-500",
    badgeBg: "bg-blue-100 text-blue-700 border-blue-200",
    borderHover: "hover:border-blue-500 hover:ring-2 hover:ring-blue-400/20",
  },
  CAY_THUE: {
    title: "Cày Thuê TFT & Coaching",
    subtitle: "Mốc rank mục tiêu, bảo mật, coaching 1-1, tiến độ cày...",
    icon: Zap,
    color: "from-purple-600 to-pink-500",
    badgeBg: "bg-purple-100 text-purple-700 border-purple-200",
    borderHover: "hover:border-purple-500 hover:ring-2 hover:ring-purple-400/20",
  },
};

export default function KhaoSatPage() {
  const [config, setConfig] = useState<SurveyConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);

  // Selected Branch & Wizard step
  const [selectedBranch, setSelectedBranch] = useState<BranchType | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = Branch select, 1..N = Questions, N+1 = Final user info

  // Answers State
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [hoverRating, setHoverRating] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState<string>("");
  const [customerZalo, setCustomerZalo] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [rewardCode, setRewardCode] = useState<string>("TRIAN-TFT50");
  const [rewardTitle, setRewardTitle] = useState<string>("Mã Ưu Đãi Tri Ân Dành Riêng Cho Bạn");
  const [rewardDescription, setRewardDescription] = useState<string>(
    "⚡ Giảm ngay 50.000đ khi gửi mã này qua Zalo Tuấn Thái Bình + Tặng 1 Acc Gacha 400-2000 Kỉ Vật!"
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    getSurveyConfigApi()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setConfig(res.data);
          if (res.data.reward?.voucherCode) setRewardCode(res.data.reward.voucherCode);
          if (res.data.reward?.rewardTitle) setRewardTitle(res.data.reward.rewardTitle);
          if (res.data.reward?.rewardDescription) setRewardDescription(res.data.reward.rewardDescription);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingConfig(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter questions for the selected branch (excluding the root selector q_branch)
  const branchQuestions = useMemo(() => {
    if (!config?.questions || !selectedBranch) return [];
    return config.questions.filter(
      (q) =>
        q.enabled !== false &&
        q.id !== "q_branch" &&
        (q.branch === selectedBranch || q.branch === "ALL" || !q.branch)
    );
  }, [config, selectedBranch]);

  // Total steps = 1 (Branch Select) + branchQuestions.length + 1 (Final contact & submit)
  const totalQuestions = branchQuestions.length;
  const isFinalStep = selectedBranch !== null && currentStep === totalQuestions + 1;
  const isQuestionStep = selectedBranch !== null && currentStep >= 1 && currentStep <= totalQuestions;
  const currentQuestion: SurveyQuestion | undefined = isQuestionStep ? branchQuestions[currentStep - 1] : undefined;

  // Percentage calculation
  const progressPercent = useMemo(() => {
    if (!selectedBranch || currentStep === 0) return 10;
    if (isFinalStep) return 100;
    return Math.round(((currentStep) / (totalQuestions + 1)) * 100);
  }, [selectedBranch, currentStep, totalQuestions, isFinalStep]);

  // Handle Branch Selection
  const handleSelectBranch = (branch: BranchType) => {
    setSelectedBranch(branch);
    setAnswers((prev) => ({
      ...prev,
      q_branch: BRANCH_CONFIG[branch].title,
      q_services: [BRANCH_CONFIG[branch].title],
    }));
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Multiple choice toggle
  const handleMultipleChoiceToggle = (questionId: string, option: string) => {
    const currentList = Array.isArray(answers[questionId]) ? answers[questionId] : [];
    if (currentList.includes(option)) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: currentList.filter((item: string) => item !== option),
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: [...currentList, option],
      }));
    }
  };

  // Handle Single Choice selection with auto-advance
  const handleSingleChoiceSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    // Auto advance after 250ms for seamless user flow
    setTimeout(() => {
      handleNextStep();
    }, 260);
  };

  // Handle Star Rating selection with auto-advance
  const handleStarRatingSelect = (questionId: string, star: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: star }));
    setTimeout(() => {
      handleNextStep();
    }, 300);
  };

  // Handle NPS 1-10 rating with auto-advance
  const handleNpsSelect = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
    setTimeout(() => {
      handleNextStep();
    }, 300);
  };

  // Navigate to Next Step
  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!selectedBranch) {
        toast.error("Vui lòng chọn 1 dịch vụ bạn muốn khảo sát!");
        return;
      }
      setCurrentStep(1);
      return;
    }

    if (isQuestionStep && currentQuestion) {
      if (currentQuestion.required) {
        const val = answers[currentQuestion.id];
        if (
          val === undefined ||
          val === null ||
          (typeof val === "string" && !val.trim()) ||
          (Array.isArray(val) && val.length === 0)
        ) {
          toast.error("Vui lòng trả lời câu hỏi này trước khi tiếp tục nhé!");
          return;
        }
      }
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Navigate to Previous Step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle Reset / Change Branch
  const handleChangeBranch = () => {
    setSelectedBranch(null);
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Copy voucher
  const handleCopyDiscount = () => {
    navigator.clipboard.writeText(rewardCode);
    setCopiedCode(true);
    toast.success("Đã sao chép mã ưu đãi!", { icon: "🎁" });
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    const toastId = toast.loading("Đang gửi ý kiến khảo sát...");

    try {
      const branchTitle = selectedBranch ? BRANCH_CONFIG[selectedBranch].title : "Thuê Acc TFT";
      const payload = {
        servicesUsed: [branchTitle],
        satisfactionRating: Number(answers.q_satisfaction) || 5,
        deliverySpeed: answers.q_thue_speed || answers.q_gdtg_speed || "Siêu nhanh (< 1 phút)",
        supportAttitude: answers.q_attitude || "Rất nhiệt tình & chu đáo",
        accountQuality: answers.q_quality || "Đúng 100% như mô tả",
        requestedAdditions: answers.q_thue_additions || undefined,
        pricingPerception: answers.q_pricing || "Hợp lý, vừa túi tiền",
        improvementSuggestion:
          answers.q_gdtg_suggestion ||
          answers.q_cay_suggestion ||
          answers.q_suggestion ||
          `Khảo sát nhánh: ${branchTitle}`,
        recommendScore: Number(answers.q_recommend) || 10,
        customerName: customerName.trim() || undefined,
        customerZalo: customerZalo.trim() || undefined,
        customAnswers: {
          ...answers,
          selectedBranch,
          branchName: branchTitle,
        },
      };

      const res = await submitSurveyApi(payload);

      if (res.success) {
        toast.success("Cảm ơn bạn! Ý kiến đóng góp đã được gửi thành công!", {
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

  const headerInfo = config?.header || {
    title: "Khảo Sát Ý Kiến & Đóng Góp Cải Tiến",
    subtitle: "Shop TFT Tuấn Thái Bình • TFT MOBILE - ĐTCL",
    description:
      "Nhằm nâng cao chất lượng dịch vụ Thuê Acc, GDTG và Cày Thuê ngày càng chuyên nghiệp, Tuấn rất mong nhận được những góp ý thẳng thắn từ bạn. Hoàn thành khảo sát để nhận ngay Mã giảm giá tri ân 50.000đ và 1 Acc Gacha 400-2000 Kỉ Vật nhé!",
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white font-sans">
      <TFTNavbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1">
        {/* Top Header Links */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Trang Chủ</span>
          </Link>

          {selectedBranch && !isSubmitted && (
            <button
              type="button"
              onClick={handleChangeBranch}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-orange-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đổi nhánh dịch vụ</span>
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* 1. SUCCESS SCREEN (THANK YOU & VOUCHER GIFT) */}
        {/* ============================================================ */}
        {isSubmitted ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10 text-center space-y-6 animate-scaleUp">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-gaming">
                CẢM ƠN BẠN ĐÃ GÓP Ý!
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
                Mọi ý kiến đóng góp của bạn đều được <strong>Tuấn Thái Bình</strong> đọc và ghi nhận trực tiếp để nâng cấp dịch vụ ngày một tốt hơn.
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

                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {rewardDescription}
                </p>
              </div>
            )}

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-all"
              >
                Về Trang Chủ Shop
              </Link>
              <a
                href={PROFILE_INFO.zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Zalo Nhận Acc Gacha</span>
              </a>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 2. STEP-BY-STEP PROGRESSIVE SURVEY CONTAINER */
          /* ============================================================ */
          <div className="space-y-4">
            {/* Header Branding Card */}
            <div className="bg-white rounded-3xl border-t-8 border-t-orange-600 border-x border-b border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr from-orange-500 to-amber-500 shadow-sm flex-shrink-0">
                  <img
                    src={PROFILE_INFO.avatarUrl}
                    alt="Tuấn Thái Bình"
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 font-gaming leading-tight">
                    {headerInfo.title}
                  </h1>
                  <span className="text-xs font-semibold text-orange-600">
                    {headerInfo.subtitle}
                  </span>
                </div>
              </div>

              {/* Real-time Progress Bar */}
              {selectedBranch && (
                <div className="pt-2 space-y-1.5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-orange-700 flex items-center gap-1">
                      <span>{isFinalStep ? "🎁 Bước cuối: Nhận Quà" : `Câu hỏi ${currentStep} / ${totalQuestions}`}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase border ${BRANCH_CONFIG[selectedBranch].badgeBg}`}>
                        {BRANCH_CONFIG[selectedBranch].title}
                      </span>
                    </span>
                    <span className="font-mono text-slate-500">{progressPercent}% Hoàn thành</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* STEP 0: SELECT BRANCH (3 DỊCH VỤ CHÍNH) */}
            {/* ============================================================ */}
            {currentStep === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5 animate-fadeIn">
                <div className="text-center space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full inline-block">
                    Bước 1: Chọn nhánh dịch vụ
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 font-gaming">
                    Bạn muốn đánh giá & góp ý về dịch vụ nào của Shop?
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Chọn đúng dịch vụ bạn quan tâm để trả lời các câu hỏi sát nhất và nhận quà nhé!
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {(Object.keys(BRANCH_CONFIG) as BranchType[]).map((key) => {
                    const item = BRANCH_CONFIG[key];
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectBranch(key)}
                        className={`p-4 sm:p-5 rounded-2xl border-2 border-slate-200 bg-white text-left transition-all cursor-pointer flex items-start gap-4 group ${item.borderHover} hover:shadow-md active:scale-[0.99]`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-orange-600 transition-colors">
                              {item.title}
                            </h3>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 1..N: INDIVIDUAL QUESTION STEP */}
            {/* ============================================================ */}
            {isQuestionStep && currentQuestion && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-0.5 rounded-full">
                      Câu hỏi {currentStep} / {totalQuestions}
                    </span>
                    {currentQuestion.required ? (
                      <span className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5">
                        * Bắt buộc
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">Không bắt buộc</span>
                    )}
                  </div>

                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {currentQuestion.title}
                  </h2>

                  {currentQuestion.subtitle && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {currentQuestion.subtitle}
                    </p>
                  )}
                </div>

                {/* --- RATING_5 --- */}
                {currentQuestion.type === "RATING_5" && (
                  <div className="py-4 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const currentVal = Number(answers[currentQuestion.id]) || 0;
                        const hoverVal = hoverRating[currentQuestion.id] || 0;
                        const isActive = hoverVal ? star <= hoverVal : star <= currentVal;

                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleStarRatingSelect(currentQuestion.id, star)}
                            onMouseEnter={() =>
                              setHoverRating((prev) => ({ ...prev, [currentQuestion.id]: star }))
                            }
                            onMouseLeave={() =>
                              setHoverRating((prev) => ({ ...prev, [currentQuestion.id]: 0 }))
                            }
                            className="p-2 sm:p-3 rounded-2xl transition-all hover:scale-125 active:scale-95 cursor-pointer bg-slate-50 hover:bg-orange-50"
                          >
                            <Star
                              className={`w-9 h-9 sm:w-12 sm:h-12 transition-colors ${
                                isActive
                                  ? "fill-amber-400 text-amber-500 drop-shadow-md"
                                  : "text-slate-300"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-4">
                      <span>1 Sao (Rất tệ)</span>
                      <span className="text-orange-600">
                        {answers[currentQuestion.id] ? `${answers[currentQuestion.id]} / 5 Sao ⭐` : "Chạm để đánh giá"}
                      </span>
                      <span>5 Sao (Tuyệt vời)</span>
                    </div>
                  </div>
                )}

                {/* --- RATING_10 (NPS) --- */}
                {currentQuestion.type === "RATING_10" && (
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
                        const isSelected = answers[currentQuestion.id] === score;
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => handleNpsSelect(currentQuestion.id, score)}
                            className={`py-3 sm:py-3.5 rounded-xl text-sm font-black transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-500/30 scale-105"
                                : "bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:bg-orange-50"
                            }`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>1: Chắc chắn không</span>
                      <span>10: Chắc chắn sẽ giới thiệu 🎉</span>
                    </div>
                  </div>
                )}

                {/* --- SINGLE CHOICE --- */}
                {currentQuestion.type === "SINGLE_CHOICE" && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQuestion.options?.map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSingleChoiceSelect(currentQuestion.id, opt)}
                          className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between group ${
                            isSelected
                              ? "border-orange-600 bg-orange-50/70 text-orange-950 shadow-sm"
                              : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <span className="flex-1 pr-3">{opt}</span>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? "border-orange-600 bg-orange-600 text-white"
                                : "border-slate-300 group-hover:border-orange-400"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* --- MULTIPLE CHOICE --- */}
                {currentQuestion.type === "MULTIPLE_CHOICE" && (
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQuestion.options?.map((opt) => {
                      const currentSelected: string[] = Array.isArray(answers[currentQuestion.id])
                        ? answers[currentQuestion.id]
                        : [];
                      const isSelected = currentSelected.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleMultipleChoiceToggle(currentQuestion.id, opt)}
                          className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between group ${
                            isSelected
                              ? "border-orange-600 bg-orange-50/70 text-orange-950 shadow-sm"
                              : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <span className="flex-1 pr-3">{opt}</span>
                          <div
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? "border-orange-600 bg-orange-600 text-white"
                                : "border-slate-300 group-hover:border-orange-400"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* --- TEXT / TEXTAREA --- */}
                {(currentQuestion.type === "TEXTAREA" || currentQuestion.type === "TEXT") && (
                  <div>
                    <textarea
                      rows={4}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
                      }
                      placeholder={
                        currentQuestion.placeholder || "Nhập ý kiến đóng góp chân thành của bạn..."
                      }
                      className="w-full p-4 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none font-medium placeholder:text-slate-400"
                    />
                  </div>
                )}

                {/* Action Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/20 cursor-pointer"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP N+1: FINAL STEP (CONTACT INFO & SUBMIT FORM) */}
            {/* ============================================================ */}
            {isFinalStep && (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn"
              >
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">
                    <Gift className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 font-gaming">
                    Bước Cuối: Thông Tin Nhận Quà Tri Ân
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Nhập thông tin liên hệ để nhận mã voucher <strong>50.000đ</strong> và phần quà <strong>Acc Gacha</strong> từ Tuấn Thái Bình.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-orange-600" />
                      <span>Họ và Tên / Biệt danh (Không bắt buộc):</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="VD: Anh Tuấn, Thành Đạt..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-orange-600" />
                      <span>Số Zalo nhận quà tri ân:</span>
                    </label>
                    <input
                      type="text"
                      value={customerZalo}
                      onChange={(e) => setCustomerZalo(e.target.value)}
                      placeholder="VD: 0987.xxx.xxx"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`py-3 px-6 rounded-xl text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all font-gaming cursor-pointer ${
                      submitting
                        ? "bg-slate-400 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99]"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi Khảo Sát & Nhận Quà</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      <TFTFooter />
    </div>
  );
}
