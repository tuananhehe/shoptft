"use client";

import React from "react";
import { MBadge, MStripeDivider } from "./m-stripe-divider";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

export const CTABand: React.FC<{ onBookTestDrive?: () => void }> = ({ onBookTestDrive }) => {
  return (
    <section className="relative w-full py-24 md:py-32 bg-canvas overflow-hidden border-b border-hairline">
      {/* Background Motorsport Track Photo */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop')",
          }}
        />
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-marketing mx-auto px-4 md:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-card border border-hairline">
          <MBadge size="sm" />
          <span className="text-xs uppercase tracking-machined text-white font-bold">
            BMW M Driving Experience
          </span>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white tracking-tight leading-tight">
            FEEL THE RAW POWER OF M ON TRACK.
          </h2>
          <p className="text-body font-light text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
            Take command of high-performance BMW M machinery with professional factory race instructors
            at benchmark circuits worldwide.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="#configurator"
            className="inline-flex items-center justify-center h-12 px-8 bg-white text-black hover:bg-m-blue-light hover:text-white font-bold uppercase tracking-machined text-xs transition-colors rounded-none"
          >
            <span>Configure Your M</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>

          <a
            href="#models"
            className="inline-flex items-center justify-center h-12 px-8 bg-transparent text-white border border-white hover:bg-white hover:text-black font-bold uppercase tracking-machined text-xs transition-colors rounded-none"
          >
            <span>Explore Lineup</span>
          </a>
        </div>
      </div>
    </section>
  );
};
