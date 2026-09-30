"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  ChevronDown,
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
  details: { text: string; highlight?: string }[];
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
    title: "Đăng nhập cổng bảo mật Riot Games",
    shortDesc: "Truy cập cổng chính thức account.riotgames.com để đăng nhập thông tin do Shop cấp.",
    details: [
      { text: "Mở trình duyệt truy cập trang chủ chính thức:", highlight: "account.riotgames.com" },
      { text: "Nhập Tên đăng nhập (Username) và Mật khẩu do Tuấn Thái Bình bàn giao qua Zalo." },
      { text: "Luôn kiểm tra đúng tên miền có đuôi riotgames.com để tránh web giả mạo." },
    ],
    actionLink: {
      url: "https://account.riotgames.com",
      label: "Mở trang account.riotgames.com ↗",
    },
    importantNote: "Không đăng nhập vào bất kỳ đường link lạ nào ngoài trang chủ chính thức của Riot Games.",
    caption: "Màn hình đăng nhập chính thức của cổng bảo mật Riot Games.",
    visualType: "login",
  },
  {
    id: "buoc-2-cai-dat-tai-khoan",
    stepNumber: "02",
    title: "Vào mục Quản lý tài khoản (Riot Account)",
    shortDesc: "Sau khi đăng nhập thành công, bạn sẽ vào trang tổng quan thông tin tài khoản.",
    details: [
      { text: "Tại thanh menu chính, chọn mục:", highlight: "RIOT ACCOUNT (hoặc Quản Lý Tài Khoản)" },
      { text: "Kiểm tra 4 mục quan trọng: Riot ID, Tên người dùng, Mật khẩu và Địa chỉ Email." },
      { text: "Xác nhận các thông tin hiển thị đã đúng với tài khoản bạn vừa nhận từ Shop." },
    ],
    caption: "Trang cài đặt tổng quan hiển thị Riot ID, Mật khẩu và Email liên kết.",
    visualType: "management",
  },
  {
    id: "buoc-3-doi-mat-khau",
    stepNumber: "03",
    title: "Đổi mật khẩu mới (Change Password)",
    shortDesc: "Thiết lập mật khẩu cá nhân mới của bạn để bảo mật tuyệt đối tài khoản.",
    details: [
      { text: "Cuộn xuống mục MẬT KHẨU (Password) trong trang quản lý." },
      { text: "Ô 1: Nhập Mật khẩu hiện tại (mật khẩu ban đầu do Shop cấp)." },
      { text: "Ô 2 & 3: Nhập Mật khẩu mới của bạn và xác nhận lại." },
      { text: "Bấm nút:", highlight: "LƯU THAY ĐỔI (Save Changes)" },
    ],
    importantNote: "Mật khẩu mới tối thiểu 8 ký tự, nên gồm cả chữ hoa, chữ thường và số để đạt độ an toàn cao.",
    caption: "Biểu mẫu thay đổi mật khẩu Riot Games với 3 trường nhập và nút Lưu Thay Đổi.",
    visualType: "password",
  },
  {
    id: "buoc-4-doi-email",
    stepNumber: "04",
    title: "Đổi Email chính chủ & Bấm xác minh",
    shortDesc: "Chuyển địa chỉ email liên kết về hòm thư Gmail/Outlook cá nhân của bạn.",
    details: [
      { text: "Tại mục ĐỊA CHỈ EMAIL, nhập địa chỉ Email cá nhân của bạn." },
      { text: "Bấm nút:", highlight: "LƯU & XÁC MINH (Save & Verify)" },
      { text: "Mở hòm thư Gmail/Outlook của bạn, tìm email do Riot Games gửi về." },
      { text: "Bấm vào nút VERIFY EMAIL trong thư để hoàn tất chuyển chủ sở hữu 100%." },
    ],
    importantNote: "Bắt buộc phải mở mail và bấm nút xác minh thì việc đổi email mới chính thức có hiệu lực.",
    caption: "Giao diện nhập Email mới và thông báo thư xác minh từ Riot Games.",
    visualType: "email",
  },
  {
    id: "buoc-5-kiem-tra-bao-mat",
    stepNumber: "05",
    title: "Bật bảo mật 2 lớp (2FA) & Đổi Riot ID",
    shortDesc: "Kích hoạt xác thực 2 bước nhận OTP và đổi tên hiển thị trong game hoàn toàn miễn phí.",
    details: [
      { text: "Tại mục XÁC THỰC HAI YẾU TỐ (2FA), gạt công tắc sang:", highlight: "BẬT (ON)" },
      { text: "Mỗi khi đăng nhập trên thiết bị lạ, Riot sẽ gửi mã OTP 6 số về Email của bạn để phê duyệt." },
      { text: "Tại mục Riot ID, bạn có thể tự do đổi Tên nhân vật và Tagline (#VN2, #TFT...) miễn phí 90 ngày/lần." },
    ],
    caption: "Hệ thống xác thực hai bước (2FA) đã được kích hoạt thành công.",
    visualType: "two_factor",
  },
];

