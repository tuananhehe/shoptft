"use client";

import React, { useState } from "react";
import { MBadge, MStripeDivider } from "./m-stripe-divider";
import { Sliders, Check, Sparkles, Shield, Disc, ArrowRight, Download, Share2 } from "lucide-react";
import { BMW_MODELS, BMWModel } from "./model-showcase";

interface ColorOption {
  id: string;
  name: string;
  hex: string;
  price: number;
  type: "Metallic" | "Solid" | "BMW Individual Frozen";
}

const EXTERIOR_COLORS: ColorOption[] = [
  { id: "iom-green", name: "Isle of Man Green", hex: "#154734", price: 650, type: "Metallic" },
  { id: "marina-blue", name: "Marina Bay Blue", hex: "#0b427b", price: 650, type: "Metallic" },
  { id: "sao-paulo", name: "Sao Paulo Yellow", hex: "#c9d924", price: 0, type: "Solid" },
  { id: "toronto-red", name: "Toronto Red", hex: "#b11a21", price: 650, type: "Metallic" },
  { id: "frozen-grey", name: "Frozen Deep Grey", hex: "#32373b", price: 3600, type: "BMW Individual Frozen" },
  { id: "black-sapphire", name: "Black Sapphire", hex: "#161616", price: 650, type: "Metallic" },
  { id: "alpine-white", name: "Alpine White", hex: "#ececec", price: 0, type: "Solid" },
];

interface WheelOption {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
}

const WHEEL_OPTIONS: WheelOption[] = [
  {
    id: "w-826m-black",
    name: "19\"/20\" M Forged Double-spoke 826 M",
    size: "Front 275/35 R19, Rear 285/30 R20",
    price: 0,
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w-1000m-bronze",
    name: "20\"/21\" M Performance 1000 M Frozen Gold Bronze",
    size: "Front 285/30 R20, Rear 295/25 R21",
    price: 4800,
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "w-827m-jet",
    name: "19\"/20\" M Light Alloy 827 M Jet Black",
    size: "Front 275/35 R19, Rear 285/30 R20",
    price: 1800,
    image: "https://images.unsplash.com/photo-1555353540-64580b51c258?q=80&w=400&auto=format&fit=crop",
  },
];

interface PackageOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

const M_PACKAGES: PackageOption[] = [
  {
    id: "pkg-carbon-brakes",
    name: "M Carbon Ceramic Brake System",
    price: 8500,
    description: "Gold calipers, 420mm front discs, 14kg weight reduction, zero fade.",
  },
  {
    id: "pkg-carbon-exterior",
    name: "M Carbon Exterior Package",
    price: 4700,
    description: "Carbon fiber air curtains, mirror caps, rear spoiler, and rear diffuser.",
  },
  {
    id: "pkg-drivers-pkg",
    name: "M Driver's Package",
    price: 2500,
    description: "Increases top speed limiter to 305 km/h + BMW M Driving Experience voucher.",
  },
  {
    id: "pkg-exhaust-titanium",
    name: "M Performance Titanium Exhaust System",
    price: 6800,
    description: "Quad central exhaust layout, ultra-lightweight titanium, extreme acoustics.",
  },
];

