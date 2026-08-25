"use client";

import React from "react";
import { MBadge, MStripeDivider } from "./m-stripe-divider";
import { Globe, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-canvas border-t border-hairline text-body text-xs font-light">
      <MStripeDivider />

      <div className="max-w-marketing mx-auto px-4 md:px-8 py-16">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-hairline/60">
          {/* Col 1 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-machined text-white">
              BMW M Models
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#models" className="hover:text-white transition-colors">
                  BMW M3 Competition Sedan
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-white transition-colors">
                  BMW M4 Competition Coupé
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-white transition-colors">
                  The All-New BMW M5 Saloon
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-white transition-colors">
                  BMW M8 Competition Gran Coupé
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-white transition-colors">
                  BMW XM Label Red
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-white transition-colors">
                  BMW i4 M50 Electrified
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-machined text-white">
              Motorsport & Heritage
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#magazine" className="hover:text-white transition-colors">
                  BMW M Motorsport Works Team
                </a>
              </li>
              <li>
                <a href="#magazine" className="hover:text-white transition-colors">
                  24h Nürburgring Programme
                </a>
              </li>
              <li>
                <a href="#magazine" className="hover:text-white transition-colors">
                  BMW M Driving Experience
                </a>
              </li>
              <li>
                <a href="#magazine" className="hover:text-white transition-colors">
                  50 Years of ///M Heritage
                </a>
              </li>
              <li>
                <a href="#sound-engine" className="hover:text-white transition-colors">
                  M Acoustic Chamber (V8 Sound)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-machined text-white">
              M Performance Parts
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#configurator" className="hover:text-white transition-colors">
                  M Carbon Ceramic Brake Systems
                </a>
              </li>
              <li>
                <a href="#configurator" className="hover:text-white transition-colors">
                  M Performance Aerodynamic Kits
                </a>
              </li>
              <li>
                <a href="#configurator" className="hover:text-white transition-colors">
                  Titanium Exhaust Systems
                </a>
              </li>
              <li>
                <a href="#configurator" className="hover:text-white transition-colors">
                  M Forged Wheels & Slicks
                </a>
              </li>
              <li>
                <a href="#configurator" className="hover:text-white transition-colors">
                  BMW Individual Paint Swatches
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MBadge size="sm" />
              <h4 className="text-xs font-bold uppercase tracking-machined text-white">
                BMW M GmbH
              </h4>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Daimlerstraße 19, 85748 Garching bei München, Germany.
              Engineering highest automotive performance since 1972.
            </p>

            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-machined text-white hover:text-m-blue-light border border-hairline px-3 py-2 bg-surface-soft"
              >
                <span>Back To Top</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer according to DESIGN.md typography.caption */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-muted">
          <p className="max-w-3xl leading-relaxed">
            Official fuel consumption, CO2 emissions, electrical consumption and electric range figures were
            determined according to the prescribed measurement procedure (WLTP). Values are for comparability purposes only.
            Always obey local speed limits and traffic regulations.
          </p>

          <div className="flex items-center gap-6 whitespace-nowrap text-xs">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Legal Notice
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Preferences
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-hairline/40 flex items-center justify-between text-[11px] text-muted">
          <span>© 2026 BMW M GmbH. All rights reserved.</span>
          <span className="font-mono uppercase tracking-widest text-[10px]">
            Engineered with BMW M Design System
          </span>
        </div>
      </div>
    </footer>
  );
};
