import React from "react";

interface MStripeDividerProps {
  className?: string;
  width?: string;
}

export const MStripeDivider: React.FC<MStripeDividerProps> = ({
  className = "",
  width = "w-full",
}) => {
  return (
    <div className={`h-[4px] flex ${width} ${className}`} role="presentation">
      <div className="w-1/3 bg-m-blue-light h-full" />
      <div className="w-1/3 bg-m-blue-dark h-full" />
      <div className="w-1/3 bg-m-red h-full" />
    </div>
  );
};

export const MBadge: React.FC<{ size?: "sm" | "md" | "lg"; showText?: boolean }> = ({
  size = "md",
  showText = true,
}) => {
  const heights = {
    sm: "h-3",
    md: "h-4",
    lg: "h-6",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-xl",
  };

  return (
    <div className="inline-flex items-center gap-1 font-bold select-none">
      <div className={`flex -skew-x-12 ${heights[size]}`}>
        <div className="w-1.5 bg-m-blue-light h-full mr-0.5" />
        <div className="w-1.5 bg-m-blue-dark h-full mr-0.5" />
        <div className="w-1.5 bg-m-red h-full" />
      </div>
      {showText && (
        <span className={`font-black italic tracking-tighter text-white ${textSizes[size]}`}>
          M
        </span>
      )}
    </div>
  );
};
