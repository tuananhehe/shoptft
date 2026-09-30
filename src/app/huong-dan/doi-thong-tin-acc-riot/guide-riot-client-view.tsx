"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Lock,
  Mail,
  UserCheck,
  AlertTriangle,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Maximize2,
  X,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { PROFILE_INFO } from "@/data/tft-data";
import { analytics } from "@/utils/analytics";
import toast from "react-hot-toast";

interface StepGuide {
  id: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  details: string[];
  actionLink?: {
    url: string;
    label: string;
  };
  importantNote?: string;
  caption: string;
  visualType: "login" | "management" | "password" | "email" | "two_factor";
}

const GUIDE_STEPS: StepGuide[] = [
  {
    id: "buoc-1-dang-nhap",
    stepNumber: "01",
    title: "Đăng nhập trang quản lý tài khoản Riot",
    shortDesc: "Truy cập cổng bảo mật chính thức của Riot Games để đăng nhập thông tin acc vừa nhận.",
    details: [
      "Mở trình duyệt trên điện thoại hoặc máy tính và truy cập địa chỉ chính thức: account.riotgames.com",
      "Nhập Tên đăng nhập (Username) và Mật khẩu (Password) do Tuấn Thái Bình cung cấp qua Zalo.",
      "Lưu ý: Luôn kiểm tra thanh địa chỉ trình duyệt hiển thị đúng tên miền có đuôi riotgames.com để đảm bảo an toàn tuyệt đối.",
    ],
    actionLink: {
      url: "https://account.riotgames.com",
      label: "Mở trang account.riotgames.com ↗",
    },
    importantNote: "Không đăng nhập vào bất kỳ đường link lạ nào ngoài trang chủ chính thức của Riot Games.",
    caption: "Màn hình đăng nhập chính thức của cổng bảo mật Riot Games Account Management.",
    visualType: "login",
  },
  {
    id: "buoc-2-cai-dat-tai-khoan",
    stepNumber: "02",
    title: "Vào mục Quản lý tài khoản (Riot Account)",
    shortDesc: "Sau khi đăng nhập thành công, bạn sẽ được đưa vào trang tổng quan thông tin tài khoản.",
    details: [
      "Tại giao diện chính, chọn mục 'RIOT ACCOUNT' (hoặc 'QUẢN LÝ TÀI KHOẢN').",
      "Bạn sẽ thấy các trường thông tin bao gồm: Riot ID, Tên người dùng, Địa chỉ Email và Mật khẩu.",
      "Kiểm tra xem thông tin hiển thị đã đúng với acc bạn vừa mua/thuê hay chưa.",
    ],
    caption: "Khu vực cài đặt tài khoản hiển thị đầy đủ các mục Riot ID, Mật khẩu và Email.",
    visualType: "management",
  },
  {
    id: "buoc-3-doi-mat-khau",
    stepNumber: "03",
    title: "Đổi mật khẩu tài khoản mới (Password)",
    shortDesc: "Thiết lập mật khẩu cá nhân mới của bạn để bảo mật tuyệt đối tài khoản.",
    details: [
      "Cuộn xuống mục 'MẬT KHẨU' (PASSWORD) trong trang quản lý.",
      "Ô 1: Nhập Mật khẩu hiện tại (mật khẩu do shop cấp khi bàn giao).",
      "Ô 2: Nhập Mật khẩu mới của bạn (tối thiểu 8 ký tự, nên có cả chữ hoa, chữ thường, số hoặc ký tự đặc biệt).",
      "Ô 3: Nhập lại mật khẩu mới để xác nhận.",
      "Bấm nút 'LƯU THAY ĐỔI' (SAVE CHANGES).",
    ],
    importantNote: "Nên đặt mật khẩu khó đoán, không đặt trùng ngày sinh hoặc số điện thoại công khai.",
    caption: "Giao diện đổi mật khẩu Riot Games với 3 trường nhập và nút Lưu Thay Đổi.",
    visualType: "password",
  },
  {
    id: "buoc-4-doi-email",
    stepNumber: "04",
    title: "Đổi Email chính chủ & Bấm xác minh",
    shortDesc: "Chuyển địa chỉ email liên kết về hòm thư Gmail/Outlook cá nhân của bạn.",
    details: [
      "Tìm đến mục 'ĐỊA CHỈ EMAIL' (EMAIL ADDRESS).",
      "Xóa email cũ và điền chính xác địa chỉ Email cá nhân của bạn vào ô trống.",
      "Bấm nút 'LƯU & XÁC MINH' (SAVE & VERIFY).",
      "Riot Games sẽ gửi 1 bức thư xác minh vào hòm thư cá nhân của bạn.",
      "Mở hộp thư của bạn (kiểm tra cả mục Hộp thư đến và Thư rác/Spam), bấm vào nút 'Xác minh Email' (Verify Email) trong thư để hoàn tất 100%.",
    ],
    importantNote: "Bắt buộc phải mở mail và bấm nút Xác minh Email từ Riot thì việc đổi mail mới chính thức có hiệu lực.",
    caption: "Mục nhập Email mới và hộp thư thông báo xác nhận chính chủ từ Riot Games.",
    visualType: "email",
  },
  {
    id: "buoc-5-kiem-tra-bao-mat",
    stepNumber: "05",
    title: "Bật bảo mật 2 lớp (2FA) & Đổi Riot ID",
    shortDesc: "Kích hoạt xác thực 2 bước để không ai có thể xâm nhập tài khoản nếu không có mã từ email.",
    details: [
      "Tìm đến mục 'XÁC THỰC HAI YẾU TỐ' (TWO-FACTOR AUTHENTICATION - 2FA).",
      "Gạt công tắc sang trạng thái BẬT (ON). Từ nay mỗi lần đăng nhập trên thiết bị lạ, Riot sẽ gửi mã 6 số về email của bạn.",
      "Nếu muốn đổi tên hiển thị trong game (Riot ID + Tagline), bạn có thể đổi trực tiếp tại mục Riot ID (Riot cho đổi miễn phí 90 ngày/lần).",
    ],
    caption: "Hệ thống xác thực hai bước (2FA) đã được kích hoạt thành công với biểu tượng bảo mật xanh.",
    visualType: "two_factor",
  },
];