export const InteractiveConfigurator: React.FC<{
  initialModel?: BMWModel;
}> = ({ initialModel }) => {
  const [selectedModel, setSelectedModel] = useState<BMWModel>(
    initialModel || BMW_MODELS[0]
  );
  const [selectedColor, setSelectedColor] = useState<ColorOption>(EXTERIOR_COLORS[0]);
  const [selectedWheel, setSelectedWheel] = useState<WheelOption>(WHEEL_OPTIONS[0]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    "pkg-carbon-exterior",
  ]);
  const [buildSaved, setBuildSaved] = useState(false);

  const basePriceNum = parseInt(selectedModel.priceFrom.replace(/[^0-9]/g, "")) || 80200;
  const packagesTotal = selectedPackages.reduce((sum, pkgId) => {
    const p = M_PACKAGES.find((pkg) => pkg.id === pkgId);
    return sum + (p ? p.price : 0);
  }, 0);

  const totalCalculatedMSRP =
    basePriceNum + selectedColor.price + selectedWheel.price + packagesTotal;

  const togglePackage = (pkgId: string) => {
    if (selectedPackages.includes(pkgId)) {
      setSelectedPackages(selectedPackages.filter((id) => id !== pkgId));
    } else {
      setSelectedPackages([...selectedPackages, pkgId]);
    }
  };

  return (
    <section id="configurator" className="py-24 bg-canvas text-white border-b border-hairline">
      <div className="max-w-marketing mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center gap-3">
            <MBadge size="md" />
            <span className="text-xs uppercase tracking-machined text-m-blue-light font-bold">
              Bespoke M Studio
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            CUSTOMIZE YOUR M MACHINE.
          </h2>
          <p className="text-body font-light text-sm md:text-base max-w-2xl">
            Configure lightweight carbon composite enhancements, track aerodynamics, and
            BMW Individual pigments tailored to your specifications.
          </p>
        </div>

        {/* Model Selector Bar */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 border-b border-hairline">
          {BMW_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-machined whitespace-nowrap transition-all border ${
                selectedModel.id === model.id
                  ? "bg-white text-black border-white"
                  : "bg-surface-soft text-body border-hairline hover:text-white"
              }`}
            >
              {model.name.replace("COMPETITION ", "")}
            </button>
          ))}
        </div>

        {/* Main 2-Column Customizer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Top: Interactive Studio Stage View (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[16/10] bg-surface-soft border border-hairline overflow-hidden group">
              <div
                className="w-full h-full bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url(${selectedModel.image})` }}
              />

              {/* Tint overlay reflecting selected color */}
              <div
                className="absolute inset-0 mix-blend-color opacity-30 transition-all duration-500 pointer-events-none"
                style={{ backgroundColor: selectedColor.hex }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Live Tag overlay */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-hairline flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-white/40"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span className="text-[11px] font-bold uppercase tracking-machined text-white">
                  {selectedColor.name}
                </span>
              </div>

              {/* Model & Power Tag */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="text-xs uppercase tracking-machined text-m-blue-light font-bold">
                    {selectedModel.badge}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase text-white">
                    {selectedModel.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted block uppercase">Estimated MSRP</span>
                  <span className="text-xl md:text-2xl font-black text-white font-mono">
                    ${totalCalculatedMSRP.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Specs summary */}
            <div className="grid grid-cols-4 gap-2 bg-surface-soft border border-hairline p-4 text-center">
              <div>
                <span className="text-[10px] uppercase text-muted block">Output</span>
                <span className="text-sm font-bold text-white">{selectedModel.power}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-muted block">Torque</span>
                <span className="text-sm font-bold text-white">{selectedModel.torque}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-muted block">0-100</span>
                <span className="text-sm font-bold text-white">{selectedModel.acceleration}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-muted block">V-Max</span>
                <span className="text-sm font-bold text-white">
                  {selectedPackages.includes("pkg-drivers-pkg") ? "305 km/h" : selectedModel.topSpeed}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Studio Customization Options (5 cols) */}
          <div className="lg:col-span-5 space-y-6 bg-surface-card border border-hairline p-6 md:p-8">
            <MStripeDivider />

            {/* Step 1: Exterior Paint Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-machined text-white">
                  1. Exterior Paint Finish
                </span>
                <span className="text-xs font-mono text-muted">
                  {selectedColor.price === 0 ? "Standard" : `+$${selectedColor.price}`}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {EXTERIOR_COLORS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedColor(col)}
                    title={`${col.name} (${col.type})`}
                    className={`aspect-square relative border transition-transform flex items-center justify-center ${
                      selectedColor.id === col.id
                        ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                        : "border-hairline hover:border-body opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: col.hex }}
                  >
                    {selectedColor.id === col.id && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-body mt-2 font-light">
                Selected: <strong className="text-white font-bold">{selectedColor.name}</strong> ({selectedColor.type})
              </div>
            </div>

            {/* Step 2: Wheels Selection */}
            <div className="border-t border-hairline/80 pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-machined text-white">
                  2. M Forged Wheels
                </span>
                <span className="text-xs font-mono text-muted">
                  {selectedWheel.price === 0 ? "Included" : `+$${selectedWheel.price}`}
                </span>
              </div>

              <div className="space-y-2">
                {WHEEL_OPTIONS.map((wheel) => (
                  <div
                    key={wheel.id}
                    onClick={() => setSelectedWheel(wheel)}
                    className={`p-3 border cursor-pointer transition-all flex items-center justify-between ${
                      selectedWheel.id === wheel.id
                        ? "bg-surface-elevated border-white"
                        : "bg-surface-soft border-hairline hover:border-hairline-strong"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-tight">
                        {wheel.name}
                      </div>
                      <div className="text-[11px] text-muted font-light">{wheel.size}</div>
                    </div>
                    <span className="text-xs font-bold text-m-blue-light font-mono">
                      {wheel.price === 0 ? "Standard" : `+$${wheel.price}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Performance Packages */}
            <div className="border-t border-hairline/80 pt-6">
              <span className="text-xs font-bold uppercase tracking-machined text-white block mb-3">
                3. High-Performance Packages
              </span>

              <div className="space-y-2">
                {M_PACKAGES.map((pkg) => {
                  const isChecked = selectedPackages.includes(pkg.id);
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => togglePackage(pkg.id)}
                      className={`p-3 border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? "bg-surface-elevated border-m-blue-light"
                          : "bg-surface-soft border-hairline hover:border-body/40"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                          isChecked ? "bg-m-blue-light border-m-blue-light text-white" : "border-hairline"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-white">
                            {pkg.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            +${pkg.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-body font-light mt-0.5">
                          {pkg.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Build Summary Actions */}
            <div className="border-t border-hairline/80 pt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted uppercase tracking-machined text-xs">Total Build MSRP</span>
                <span className="text-2xl font-black text-white font-mono">
                  ${totalCalculatedMSRP.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  setBuildSaved(true);
                  setTimeout(() => setBuildSaved(false), 3000);
                }}
                className="w-full h-12 bg-white text-black hover:bg-m-blue-light hover:text-white font-bold uppercase tracking-machined text-xs transition-colors flex items-center justify-center gap-2 rounded-none"
              >
                {buildSaved ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Spec Sheet Saved to Vault</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Save & Download Build Specification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
