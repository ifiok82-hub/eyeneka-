import React from "react";
import { BookOpen, Briefcase, HeartPulse, Home, Landmark, Scale, Wallet } from "lucide-react";
import { LanguageName, TabKey } from "../types";
import { getCopy } from "../lib/i18n";

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  language: LanguageName;
}

const ITEMS: { key: TabKey; Icon: React.FC<{ className?: string }> }[] = [
  { key: "home", Icon: Home },
  { key: "learn", Icon: BookOpen },
  { key: "work", Icon: Briefcase },
  { key: "care", Icon: HeartPulse },
  { key: "save", Icon: Landmark },
  { key: "wallet", Icon: Wallet },
  { key: "law", Icon: Scale },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, language }) => {
  const copy = getCopy(language);

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050507]/95 backdrop-blur-md border-t border-white/10"
    >
      <div className="grid grid-cols-7 items-center h-14 px-1">
        {ITEMS.map(({ key, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC800] ${
                active ? "text-[#FFC800]" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-full px-0.5">
                {copy.nav[key]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
