"use client";

import React, { useState } from "react";
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
      {zoomedVisual && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setZoomedVisual(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#141416] border border-white/20 rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="space-y-0.5">
                <span className="font-mono text-xs text-zinc-400">BƯỚC {zoomedVisual.stepNumber}</span>
                <h4 className="text-base font-bold text-white font-heading">{zoomedVisual.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setZoomedVisual(null)}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 sm:p-6 bg-[#09090b] rounded-xl border border-white/10 overflow-hidden">
              <RiotStepGraphic visualType={zoomedVisual.visualType} isExpanded />
            </div>

            <p className="text-xs text-zinc-400 text-center font-normal">
              {zoomedVisual.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
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
  const containerHeight = isExpanded ? "min-h-[280px]" : "min-h-[190px]";

  if (visualType === "login") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0f0f12] rounded-xl border border-white/10 p-4 sm:p-6 flex flex-col justify-center items-center text-center space-y-3`}>
        <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-bold text-sm tracking-widest font-heading">
          RIOT
        </div>
        <div className="space-y-1">
          <div className="text-xs font-semibold text-white tracking-wide">CỔNG ĐĂNG NHẬP RIOT GAMES</div>
          <div className="text-[11px] font-mono text-emerald-400">https://account.riotgames.com</div>
        </div>
        <div className="w-full max-w-xs space-y-2 pt-1 text-left text-xs">
          <div className="p-2.5 rounded-lg bg-black/60 border border-white/15 text-zinc-300 font-mono text-[11px] flex justify-between">
            <span>Tên đăng nhập (Username):</span>
            <span className="text-white font-bold">tft_ms***</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/60 border border-white/15 text-zinc-300 font-mono text-[11px] flex justify-between">
            <span>Mật khẩu (Password):</span>
            <span className="text-zinc-500">••••••••••••</span>
          </div>
          <div className="w-full py-2 bg-red-600 rounded-lg text-white font-bold text-center text-xs tracking-wider uppercase">
            Đăng nhập (Sign In) →
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "management") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0f0f12] rounded-xl border border-white/10 p-4 sm:p-6 flex flex-col justify-center space-y-3`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
          <div className="font-heading font-bold text-white flex items-center gap-2">
            <span>QUẢN LÝ TÀI KHOẢN (RIOT ACCOUNT)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">Đã Đăng Nhập</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-black/50 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] text-zinc-400 block">Riot ID:</span>
            <span className="font-bold text-white block">TuanThaiBinh#VN2</span>
          </div>
          <div className="p-3 bg-black/50 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] text-zinc-400 block">Tên người dùng:</span>
            <span className="font-bold text-white block font-mono">tft_ms8899</span>
          </div>
          <div className="p-3 bg-black/50 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] text-zinc-400 block">Mật khẩu:</span>
            <span className="text-zinc-400 font-mono block">•••••••• [Thay đổi]</span>
          </div>
          <div className="p-3 bg-black/50 rounded-lg border border-white/10 space-y-1">
            <span className="text-[10px] text-zinc-400 block">Địa chỉ Email:</span>
            <span className="text-zinc-400 font-mono block truncate">shop***@gmail.com</span>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "password") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0f0f12] rounded-xl border border-white/10 p-4 sm:p-6 flex flex-col justify-center space-y-3`}>
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-white border-b border-white/10 pb-2">
          <KeyRound className="w-4 h-4 text-zinc-400" />
          <span>THAY ĐỔI MẬT KHẨU (CHANGE PASSWORD)</span>
        </div>
        <div className="space-y-2 text-xs max-w-md">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Mật khẩu hiện tại (Shop cấp):</span>
            <div className="p-2 bg-black/60 rounded border border-white/15 text-zinc-400 font-mono text-[11px]">••••••••••••</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Mật khẩu mới của bạn:</span>
            <div className="p-2 bg-black/60 rounded border border-white/15 text-white font-mono text-[11px]">MatKhauMoiCuaBan@2026</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Xác nhận mật khẩu mới:</span>
            <div className="p-2 bg-black/60 rounded border border-white/15 text-white font-mono text-[11px]">MatKhauMoiCuaBan@2026</div>
          </div>
          <div className="pt-1">
            <span className="px-4 py-1.5 bg-white text-black font-bold text-xs rounded-lg inline-block">
              Lưu thay đổi (Save Changes) ✓
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (visualType === "email") {
    return (
      <div className={`w-full ${containerHeight} bg-[#0f0f12] rounded-xl border border-white/10 p-4 sm:p-6 flex flex-col justify-center space-y-3`}>
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-white border-b border-white/10 pb-2">
          <Mail className="w-4 h-4 text-zinc-400" />
          <span>ĐỔI EMAIL CHÍNH CHỦ (EMAIL ADDRESS)</span>
        </div>
        <div className="space-y-2.5 text-xs max-w-md">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400">Nhập địa chỉ Gmail/Email cá nhân của bạn:</span>
            <div className="p-2.5 bg-black/60 rounded border border-emerald-500/40 text-emerald-400 font-mono text-xs flex justify-between items-center">
              <span>email.cuaban@gmail.com</span>
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <span>📩 Đã gửi thư xác minh từ Riot Games!</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              Mở hộp thư email.cuaban@gmail.com và bấm nút <strong className="text-white">Verify Email</strong> để hoàn tất.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Two factor
  return (
    <div className={`w-full ${containerHeight} bg-[#0f0f12] rounded-xl border border-white/10 p-4 sm:p-6 flex flex-col justify-center space-y-3`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
        <span className="font-heading font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>XÁC THỰC HAI YẾU TỐ (2FA)</span>
        </span>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
          BẬT (ENABLED)
        </span>
      </div>
      <div className="p-4 bg-black/50 rounded-xl border border-emerald-500/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-white font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>Tài khoản đã được bảo vệ an toàn 100%!</span>
        </div>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Mỗi khi đăng nhập trên máy tính mới hoặc thiết bị lạ, Riot Games sẽ tự động gửi mã OTP 6 số về email chính chủ của bạn để bảo vệ tài khoản không bị truy cập trái phép.
        </p>
      </div>
    </div>
  );
}
