"use client";

import React, { useState } from "react";
import { MBadge, MStripeDivider } from "./m-stripe-divider";
import { ArrowRight, Zap, Gauge, Flame, Fuel, Eye, Sliders, Check } from "lucide-react";

export interface BMWModel {
  id: string;
  name: string;
  category: "SEDAN" | "COUPE" | "SAV" | "ELECTRIFIED M";
  tagline: string;
  engine: string;
  power: string;
  torque: string;
  acceleration: string;
  topSpeed: string;
  fuelType: string;
  priceFrom: string;
  image: string;
  badge: string;
  description: string;
}

export const BMW_MODELS: BMWModel[] = [
  {
    id: "m3-sedan",
    name: "BMW M3 COMPETITION SEDAN",
    category: "SEDAN",
    tagline: "The Benchmark of High-Performance Sedans",
    engine: "3.0L M TwinPower Turbo Inline 6-Cylinder",
    power: "510 HP",
    torque: "650 Nm",
    acceleration: "3.5 s (0-100 km/h)",
    topSpeed: "290 km/h",
    fuelType: "Gasoline",
    priceFrom: "$80,200",
    image: "https://images.unsplash.com/photo-1555353540-64580b51c258?q=80&w=1200&auto=format&fit=crop",
    badge: "M xDrive",
    description:
      "A racing legend engineered for everyday dominance. The BMW M3 Competition features aggressive front cooling intakes, carbon roof, and adaptive M suspension.",
  },
  {
    id: "m4-coupe",
    name: "BMW M4 COMPETITION COUPE",
    category: "COUPE",
    tagline: "Uncompromising Precision and Coupé Aesthetics",
    engine: "3.0L M TwinPower Turbo High-Rev Engine",
    power: "530 HP",
    torque: "650 Nm",
    acceleration: "3.4 s (0-100 km/h)",
    topSpeed: "290 km/h",
    fuelType: "Gasoline",
    priceFrom: "$83,200",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop",
    badge: "Competition",
    description:
      "Sensational agility with a radical silhouette. The M4 Coupé merges track-derived cooling systems with sculpted flared wheel arches and active M differential.",
  },
  {
    id: "m5-hybrid",
    name: "THE ALL-NEW BMW M5",
    category: "SEDAN",
    tagline: "First Electrified High-Performance V8 Saloon",
    engine: "4.4L M TwinPower V8 + M eDrive Electric Motor",
    power: "727 HP",
    torque: "1,000 Nm",
    acceleration: "3.5 s (0-100 km/h)",
    topSpeed: "305 km/h",
    fuelType: "PHEV High-Performance",
    priceFrom: "$119,500",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1200&auto=format&fit=crop",
    badge: "M HYBRID",
    description:
      "A new era of M Power. Seamless electric launch combined with high-revving V8 twin-turbo thrust and purely electric cruising range up to 69 km.",
  },
  {
    id: "m8-gran-coupe",
    name: "BMW M8 COMPETITION GRAN COUPE",
    category: "COUPE",
    tagline: "The Pinnacle of Motorsport Luxury",
    engine: "4.4L Bi-Turbo V8 Engine with Cross-Bank Manifold",
    power: "625 HP",
    torque: "750 Nm",
    acceleration: "3.2 s (0-100 km/h)",
    topSpeed: "305 km/h",
    fuelType: "Gasoline",
    priceFrom: "$138,800",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
    badge: "V8 Biturbo",
    description:
      "Flawless grand touring capability with racetrack ferocity. 0 to 100 km/h in 3.2 seconds accompanied by an unmistakable motorsport acoustic soundtrack.",
  },
  {
    id: "xm-label",
    name: "BMW XM LABEL RED",
    category: "SAV",
    tagline: "The Most Powerful BMW M Vehicle Ever Created",
    engine: "4.4L M TwinPower V8 + Electric Motor System",
    power: "748 HP",
    torque: "1,000 Nm",
    acceleration: "3.8 s (0-100 km/h)",
    topSpeed: "290 km/h",
    fuelType: "M HYBRID SAV",
    priceFrom: "$185,000",
    image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop",
    badge: "748 HP M Hybrid",
    description:
      "An avant-garde Sports Activity Vehicle with imposing proportions, illuminated iconic kidney grille, Toronto Red accents, and bespoke lounge interior.",
  },
  {
    id: "i4-m50",
    name: "BMW i4 M50 GRAN COUPE",
    category: "ELECTRIFIED M",
    tagline: "Instant Torque with Pure Electric M Dynamics",
    engine: "Dual BMW M eDrive Electric Motors",
    power: "544 HP",
    torque: "795 Nm",
    acceleration: "3.9 s (0-100 km/h)",
    topSpeed: "225 km/h",
    fuelType: "100% Electric",
    priceFrom: "$69,700",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop",
    badge: "All-Electric M",
    description:
      "Zero local emissions with instantaneous throttle response, engineered M suspension, and iconic BMW IconicSounds Electric composed by Hans Zimmer.",
  },
];

const CATEGORIES = ["ALL", "SEDAN", "COUPE", "SAV", "ELECTRIFIED M"] as const;

