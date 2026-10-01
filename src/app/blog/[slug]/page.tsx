import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { TFTNavbar } from "@/components/tft-navbar";
import { TFTFooter } from "@/components/tft-footer";
import { TFTMobileBottomBar } from "@/components/tft-mobile-bottom-bar";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/utils/admin-auth";
import {
  getBlogPosts,
  getPostBySlug,
  getRelatedPosts,
  isPatchStale,
  CURRENT_TFT_PATCH,
  BlogPost,
} from "@/utils/blog-service";
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Share2,
  Gamepad2,
  ShieldCheck,
  CheckCircle2,
  List,
} from "lucide-react";
import { BlogTrackingClient } from "./blog-tracking-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts({ status: "published" });
  return posts.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const post = await getPostBySlug(resolved.slug);

  if (!post) {
    return {
      title: {
        absolute: "Không tìm thấy bài viết | ShopTFTMobile",
      },
      description: "Bài viết không tồn tại hoặc đã được cập nhật.",
      robots: { index: false, follow: false },
    };
  }

  // Draft protection: If article is draft and visitor is not authorized admin, do not leak metadata
  if (post.status !== "published") {
    let isAdmin = false;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
      isAdmin = Boolean(verifyAdminSessionToken(token));
    } catch {
      isAdmin = false;
    }

    if (!isAdmin) {
      return {
        title: {
          absolute: "Không tìm thấy bài viết | ShopTFTMobile",
        },
        description: "Bài viết không tồn tại hoặc đã được cập nhật.",
        robots: { index: false, follow: false },
      };
    }
  }

  const title = post.seo?.title || `${post.title} | ShopTFTMobile`;
  const description = post.seo?.description || post.excerpt;
  const canonicalUrl = post.seo?.canonical || `https://www.shoptftmobile.net/blog/${post.slug}`;
  const ogImg = post.seo?.ogImage || post.coverImage || "https://www.shoptftmobile.net/banner-seo.jpg";
  const shouldNoindex = Boolean(post.seo?.noindex) || post.status !== "published";

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "ShopTFTMobile",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "vi_VN",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImg],
    },
    robots: {
      index: !shouldNoindex,
      follow: !shouldNoindex,
    },
  };
}

/**
 * Trích xuất danh sách tiêu đề H2 từ nội dung markdown để tạo Mục lục (Table of Contents)
 */
