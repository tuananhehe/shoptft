import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Clock, Calendar } from "lucide-react";
import { BlogPost } from "@/utils/blog-shared";
import { analytics } from "@/utils/analytics";
import { Reveal } from "@/components/reveal";

interface TFTBlogPreviewProps {
  posts?: BlogPost[];
}

export const TFTBlogPreview: React.FC<TFTBlogPreviewProps> = ({ posts = [] }) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  const displayPosts = posts.slice(0, 3);

  return (
    <section className="bg-[#090909] py-8 sm:py-12 lg:py-14 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] mb-2">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                <span>KIẾN THỨC & CẨM NANG</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-[-0.02em] text-white leading-tight">
                Cẩm Nang & Bài Viết Mới
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-xl font-normal leading-relaxed">
                Chia sẻ giáo án meta, phân tích tộc hệ TFT Mùa 18 và hướng dẫn bảo mật tài khoản từ Tuấn Thái Bình.
              </p>
            </div>

            <Link
              href="/blog"
              onClick={() => analytics.trackHomepageBlogClick("all")}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Xem tất cả bài viết →</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {displayPosts.map((post, idx) => (
            <Reveal key={post.id || post.slug} delay={idx * 60}>
              <Link
                href={`/blog/${post.slug}`}
                onClick={() => analytics.trackHomepageBlogClick(post.slug)}
                className="group flex flex-col justify-between h-full rounded-2xl bg-[#141414] hover:bg-[#18181b] border border-white/[0.08] hover:border-white/20 transition-all duration-200 overflow-hidden"
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-white/[0.06]">
                    <img
                      src={post.coverImage || "/banner-seo.jpg"}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {post.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] sm:text-[11px] font-semibold text-zinc-200 uppercase tracking-wider">
                        {post.category}
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readingTime || "3 phút"}</span>
                      </span>
                      {post.patch && (
                        <span>• Patch {post.patch}</span>
                      )}
                    </div>

                    <h3 className="font-heading text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition-colors">
                  <span className="text-[11px] font-medium text-amber-400/90">Đọc bài viết</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-amber-400" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
