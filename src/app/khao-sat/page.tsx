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
  Star,
  CheckCircle2,
  Send,
  Loader2,
  Gift,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Zap,
  Gamepad2,
  RotateCcw,
  User,
  Phone,
  Clock,
  ThumbsUp,
  Bug,
} from "lucide-react";

type BranchType = "THUE_ACC" | "GDTG" | "WEBSITE";

const BRANCH_CONFIG: Record<
  BranchType,
  {
    title: string;
    shortTitle: string;
    subtitle: string;
    rewardBadge: string;
    icon: any;
    color: string;
    badgeBg: string;
    borderHover: string;
    tag: string;
  }
> = {
  THUE_ACC: {
    title: "Thuê Acc TFT (TFT Mobile & PC)",
    shortTitle: "Thuê Acc",
    subtitle: "Tí Nị Thần Thoại, Sân đấu EDM độc quyền, Gói cày đêm...",
    rewardBadge: "Voucher 50K + Acc Gacha",
    tag: "Thuê VIP & Cày Đêm",
    icon: Gamepad2,
    color: "from-orange-500 to-amber-500",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    borderHover: "hover:border-orange-500 hover:ring-2 hover:ring-orange-400/20",
  },
  GDTG: {
    title: "Giao Dịch Trung Gian (GDTG ĐTCL)",
    shortTitle: "GDTG",
    subtitle: "Check Mail Ẩn, Riot ID sạch, Quỹ bảo hiểm 30M...",
    rewardBadge: "Miễn Phí GDTG < 1M",
    tag: "Bảo Hiểm Checkscam 30M",
    icon: ShieldCheck,
    color: "from-blue-600 to-cyan-500",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    borderHover: "hover:border-blue-500 hover:ring-2 hover:ring-blue-400/20",
  },
  WEBSITE: {
    title: "Báo Lỗi & Cải Thiện Website",
    shortTitle: "Website",
    subtitle: "Tối ưu giao diện mobile, link QR thanh toán, bộ lọc...",
    rewardBadge: "Voucher Tri Ân 30K",
    tag: "Đóng Góp Ý Kiến",
    icon: Bug,
    color: "from-emerald-600 to-teal-500",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    borderHover: "hover:border-emerald-500 hover:ring-2 hover:ring-emerald-400/20",
  },
};