const SECURITY_RULES = [
  {
    title: "Không chia sẻ mật khẩu mới",
    desc: "Sau khi bàn giao, Tuấn Thái Bình tuyệt đối không bao giờ hỏi lại mật khẩu mới của bạn.",
    icon: CheckCircle2,
  },
  {
    title: "Bảo mật Email cá nhân",
    desc: "Cài bảo mật 2 lớp cho hòm thư Gmail của bạn để đảm bảo quyền khôi phục tài khoản.",
    icon: CheckCircle2,
  },
  {
    title: "Tránh web giả mạo nạp lậu",
    desc: "Không đăng nhập vào các trang nhận RP hay báu vật miễn phí lừa đảo trôi nổi trên mạng.",
    icon: CheckCircle2,
  },
  {
    title: "Bảo hành Checkscam uy tín",
    desc: "Mọi tài khoản bàn giao đều được bảo hiểm 30 triệu Checkscam và hỗ trợ trọn đời bởi Tuấn.",
    icon: CheckCircle2,
  },
];

const FAQS = [
  {
    q: "Sau khi đổi xong thông tin, mình có cần báo lại cho Shop không?",
    a: "Không bắt buộc, nhưng bạn nên nhắn tin xác nhận qua Zalo cho Tuấn Thái Bình để Shop ghi nhận hoàn tất đơn hàng và kích hoạt bảo hành trọn đời cho bạn.",
  },
  {
    q: "Nếu Riot yêu cầu mã xác minh từ email cũ của Shop thì sao?",
    a: "Với các acc bàn giao, nếu hệ thống gửi mã xác minh về email cũ, bạn chỉ cần nhắn tin ngay qua Zalo, Shop sẽ đọc ngay mã OTP trong vòng 30 giây để bạn hoàn tất đổi sang mail của mình!",
  },
  {
    q: "Bao lâu mình nên đổi thông tin sau khi nhận tài khoản?",
    a: "Bạn nên tiến hành đổi mật khẩu và email ngay trong vòng 15–30 phút sau khi nhận bàn giao để đảm bảo quyền sở hữu riêng tư tuyệt đối.",
  },
  {
    q: "Mình có thể đổi tên nhân vật trong game (Riot ID) ngay không?",
    a: "Có! Tại mục Riot ID trong trang quản lý tài khoản, bạn có thể tự do đặt Tên nhân vật và Tagline (ví dụ: #VN2, #TFT...) hoàn toàn miễn phí (chu kỳ 90 ngày/lần).",
  },
];