const FAQS = [
  {
    q: "Sau khi đổi xong thông tin, mình có cần báo lại cho Shop không?",
    a: "Không bắt buộc, nhưng bạn nên nhắn một tin xác nhận qua Zalo cho Tuấn Thái Bình để Shop ghi chú hoàn tất đơn hàng và kích hoạt bảo hành trọn vẹn cho bạn.",
  },
  {
    q: "Nếu Riot yêu cầu mã xác minh từ email cũ của Shop thì sao?",
    a: "Với các acc trắng thông tin bàn giao mới, bạn chỉ cần nhắn tin ngay qua Zalo, Shop sẽ đọc ngay mã OTP gửi về mail cũ trong vòng 30 giây để bạn hoàn tất đổi sang mail của mình!",
  },
  {
    q: "Bao lâu mình nên đổi thông tin sau khi nhận tài khoản?",
    a: "Bạn nên tiến hành đổi mật khẩu và email ngay trong vòng 15–30 phút sau khi nhận bàn giao để đảm bảo quyền sở hữu riêng tư tuyệt đối.",
  },
  {
    q: "Mình có thể đổi tên nhân vật trong game (Riot ID) ngay không?",
    a: "Có! Tại mục Riot ID trong trang quản lý tài khoản, bạn có thể tự do đặt Tên nhân vật và Tagline (ví dụ: #VN2, #TFT...) hoàn toàn miễn phí.",
  },
];

