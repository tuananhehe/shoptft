"use client";

import React, { useState } from "react";
import { MBadge, MStripeDivider } from "./m-stripe-divider";
import { Shield, Send, Sparkles, X, Bot, User, CheckCircle2 } from "lucide-react";

interface Message {
  sender: "user" | "genius";
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  "How does the M xDrive system switch to 100% rear-wheel drive?",
  "What are the benefits of M Carbon Ceramic brakes over steel?",
  "Tell me about the new M5 Hybrid V8 powertrain specs.",
  "Which BMW M model is best suited for track days?",
];

const PRESET_ANSWERS: Record<string, string> = {
  default:
    "BMW M engineers build high-performance vehicles on three core tenets: intelligent lightweight construction, motorsport-grade cooling systems, and instantaneous steering feedback tuned at the Nürburgring Nordschleife.",
  "How does the M xDrive system switch to 100% rear-wheel drive?":
    "The M xDrive system uses an electronically controlled multi-plate clutch in the transfer case. When Dynamic Stability Control (DSC) is turned OFF and 2WD mode is selected in the M Setup menu, 100% of engine torque is routed strictly to the active M differential on the rear axle, giving pure rear-wheel drive purist drift dynamics without electronic intervention.",
  "What are the benefits of M Carbon Ceramic brakes over steel?":
    "BMW M Carbon Ceramic Brakes provide a massive 14 kg reduction in unsprung rotational mass, exceptionally high thermal resistance that completely prevents brake fade during sustained 300+ km/h track sessions, gold-painted fixed calipers, and a lifespan several times longer than standard compound discs.",
  "Tell me about the new M5 Hybrid V8 powertrain specs.":
    "The new BMW M5 combines a 4.4-liter M TwinPower Turbo V8 (585 hp) with a high-performance electric motor (197 hp) integrated into the 8-speed M Steptronic transmission. Total system output reaches 727 HP and 1,000 Nm of torque, catapulting from 0 to 100 km/h in 3.5 seconds with top speeds up to 305 km/h.",
  "Which BMW M model is best suited for track days?":
    "For dedicated track work, the BMW M4 CSL and M4 Competition Coupé with M Race Track Package are benchmark weapons. They feature forged lightweight wheels, carbon bucket seats, carbon ceramic brakes, and track-optimized cooling circuits capable of handling extreme G-forces.",
};

export const AIAssistantModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "genius",
      text: "Welcome to BMW M Telemetry & Engineering Intelligence. I am your M Genius Assistant. How may I assist your high-performance exploration today?",
      timestamp: "Live",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query) return;

    const userMsg: Message = {
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = PRESET_ANSWERS[query] || PRESET_ANSWERS["default"];
      if (!PRESET_ANSWERS[query]) {
        if (query.toLowerCase().includes("v8") || query.toLowerCase().includes("engine")) {
          reply = PRESET_ANSWERS["Tell me about the new M5 Hybrid V8 powertrain specs."];
        } else if (query.toLowerCase().includes("brake") || query.toLowerCase().includes("ceramic")) {
          reply = PRESET_ANSWERS["What are the benefits of M Carbon Ceramic brakes over steel?"];
        } else if (query.toLowerCase().includes("xdrive") || query.toLowerCase().includes("drift")) {
          reply = PRESET_ANSWERS["How does the M xDrive system switch to 100% rear-wheel drive?"];
        } else if (query.toLowerCase().includes("track")) {
          reply = PRESET_ANSWERS["Which BMW M model is best suited for track days?"];
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "genius",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface-card border border-hairline max-w-xl w-full h-[650px] max-h-[92vh] flex flex-col justify-between rounded-none shadow-2xl relative animate-fadeIn">
        <MStripeDivider className="absolute top-0 left-0 right-0" />

        {/* Header */}
        <div className="p-4 md:p-6 border-b border-hairline flex items-center justify-between bg-surface-soft">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface-card border border-hairline text-m-blue-light">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <MBadge size="sm" />
                <h3 className="text-sm font-bold uppercase tracking-machined text-white">
                  BMW M Genius AI
                </h3>
              </div>
              <span className="text-[11px] text-muted font-mono">Motorsport Telemetry Advisory</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 border border-hairline hover:border-white flex items-center justify-center text-white text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-canvas">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 text-xs sm:text-sm leading-relaxed border ${
                  msg.sender === "user"
                    ? "bg-surface-elevated border-white/20 text-white font-medium"
                    : "bg-surface-card border-hairline text-body font-light"
                }`}
              >
                {msg.sender === "genius" && (
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-machined text-m-blue-light font-bold mb-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>M Telemetry Response</span>
                  </div>
                )}
                <p>{msg.text}</p>
                <div className="text-[10px] text-muted font-mono text-right mt-2">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-muted p-2">
              <span className="w-2 h-2 rounded-full bg-m-blue-light animate-ping" />
              <span>Analyzing telemetry parameters...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-surface-soft border-t border-hairline overflow-x-auto flex gap-2">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] font-normal text-muted hover:text-white bg-surface-card border border-hairline hover:border-white px-3 py-1.5 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar according to DESIGN.md text-input token */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-surface-card border-t border-hairline flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about BMW M engines, telemetry, lap times..."
            className="flex-1 h-12 bg-surface-soft border border-hairline text-white text-xs px-4 focus:outline-none focus:border-white transition-colors"
          />
          <button
            type="submit"
            className="h-12 px-6 bg-white text-black hover:bg-m-blue-light hover:text-white font-bold uppercase tracking-machined text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </form>
      </div>
    </div>
  );
};
