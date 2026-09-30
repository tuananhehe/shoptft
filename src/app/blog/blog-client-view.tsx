"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Calendar,
  Clock,
  Tag,
  ArrowRight,
  Sparkles,
  Flame,
  Layers,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { BlogPost, BlogPostCategory, BLOG_CATEGORIES, isPatchStale } from "@/utils/blog-shared";

interface BlogClientViewProps {
  initialPosts: BlogPost[];
}

export const BlogClientView: React.FC<BlogClientViewProps> = ({ initialPosts }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      // Category filter
      if (selectedCategory !== "ALL" && post.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = post.title.toLowerCase().includes(q);
        const inExcerpt = post.excerpt.toLowerCase().includes(q);
        const inTags = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inExcerpt && !inTags) return false;
      }
      return true;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return initialPosts.find((p) => p.featured) || initialPosts[0];
  }, [initialPosts]);

  return (
    <div className="space-y-10">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-white text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/[0.06]"
            }`}
          >
            Tất cả bài viết
          </button>
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-zinc-950 shadow-md"
                  : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/[0.06]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết, meta..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900/80 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-400/50 transition-colors"
          />
        </div>
      </div>

      {/* Featured Banner (if on ALL and no search) */}
      {selectedCategory === "ALL" && !searchQuery && featuredPost && (
        <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900 via-zinc-900/60 to-black overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 lg:p-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Bài Nổi Bật Mùa 18</span>
                </span>
                {featuredPost.patch && (
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[11px] border border-white/[0.06]">
                    Patch {featuredPost.patch}
                  </span>
                )}
              </div>

              <Link href={`/blog/${featuredPost.slug}`}>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
              </Link>

              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                  />
                  <span className="text-zinc-200 font-medium">{featuredPost.author.name}</span>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{featuredPost.readingTime}</span>
                </span>
              </div>

              <div className="pt-2">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                >
                  <span>Đọc bài viết đầy đủ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-950">
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TFT Mùa 18 Special Hub Callout */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-white">
              Cổng Thông Tin Tổng Hợp: TFT Mùa 18 – Đại Ngàn Kỳ Bí
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cơ chế Tinh Linh, danh sách tướng, tộc hệ và cập nhật patch meta được tinh lọc bởi Tuấn Thái Bình.
            </p>
          </div>
        </div>

        <Link
          href="/blog/tft-mua-18"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs hover:bg-amber-500/30 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <span>Khám phá Hub Mùa 18</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Posts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-white">
            {selectedCategory === "ALL" ? "Tất cả bài viết mới nhất" : `Chuyên mục: ${selectedCategory}`}
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            {filteredPosts.length} bài viết
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/30 space-y-2">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">Không tìm thấy bài viết nào phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => {
              const isStale = isPatchStale(post);
              return (
                <article
                  key={post.id}
                  className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 hover:bg-zinc-900 transition-all flex flex-col justify-between overflow-hidden group hover:border-white/20"
                >
                  <div>
                    {/* Cover Thumbnail */}
                    <Link href={`/blog/${post.slug}`} className="block relative aspect-video overflow-hidden bg-zinc-950">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[11px] font-semibold text-zinc-200 border border-white/10">
                          {post.category}
                        </span>
                        {post.patch && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            isStale ? "bg-amber-500/80 text-black" : "bg-emerald-500/80 text-black"
                          }`}>
                            P{post.patch}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Content Preview */}
                    <div className="p-4 sm:p-5 space-y-2.5">
                      <Link href={`/blog/${post.slug}`}>
                        <h4 className="font-heading font-bold text-sm sm:text-base text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                      </Link>

                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      <span>{post.readingTime}</span>
                    </span>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Xem bài</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