export function GuideRiotClientView() {
  const [activeTab, setActiveTab] = useState<string>("buoc-1-dang-nhap");
  const [zoomedVisual, setZoomedVisual] = useState<StepGuide | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopyRiotUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("https://account.riotgames.com");
      setCopiedLink(true);
      toast.success("Đã copy link: account.riotgames.com");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const scrollToStep = (stepId: string) => {
    setActiveTab(stepId);
    const el = document.getElementById(stepId);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full flex-1 pb-24 sm:pb-16">
      {/* 1. BREADCRUMB (Ẩn trên mobile để tiết kiệm diện tích) */}
      <div className="hidden sm:block border-b border-white/[0.08] bg-[#09090b]/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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

      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        {/* 2. HERO INTRO - GỌN GÀNG, CHUYÊN NGHIỆP TRÊN CẢ MOBILE & DESKTOP */}
        <div className="bg-[#121214] rounded-2xl sm:rounded-3xl border border-white/[0.08] p-4.5 sm:p-7 relative overflow-hidden mb-5 sm:mb-8">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-2.5 sm:space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] sm:text-xs text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Cẩm Nang Bảo Mật • ShopTFTMobile</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-white tracking-tight leading-tight">
              Hướng Dẫn Đổi Thông Tin Acc Riot Games
            </h1>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
              Quy trình 5 bước đổi mật khẩu, email chính chủ và bật bảo mật 2 lớp sau khi nhận bàn giao từ Tuấn Thái Bình. Hoàn tất nhanh trong 3 phút.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <a
                href="https://account.riotgames.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-white hover:bg-zinc-200 active:scale-98 text-black font-semibold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>Mở Cổng Riot Games</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyRiotUrl}
                className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:scale-98 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Đã copy link" : "Copy link"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. QUICK NAVIGATION CHIPS (TỐI ƯU CUỘN NGANG GỌN TRÊN MOBILE) */}
        <div className="mb-6 sm:mb-8 sticky top-14 sm:top-16 z-30 bg-[#09090b]/95 backdrop-blur-md py-2 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-zinc-500 font-medium whitespace-nowrap pl-1 hidden sm:inline text-xs">Mục lục:</span>
            {[
              { id: "buoc-1-dang-nhap", num: "01", label: "Đăng nhập" },
              { id: "buoc-2-cai-dat-tai-khoan", num: "02", label: "Quản lý acc" },
              { id: "buoc-3-doi-mat-khau", num: "03", label: "Đổi Pass" },
              { id: "buoc-4-doi-email", num: "04", label: "Đổi Email" },
              { id: "buoc-5-kiem-tra-bao-mat", num: "05", label: "Bật 2FA" },
              { id: "security-rules", num: "★", label: "Lưu ý" },
              { id: "faq-section", num: "?", label: "Hỏi đáp" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToStep(tab.id)}
                className={`whitespace-nowrap px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-white text-black border-white shadow-sm font-semibold"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white border-white/[0.08] hover:border-white/20"
                }`}
              >
                <span className={`font-mono text-[10px] ${activeTab === tab.id ? "text-black/60" : "text-zinc-500"}`}>
                  {tab.num}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. MAIN CONTENT: 5 BƯỚC HƯỚNG DẪN TINH GỌN */}
        <div className="space-y-6 sm:space-y-8">
          {GUIDE_STEPS.map((step, idx) => (
            <section
              key={step.id}
              id={step.id}
              className="bg-[#121214] rounded-2xl border border-white/[0.08] p-4 sm:p-6 space-y-4 transition-all hover:border-white/15"
            >
              {/* Step Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-white text-black">
                      BƯỚC {step.stepNumber}
                    </span>
                    <span className="text-[11px] sm:text-xs text-zinc-400 font-medium">Bảo mật tài khoản</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
                    {step.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-snug font-normal">
                    {step.shortDesc}
                  </p>
                </div>

                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0 text-zinc-400">
                  {idx === 0 && <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                  {idx === 1 && <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                  {idx === 2 && <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                  {idx === 3 && <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                  {idx === 4 && <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
                </div>
              </div>

              {/* Step Action Link */}
              {step.actionLink && (
                <div className="pt-0.5">
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
              <ul className="space-y-1.5 pt-0.5">
                {step.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 mt-1.5 flex-shrink-0" />
                    <span>
                      {detail.text}{" "}
                      {detail.highlight && (
                        <strong className="text-white font-semibold font-mono underline decoration-zinc-500">
                          {detail.highlight}
                        </strong>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Important Callout Note */}
              {step.importantNote && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step.importantNote}</span>
                </div>
              )}

              {/* STEP VISUAL / ILLUSTRATION MOCKUP */}
              <div className="pt-1">
                <div
                  onClick={() => setZoomedVisual(step)}
                  className="group relative rounded-xl border border-white/10 bg-[#0c0c0e] p-2.5 sm:p-4 overflow-hidden cursor-pointer hover:border-white/30 transition-all shadow-inner"
                >
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 border-b border-white/[0.06] pb-1.5 mb-2.5">
                    <span className="font-mono font-medium flex items-center gap-1.5 text-zinc-300 truncate pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse flex-shrink-0" />
                      <span>Minh họa: {step.title}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 group-hover:text-white transition-colors flex-shrink-0">
                      <Maximize2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Phóng to</span>
                    </span>
                  </div>

                  {/* Render Visual Representation based on step */}
                  <RiotStepGraphic visualType={step.visualType} />

                  <div className="mt-2 text-[10px] sm:text-[11px] text-zinc-400 text-center font-normal">
                    {step.caption}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* 5. SECURITY RULES CHECKLIST */}
        <div id="security-rules" className="mt-8 sm:mt-10 bg-[#121214] rounded-2xl border border-white/[0.08] p-4.5 sm:p-6 space-y-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
            <h3 className="text-sm sm:text-base font-heading font-bold text-white">
              Quy Tắc Bảo Vệ Tài Khoản Tuyệt Đối
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5 text-xs">
            {SECURITY_RULES.map((rule, rIdx) => (
              <div key={rIdx} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{rule.title}</span>
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed pl-5 font-normal">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. FAQ SECTION (COLLAPSIBLE ACCORDION GỌN GÀNG TRÊN MOBILE) */}
        <div id="faq-section" className="mt-8 sm:mt-10 bg-[#121214] rounded-2xl border border-white/[0.08] p-4.5 sm:p-6 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-zinc-300 flex-shrink-0" />
              <h3 className="text-sm sm:text-base font-heading font-bold text-white">
                Giải Đáp Các Câu Hỏi Thường Gặp
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Các thắc mắc phổ biến nhất của khách hàng sau khi nhận tài khoản.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {FAQS.map((faq, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <div
                  key={fIdx}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-white/[0.05] border-white/20"
                      : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                    className="w-full p-3 sm:p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-sm font-semibold text-white flex items-start gap-2">
                      <span className="text-zinc-500 font-mono text-xs mt-0.5 flex-shrink-0">Q{fIdx + 1}:</span>
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3 sm:px-3.5 pb-3 sm:pb-3.5 pt-0 text-xs text-zinc-300 leading-relaxed pl-7 sm:pl-8 border-t border-white/[0.04]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. SUPPORT CTA BANNER */}
        <div className="mt-8 sm:mt-10 bg-gradient-to-r from-zinc-900 to-[#141416] rounded-2xl border border-white/10 p-5 sm:p-7 text-center space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <MessageCircle className="w-5 h-5" />
          </div>

          <div className="space-y-1 max-w-lg mx-auto">
            <h3 className="text-base sm:text-lg font-heading font-bold text-white">
              Cần Hỗ Trợ Đổi Thông Tin Hoặc Nhận Mã OTP?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Nếu Riot yêu cầu mã OTP từ email cũ hoặc bạn cần trợ giúp kỹ thuật, nhắn tin Zalo ngay cho Tuấn Thái Bình để được xử lý trong 30 giây!
            </p>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <a
              href={PROFILE_INFO.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => analytics.trackClickZalo({ source: "guide_riot" })}
              className="h-9.5 sm:h-10 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Nhắn Zalo Ngay ({PROFILE_INFO.phoneZalo})</span>
            </a>

            <Link
              href="/shop"
              className="h-9.5 sm:h-10 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Kho Acc TFT</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
 * LIGHTBOX MODAL WITH PORTAL, ZOOM & RESPONSIVE PREVIEW
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
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col justify-between p-2.5 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between w-full max-w-4xl mx-auto z-10 pt-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] sm:text-xs font-mono font-bold">
            BƯỚC {step.stepNumber}
          </span>
          <h4 className="text-white font-bold text-xs sm:text-sm font-heading truncate max-w-[180px] sm:max-w-md">
            {step.title}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/10 border border-white/15 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(prev - 0.25, 1))}
              disabled={zoomScale <= 1}
              className="p-1 sm:p-1.5 text-zinc-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Thu nhỏ (-)"
            >
              <span className="text-xs font-bold px-1">−</span>
            </button>
            <span className="px-1 text-[10px] sm:text-[11px] font-mono text-zinc-300">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(prev + 0.25, 2))}
              disabled={zoomScale >= 2}
              className="p-1 sm:p-1.5 text-zinc-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Phóng to (+)"
            >
              <span className="text-xs font-bold px-1">+</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng xem ảnh"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Graphic Content Area */}
      <div
        className="flex-1 flex items-center justify-center py-2 sm:py-4 overflow-auto relative touch-manipulation"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl max-h-[75vh] overflow-y-auto rounded-2xl border border-white/15 shadow-2xl bg-[#0e0e11] p-2.5 sm:p-5 transition-transform duration-200"
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
        <div className="bg-zinc-900/90 border border-white/10 rounded-xl p-2.5 sm:p-3 text-center text-xs text-zinc-300 flex flex-col sm:flex-row items-center justify-between gap-2">
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
 * COMPONENT ĐỒ HỌA MÔ PHỎNG CHI TIẾT GIAO DIỆN RIOT GAMES (TINH GỌN, SẮC NÉT TRÊN MOBILE)
 */
function RiotStepGraphic({
  visualType,
  isExpanded = false,
}: {
  visualType: "login" | "management" | "password" | "email" | "two_factor";
  isExpanded?: boolean;
}) {
  const containerHeight = isExpanded ? "min-h-[300px]" : "min-h-[200px]";

  // Browser Chrome Frame Top Bar (Tối ưu cho cả mobile & desktop)
  const browserBar = (
    <div className="w-full bg-[#18181c] border-b border-white/10 px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between text-xs rounded-t-xl select-none">
      <div className="flex items-center gap-1.5">
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-500/80 inline-block" />
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500/80 inline-block" />
        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500/80 inline-block" />
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-md bg-black/60 border border-white/10 text-[10px] sm:text-[11px] font-mono text-zinc-300 max-w-[200px] sm:max-w-xs truncate">
        <Lock className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-emerald-400 flex-shrink-0" />
        <span className="text-emerald-400 font-semibold">https://</span>
        <span className="text-zinc-200">account.riotgames.com</span>
      </div>

      <div className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
        SSL Verified
      </div>
    </div>
  );

  if (visualType === "login") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0b0b0e] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-lg`}>
        {browserBar}
        <div className="flex-1 p-3.5 sm:p-6 flex flex-col justify-center items-center text-center space-y-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-600 border border-red-500 flex items-center justify-center text-white font-extrabold text-sm tracking-widest font-heading shadow-md">
            RIOT
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">CỔNG ĐĂNG NHẬP RIOT GAMES</h4>
            <p className="text-[10px] sm:text-[11px] text-zinc-400">Đăng nhập tài khoản do Shop Tuấn Thái Bình bàn giao</p>
          </div>
          <div className="w-full max-w-sm space-y-2 pt-0.5 text-left text-xs">
            <div className="p-2.5 sm:p-3 rounded-xl bg-black/70 border border-white/15 text-zinc-300 font-mono text-xs flex justify-between items-center relative group">
              <span className="text-zinc-400 text-[10px] sm:text-[11px]">Tên đăng nhập:</span>
              <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded text-[11px]">tft_ms***</span>
              <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] sm:text-[9px] font-sans font-bold">
                1. Nhập Username
              </span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-black/70 border border-white/15 text-zinc-300 font-mono text-xs flex justify-between items-center relative group">
              <span className="text-zinc-400 text-[10px] sm:text-[11px]">Mật khẩu:</span>
              <span className="text-zinc-400 text-xs">••••••••••••</span>
              <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] sm:text-[9px] font-sans font-bold">
                2. Nhập Pass ban đầu
              </span>
            </div>
            <div className="w-full py-2 bg-red-600 text-white font-bold text-center text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 select-none">
              <span>ĐĂNG NHẬP (SIGN IN)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "management") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0b0b0e] rounded-xl border border-white/10 flex flex-col overflow-hidden shadow-lg`}>
        {browserBar}
        <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-center space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="font-heading font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>QUẢN LÝ TÀI KHOẢN (RIOT ACCOUNT)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-mono font-bold flex items-center gap-1 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ĐÃ ĐĂNG NHẬP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 sm:p-3 bg-black/60 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-zinc-400 block font-medium">Riot ID & Tagline:</span>
              <span className="font-bold text-white block text-xs sm:text-sm truncate">TuanThaiBinh#VN2</span>
              <span className="text-[9px] text-emerald-400 block">Đổi miễn phí 90 ngày/lần</span>
            </div>
            <div className="p-2.5 sm:p-3 bg-black/60 rounded-xl border border-white/10 space-y-0.5">
              <span className="text-[10px] text-zinc-400 block font-medium">Tên người dùng:</span>
              <span className="font-bold text-white block font-mono text-xs sm:text-sm">tft_ms8899</span>
              <span className="text-[9px] text-zinc-500 block">Dùng đăng nhập client</span>
            </div>
            <div className="p-2.5 sm:p-3 bg-black/60 rounded-xl border border-amber-500/30 space-y-0.5">
              <span className="text-[10px] text-amber-300 block font-bold">Mật khẩu (Password):</span>
              <span className="text-zinc-300 font-mono block text-xs">••••••••••••</span>
              <span className="inline-block text-[9px] text-amber-400 font-semibold bg-amber-500/10 px-1 py-0.5 rounded">
                ⚡ Cần đổi tại Bước 3
              </span>
            </div>
            <div className="p-2.5 sm:p-3 bg-black/60 rounded-xl border border-amber-500/30 space-y-0.5">
              <span className="text-[10px] text-amber-300 block font-bold">Địa chỉ Email:</span>
              <span className="text-zinc-300 font-mono block text-xs truncate">shop***@gmail.com</span>
              <span className="inline-block text-[9px] text-amber-400 font-semibold bg-amber-500/10 px-1 py-0.5 rounded">
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
        <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-center space-y-3">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold text-white border-b border-white/10 pb-2.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>THAY ĐỔI MẬT KHẨU (CHANGE PASSWORD)</span>
          </div>

          <div className="space-y-2 text-xs max-w-lg">
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-[11px] text-zinc-400 flex items-center justify-between">
                <span>1. Mật khẩu hiện tại:</span>
                <span className="text-[9px] text-zinc-500 font-mono">Current Password</span>
              </span>
              <div className="p-2 bg-black/70 rounded-xl border border-white/15 text-zinc-400 font-mono text-xs">
                ••••••••••••
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-[11px] text-zinc-300 flex items-center justify-between font-semibold">
                <span className="text-white">2. Mật khẩu mới của bạn:</span>
                <span className="text-[9px] text-emerald-400 font-medium">Tối thiểu 8 ký tự</span>
              </span>
              <div className="p-2 bg-black/70 rounded-xl border border-emerald-500/40 text-emerald-400 font-mono text-xs flex justify-between items-center">
                <span className="truncate">MatKhauMoiCuaBan@2026</span>
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-[11px] text-zinc-400">3. Nhập lại mật khẩu mới:</span>
              <div className="p-2 bg-black/70 rounded-xl border border-emerald-500/40 text-emerald-400 font-mono text-xs flex justify-between items-center">
                <span className="truncate">MatKhauMoiCuaBan@2026</span>
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              </div>
            </div>

            <div className="pt-1">
              <span className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md">
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
        <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-center space-y-3">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-heading font-bold text-white border-b border-white/10 pb-2.5">
            <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>ĐỔI EMAIL CHÍNH CHỦ (EMAIL ADDRESS)</span>
          </div>

          <div className="space-y-2.5 text-xs max-w-lg">
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-[11px] text-zinc-300 font-medium">
                Nhập Email cá nhân của bạn (Gmail, Outlook...):
              </span>
              <div className="p-2.5 bg-black/70 rounded-xl border border-emerald-500/40 text-emerald-400 font-mono text-xs flex justify-between items-center">
                <span className="truncate">email.chinhchu@gmail.com</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex-shrink-0">
                  Lưu & Xác Minh
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Thư xác minh từ Riot Games đã được gửi!</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Mở hòm thư Gmail của bạn, tìm email từ <strong className="text-white">Riot Games</strong> và bấm nút <span className="underline font-bold text-emerald-400">VERIFY EMAIL</span> để hoàn tất 100%.
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
      <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-center space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs sm:text-sm">
          <span className="font-heading font-bold text-white flex items-center gap-1.5 truncate pr-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">XÁC THỰC HAI YẾU TỐ (2FA)</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            BẬT (ON)
          </span>
        </div>

        <div className="p-3.5 sm:p-4 bg-black/60 rounded-xl border border-emerald-500/30 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-white font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Tài khoản Riot đã được bảo vệ 2 lớp tối đa!</span>
          </div>
          <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed">
            Mỗi khi đăng nhập trên máy tính mới hoặc thiết bị lạ, Riot Games sẽ tự động gửi mã OTP 6 số về địa chỉ Email chính chủ của bạn để phê duyệt. Không ai có thể vào acc nếu không có email của bạn!
          </p>
        </div>
      </div>
    </div>
  );
}
