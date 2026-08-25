"use client";

import React, { useState } from "react";
import { MBadge, MStripeDivider } from "./m-stripe-divider";
import { ArrowRight, Clock, BookOpen } from "lucide-react";

interface Article {
  id: string;
  category: "MOTORSPORT" | "INNOVATION" | "HERITAGE" | "DRIVING EXPERIENCE";
  title: string;
  excerpt: string;
  fullStory: string;
  readTime: string;
  date: string;
  image: string;
}

const ARTICLES: Article[] = [
  {
    id: "gt3-nurburgring",
    category: "MOTORSPORT",
    title: "CONQUERING THE 24 HOURS OF NÜRBURGRING.",
    excerpt:
      "Inside the telemetry and aerodynamic strategy behind the BMW M4 GT3 victory in the legendary Eifel marathon.",
    fullStory:
      "The 24-Hour race at Nürburgring pushes drivers and machines past ordinary physical limits. In wet-to-dry transitions on the 25.378-kilometer circuit, the BMW M4 GT3 utilized real-time predictive tire temperature telemetry combined with driver-adjustable ABS and M Traction Control across 10 stages to take the checkered flag.",
    readTime: "5 MIN READ",
    date: "AUGUST 2026",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "m-hybrid-v8",
    category: "INNOVATION",
    title: "THE ANATOMY OF ELECTRIFIED M POWER.",
    excerpt:
      "How BMW M engineers harmonized instantaneous electric torque with the raw high-revving character of the TwinPower V8.",
    fullStory:
      "The all-new M Hybrid powertrain integrates a permanently excited synchronous electric motor directly inside the housing of the 8-speed M Steptronic transmission. Operating alongside the 4.4-liter high-revving V8, the electric boost eliminates turbo lag completely, offering immediate launch torque of up to 1,000 Nm.",
    readTime: "7 MIN READ",
    date: "JULY 2026",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "e30-m3-legacy",
    category: "HERITAGE",
    title: "50 YEARS OF ///M: FROM E30 TO THE HYPERCAR ERA.",
    excerpt:
      "The historical bloodline that started with the 3.0 CSL Batmobile and redefined touring car motorsport forever.",
    fullStory:
      "Founded in 1972 under Jochen Neerpasch, BMW Motorsport GmbH created legends that dominated European touring car championships. From the iconic boxed fenders of the 1986 E30 M3 to today's M Hybrid Hypercars, the philosophy remains uncompromising: racetrack engineering translated directly onto public asphalt.",
    readTime: "6 MIN READ",
    date: "JUNE 2026",
    image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop",
  },
];

export const MagazineGrid: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <section id="magazine" className="py-24 bg-canvas text-white border-b border-hairline">
      <div className="max-w-marketing mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="space-y-4 mb-16">
          <div className="flex items-center gap-3">
            <MBadge size="md" />
            <span className="text-xs uppercase tracking-machined text-m-blue-light font-bold">
              BMW M Editorial
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
                MORE FROM BMW M MAGAZINE.
              </h2>
              <p className="text-body font-light text-sm md:text-base mt-2 max-w-xl">
                Exclusive stories, engineering deep dives, and race paddock reports directly from the heart of BMW M GmbH.
              </p>
            </div>

            <a
              href="#motorsport"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-machined text-white hover:text-m-blue-light border-b border-white pb-1"
            >
              <span>View All Editorial Stories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 3-Up Grid of feature-photo-card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-surface-card border border-hairline hover:border-hairline-strong flex flex-col justify-between cursor-pointer group transition-all"
            >
              {/* Photo top (16:9 full bleed within card) */}
              <div className="relative aspect-[16/9] overflow-hidden bg-surface-soft">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${article.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-machined text-white border border-hairline">
                  {article.category}
                </div>
              </div>

              {/* Card Body with spacing.lg (24px) */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-muted uppercase">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-m-blue-light" />
                      {article.readTime}
                    </span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>

                  <h3 className="text-xl font-bold uppercase text-white tracking-tight leading-snug group-hover:text-m-blue-light transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs font-light text-body leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-hairline/60 flex items-center justify-between text-xs font-bold uppercase tracking-machined text-white group-hover:text-m-red transition-colors">
                  <span>Read Full Story</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Full Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-card border border-hairline max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-none relative animate-fadeIn">
            <MStripeDivider />

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-machined text-m-blue-light font-bold">
                    BMW M MAGAZINE // {selectedArticle.category}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase text-white mt-2">
                    {selectedArticle.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted font-mono mt-2 uppercase">
                    <span>{selectedArticle.date}</span>
                    <span>•</span>
                    <span>{selectedArticle.readTime}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="w-10 h-10 border border-hairline hover:border-white flex items-center justify-center text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div
                className="aspect-video w-full bg-cover bg-center border border-hairline"
                style={{ backgroundImage: `url(${selectedArticle.image})` }}
              />

              <div className="text-sm md:text-base text-body font-light leading-relaxed space-y-4">
                <p className="text-white font-medium">{selectedArticle.excerpt}</p>
                <p>{selectedArticle.fullStory}</p>
              </div>

              <div className="pt-4 border-t border-hairline flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 h-12 bg-white text-black font-bold uppercase tracking-machined text-xs hover:bg-m-blue-light hover:text-white transition-colors"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
