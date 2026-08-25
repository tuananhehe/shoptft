"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, ArrowUpRight, Gauge, Zap, Flame } from "lucide-react";
import { MBadge } from "./m-stripe-divider";

interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  model: string;
  hp: string;
  acceleration: string;
  topSpeed: string;
  imageUrl: string;
  accent: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "m5",
    tag: "THE HYBRID MONSTER",
    title: "MORE BMW M.",
    subtitle: "Electrified V8 TwinPower Turbo engineering meets track dominance with 727 hp and M xDrive precision.",
    model: "THE ALL-NEW BMW M5",
    hp: "727 HP",
    acceleration: "3.5 s",
    topSpeed: "305 km/h",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1920&auto=format&fit=crop",
    accent: "bg-m-blue-light",
  },
  {
    id: "m4-csl",
    tag: "PURE MOTORSPORT DNA",
    title: "LIGHTWEIGHT INTENSITY.",
    subtitle: "Forged in the Green Hell. Radical aerodynamics, carbon-fiber monocoque rigidity, and purist rear-wheel aggression.",
    model: "BMW M4 CSL COUPE",
    hp: "550 HP",
    acceleration: "3.7 s",
    topSpeed: "307 km/h",
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1920&auto=format&fit=crop",
    accent: "bg-m-red",
  },
  {
    id: "m8-gc",
    tag: "LUXURY MEETS FEROCITY",
    title: "THE ULTIMATE GRANDEUR.",
    subtitle: "A commanding four-door Gran Coupé sculpture capable of tearing tarmac in total executive comfort.",
    model: "BMW M8 COMPETITION GRAN COUPE",
    hp: "625 HP",
    acceleration: "3.2 s",
    topSpeed: "305 km/h",
    imageUrl: "https://images.unsplash.com/photo-1555353540-64580b51c258?q=80&w=1920&auto=format&fit=crop",
    accent: "bg-m-blue-dark",
  },
];

interface HeroBandProps {
  onOpenSoundSimulator?: () => void;
}

export const HeroBand: React.FC<HeroBandProps> = ({ onOpenSoundSimulator }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = HERO_SLIDES[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Auto transition every 8s
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[88vh] lg:min-h-[92vh] bg-canvas flex flex-col justify-between overflow-hidden border-b border-hairline">
      {/* Background Image Layer with Cinematic Gradient */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
        />
        {/* Dark Vignette & Motorsport Engineering Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      {/* Hero Content Top/Middle */}
      <div className="relative z-10 max-w-marketing mx-auto w-full px-4 md:px-8 pt-12 md:pt-20 pb-12 flex flex-col justify-between h-full">
        {/* Category Tag & Model Identifier */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MBadge size="md" />
            <span className="text-xs uppercase tracking-machined text-body-strong font-bold">
              {slide.tag}
            </span>
          </div>

          <h2 className="text-sm md:text-base uppercase tracking-machined text-m-blue-light font-bold">
            {slide.model}
          </h2>
        </div>

        {/* Display Typography */}
        <div className="my-8 max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-white leading-none tracking-tight">
            {slide.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-light text-body max-w-2xl leading-relaxed">
            {slide.subtitle}
          </p>

          {/* Primary & Outline Buttons according to DESIGN.md */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="#models"
              className="inline-flex items-center justify-center h-12 px-8 bg-transparent text-white border border-white hover:bg-white hover:text-black font-bold uppercase tracking-machined text-xs transition-all rounded-none"
            >
              <span>Explore Lineup</span>
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </a>

            {onOpenSoundSimulator && (
              <button
                onClick={onOpenSoundSimulator}
                className="inline-flex items-center justify-center h-12 px-8 bg-surface-card/90 text-white border border-hairline hover:border-m-red font-bold uppercase tracking-machined text-xs transition-all rounded-none group"
              >
                <Flame className="w-4 h-4 mr-2 text-m-red group-hover:scale-110 transition-transform" />
                <span>Hear TwinPower V8</span>
              </button>
            )}

            <a
              href="#configurator"
              className="inline-flex items-center justify-center h-12 px-8 bg-surface-soft/80 text-body hover:text-white border border-hairline hover:border-hairline-strong font-bold uppercase tracking-machined text-xs transition-all rounded-none"
            >
              <span>Customize in Studio</span>
            </a>
          </div>
        </div>

        {/* Spec Cell Badges Band & Carousel Controls */}
        <div className="pt-6 border-t border-hairline/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* 3 Spec Badges */}
          <div className="grid grid-cols-3 gap-3 md:gap-8">
            <div className="bg-surface-soft/90 border border-hairline/60 p-3 md:p-4 min-w-[90px] md:min-w-[130px]">
              <div className="text-xs uppercase tracking-machined text-muted font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-m-blue-light" />
                <span>Power</span>
              </div>
              <div className="text-xl md:text-3xl font-black text-white mt-1">
                {slide.hp}
              </div>
            </div>

            <div className="bg-surface-soft/90 border border-hairline/60 p-3 md:p-4 min-w-[90px] md:min-w-[130px]">
              <div className="text-xs uppercase tracking-machined text-muted font-bold flex items-center gap-1">
                <Gauge className="w-3 h-3 text-m-blue-dark" />
                <span>0-100 km/h</span>
              </div>
              <div className="text-xl md:text-3xl font-black text-white mt-1">
                {slide.acceleration}
              </div>
            </div>

            <div className="bg-surface-soft/90 border border-hairline/60 p-3 md:p-4 min-w-[90px] md:min-w-[130px]">
              <div className="text-xs uppercase tracking-machined text-muted font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-m-red" />
                <span>V-Max</span>
              </div>
              <div className="text-xl md:text-3xl font-black text-white mt-1">
                {slide.topSpeed}
              </div>
            </div>
          </div>

          {/* Carousel Arrows (48x48 rounded-full as per DESIGN.md) */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono uppercase tracking-machined text-muted mr-2">
              0{currentSlide + 1} / 0{HERO_SLIDES.length}
            </div>

            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="w-12 h-12 rounded-full bg-surface-card hover:bg-surface-elevated text-white border border-hairline flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="w-12 h-12 rounded-full bg-surface-card hover:bg-surface-elevated text-white border border-hairline flex items-center justify-center transition-all hover:scale-105"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
