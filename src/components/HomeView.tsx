import React from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Circle,
  Download,
  Globe,
  HeartPulse,
  Landmark,
  PlayCircle,
  ShieldCheck,
  Type,
  WifiOff,
} from "lucide-react";
import {
  CertificateRecord,
  Gig,
  LanguageName,
  Lesson,
  SavingsCircle,
  TabKey,
  TextScale,
} from "../types";
import { SUPPORTED_LANGUAGES, getCopy } from "../lib/i18n";
import { triggerPiAd } from "../lib/piSdk";
import { TrustRing } from "./TrustRing";

interface HomeViewProps {
  username: string;
  piConnected: boolean;
  kycVerified: boolean;
  trustScore: number;
  language: LanguageName;
  lowDataMode: boolean;
  textScale: TextScale;
  offlineLessonIds: string[];
  earnedSkills: string[];
  certificates: CertificateRecord[];
  gigs: Gig[];
  lessons: Lesson[];
  circles: SavingsCircle[];
  earnedMonthPi: number;
  healthScore: number | null;
  onLanguageChange: (lang: LanguageName) => void;
  onToggleLowData: () => void;
  onTextScaleChange: (scale: TextScale) => void;
  onNavigate: (tab: TabKey) => void;
  onSelectLesson: (lessonId: string) => void;
  onSelectGig: (gigId: string) => void;
  onConnectPi: () => void;
  onRecordAdSupport: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  username,
  piConnected,
  kycVerified,
  trustScore,
  language,
  lowDataMode,
  textScale,
  offlineLessonIds,
  earnedSkills,
  certificates,
  gigs,
  lessons,
  circles,
  earnedMonthPi,
  healthScore,
  onLanguageChange,
  onToggleLowData,
  onTextScaleChange,
  onNavigate,
  onSelectLesson,
  onSelectGig,
  onConnectPi,
  onRecordAdSupport,
}) => {
  const [adDone, setAdDone] = React.useState(false);
  const [adBusy, setAdBusy] = React.useState(false);
  const copy = getCopy(language);

  const completedGigsCount = gigs.filter((g) => g.status === "Released").length;
  const activeGigsCount = gigs.filter(
    (g) => g.status === "Funds Locked" || g.status === "Proof Submitted" || g.status === "Applied"
  ).length;
  const totalCirclesSaved = circles.reduce(
    (sum, c) => sum + (c.joined ? c.contributionPi * c.currentCycle : 0),
    0
  );

  // Daily Feed shows ONLY real user-created items
  const matchedGigs = [
    ...gigs.filter((g) => earnedSkills.includes(g.requiredSkill) && g.status === "Open"),
    ...gigs.filter((g) => !earnedSkills.includes(g.requiredSkill) && g.status === "Open"),
  ].slice(0, 3);

  const featuredLesson =
    lessons.find((l) => !earnedSkills.includes(l.skillUnlock)) ?? lessons[0] ?? null;
  const closingCircle = circles[0] ?? null;

  // Real Onboarding Steps
  const step1Done = piConnected;
  const step2Done = lessons.length >= 1;
  const step3Done = certificates.length >= 1;
  const step4Done = completedGigsCount >= 1 || activeGigsCount >= 1;

  const onboardingSteps = [
    {
      num: "01",
      title: "Connect Pi Wallet",
      done: step1Done,
      actionLabel: step1Done ? "Connected" : "Connect Pi",
      onClick: () => (step1Done ? onNavigate("wallet") : onConnectPi()),
    },
    {
      num: "02",
      title: "Publish or Open a Lesson",
      done: step2Done,
      actionLabel: "Open Learn",
      onClick: () => onNavigate("learn"),
    },
    {
      num: "03",
      title: "Pass Test & Mint Certificate",
      done: step3Done,
      actionLabel: "Earn Skill",
      onClick: () => {
        if (featuredLesson) onSelectLesson(featuredLesson.id);
        onNavigate("learn");
      },
    },
    {
      num: "04",
      title: "Post or Complete a Real Gig",
      done: step4Done,
      actionLabel: "Open Work",
      onClick: () => onNavigate("work"),
    },
  ];

  const hasFeedItems =
    matchedGigs.length > 0 || Boolean(featuredLesson) || Boolean(closingCircle);

  return (
    <div className="space-y-8">
      {/* Hero Command Header + Trust Score Ring */}
      <section className="rounded-2xl bg-[#0D0D14] border border-white/10 p-6 sm:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-medium text-[#FFC800] tracking-wide">
              {copy.tagline} · Global Borderless Utility
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-wrap-balance">
              {piConnected && username
                ? `${copy.welcomePrefix} @${username}`
                : copy.welcomePrefix}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl">
              Learn verified AI and digital skills for free, complete smart-contract escrow micro-gigs in Pi, navigate everyday family care, and save transparently with community circles.
            </p>
            {!piConnected && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onConnectPi}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FFC800] text-[#050507] text-sm font-semibold hover:bg-[#eab800] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Connect Pi Wallet (SDK v2.0)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Real Trust Score Ring Panel */}
          <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-5 flex items-center gap-5 shrink-0">
            <TrustRing score={trustScore} size={84} strokeWidth={7} darkSurface />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span className="font-display font-semibold text-base text-white">
                  {copy.trustScore}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {piConnected && kycVerified
                  ? "Verified Pioneer · KYC Active"
                  : piConnected
                  ? "Pi Connected · Standard Tier"
                  : "Not connected yet"}
              </p>
              <p className="text-xs text-slate-400">
                {trustScore === 0
                  ? "Complete a real gig to increase score."
                  : `${completedGigsCount} completed gigs · ${certificates.length} certificates`}
              </p>
            </div>
          </div>
        </div>

        {/* Accessibility & Localization Toolbar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-300">
              <Globe className="w-4 h-4 text-[#FFC800]" />
              <span className="whitespace-nowrap">Language</span>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as LanguageName)}
                className="min-h-[40px] px-3 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFC800]"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} className="bg-[#0D0D14] text-white">
                    {lang}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={onToggleLowData}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-medium inline-flex items-center gap-2 border transition-colors whitespace-nowrap ${
                lowDataMode
                  ? "bg-[#22C55E]/20 border-[#22C55E]/50 text-[#86EFAC]"
                  : "bg-white/5 border-white/15 text-slate-300 hover:bg-white/10"
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>{lowDataMode ? "Low-Data Mode: On" : "Low-Data Mode: Off"}</span>
            </button>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 px-2">
              <Download className="w-3.5 h-3.5 text-[#FFC800]" />
              <span className="tabular-nums">{offlineLessonIds.length} Offline Lessons Saved</span>
            </span>
          </div>

          {/* Text-Size Control */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <span className="px-2 text-xs text-slate-400 inline-flex items-center gap-1">
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </span>
            {(["normal", "lg", "xl"] as TextScale[]).map((scale) => (
              <button
                key={scale}
                type="button"
                onClick={() => onTextScaleChange(scale)}
                className={`min-h-[34px] px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  textScale === scale
                    ? "bg-[#7C3AED] text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {scale === "normal" ? "1x" : scale === "lg" ? "1.1x" : "1.25x"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Big Command Cards with REAL Counts */}
      <section aria-label="Personal Command Cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate("learn")}
          className="text-left rounded-2xl bg-white p-6 border border-slate-200 hover:border-[#7C3AED] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <span className="font-mono-tabular text-2xl font-bold text-slate-900">
              {earnedSkills.length}
            </span>
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
            {copy.cards.skills}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {earnedSkills.length > 0
              ? earnedSkills.slice(0, 2).join(" · ")
              : "You have no skills yet. Add your first skill."}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED]">
            Add / Verify Skill <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("work")}
          className="text-left rounded-2xl bg-white p-6 border border-slate-200 hover:border-[#7C3AED] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#FFC800]/20 text-slate-900 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-mono-tabular text-2xl font-bold text-slate-900">
              {gigs.length}
            </span>
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
            {copy.cards.gigs}
          </h2>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            {gigs.length === 0
              ? "No gigs yet. Be the first to post a gig."
              : `${activeGigsCount} active escrow · ${completedGigsCount} completed`}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
            Open Marketplace <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("wallet")}
          className="text-left rounded-2xl bg-white p-6 border border-slate-200 hover:border-[#7C3AED] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-[#FFC800] flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="font-mono-tabular text-xl font-bold text-[#7C3AED]">
              {earnedMonthPi === 0 ? "0 π" : `${earnedMonthPi.toFixed(2)} π`}
            </span>
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
            {copy.cards.earnings}
          </h2>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            {earnedMonthPi === 0
              ? "0 π earned yet."
              : `${earnedMonthPi.toFixed(2)} π net payouts · Circles ${totalCirclesSaved.toFixed(2)} π`}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED]">
            Open Pi Wallet <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("care")}
          className="text-left rounded-2xl bg-white p-6 border border-slate-200 hover:border-[#22C55E] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#22C55E]/15 text-[#16A34A] flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="font-mono-tabular text-2xl font-bold text-slate-900">
              {healthScore === null ? "--" : `${healthScore}/100`}
            </span>
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
            {copy.cards.health}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {healthScore === null
              ? "Complete a wellness check in Care to set your score."
              : "Updated from your logged Care check-ins."}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
            Open Care Helper <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      </section>

      {/* Pioneer Quick-Start Path */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Pioneer Quick-Start Path
            </h2>
            <p className="text-sm text-slate-600">
              Your real progress across Pi Wallet connection, learning, skill verification, and escrow work.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#7C3AED] tabular-nums">
            {[step1Done, step2Done, step3Done, step4Done].filter(Boolean).length} of 4 completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {onboardingSteps.map((step) => (
            <div
              key={step.num}
              className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-3 bg-slate-50/70"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono-tabular text-xs font-semibold text-slate-500">
                  {step.num}
                </span>
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                )}
              </div>
              <p className="font-display font-semibold text-sm text-slate-900">
                {step.title}
              </p>
              <button
                type="button"
                onClick={step.onClick}
                className="min-h-[40px] w-full rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                {step.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Feed — Real Items Only */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white">
            {copy.dailyFeed}
          </h2>
          <p className="text-sm text-slate-400">
            Displays live gigs, lessons, and savings circles created by real Pioneers.
          </p>
        </div>

        {!hasFeedItems ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              No daily feed items yet
            </h3>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              All EYENEKA lists start empty with real data only. Create the first lesson, post the first verified gig, or start a savings circle.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate("learn")}
                className="min-h-[44px] px-4 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9]"
              >
                Create First Lesson
              </button>
              <button
                type="button"
                onClick={() => onNavigate("work")}
                className="min-h-[44px] px-4 rounded-xl bg-[#FFC800] text-[#050507] text-xs font-bold hover:bg-[#eab800]"
              >
                Post First Gig
              </button>
              <button
                type="button"
                onClick={() => onNavigate("save")}
                className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Create First Circle
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100">
              <div className="px-6 py-4 flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-slate-900">
                  Real Gigs ({gigs.length})
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigate("work")}
                  className="text-xs font-semibold text-[#7C3AED] hover:underline"
                >
                  Open Marketplace
                </button>
              </div>
              {matchedGigs.length === 0 ? (
                <div className="p-6 text-center space-y-3">
                  <p className="text-sm text-slate-600">No gigs yet. Be the first to post a gig.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate("work")}
                    className="min-h-[40px] px-4 rounded-xl bg-[#FFC800] text-[#050507] text-xs font-bold"
                  >
                    Post a Gig
                  </button>
                </div>
              ) : (
                matchedGigs.map((gig) => {
                  const unlocked = earnedSkills.includes(gig.requiredSkill);
                  return (
                    <div
                      key={gig.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{gig.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>Requires {gig.requiredSkill}</span>
                          <span aria-hidden="true">·</span>
                          <span>{gig.deadline}</span>
                        </div>
                        <p className="font-display font-semibold text-sm sm:text-base text-slate-900">
                          {gig.title}
                        </p>
                        <p className="text-xs text-slate-600">
                          Buyer {gig.buyerHandle} · {unlocked ? "Skill Verified" : "Certificate Required"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono-tabular text-base font-bold text-[#7C3AED]">
                          {gig.pricePi.toFixed(2)} π
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectGig(gig.id);
                            onNavigate("work");
                          }}
                          className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
                        >
                          Inspect Gig
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-4">
              {featuredLesson ? (
                <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Published Lesson</span>
                    <span>{featuredLesson.durationMin} min</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    {featuredLesson.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {featuredLesson.summary}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectLesson(featuredLesson.id);
                      onNavigate("learn");
                    }}
                    className="min-h-[44px] w-full rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Free Lesson</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">
                    No lessons yet. Create the first lesson.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate("learn")}
                    className="min-h-[40px] w-full rounded-xl bg-[#7C3AED] text-white text-xs font-semibold"
                  >
                    Create Lesson
                  </button>
                </div>
              )}

              {closingCircle ? (
                <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Savings Circle</span>
                    <span className="font-semibold text-[#16A34A]">{closingCircle.cycle}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    {closingCircle.name}
                  </h3>
                  <p className="text-xs text-slate-600 tabular-nums">
                    {closingCircle.contributionPi.toFixed(1)} π / cycle · Next payout:{" "}
                    {closingCircle.nextRecipient}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate("save")}
                    className="min-h-[44px] w-full rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Open Circle Ledger
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">
                    No circles yet. Create your first circle.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate("save")}
                    className="min-h-[40px] w-full rounded-xl bg-slate-900 text-white text-xs font-semibold"
                  >
                    Create Circle
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pi Network Ads placement */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#7C3AED]">
              Pi Network Ad · Ads Support Free Learning
            </p>
            <p className="text-sm font-semibold text-slate-900">
              Support free Pioneer learning via official Pi.Ads.showAd
            </p>
            <p className="text-xs text-slate-600">
              Viewing an ecosystem ad logs a real support entry in your Wallet ledger.
            </p>
          </div>
          <button
            type="button"
            disabled={adBusy || adDone}
            onClick={async () => {
              setAdBusy(true);
              try {
                const res = await triggerPiAd("rewarded");
                if (res.completed) {
                  setAdDone(true);
                  onRecordAdSupport();
                }
              } finally {
                setAdBusy(false);
              }
            }}
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <PlayCircle className="w-4 h-4 text-[#FFC800]" />
            <span>
              {adDone ? "Ad Viewed · Free Learning Supported" : adBusy ? "Showing Pi Ad..." : "Watch Pi Ad"}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};