export const ModelShowcase: React.FC<{
  onSelectModelForCustomizer?: (model: BMWModel) => void;
}> = ({ onSelectModelForCustomizer }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeModalModel, setActiveModalModel] = useState<BMWModel | null>(null);

  const filteredModels =
    selectedCategory === "ALL"
      ? BMW_MODELS
      : BMW_MODELS.filter((m) => m.category === selectedCategory);

  return (
    <section id="models" className="py-24 bg-canvas text-white border-b border-hairline">
      <div className="max-w-marketing mx-auto px-4 md:px-8">
        {/* Section Header with M Stripe */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center gap-3">
            <MBadge size="md" />
            <span className="text-xs font-bold uppercase tracking-machined text-m-blue-light">
              Official Production Lineup
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
                MORE NEW M MODELS.
              </h2>
              <p className="text-body font-light text-sm md:text-base mt-2 max-w-xl">
                Engineered for maximum lateral acceleration, precise chassis feedback, and
                uncompromising high-revving performance.
              </p>
            </div>

            {/* Category Tabs according to DESIGN.md */}
            <div className="flex flex-wrap gap-2 sm:gap-6 border-b border-hairline pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold uppercase tracking-machined py-2 transition-all relative ${
                    selectedCategory === cat
                      ? "text-white after:absolute after:bottom-[-9px] after:left-0 after:w-full after:h-[2px] after:bg-white"
                      : "text-muted hover:text-body"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Up Grid of Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="bg-surface-card border border-hairline hover:border-hairline-strong flex flex-col justify-between transition-all duration-300 group"
            >
              {/* Photo Area (16:10 aspect ratio) */}
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-soft">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${model.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-hairline px-2.5 py-1 text-[11px] font-bold uppercase tracking-machined text-white">
                  {model.badge}
                </div>

                <div className="absolute bottom-3 right-3 text-xs font-bold uppercase tracking-machined text-body-strong bg-black/60 px-2 py-0.5 border border-white/10">
                  {model.priceFrom}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-machined text-m-blue-light mb-1">
                    {model.category}
                  </div>
                  <h3 className="text-xl font-bold uppercase text-white tracking-tight leading-tight group-hover:text-m-blue-dark transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-xs font-light text-body mt-2 line-clamp-2">
                    {model.tagline}
                  </p>
                </div>

                {/* Performance Metric Row */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-hairline/60 bg-surface-soft/60 px-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-machined text-muted block">Power</span>
                    <span className="text-sm font-bold text-white">{model.power}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-machined text-muted block">0-100</span>
                    <span className="text-sm font-bold text-white">{model.acceleration.split(" ")[0]} s</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-machined text-muted block">Top Speed</span>
                    <span className="text-sm font-bold text-white">{model.topSpeed}</span>
                  </div>
                </div>

                {/* Action Links */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActiveModalModel(model)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-machined text-white hover:text-m-blue-light transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Technical Specs</span>
                  </button>

                  {onSelectModelForCustomizer && (
                    <button
                      onClick={() => onSelectModelForCustomizer(model)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-machined text-m-red hover:underline"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Technical Detail Modal */}
      {activeModalModel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-card border border-hairline max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-none relative animate-fadeIn">
            <MStripeDivider />

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-machined text-m-blue-light font-bold">
                    {activeModalModel.category} // {activeModalModel.badge}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase text-white mt-1">
                    {activeModalModel.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalModel(null)}
                  className="w-10 h-10 border border-hairline hover:border-white flex items-center justify-center text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="aspect-video w-full bg-cover bg-center border border-hairline" style={{ backgroundImage: `url(${activeModalModel.image})` }} />

              <p className="text-sm text-body leading-relaxed font-light">
                {activeModalModel.description}
              </p>

              {/* Detailed Spec Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-soft p-4 border border-hairline">
                <div>
                  <span className="text-[10px] uppercase tracking-machined text-muted block">Output</span>
                  <span className="text-base font-bold text-white">{activeModalModel.power}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-machined text-muted block">Torque</span>
                  <span className="text-base font-bold text-white">{activeModalModel.torque}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-machined text-muted block">0-100 km/h</span>
                  <span className="text-base font-bold text-white">{activeModalModel.acceleration}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-machined text-muted block">Max Speed</span>
                  <span className="text-base font-bold text-white">{activeModalModel.topSpeed}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-hairline pt-4 text-xs text-muted">
                <div className="flex justify-between">
                  <span>Engine Architecture:</span>
                  <span className="text-white font-medium">{activeModalModel.engine}</span>
                </div>
                <div className="flex justify-between">
                  <span>Powertrain Type:</span>
                  <span className="text-white font-medium">{activeModalModel.fuelType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Starting MSRP:</span>
                  <span className="text-white font-bold">{activeModalModel.priceFrom}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => {
                    if (onSelectModelForCustomizer) {
                      onSelectModelForCustomizer(activeModalModel);
                    }
                    setActiveModalModel(null);
                    const el = document.getElementById("configurator");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex-1 h-12 bg-white text-black font-bold uppercase tracking-machined text-xs flex items-center justify-center gap-2 hover:bg-m-blue-light hover:text-white transition-colors"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Customize in M Studio</span>
                </button>

                <button
                  onClick={() => setActiveModalModel(null)}
                  className="h-12 px-6 border border-hairline hover:border-white text-xs font-bold uppercase tracking-machined text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
