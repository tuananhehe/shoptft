"use client";

import React from "react";
import { MBadge, MStripeDivider } from "./m-stripe-divider";
import { Cpu, Activity, Disc, Gauge, ShieldCheck, Zap } from "lucide-react";

interface SpecItem {
  value: string;
  unit: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
}

const BENCHMARK_SPECS: SpecItem[] = [
  {
    value: "7:18.1",
    unit: "MIN",
    label: "Nordschleife Lap Record",
    detail: "Official lap benchmark recorded at the Nürburgring Green Hell on Michelin Pilot Sport Cup 2 R tyres.",
    icon: <Activity className="w-5 h-5 text-m-red" />,
  },
  {
    value: "748",
    unit: "HP",
    label: "Peak System Output",
    detail: "Combined output of BMW M TwinPower Turbo V8 and synchronous permanent magnet motor.",
    icon: <Zap className="w-5 h-5 text-m-blue-light" />,
  },
  {
    value: "1,000",
    unit: "NM",
    label: "Immediate Torque",
    detail: "Available from 1,800 to 5,400 rpm for instantaneous slingshot acceleration out of apexes.",
    icon: <Gauge className="w-5 h-5 text-m-blue-dark" />,
  },
  {
    value: "1.35",
    unit: "G",
    label: "Max Lateral Acceleration",
    detail: "Sustained cornering force achieved with adaptive M differential and staggered forged wheels.",
    icon: <Cpu className="w-5 h-5 text-white" />,
  },
  {
    value: "420",
    unit: "MM",
    label: "Carbon Ceramic Rotors",
    detail: "M Carbon Ceramic 6-piston fixed caliper brakes delivering fade-free decelaration from 300 km/h.",
    icon: <Disc className="w-5 h-5 text-m-red" />,
  },
  {
    value: "100%",
    unit: "LOCK",
    label: "Active M Differential",
    detail: "Variable electro-mechanical lock across rear axle responding in milliseconds to wheel slip.",
    icon: <ShieldCheck className="w-5 h-5 text-m-blue-light" />,
  },
];

export const TechSpecsGrid: React.FC = () => {
  return (
    <section id="specs" className="py-24 bg-canvas text-white border-b border-hairline">
      <div className="max-w-marketing mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="space-y-4 mb-16 max-w-3xl">
          <div className="flex items-center gap-3">
            <MBadge size="md" />
            <span className="text-xs uppercase tracking-machined text-m-red font-bold">
              Engineering Telemetry
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            MOTORSPORT PRECISION. BRED ON TRACK.
          </h2>

          <p className="text-body font-light text-sm md:text-base leading-relaxed">
            Every millimeter of a BMW M chassis is tuned on the Nürburgring Nordschleife.
            Weight distribution is balanced 50:50, cooling systems are pressurized for sustained high-G loads,
            and aerodynamics provide genuine downforce at speed.
          </p>
        </div>

        {/* Spec Cell Matrix according to DESIGN.md spec-cell token */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENCHMARK_SPECS.map((spec, index) => (
            <div
              key={index}
              className="bg-surface-soft border border-hairline hover:border-white/40 p-6 md:p-8 flex flex-col justify-between transition-colors relative group"
            >
              {/* Header Icon + Number */}
              <div className="flex items-center justify-between pb-6 border-b border-hairline/60">
                <div className="p-2.5 bg-surface-card border border-hairline">
                  {spec.icon}
                </div>
                <span className="text-xs font-mono tracking-widest text-muted">
                  0{index + 1} // M-TELEMETRY
                </span>
              </div>

              {/* Big Display Value */}
              <div className="my-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black tracking-tight text-white">
                    {spec.value}
                  </span>
                  <span className="text-sm font-bold uppercase tracking-machined text-m-blue-light">
                    {spec.unit}
                  </span>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-machined text-white mt-2">
                  {spec.label}
                </h3>
              </div>

              {/* Detail Excerpt */}
              <p className="text-xs text-body font-light leading-relaxed border-t border-hairline/40 pt-4">
                {spec.detail}
              </p>

              {/* Active Stripe Accent on Hover */}
              <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity m-stripe-bg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