function extractHeadings(content: string): Array<{ id: string; text: string; level: number }> {
  const lines = content.split("\n");
  const headings: Array<{ id: string; text: string; level: number }> = [];

  lines.forEach((line) => {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      const text = h2Match[1].replace(/[*_~`]/g, "").trim();
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      headings.push({ id, text, level: 2 });
    }
  });

  return headings;
}

/**
 * Render an toàn các thẻ nội dòng: **in đậm**, [liên kết](url), `code`
 */
function formatInlineMarkdown(text: string): React.ReactNode {
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const href = linkMatch[2];
      const isExternal = href.startsWith("http://") || href.startsWith("https://");
      if (isExternal) {
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors font-medium"
          >
            {label}
          </a>
        );
      }
      return (
        <Link
          key={i}
          href={href}
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors font-medium"
        >
          {label}
        </Link>
      );
    }
    return part;
  });
}

/**
 * Render Markdown đơn giản và an toàn với định dạng bảng, tiêu đề, callout và danh sách
 */
function renderMarkdown(content: string) {
  const sections = content.split("\n\n");

  return sections.map((sec, idx) => {
    const trimmed = sec.trim();

    // H2 Heading
    if (trimmed.startsWith("## ")) {
      const text = trimmed.replace("## ", "");
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      return (
        <h2
          key={idx}
          id={id}
          className="text-xl sm:text-2xl font-heading font-black text-white mt-8 mb-4 scroll-mt-24 border-b border-white/[0.08] pb-2.5 flex items-center gap-2"
        >
          <span className="w-1.5 h-6 rounded-full bg-amber-400" />
          <span>{text}</span>
        </h2>
      );
    }

    // H3 Heading
    if (trimmed.startsWith("### ")) {
      const text = trimmed.replace("### ", "");
      return (
        <h3
          key={idx}
          className="text-base sm:text-lg font-heading font-bold text-zinc-100 mt-6 mb-3"
        >
          {formatInlineMarkdown(text)}
        </h3>
      );
    }

    // Callout Alert
    if (trimmed.startsWith("> [!TIP]") || trimmed.startsWith("> [!NOTE]")) {
      const lines = trimmed.split("\n");
      const cleanLines = lines.slice(1).map((l) => l.replace(/^>\s*/, ""));
      return (
        <div
          key={idx}
          className="my-5 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed space-y-1.5"
        >
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mẹo & Lời Khuyên Từ Tuấn Thái Bình:</span>
          </div>
          <div className="text-zinc-300 space-y-1">
            {cleanLines.map((cl, i) => (
              <p key={i}>{formatInlineMarkdown(cl)}</p>
            ))}
          </div>
        </div>
      );
    }

    // Table
    if (trimmed.startsWith("|") && trimmed.includes("---")) {
      const rows = trimmed.split("\n").filter(Boolean);
      const headerRow = rows[0]
        .split("|")
        .filter(Boolean)
        .map((c) => c.trim());
      const bodyRows = rows.slice(2).map((r) =>
        r
          .split("|")
          .filter(Boolean)
          .map((c) => c.trim())
      );

      return (
        <div key={idx} className="my-6 overflow-x-auto rounded-2xl border border-white/[0.08] bg-zinc-950">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-900 border-b border-white/[0.08] text-zinc-300 font-bold">
              <tr>
                {headerRow.map((h, i) => (
                  <th key={i} className="px-4 py-3">
                    {formatInlineMarkdown(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {bodyRows.map((r, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-zinc-900/50">
                  {r.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3 leading-relaxed">
                      {formatInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Unordered List
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").map((l) => l.replace(/^[-*]\s+/, ""));
      return (
        <ul key={idx} className="my-4 space-y-2 text-xs sm:text-sm text-zinc-300">
          {items.map((it, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span className="leading-relaxed">{formatInlineMarkdown(it)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Ordered List
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = trimmed.split("\n").map((l) => l.replace(/^\d+\.\s+/, ""));
      return (
        <ol key={idx} className="my-4 space-y-2 text-xs sm:text-sm text-zinc-300">
          {items.map((it, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5">
              <span className="font-bold text-amber-400 flex-shrink-0">
                {itemIdx + 1}.
              </span>
              <span className="leading-relaxed">{formatInlineMarkdown(it)}</span>
            </li>
          ))}
        </ol>
      );
    }

    // Standard Paragraph
    return (
      <p key={idx} className="my-4 text-xs sm:text-base text-zinc-300 leading-relaxed font-normal">
        {formatInlineMarkdown(trimmed)}
      </p>
    );
  });
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const resolved = await params;
  const post = await getPostBySlug(resolved.slug);

  if (!post) {
    notFound();
  }

  // Draft security: Only authorized admin can preview draft articles
  let isAdmin = false;
  if (post.status !== "published") {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
      isAdmin = Boolean(verifyAdminSessionToken(token));
    } catch {
      isAdmin = false;
    }

    if (!isAdmin) {
      notFound();
    }
  }

  const relatedPosts = await getRelatedPosts(post, 3);
  const headings = extractHeadings(post.content);
  const isStale = isPatchStale(post);

  const isSet18 =
    post.category === "TFT Mùa 18" ||
    post.category === "Meta & Đội Hình" ||
    post.tags.some((t) => t.toLowerCase().includes("mùa 18") || t.toLowerCase().includes("set 18"));

  const jsonLdGraph: any[] = [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Trang chủ",
          "item": "https://www.shoptftmobile.net",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://www.shoptftmobile.net/blog",
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": isSet18 ? "TFT Mùa 18" : post.category,
          "item": isSet18
            ? "https://www.shoptftmobile.net/blog/tft-mua-18"
            : `https://www.shoptftmobile.net/blog?category=${encodeURIComponent(post.category)}`,
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": post.title,
          "item": `https://www.shoptftmobile.net/blog/${post.slug}`,
        },
      ],
    },
    {
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt,
      "image": post.coverImage || "https://www.shoptftmobile.net/banner-seo.jpg",
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt,
      "author": {
        "@type": "Person",
        "name": post.author.name,
        "jobTitle": post.author.role,
        "url": "https://www.shoptftmobile.net/ve-shop",
      },
      "publisher": {
        "@type": "Organization",
        "name": "ShopTFTMobile",
        "logo": "https://www.shoptftmobile.net/avatar.jpg",
      },
      "mainEntityOfPage": `https://www.shoptftmobile.net/blog/${post.slug}`,
    },
  ];

  if (post.faqs && post.faqs.length > 0) {
    jsonLdGraph.push({
      "@type": "FAQPage",
      "mainEntity": post.faqs.map((f) => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a,
        },
      })),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": jsonLdGraph,
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TFTNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Admin Draft Preview Notice */}
        {post.status !== "published" && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">ĐANG XEM BẢN NHÁP (DRAFT PREVIEW):</span> Bài viết này chưa được xuất bản công khai. Chỉ Quản Trị Viên mới thấy trang này.
              </div>
            </div>
            <Link
              href="/admin/blog"
              className="px-3 py-1.5 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Về Quản Trị Blog
            </Link>
          </div>
        )}

        {/* Analytics Tracker Client */}
        <BlogTrackingClient slug={post.slug} category={post.category} />

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6 flex-wrap"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          {isSet18 ? (
            <Link href="/blog/tft-mua-18" className="hover:text-white transition-colors">
              TFT Mùa 18
            </Link>
          ) : (
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="hover:text-white transition-colors text-zinc-400"
            >
              {post.category}
            </Link>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-xs">
            {post.title}
          </span>
        </nav>

        {/* Patch Stale Warning Banner */}
        {post.contentType === "patch-sensitive" && (
          <div
            className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${
              isStale
                ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold">
                {isStale
                  ? `Bài viết dựa trên Patch ${post.patch || "cũ"} (Hiện tại: Patch ${CURRENT_TFT_PATCH})`
                  : `Cập nhật theo Patch ${post.patch || CURRENT_TFT_PATCH}`}
              </p>
              <p className="text-zinc-300">
                {isStale
                  ? "Meta TFT thay đổi sau mỗi 2 tuần. Một số chỉ số tướng và đội hình có thể đã có sự điều chỉnh ở bản vá mới nhất."
                  : "Nội dung và phân tích sức mạnh đội hình đã được kiểm chứng chuẩn xác cho bản vá hiện tại."}
              </p>
            </div>
          </div>
        )}

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/[0.08] text-xs font-semibold text-zinc-200">
              {post.category}
            </span>
            {post.patch && (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
                Patch {post.patch}
              </span>
            )}
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-black text-white leading-tight">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            {post.excerpt}
          </p>

          {/* Author info & timestamps */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author?.avatar || "/avatar.jpg"}
                alt={post.author?.name || "Tuấn Thái Bình"}
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              <div>
                <p className="text-xs font-bold text-white">{post.author?.name || "Tuấn Thái Bình"}</p>
                <p className="text-[11px] text-zinc-400">{post.author?.role || "Cựu Thách Đấu ĐTCL"}</p>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 flex items-center gap-4">
              <span>Đăng ngày: {new Date(post.publishedAt || post.updatedAt).toLocaleDateString("vi-VN")}</span>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <span>• Cập nhật: {new Date(post.updatedAt).toLocaleDateString("vi-VN")}</span>
              )}
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/[0.08] mb-8 bg-zinc-950">
          <img
            src={post.coverImage || "/banner-seo.jpg"}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Table of Contents (TOC) if >= 2 headings */}
        {headings.length >= 2 && (
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.08] mb-8 space-y-3">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <List className="w-4 h-4" />
              <span>Mục Lục Nội Dung Bài Viết</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-zinc-300">
              {headings.map((h, i) => (
                <li key={i}>
                  <a
                    href={`#${h.id}`}
                    className="hover:text-amber-300 transition-colors flex items-center gap-2"
                  >
                    <span className="text-zinc-500 font-mono text-[11px]">0{i + 1}.</span>
                    <span>{h.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Article Body */}
        <article className="prose prose-invert max-w-none mb-12">
          {renderMarkdown(post.content)}
        </article>

        {/* FAQ Section if defined */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="my-10 p-6 rounded-2xl bg-zinc-900/40 border border-white/[0.06] space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <span>Câu Hỏi Thường Gặp Về Bài Viết</span>
            </h3>
            <div className="space-y-3">
              {post.faqs.map((faq, i) => (
                <div key={i} className="p-4 rounded-xl bg-zinc-900 border border-white/[0.05] space-y-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-200">
                    Q: {faq.q}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed pl-4 border-l border-amber-400/40">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Author Bio Box */}
        <section className="my-10 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/70 to-black border border-white/[0.08] flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            src={post.author?.avatar || "/avatar.jpg"}
            alt={post.author?.name || "Tuấn Thái Bình"}
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40 flex-shrink-0"
          />
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h4 className="font-bold text-sm text-white">{post.author?.name || "Tuấn Thái Bình"}</h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                Chủ Shop
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cựu Thách Đấu ĐTCL máy chủ Việt Nam (1.134 ĐNG). Người sáng lập và vận hành hệ thống ShopTFTMobile, chuyên chia sẻ giáo án chuẩn meta và cung cấp dịch vụ thuê acc TFT VIP minh bạch.
            </p>
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
              <Link
                href="/ve-shop"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                Về Tuấn Thái Bình →
              </Link>
            </div>
          </div>
        </section>

        {/* Contextual CTA to Shop / Hub */}
        <section className="my-10 p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] text-center space-y-4">
          <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
            {post.category === "Pet / Chibi / Sân Đấu"
              ? "Xem acc có Pet/Chibi và Sân Đấu tương tự"
              : isSet18
              ? "Trải nghiệm đội hình Mùa 18 với acc ĐTCL sẵn có"
              : "Tìm tài khoản ĐTCL phù hợp với bạn"}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {post.category === "Pet / Chibi / Sân Đấu"
              ? "Khám phá danh sách tài khoản sở hữu Tí Nị Thần Thoại và Sân Đấu hiệu ứng đẹp mắt, bàn giao trực tiếp qua Zalo Tuấn Thái Bình TFT."
              : isSet18
              ? "Trải nghiệm các tướng Tí Nị Thần Thoại và leo rank thoải mái mà không cần nạp rương tốn kém. Bàn giao 1-1 nhanh chóng."
              : "Kho tài khoản TFT/ĐTCL đa dạng phân khúc từ clone giá rẻ đến VIP sưu tầm, hỗ trợ trực tiếp từ Tuấn Thái Bình TFT."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href={post.category === "Pet / Chibi / Sân Đấu" ? "/shop?focus=pet" : "/shop"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-md"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Xem Kho Acc</span>
            </Link>
            {isSet18 && (
              <Link
                href="/blog/tft-mua-18"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 font-semibold text-xs hover:bg-zinc-700 transition-colors"
              >
                <span>Xem Hub Mùa 18</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              href="/thue-acc-tft-dtcl"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 font-semibold text-xs hover:bg-zinc-700 transition-colors"
            >
              <span>Dịch Vụ Thuê Acc</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="pt-8 border-t border-white/[0.08] space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">
              Bài Viết Liên Quan Cùng Chủ Đề
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.06] hover:bg-zinc-900 transition-all space-y-2 group"
                >
                  <div className="aspect-video rounded-lg overflow-hidden bg-zinc-950 mb-2">
                    <img
                      src={rel.coverImage || "/banner-seo.jpg"}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                    {rel.category}
                  </span>
                  <h4 className="font-heading font-bold text-xs text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <TFTFooter />
      <TFTMobileBottomBar />
    </div>
  );
}
