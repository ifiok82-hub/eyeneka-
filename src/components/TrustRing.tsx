import React from "react";

interface TrustRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  darkSurface?: boolean;
  label?: string;
}

export const TrustRing: React.FC<TrustRingProps> = ({
  score,
  size = 44,
  strokeWidth = 4,
  darkSurface = false,
  label,
}) => {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const strokeColor =
    clamped === 0
      ? darkSurface
        ? "rgba(255,255,255,0.28)"
        : "#94A3B8"
      : clamped >= 80
      ? "#22C55E"
      : clamped >= 55
      ? "#FFC800"
      : "#EF4444";

  return (
    <div className="inline-flex items-center gap-2 shrink-0">
      <div
        className="relative inline-flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
        aria-label={`Trust Score ${clamped} out of 100`}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={darkSurface ? "rgba(255,255,255,0.14)" : "#E2E8F0"}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <span
          className={`absolute font-mono-tabular font-semibold ${
            size >= 72 ? "text-lg" : "text-[11px]"
          } ${darkSurface ? "text-white" : "text-slate-900"}`}
        >
          {clamped}
        </span>
      </div>
      {label && (
        <span className={`text-xs font-medium whitespace-nowrap ${darkSurface ? "text-slate-300" : "text-slate-600"}`}>
          {label}
        </span>
      )}
    </div>
  );
};