const STAR_LABELS: Record<number, string> = {
  1: "1 Sao - Cần cải thiện rất nhiều",
  2: "2 Sao - Chưa thực sự hài lòng",
  3: "3 Sao - Đạt mức tiêu chuẩn",
  4: "4 Sao - Rất hài lòng, phục vụ chu đáo",
  5: "5 Sao - Xuất sắc, dịch vụ vượt mong đợi",
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
    if (!selectedBranch || currentStep === 0) return 0;
    if (isFinalStep) return 100;
    return Math.round((currentStep / (totalQuestions + 1)) * 100);
  }, [selectedBranch, currentStep, totalQuestions, isFinalStep]);

  // Handle Branch Selection
  const handleSelectBranch = (branch: BranchType) => {
    setSelectedBranch(branch);
    const bReward = config?.branchRewards?.[branch] || config?.reward;
    if (bReward?.voucherCode) setRewardCode(bReward.voucherCode);
    if (bReward?.rewardTitle) setRewardTitle(bReward.rewardTitle);
    if (bReward?.rewardDescription) setRewardDescription(bReward.rewardDescription);

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
    setTimeout(() => {
      handleNextStep();
    }, 240);
  };

  // Handle Star Rating selection with auto-advance
  const handleStarRatingSelect = (questionId: string, star: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: star }));
    setTimeout(() => {
      handleNextStep();
    }, 280);
  };

  // Handle NPS 1-10 rating with auto-advance
  const handleNpsSelect = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
    setTimeout(() => {
      handleNextStep();
    }, 280);
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

    if (!customerZalo.trim()) {
      toast.error("Vui lòng nhập Số Zalo để Shop gửi quà tri ân nhé!");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Đang gửi ý kiến khảo sát...");

    try {
      const branchTitle = selectedBranch ? BRANCH_CONFIG[selectedBranch].title : "Thuê Acc TFT";
      const payload = {
        branch: selectedBranch || "THUE_ACC",
        servicesUsed: [branchTitle],
        satisfactionRating: Number(answers.q_satisfaction) || 5,
        deliverySpeed: answers.q_thue_speed || answers.q_gdtg_speed || answers.q_web_experience || "Siêu nhanh (< 1 phút)",
        supportAttitude: answers.q_attitude || "Rất nhiệt tình & chu đáo",
        accountQuality:
          answers.q_quality ||
          (Array.isArray(answers.q_web_bug_type) ? answers.q_web_bug_type.join(", ") : answers.q_web_bug_type) ||
          "Đúng 100% như mô tả",
        requestedAdditions: answers.q_thue_additions || answers.q_web_feature_wish || undefined,
        pricingPerception: answers.q_pricing || "Hợp lý, vừa túi tiền",
        improvementSuggestion:
          answers.q_web_bug_detail ||
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white font-sans">
      <TFTNavbar />

      <main className="max-w-xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 w-full flex-1">
        {/* ============================================================ */}
        {/* TOP COMPACT HEADER / PROGRESS BAR                            */}
        {/* ============================================================ */}
        <div className="mb-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-orange-600 transition-colors py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang Chủ</span>
            </Link>

            {selectedBranch && !isSubmitted && (
              <button
                type="button"
                onClick={handleChangeBranch}
                className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-orange-600 bg-white border border-slate-200/80 px-2.5 py-1 rounded-full text-[11px] shadow-xs cursor-pointer transition-colors active:scale-95"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Đổi dịch vụ</span>
              </button>
            )}
          </div>

          {/* Progress Bar Header Card */}
          {selectedBranch && !isSubmitted && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${BRANCH_CONFIG[selectedBranch].badgeBg}`}>
                    {BRANCH_CONFIG[selectedBranch].shortTitle}
                  </span>
                  <span className="text-slate-800 text-[11px] font-bold">
                    {isFinalStep ? "Bước cuối: Nhận Quà Tri Ân" : `Câu ${currentStep} / ${totalQuestions}`}
                  </span>
                </div>
                <span className="font-mono text-orange-600 text-[11px]">{progressPercent}%</span>
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 1. SUCCESS SCREEN (THANK YOU & VOUCHER GIFT)                 */}
        {/* ============================================================ */}
        {isSubmitted ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 text-center space-y-5 animate-scaleUp">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-gaming">
                CẢM ƠN BẠN ĐÃ GÓP Ý!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Mọi đóng góp chân thành của bạn đều được <strong>Tuấn Thái Bình</strong> đọc và ghi nhận để nâng cấp dịch vụ tốt hơn.
              </p>
            </div>

            {/* Reward Voucher Box */}
            {config?.reward?.enabled !== false && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 border-2 border-dashed border-orange-300 max-w-md mx-auto space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-orange-700 font-bold text-[11px] uppercase tracking-wider">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <span>{rewardTitle}</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-orange-600 tracking-wider bg-white px-4 py-1.5 rounded-xl border border-orange-200 shadow-xs select-all">
                    {rewardCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDiscount}
                    className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
                    title="Sao chép mã"
                  >
                    {copiedCode ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {rewardDescription}
                </p>
              </div>
            )}

            {/* Quick CTAs */}
            <div className="flex flex-col gap-2.5 pt-2">
              <a
                href={`https://zalo.me/0352867283?text=${encodeURIComponent(
                  selectedBranch === "GDTG"
                    ? `Chào Tuấn, mình vừa hoàn thành khảo sát GDTG trên web! Mã ưu đãi của mình là: ${rewardCode} (${rewardTitle}). Mình muốn nhận ưu đãi free phí GDTG nhé!`
                    : selectedBranch === "WEBSITE"
                    ? `Chào Tuấn, mình vừa hoàn thành đóng góp ý kiến & báo lỗi website! Mã ưu đãi của mình là: ${rewardCode} (${rewardTitle}). Gửi mình voucher giảm giá nhé!`
                    : `Chào Tuấn, mình vừa hoàn thành khảo sát Thuê Acc trên web! Mã ưu đãi của mình là: ${rewardCode} (${rewardTitle}). Gửi mình voucher và acc gacha nhé!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/20 active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {selectedBranch === "GDTG"
                    ? "Nhắn Zalo Nhận Free GDTG"
                    : selectedBranch === "WEBSITE"
                    ? "Nhắn Zalo Nhận Voucher Web"
                    : "Nhắn Zalo Nhận Quà & Acc Gacha"}
                </span>
              </a>

              <Link
                href="/"
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all"
              >
                Về Trang Chủ Shop
              </Link>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 2. STEP-BY-STEP PROGRESSIVE SURVEY CONTAINER                 */
          /* ============================================================ */
          <div className="space-y-3.5">
            {/* ============================================================ */}
            {/* STEP 0: SELECT BRANCH (3 DỊCH VỤ CHÍNH)                      */}
            {/* ============================================================ */}
            {currentStep === 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-4 animate-fadeIn">
                {/* Hero Header */}
                <div className="text-center space-y-1.5 pb-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full">
                    <span>Mỗi dịch vụ 1 phần quà riêng biệt • Khảo sát 30s</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight pt-1">
                    Bạn muốn đánh giá dịch vụ nào của Tuấn?
                  </h1>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Chọn đúng dịch vụ bạn quan tâm để trả lời nhanh và nhận phần quà tương ứng nhé!
                  </p>
                </div>

                {/* 3 Interactive Branch Cards */}
                <div className="grid grid-cols-1 gap-2.5">
                  {(Object.keys(BRANCH_CONFIG) as BranchType[]).map((key) => {
                    const item = BRANCH_CONFIG[key];
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectBranch(key)}
                        className={`p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 bg-white text-left transition-all cursor-pointer flex items-center gap-3.5 group ${item.borderHover} hover:shadow-md active:scale-[0.98]`}
                      >
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                        >
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                              {item.title}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                            {item.subtitle}
                          </p>
                          <div className="mt-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-md">
                              <Gift className="w-3 h-3 text-emerald-600" />
                              <span>{item.rewardBadge}</span>
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>


                {/* Trust badge */}
                <div className="pt-2 text-center text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hoàn thành trong ~30 giây • 100% nhận quà</span>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 1..N: INDIVIDUAL QUESTION STEP                          */}
            {/* ============================================================ */}
            {isQuestionStep && currentQuestion && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-4 animate-fadeIn">
                {/* Question Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-md">
                      Câu {currentStep} / {totalQuestions}
                    </span>
                    {currentQuestion.required ? (
                      <span className="text-[10px] font-bold text-rose-500">* Bắt buộc</span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Tùy chọn</span>
                    )}
                  </div>

                  <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug pt-1">
                    {currentQuestion.title}
                  </h2>

                  {currentQuestion.subtitle && (
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {currentQuestion.subtitle}
                    </p>
                  )}
                </div>

                {/* --- RATING_5 (5 STARS) --- */}
                {currentQuestion.type === "RATING_5" && (
                  <div className="py-3 text-center space-y-2.5">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
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
                            className="p-2 sm:p-2.5 rounded-2xl transition-all hover:scale-115 active:scale-95 cursor-pointer bg-slate-50 hover:bg-orange-50"
                          >
                            <Star
                              className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${
                                isActive
                                  ? "fill-amber-400 text-amber-500 drop-shadow-sm"
                                  : "text-slate-200"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs font-bold text-orange-600 min-h-[1.25rem]">
                      {STAR_LABELS[Number(answers[currentQuestion.id])] || "Chạm vào sao để đánh giá"}
                    </p>
                  </div>
                )}

                {/* --- RATING_10 (NPS) --- */}
                {currentQuestion.type === "RATING_10" && (
                  <div className="space-y-3 py-1">
                    {/* 2 Clean rows of 5 on mobile, 10 on desktop */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
                        const isSelected = answers[currentQuestion.id] === score;
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => handleNpsSelect(currentQuestion.id, score)}
                            className={`h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border active:scale-95 ${
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
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 px-1 pt-1">
                      <span>1: Rất khó giới thiệu</span>
                      <span className="text-orange-600 font-bold">
                        {answers[currentQuestion.id] ? `Đã chọn: ${answers[currentQuestion.id]} / 10 Điểm` : ""}
                      </span>
                      <span>10: Chắc chắn giới thiệu</span>
                    </div>
                  </div>
                )}

                {/* --- SINGLE CHOICE --- */}
                {currentQuestion.type === "SINGLE_CHOICE" && (
                  <div className="grid grid-cols-1 gap-2">
                    {currentQuestion.options?.map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSingleChoiceSelect(currentQuestion.id, opt)}
                          className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99] ${
                            isSelected
                              ? "border-orange-600 bg-orange-50/80 text-orange-950 shadow-xs"
                              : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <span className="flex-1 pr-2 leading-relaxed">{opt}</span>
                          <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? "border-orange-600 bg-orange-600 text-white"
                                : "border-slate-300 group-hover:border-orange-400"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* --- MULTIPLE CHOICE --- */}
                {currentQuestion.type === "MULTIPLE_CHOICE" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
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
                            className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99] ${
                              isSelected
                                ? "border-orange-600 bg-orange-50/80 text-orange-950 shadow-xs"
                                : "border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 text-slate-800"
                            }`}
                          >
                            <span className="flex-1 pr-2 leading-relaxed">{opt}</span>
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected
                                  ? "border-orange-600 bg-orange-600 text-white"
                                  : "border-slate-300 group-hover:border-orange-400"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length > 0 && (
                      <p className="text-[11px] text-orange-600 font-bold px-1">
                        ✓ Đã chọn {answers[currentQuestion.id].length} mục
                      </p>
                    )}
                  </div>
                )}

                {/* --- TEXT / TEXTAREA --- */}
                {(currentQuestion.type === "TEXTAREA" || currentQuestion.type === "TEXT") && (
                  <div>
                    <textarea
                      rows={3}
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
                      }
                      placeholder={
                        currentQuestion.placeholder || "Gõ ý kiến đóng góp của bạn tại đây..."
                      }
                      className="w-full p-3.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none font-medium placeholder:text-slate-400"
                    />
                  </div>
                )}

                {/* Action Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-600/20 cursor-pointer active:scale-95"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP N+1: FINAL STEP (CONTACT INFO & SUBMIT FORM)            */}
            {/* ============================================================ */}
            {isFinalStep && (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-4 animate-fadeIn"
              >
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-sm">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 font-gaming">
                    Bước Cuối: Thông Tin Nhận Quà
                  </h2>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {selectedBranch === "GDTG" ? (
                      <>Nhập số Zalo để Shop gửi mã ưu đãi <strong>Miễn phí 1 lần GDTG (dưới 1 triệu)</strong> nhé!</>
                    ) : selectedBranch === "WEBSITE" ? (
                      <>Nhập số Zalo để Shop gửi tặng <strong>Voucher tri ân 30.000đ</strong> vì đã đóng góp ý kiến cải thiện website nhé!</>
                    ) : (
                      <>Nhập số Zalo để Shop gửi tặng Voucher <strong>50.000đ</strong> thuê acc và phần quà <strong>Acc Gacha</strong> nhé!</>
                    )}
                  </p>

                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-orange-600" />
                      <span>Số Zalo nhận quà tri ân:</span>
                      <span className="text-rose-500 text-[10px]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerZalo}
                      onChange={(e) => setCustomerZalo(e.target.value)}
                      placeholder="VD: 0987.xxx.xxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-orange-600" />
                      <span>Họ và Tên / Biệt danh (Không bắt buộc):</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="VD: Anh Tuấn, Đạt..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`py-3 px-5 rounded-xl text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all font-gaming cursor-pointer active:scale-98 ${
                      submitting
                        ? "bg-slate-400 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-600/30"
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
                        <span>Gửi & Nhận Quà Ngay</span>
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