export function GuideRiotClientView() {
  const [activeTab, setActiveTab] = useState<string>("buoc-1-dang-nhap");
  const [zoomedVisual, setZoomedVisual] = useState<StepGuide | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyRiotUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("https://account.riotgames.com");
      setCopiedLink(true);
      toast.success("Đã sao chép link Riot: account.riotgames.com");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const scrollToStep = (stepId: string) => {
    setActiveTab(stepId);
    const el = document.getElementById(stepId);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full flex-1 pb-16">
      {/* 1. BREADCRUMB */}
      <div className="border-b border-white/[0.08] bg-[#09090b]/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/#huong-dan" className="hover:text-white transition-colors">
              Hướng dẫn
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-white font-medium truncate">Đổi thông tin acc Riot</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* 2. HERO INTRO */}
        <div className="bg-[#121214] rounded-2xl sm:rounded-3xl border border-white/[0.08] p-6 sm:p-10 relative overflow-hidden mb-8 sm:mb-12">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cẩm Nang An Toàn • ShopTFTMobile</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight leading-tight">
              Hướng Dẫn Đổi Thông Tin Tài Khoản Riot Games
            </h1>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
              Quy trình chuẩn từng bước giúp bạn đổi mật khẩu, email chính chủ, Riot ID và kích hoạt bảo mật 2 lớp sau khi nhận tài khoản từ Tuấn Thái Bình. Đơn giản, an toàn và hoàn tất chỉ trong 3 phút.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://account.riotgames.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
              >
                <span>Mở Cổng Riot Games</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleCopyRiotUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Đã copy link" : "Copy link Riot"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. QUICK NAVIGATION CHIPS (Mobile horizontal scroll / Desktop flex) */}
        <div className="mb-8 sticky top-16 z-30 bg-[#09090b]/90 backdrop-blur-md py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-zinc-500 font-medium whitespace-nowrap pl-1 hidden sm:inline">Mục lục:</span>
            {GUIDE_STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToStep(s.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex-shrink-0 ${
                  activeTab === s.id
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white border-white/[0.08] hover:border-white/20"
                }`}
              >
                <span className="font-mono mr-1.5 opacity-70">{s.stepNumber}</span>
                <span>{s.title.split("(")[0].replace("Đăng nhập trang quản lý tài khoản Riot", "Đăng nhập Riot")}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => scrollToStep("faq-section")}
              className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/20 text-xs font-medium transition-all cursor-pointer flex-shrink-0"
            >
              FAQ Giải Đáp
            </button>
          </div>
        </div>

        {/* 4. MAIN CONTENT: STEP-BY-STEP SECTIONS */}
        <div className="space-y-8 sm:space-y-12">
          {GUIDE_STEPS.map((step, idx) => (
            <section
              key={step.id}
              id={step.id}
              className="bg-[#121214] rounded-2xl sm:rounded-3xl border border-white/[0.08] p-5 sm:p-8 space-y-5 transition-all hover:border-white/15"
            >
              {/* Step Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-black">
                      BƯỚC {step.stepNumber}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">Bảo mật tài khoản</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-white tracking-tight">
                    {step.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    {step.shortDesc}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0 text-zinc-400">
                  {idx === 0 && <UserCheck className="w-5 h-5 text-white" />}
                  {idx === 1 && <Sparkles className="w-5 h-5 text-white" />}
                  {idx === 2 && <KeyRound className="w-5 h-5 text-white" />}
                  {idx === 3 && <Mail className="w-5 h-5 text-white" />}
                  {idx === 4 && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                </div>
              </div>

              {/* Step Action Link if present */}
              {step.actionLink && (
                <div className="pt-1">
                  <a
                    href={step.actionLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white hover:text-zinc-200 underline font-medium"
                  >
                    <span>{step.actionLink.label}</span>
                  </a>
                </div>
              )}

              {/* Step Details Bullet Points */}
              <ul className="space-y-2 pt-1">
                {step.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Important Callout Note */}
              {step.importantNote && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step.importantNote}</span>
                </div>
              )}

              {/* STEP VISUAL / ILLUSTRATION MOCKUP */}
              <div className="pt-2">
                <div
                  onClick={() => setZoomedVisual(step)}
                  className="group relative rounded-xl sm:rounded-2xl border border-white/10 bg-[#0c0c0e] p-3 sm:p-5 overflow-hidden cursor-pointer hover:border-white/30 transition-all shadow-inner"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-white/[0.06] pb-2 mb-3">
                    <span className="font-mono font-medium flex items-center gap-1.5 text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      Giao diện mẫu: {step.title}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 group-hover:text-white transition-colors">
                      <Maximize2 className="w-3 h-3" />
                      <span>Xem phóng to</span>
                    </span>
                  </div>

                  {/* Render Visual Representation based on step */}
                  <RiotStepGraphic visualType={step.visualType} />

                  <div className="mt-3 text-[11px] text-zinc-400 text-center font-normal">
                    {step.caption}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* 5. SECURITY CHECKLIST */}
        <div className="mt-12 bg-[#121214] rounded-2xl sm:rounded-3xl border border-white/[0.08] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-heading font-bold text-white">
              Quy Tắc Bảo Vệ Tài Khoản Tuyệt Đối
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Không chia sẻ mật khẩu mới</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Sau khi bàn giao, Tuấn Thái Bình tuyệt đối không bao giờ yêu cầu bạn cung cấp lại mật khẩu mới.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Giữ an toàn hòm thư Email</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Email cá nhân của bạn là chìa khóa khôi phục acc Riot. Hãy cài bảo mật 2 lớp cho Gmail của bạn.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Không đăng nhập web nạp lậu</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Tránh các trang web giả mạo tặng báu vật, vòng quay hoặc nạp RP lậu để không bị đánh cắp thông tin.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bảo hành uy tín tại Shop</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Tất cả tài khoản bàn giao đều được bảo hiểm 30.000.000đ Checkscam và hỗ trợ trọn đời bởi Tuấn.
              </p>
            </div>
          </div>
        </div>

        {/* 6. FAQ SECTION */}
        <div id="faq-section" className="mt-12 bg-[#121214] rounded-2xl sm:rounded-3xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-zinc-300" />
              <h3 className="text-base sm:text-lg font-heading font-bold text-white">
                Giải Đáp Các Câu Hỏi Thường Gặp Khi Đổi Acc
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Các thắc mắc phổ biến nhất của khách hàng sau khi nhận tài khoản.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] space-y-1.5"
              >
                <h4 className="text-xs sm:text-sm font-semibold text-white flex items-start gap-2">
                  <span className="text-zinc-500 font-mono">Q:</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed pl-5 font-normal">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. SUPPORT CTA FOOTER BANNER */}
        <div className="mt-12 bg-gradient-to-r from-zinc-900 to-[#141416] rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-10 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <MessageCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
              Cần Hỗ Trợ Đổi Thông Tin Hoặc Gặp Lỗi?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Nếu Riot yêu cầu mã xác minh từ email cũ hoặc bạn cần hỗ trợ kỹ thuật, hãy nhắn tin ngay cho Tuấn Thái Bình qua Zalo để được xử lý trong vòng 1 phút!
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.trackClickZalo({ source: "guide_riot" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Nhắn Zalo Ngay ({PROFILE_INFO.phoneZalo})</span>
            </a>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 text-xs sm:text-sm font-medium transition-colors"
            >
              <span>Xem Thêm Kho Acc</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 8. LIGHTBOX MODAL FOR DETAILED VISUAL PREVIEW */}
      <GuideVisualLightbox
        step={zoomedVisual}
        onClose={() => setZoomedVisual(null)}
      />
    </div>
  );
}

/**
 * LIGHTBOX MODAL WITH PORTAL, ZOOM & REALISTIC PREVIEWS
 */
function GuideVisualLightbox({
  step,
  onClose,
}: {
  step: StepGuide | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!step) return;
    setZoomScale(1);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") setZoomScale((prev) => Math.min(prev + 0.25, 2));
      else if (e.key === "-") setZoomScale((prev) => Math.max(prev - 0.25, 1));
      else if (e.key === "0") setZoomScale(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [step, onClose]);

  if (!step || !mounted) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh minh họa: ${step.title}`}
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between w-full max-w-4xl mx-auto z-10 pt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold">
            BƯỚC {step.stepNumber}
          </span>
          <h4 className="text-white font-bold text-xs sm:text-base font-heading truncate max-w-[200px] sm:max-w-md">
            {step.title}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/10 border border-white/15 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(prev - 0.25, 1))}
              disabled={zoomScale <= 1}
              className="p-1.5 text-zinc-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Thu nhỏ (-)"
            >
              <span className="text-xs font-bold px-1">−</span>
            </button>
            <span className="px-1.5 text-[11px] font-mono text-zinc-300">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(prev + 0.25, 2))}
              disabled={zoomScale >= 2}
              className="p-1.5 text-zinc-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Phóng to (+)"
            >
              <span className="text-xs font-bold px-1">+</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng xem ảnh"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Graphic Content Area */}
      <div
        className="flex-1 flex items-center justify-center py-2 sm:py-4 overflow-auto relative touch-manipulation"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl max-h-[75vh] overflow-y-auto rounded-2xl border border-white/15 shadow-2xl bg-[#0e0e11] p-3 sm:p-6 transition-transform duration-200"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "center center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <RiotStepGraphic visualType={step.visualType} isExpanded />
        </div>
      </div>

      {/* Bottom Caption Bar */}
      <div
        className="w-full max-w-4xl mx-auto z-10 pb-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-zinc-900/90 border border-white/10 rounded-xl p-3 text-center text-xs text-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-normal text-xs text-zinc-400">
            💡 {step.caption}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer w-full sm:w-auto"
          >
            Đóng xem ảnh
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/**
 * COMPONENT ĐỒ HỌA MÔ PHỎNG CHI TIẾT GIAO DIỆN RIOT GAMES CHUẨN XÁC & SẮC NÉT 100%
 */
function RiotStepGraphic({
  visualType,
  isExpanded = false,
}: {
  visualType: "login" | "management" | "password" | "email" | "two_factor";
  isExpanded?: boolean;
}) {
  const containerHeight = isExpanded ? "min-h-[340px]" : "min-h-[220px]";

  // Browser Chrome Frame Top Bar
  const browserBar = (
    <div className="w-full bg-[#18181c] border-b border-white/10 px-3 py-2 flex items-center justify-between text-xs rounded-t-xl select-none">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 border border-white/10 text-[11px] font-mono text-zinc-300 max-w-xs truncate">
        <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
        <span className="text-emerald-400 font-semibold">https://</span>
        <span className="text-zinc-200">account.riotgames.com</span>
      </div>

      <div className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
        Riot Security SSL
      </div>
    </div>
  );

  if (visualType === "login") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0b0b0e] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-lg`}>
        {browserBar}
        <div className="flex-1 p-4 sm:p-8 flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 border border-red-500 flex items-center justify-center text-white font-extrabold text-base tracking-widest font-heading shadow-md">
            RIOT
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white tracking-wide">CỔNG ĐĂNG NHẬP RIOT GAMES</h4>
            <p className="text-[11px] text-zinc-400">Đăng nhập tài khoản do Shop Tuấn Thái Bình bàn giao</p>
          </div>
          <div className="w-full max-w-sm space-y-2.5 pt-1 text-left text-xs">
            <div className="p-3 rounded-xl bg-black/70 border border-white/15 text-zinc-300 font-mono text-xs flex justify-between items-center relative group">
              <span className="text-zinc-400 text-[11px]">Tên đăng nhập (Username):</span>
              <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">tft_ms***</span>
              <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-sans font-bold">
                1. Nhập Username Shop cấp
              </span>
            </div>
            <div className="p-3 rounded-xl bg-black/70 border border-white/15 text-zinc-300 font-mono text-xs flex justify-between items-center relative group">
              <span className="text-zinc-400 text-[11px]">Mật khẩu (Password):</span>
              <span className="text-zinc-400">••••••••••••</span>
              <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-sans font-bold">
                2. Nhập Pass Shop cấp
              </span>
            </div>
            <button
              type="button"
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-center text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-default"
            >
              <span>ĐĂNG NHẬP (SIGN IN)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "management") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0b0b0e] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-lg`}>
        {browserBar}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="font-heading font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>QUẢN LÝ TÀI KHOẢN (RIOT ACCOUNT MANAGEMENT)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ĐÃ ĐĂNG NHẬP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-black/60 rounded-xl border border-white/10 space-y-1 relative">
              <span className="text-[10px] text-zinc-400 block font-medium">Riot ID & Tagline:</span>
              <span className="font-bold text-white block text-sm">TuanThaiBinh#VN2</span>
              <span className="text-[10px] text-emerald-400 block">Được đổi miễn phí 90 ngày/lần</span>
            </div>
            <div className="p-3.5 bg-black/60 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] text-zinc-400 block font-medium">Tên người dùng (Username):</span>
              <span className="font-bold text-white block font-mono text-sm">tft_ms8899</span>
              <span className="text-[10px] text-zinc-500 block">Dùng đăng nhập client</span>
            </div>
            <div className="p-3.5 bg-black/60 rounded-xl border border-amber-500/30 space-y-1 relative">
              <span className="text-[10px] text-amber-300 block font-bold">Mật khẩu (Password):</span>
              <span className="text-zinc-300 font-mono block text-sm">••••••••••••</span>
              <span className="inline-block text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                ⚡ Cần đổi tại Bước 3
              </span>
            </div>
            <div className="p-3.5 bg-black/60 rounded-xl border border-amber-500/30 space-y-1 relative">
              <span className="text-[10px] text-amber-300 block font-bold">Địa chỉ Email:</span>
              <span className="text-zinc-300 font-mono block text-sm truncate">shop***@gmail.com</span>
              <span className="inline-block text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                ⚡ Cần đổi tại Bước 4
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "password") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0b0b0e] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-lg`}>
        {browserBar}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-bold text-white border-b border-white/10 pb-3">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>THAY ĐỔI MẬT KHẨU RIOT GAMES (CHANGE PASSWORD)</span>
          </div>

          <div className="space-y-3 text-xs max-w-lg">
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>1. Mật khẩu hiện tại (Do Shop Tuấn cấp):</span>
                <span className="text-[10px] text-zinc-500 font-mono">Current Password</span>
              </span>
              <div className="p-2.5 bg-black/70 rounded-xl border border-white/15 text-zinc-400 font-mono text-xs">
                ••••••••••••
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-zinc-300 flex items-center justify-between font-semibold">
                <span className="text-white">2. Mật khẩu mới của bạn:</span>
                <span className="text-[10px] text-emerald-400">Tối thiểu 8 ký tự</span>
              </span>
              <div className="p-2.5 bg-black/70 rounded-xl border border-emerald-500/40 text-emerald-400 font-mono text-xs flex justify-between items-center">
                <span>MatKhauMoiCuaBan@2026</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400">3. Nhập lại mật khẩu mới để xác nhận:</span>
              <div className="p-2.5 bg-black/70 rounded-xl border border-emerald-500/40 text-emerald-400 font-mono text-xs flex justify-between items-center">
                <span>MatKhauMoiCuaBan@2026</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div className="pt-2">
              <span className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md">
                <span>LƯU THAY ĐỔI (SAVE CHANGES)</span>
                <Check className="w-3.5 h-3.5 text-black" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "email") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0b0b0e] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-lg`}>
        {browserBar}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-bold text-white border-b border-white/10 pb-3">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>ĐỔI EMAIL CHÍNH CHỦ (EMAIL ADDRESS SETTINGS)</span>
          </div>

          <div className="space-y-3 text-xs max-w-lg">
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-300 font-medium">
                Nhập địa chỉ Email cá nhân của bạn (Gmail, Outlook...):
              </span>
              <div className="p-3 bg-black/70 rounded-xl border border-emerald-500/40 text-emerald-400 font-mono text-xs flex justify-between items-center">
                <span>email.chinhchu@gmail.com</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Bấm Lưu & Xác Minh
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Thư xác minh từ Riot Games đã được gửi!</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Mở hòm thư Gmail của bạn, tìm email từ <strong className="text-white">Riot Games</strong> và bấm nút <span className="underline font-bold text-emerald-400">VERIFY EMAIL</span> để hoàn tất chuyển chủ sở hữu 100%.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Two factor
  return (
    <div className={`w-full ${containerHeight} bg-[#0b0b0e] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-lg`}>
      {browserBar}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs sm:text-sm">
          <span className="font-heading font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>XÁC THỰC HAI YẾU TỐ (TWO-FACTOR AUTHENTICATION)</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            TRẠNG THÁI: BẬT (ON)
          </span>
        </div>

        <div className="p-5 bg-black/60 rounded-xl border border-emerald-500/30 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Tài khoản Riot đã được kích hoạt bảo vệ 2 lớp tối đa!</span>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Mỗi khi bạn hoặc bất kỳ ai đăng nhập trên máy tính mới hoặc thiết bị lạ, Riot Games sẽ tự động gửi mã OTP 6 số về địa chỉ Email chính chủ của bạn để phê duyệt. Không ai có thể vào acc nếu không có email của bạn!
          </p>
        </div>
      </div>
    </div>
  );
}

