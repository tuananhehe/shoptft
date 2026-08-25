"use client";

import React, { useState, useEffect, useRef } from "react";
import { MBadge, MStripeDivider } from "./m-stripe-divider";
import { Volume2, VolumeX, Flame, Zap, Power, Disc, Gauge } from "lucide-react";

export const SoundEngineSimulator: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = true,
  onClose,
}) => {
  const [engineStarted, setEngineStarted] = useState(false);
  const [rpm, setRpm] = useState(850);
  const [isRevving, setIsRevving] = useState(false);
  const [driveMode, setDriveMode] = useState<"COMFORT" | "SPORT" | "SPORT_PLUS">("SPORT_PLUS");
  const [exhaustValvesOpen, setExhaustValvesOpen] = useState(true);
  const [engineType, setEngineType] = useState<"V8_TURBO" | "I6_TWIN">("V8_TURBO");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Initialize Web Audio synthesizer for genuine exhaust simulation
  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc2.type = "triangle";

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc2.start();

      oscRef.current = osc;
      osc2Ref.current = osc2;
      gainNodeRef.current = gain;
      filterNodeRef.current = filter;

      setEngineStarted(true);
      setRpm(850);
    } catch (e) {
      console.error("Audio Context initialization error", e);
    }
  };

  const stopAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setEngineStarted(false);
    setRpm(0);
  };

  // Update sound frequencies based on RPM and Drive Mode
  useEffect(() => {
    if (!engineStarted || !audioCtxRef.current || !oscRef.current || !osc2Ref.current || !filterNodeRef.current || !gainNodeRef.current) {
      return;
    }

    const ctx = audioCtxRef.current;
    const baseFreq = engineType === "V8_TURBO" ? (rpm / 60) * 4 : (rpm / 60) * 3;
    const modeMultiplier = driveMode === "SPORT_PLUS" ? 1.4 : driveMode === "SPORT" ? 1.1 : 0.85;

    oscRef.current.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.05);
    osc2Ref.current.frequency.setTargetAtTime(baseFreq * 0.5, ctx.currentTime, 0.05);

    const cutoff = exhaustValvesOpen ? 300 + (rpm / 7500) * 2200 * modeMultiplier : 200 + (rpm / 7500) * 1100;
    filterNodeRef.current.frequency.setTargetAtTime(cutoff, ctx.currentTime, 0.05);

    const targetGain = (exhaustValvesOpen ? 0.12 : 0.06) * (isRevving ? 1.4 : 0.9);
    gainNodeRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
  }, [rpm, engineStarted, driveMode, exhaustValvesOpen, engineType, isRevving]);

  // RPM throttle animation loop
  useEffect(() => {
    if (!engineStarted) return;

    const interval = setInterval(() => {
      setRpm((prev) => {
        if (isRevving) {
          const maxRpm = 7600;
          const next = prev + Math.floor(Math.random() * 280) + 220;
          return next > maxRpm ? maxRpm - Math.floor(Math.random() * 150) : next;
        } else {
          const idleRpm = 850;
          if (prev > idleRpm) {
            const decay = Math.floor((prev - idleRpm) * 0.18) + 40;
            return Math.max(idleRpm, prev - decay);
          }
          return idleRpm + (Math.random() * 20 - 10);
        }
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isRevving, engineStarted]);

  return (
    <section id="sound-engine" className="py-20 bg-surface-soft border-b border-hairline relative">
      <div className="max-w-marketing mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MBadge size="md" />
              <span className="text-xs uppercase tracking-machined text-m-red font-bold">
                Acoustic Dynamics
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
              M EXHAUST SOUND STAGE.
            </h2>
            <p className="text-body font-light text-sm md:text-base mt-1 max-w-xl">
              Experience the thunderous roar of the M TwinPower Turbo powertrain with active exhaust flap modulation.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setEngineType("V8_TURBO")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-machined border ${
                engineType === "V8_TURBO"
                  ? "bg-white text-black border-white"
                  : "bg-surface-card text-body border-hairline hover:text-white"
              }`}
            >
              4.4L V8 Biturbo
            </button>
            <button
              onClick={() => setEngineType("I6_TWIN")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-machined border ${
                engineType === "I6_TWIN"
                  ? "bg-white text-black border-white"
                  : "bg-surface-card text-body border-hairline hover:text-white"
              }`}
            >
              3.0L Inline-6
            </button>
          </div>
        </div>

        {/* Simulator Control Dashboard */}
        <div className="bg-canvas border border-hairline p-6 md:p-12 relative overflow-hidden">
          <MStripeDivider className="absolute top-0 left-0 right-0" />

          {/* LED Shift Light Bar (Formula 1 / GT3 style) */}
          <div className="w-full mb-8 pt-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-2 uppercase tracking-machined">
              <span>Shift Lights</span>
              <span>{Math.round(rpm)} RPM / 7600 LIMIT</span>
            </div>
            <div className="grid grid-cols-16 gap-1 h-3 bg-surface-soft border border-hairline p-0.5">
              {Array.from({ length: 16 }).map((_, i) => {
                const threshold = 1000 + i * 400;
                const isActive = rpm >= threshold;
                let colorClass = "bg-muted/20";
                if (isActive) {
                  if (i < 6) colorClass = "bg-green-500 shadow-[0_0_8px_#22c55e]";
                  else if (i < 12) colorClass = "bg-m-blue-light shadow-[0_0_8px_#0066b1]";
                  else colorClass = "bg-m-red shadow-[0_0_10px_#e22718] animate-pulse";
                }
                return (
                  <div
                    key={i}
                    className={`h-full transition-all duration-75 ${colorClass}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left: Engine Start & Modes */}
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-machined text-muted block mb-3">
                  1. Ignition Status
                </span>
                <button
                  onClick={engineStarted ? stopAudio : startAudio}
                  className={`w-full h-16 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-machined border transition-all ${
                    engineStarted
                      ? "bg-m-red text-white border-m-red shadow-[0_0_20px_rgba(226,39,24,0.4)]"
                      : "bg-surface-card text-white border-hairline hover:border-white"
                  }`}
                >
                  <Power className={`w-5 h-5 ${engineStarted ? "animate-spin" : ""}`} />
                  <span>{engineStarted ? "STOP M ENGINE" : "START M ENGINE"}</span>
                </button>
              </div>

              {/* M Setup Mode Toggle */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-machined text-muted block mb-2">
                  2. M Drive Mode Setup
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["COMFORT", "SPORT", "SPORT_PLUS"] as const).map((mode) => (
                    <button
                      key={mode}
                      disabled={!engineStarted}
                      onClick={() => setDriveMode(mode)}
                      className={`h-10 text-[11px] font-bold uppercase tracking-machined border transition-all ${
                        driveMode === mode
                          ? "bg-white text-black border-white"
                          : "bg-surface-soft text-body border-hairline disabled:opacity-30 hover:text-white"
                      }`}
                    >
                      {mode.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* M Sound Control Button */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-machined text-muted block mb-2">
                  3. M Sound Flap Valves
                </span>
                <button
                  disabled={!engineStarted}
                  onClick={() => setExhaustValvesOpen(!exhaustValvesOpen)}
                  className={`w-full h-10 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-machined border transition-all ${
                    exhaustValvesOpen
                      ? "border-m-red text-m-red bg-surface-card"
                      : "border-hairline text-muted bg-surface-soft"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  <span>{exhaustValvesOpen ? "M Sport Exhaust: OPEN (LOUD)" : "Quiet Mode: CLOSED"}</span>
                </button>
              </div>
            </div>

            {/* Center: Digital Tachometer Dial */}
            <div className="flex flex-col items-center justify-center p-6 bg-surface-soft border border-hairline">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-hairline flex flex-col items-center justify-center bg-black">
                {/* Radial Glow */}
                <div
                  className="absolute inset-0 rounded-full opacity-20 blur-xl pointer-events-none"
                  style={{
                    backgroundColor: rpm > 6000 ? "#e22718" : rpm > 4000 ? "#1c69d4" : "#0066b1",
                  }}
                />

                <MBadge size="sm" />
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-2 font-mono">
                  {Math.round(rpm)}
                </div>
                <div className="text-xs uppercase tracking-machined text-muted font-bold mt-1">
                  RPM / MIN
                </div>

                <div className="absolute bottom-4 flex items-center gap-2 text-[10px] font-bold tracking-widest text-m-blue-light uppercase">
                  <span>{driveMode}</span>
                  <span>•</span>
                  <span>{engineType === "V8_TURBO" ? "4.4L V8" : "3.0L I6"}</span>
                </div>
              </div>
            </div>

            {/* Right: Big Rev Pedal / Action */}
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-machined text-muted block mb-3">
                  4. Throttle Accelerator
                </span>

                <button
                  disabled={!engineStarted}
                  onMouseDown={() => setIsRevving(true)}
                  onMouseUp={() => setIsRevving(false)}
                  onMouseLeave={() => setIsRevving(false)}
                  onTouchStart={() => setIsRevving(true)}
                  onTouchEnd={() => setIsRevving(false)}
                  className={`w-full h-32 flex flex-col items-center justify-center gap-2 border-2 uppercase font-black tracking-machined transition-all select-none ${
                    !engineStarted
                      ? "bg-surface-card text-muted border-hairline cursor-not-allowed opacity-40"
                      : isRevving
                      ? "bg-m-red text-white border-white scale-95 shadow-[0_0_30px_#e22718]"
                      : "bg-surface-elevated text-white border-hairline hover:border-white cursor-pointer active:scale-95"
                  }`}
                >
                  <Flame className={`w-8 h-8 ${isRevving ? "animate-bounce text-white" : "text-m-red"}`} />
                  <span className="text-base sm:text-lg">
                    {engineStarted
                      ? isRevving
                        ? "/// FULL THROTTLE BOOST"
                        : "PRESS & HOLD TO REV"
                      : "START ENGINE FIRST"}
                  </span>
                  <span className="text-[10px] tracking-widest text-body font-light">
                    {engineStarted ? "(Click and hold mouse / tap)" : "Ignition required"}
                  </span>
                </button>
              </div>

              <div className="p-4 bg-surface-card border border-hairline text-xs text-body font-light leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-white uppercase tracking-machined text-[11px] mb-1">
                  <Zap className="w-3.5 h-3.5 text-m-blue-light" />
                  <span>Acoustic Profile</span>
                </div>
                Cross-bank exhaust manifold routes pulses into twin scroll turbochargers, creating equalized exhaust gas waves and instantaneous spool up with zero turbo lag.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
