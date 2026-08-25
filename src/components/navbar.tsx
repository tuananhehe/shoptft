"use client";

import React, { useState } from "react";
import { MBadge, MStripeDivider } from "./m-stripe-divider";
import { Search, Globe, Menu, X, ChevronRight, Volume2, Shield } from "lucide-react";

interface NavbarProps {
  onOpenSoundSimulator?: () => void;
  onOpenAssistant?: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSoundSimulator,
  onOpenAssistant,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "DE" | "VI">("EN");

  const navLinks = [
    { label: "Models", href: "#models" },
    { label: "Performance Specs", href: "#specs" },
    { label: "M Studio", href: "#configurator" },
    { label: "M Magazine", href: "#magazine" },
    { label: "Motorsport", href: "#motorsport" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-canvas border-b border-hairline/60 backdrop-blur-md bg-opacity-95 transition-all">
      <div className="max-w-marketing mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
        {/* Brand Left */}
        <a href="#" className="flex items-center gap-3 group">
          {/* BMW Roundel SVG representation */}
          <div className="w-8 h-8 rounded-full border border-white/20 p-0.5 flex items-center justify-center bg-black">
            <div className="w-full h-full rounded-full border border-white/40 flex overflow-hidden">
              <div className="w-1/2 h-1/2 bg-white" />
              <div className="w-1/2 h-1/2 bg-[#1c69d4]" />
              <div className="w-1/2 h-1/2 bg-[#1c69d4]" />
              <div className="w-1/2 h-1/2 bg-white" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MBadge size="lg" />
            <span className="text-xs uppercase tracking-machined text-muted font-bold hidden sm:inline-block border-l border-hairline pl-2">
              Power & Precision
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-normal text-body hover:text-white tracking-nav transition-colors relative py-1 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white group-hover:w-full transition-all duration-200" />
            </a>
          ))}
        </nav>

        {/* Right Tools Cluster */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sound Simulator Shortcut */}
          {onOpenSoundSimulator && (
            <button
              onClick={onOpenSoundSimulator}
              title="M TwinPower Exhaust Sound"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-hairline hover:border-white text-xs font-bold uppercase tracking-machined text-white transition-all bg-surface-soft hover:bg-surface-elevated"
            >
              <Volume2 className="w-3.5 h-3.5 text-m-red animate-pulse" />
              <span>V8 Sound</span>
            </button>
          )}

          {/* AI Genius Launcher */}
          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-hairline hover:border-m-blue-light text-xs font-bold uppercase tracking-machined text-white transition-all bg-surface-card"
            >
              <Shield className="w-3.5 h-3.5 text-m-blue-light" />
              <span>M Genius AI</span>
            </button>
          )}

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="w-10 h-10 flex items-center justify-center text-body hover:text-white transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "EN" ? "VI" : lang === "VI" ? "DE" : "EN")}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-machined text-body hover:text-white px-2 py-1 border border-hairline"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang}</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white border border-hairline hover:border-white transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-canvas z-50 flex flex-col justify-between animate-fadeIn lg:hidden">
          <MStripeDivider />
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-xl font-bold uppercase tracking-wide text-white py-3 border-b border-hairline/50 hover:text-m-blue-dark transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-5 h-5 text-muted" />
                </a>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              {onOpenSoundSimulator && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSoundSimulator();
                  }}
                  className="w-full h-12 flex items-center justify-center gap-2 border border-white text-xs font-bold uppercase tracking-machined text-white bg-surface-card"
                >
                  <Volume2 className="w-4 h-4 text-m-red" />
                  <span>Start M Engine Sound</span>
                </button>
              )}
              {onOpenAssistant && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAssistant();
                  }}
                  className="w-full h-12 flex items-center justify-center gap-2 border border-m-blue-light text-xs font-bold uppercase tracking-machined text-white bg-surface-soft"
                >
                  <Shield className="w-4 h-4 text-m-blue-light" />
                  <span>BMW M Genius Assistant</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-hairline bg-surface-soft flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-2">
              <MBadge size="sm" />
              <span>THE ULTIMATE DRIVING MACHINE</span>
            </div>
            <span>© 2026 BMW M GmbH</span>
          </div>
        </div>
      )}
    </header>
  );
};
