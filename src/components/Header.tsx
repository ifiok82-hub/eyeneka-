import React from "react";
import { Bell, ShieldCheck, Wallet } from "lucide-react";
import { LanguageName, TabKey } from "../types";
import { getCopy } from "../lib/i18n";
import { TrustRing } from "./TrustRing";

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  piConnected: boolean;
  kycVerified: boolean;
  username: string;
  trustScore: number;
  language: LanguageName;
  unreadCount: number;
  onConnectPi: () => void;
  onToggleNotifications: () => void;
}

const TAB_KEYS: TabKey[] = ["home", "learn", "work", "care", "save", "wallet", "law"];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  piConnected,
  kycVerified,
  username,
  trustScore,
  language,
  unreadCount,
  onConnectPi,
  onToggleNotifications,
}) => {
  const copy = getCopy(language);

  return (
    <header className="sticky top-0 z-40 bg-[#050507]/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Lockup */}
        <button
          type="button"
          onClick={() => onTabChange("home")}
          className="inline-flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC800] rounded-lg"
          aria-label="EYENEKA Home"
        >
          <img
            src="/assets/aistudio/eyeneka_logo_cutout_0b9ce129.png"
            alt="EYENEKA Logo"
            className="w-8 h-8 rounded-full bg-white object-contain p-0.5 shrink-0"
          />
          <span className="font-display font-bold text-lg tracking-tight text-white">
            EYENEKA
          </span>
        </button>

        {/* Zone 2: Desktop Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-5 lg:gap-7 overflow-x-auto"
        >
          {TAB_KEYS.map((key) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC800] rounded ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {copy.nav[key]}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC800] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Trust Score + Notifications + Pi Connect */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center">
            <TrustRing score={trustScore} size={36} strokeWidth={3.5} darkSurface />
          </div>

          <button
            type="button"
            onClick={onToggleNotifications}
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC800]"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#FFC800] text-[#050507] text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onConnectPi}
            className={`min-h-[44px] px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC800] ${
              piConnected
                ? "bg-white/10 text-white border border-white/15 hover:bg-white/15"
                : "bg-[#FFC800] text-[#050507] hover:bg-[#eab800]"
            }`}
          >
            {piConnected ? (
              <>
                {kycVerified && <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />}
                <span className="max-w-[110px] truncate">@{username}</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 shrink-0" />
                <span>{copy.connectPi}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
