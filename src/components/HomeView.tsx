import React, { useState } from "react";
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
  Plus,
  ShieldCheck,
  Type,
  WifiOff,
  X,
} from "lucide-react";
import {
  CertificateRecord,
  CircleTemplate,
  FirstAidGuide,
  Gig,
  GigCategory,
  GigTemplate,
  LanguageName,
  Lesson,
  SavingsCircle,
  SkillCategory,
  TabKey,
  TextScale,
} from "../types";
import { SUPPORTED_LANGUAGES, getCopy } from "../lib/i18n";
import { triggerPiAd } from "../lib/piSdk";
import { TrustRing } from "./TrustRing";

export type AdminProductType = "Lesson" | "Gig Template" | "Care Guide" | "Circle Template";

export interface AdminPublishPayload {
  productType: AdminProductType;
  title: string;
  category: string;
  description: string;
  stepsOrChecklist: string[];
  pricePi: number;
}

interface HomeViewProps {
  username: string;
  piConnected: boolean;
  kycVerified: boolean;
  isAdmin: boolean;
  trustScore: number;
  language: LanguageName;
  lowDataMode: boolean;
  textScale: TextScale;
  offlineLessonIds: string[];
  earnedSkills: string[];
  certificates: CertificateRecord[];
  gigs: Gig[];
  lessons: Lesson[];
  gigTemplates: GigTemplate[];
  guides: FirstAidGuide[];
  circleTemplates: CircleTemplate[];
  circles: SavingsCircle[];
  earnedMonthPi: number;
  healthScore: number | null;
  onToggleAdmin: () => void;
  onPublishOfficialProduct: (payload: AdminPublishPayload) => void;
  onLanguageChange: (lang: LanguageName) => void;
  onToggleLowData: () => void;
  onTextScaleChange: (scale: TextScale) => void;
  onNavigate: (tab: TabKey) => void;
  onSelectLesson: (lessonId: string) => void;
  onSelectGig: (gigId: string) => void;
  onConnectPi: () => void;
  onRecordAdSupport: () => void;
}

const LESSON_CATEGORIES: SkillCategory[] = [
  "AI Survival",
  "Digital Work",
  "Money Skills",
  "Food & Life",
  "Health Literacy",
];

const GIG_CATEGORIES: GigCategory[] = ["Remote Digital", "Local Help", "Community"];

export const HomeView: React.FC<HomeViewProps> = ({
  username,
  piConnected,
  kycVerified,
  isAdmin,
  trustScore,
  language,
  lowDataMode,
  textScale,
  offlineLessonIds,
  earnedSkills,
  certificates,
  gigs,
  lessons,
  gigTemplates,
  guides,
  circleTemplates,
  circles,
  earnedMonthPi,
  healthScore,
  onToggleAdmin,
  onPublishOfficialProduct,
  onLanguageChange,
  onToggleLowData,
  onTextScaleChange,
  onNavigate,
  onSelectLesson,
  onSelectGig,
  onConnectPi,
  onRecordAdSupport,
}) => {
  const [adDone, setAdDone] = useState(false);
  const [adBusy, setAdBusy] = useState(false);

  // Admin Publisher Modal State
  const [pubOpen, setPubOpen] = useState(false);
  const [pType, setPType] = useState<AdminProductType>("Lesson");
  const [pTitle, setPTitle] = useState("");
  const [pCategory, setPCategory] = useState<string>("AI Survival");
  const [pDesc, setPDesc] = useState("");
  const [pStepsText, setPStepsText] = useState("");
  const [pPrice, setPPrice] = useState("0.3");
  const [pError, setPError] = useState<string | null>(null);

  const copy = getCopy(language);

  const officialLessonsCount = lessons.filter((l) => l.isOfficialStarter).length;
  const completedGigsCount = gigs.filter((g) => g.status === "Released").length;
  const activeGigsCount = gigs.filter(
    (g) => g.status === "Funds Locked" || g.status === "Proof Submitted" || g.status === "Applied"
  ).length;
  const totalCirclesSaved = circles.reduce(
    (sum, c) => sum + (c.joined ? c.contributionPi * c.currentCycle : 0),
    0
  );

  // Live From Pioneers shows ONLY live gigs & live circles created by real users (0 initially, never templates)
  const liveGigs = [
    ...gigs.filter((g) => earnedSkills.includes(g.requiredSkill) && g.status === "Open"),
    ...gigs.filter((g) => !earnedSkills.includes(g.requiredSkill) && g.status === "Open"),
  ].slice(0, 3);
  const liveCircle = circles[0] ?? null;
  const starterLesson = lessons.find((l) => !earnedSkills.includes(l.skillUnlock)) ?? lessons[0] ?? null;

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
      title: "Take an Official Lesson",
      done: step2Done && certificates.length >= 0,
      actionLabel: "Open Learn",
      onClick: () => onNavigate("learn"),
    },
    {
      num: "03",
      title: "Pass Test & Mint Certificate",
      done: step3Done,
      actionLabel: "Earn Skill",
      onClick: () => {
        if (starterLesson) onSelectLesson(starterLesson.id);
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

  const handleProductTypeChange = (nextType: AdminProductType) => {
    setPType(nextType);
    setPError(null);
    if (nextType === "Lesson") {
      setPCategory("AI Survival");
      setPPrice("0.3");
    } else if (nextType === "Gig Template") {
      setPCategory("Remote Digital");
      setPPrice("1.0");
    } else if (nextType === "Care Guide") {
      setPCategory("Urgent Action");
      setPPrice("0");
    } else {
      setPCategory("Weekly - Rotation");
      setPPrice("1.0");
    }
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPError(null);
    const lines = pStepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const price = Number(pPrice) || 0;

    if (!pTitle.trim() || !pDesc.trim()) {
      setPError("Provide a clear Title and Description.");
      return;
    }
    if (pType !== "Circle Template" && lines.length === 0) {
      setPError("Add at least 1 step or checklist line.");
      return;
    }
    if (pType === "Lesson" && (price < 0.1 || price > 0.5)) {
      setPError("Lesson Verified Certificate price must be between 0.10 π and 0.50 π.");
      return;
    }
    if (pType === "Gig Template" && (price < 0.2 || price > 5.0)) {
      setPError("Gig Template price must be between 0.20 π and 5.00 π.");
      return;
    }
    if (pType === "Circle Template" && (price < 0.5 || price > 5.0)) {
      setPError("Circle Template contribution must be between 0.50 π and 5.00 π.");
      return;
    }

    onPublishOfficialProduct({
      productType: pType,
      title: pTitle.trim(),
      category: pCategory,
      description: pDesc.trim(),
      stepsOrChecklist: lines,
      pricePi: price,
    });

    setPubOpen(false);
    setPTitle("");
    setPDesc("");
    setPStepsText("");
  };

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
              Learn verified AI and digital skills for free, copy official templates to post real escrow gigs in Pi, follow everyday health navigation, and launch peer savings circles.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!piConnected && (
                <button
                  type="button"
                  onClick={onConnectPi}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/15 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Connect Pi Wallet (SDK v2.0)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setPError(null);
                    setPubOpen(true);
                  }}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Real Product</span>
                </button>
              )}

              <button
                type="button"
                onClick={onToggleAdmin}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                  isAdmin
                    ? "bg-white/10 border-[#FFC800]/50 text-[#FFC800]"
                    : "bg-white/5 border-white/15 text-slate-300 hover:bg-white/10"
                }`}
              >
                {isAdmin ? "Admin Tools: On" : "Admin Tools: Off"}
              </button>
            </div>
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

      {/* 4 Big Command Cards with REAL User Counts */}
      <section aria-label="Personal Command Cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate("learn")}
          className="text-left rounded-2xl bg-white p-6 border border-slate-200 hover:border-[#7C3AED] transition-colors group"
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
            Explore {lessons.length} Official Lessons <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("work")}
          className="text-left rounded-2xl bg-white p-6 border border-slate-200 hover:border-[#7C3AED] transition-colors group"
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
              ? "No live gigs yet. Use a template to post."
              : `${activeGigsCount} active escrow · ${completedGigsCount} completed`}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
            View {gigTemplates.length} Gig Templates <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("wallet")}
          className="text-left rounded-2xl bg-white p-6 border border-slate-200 hover:border-[#7C3AED] transition-colors group"
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
            Open Pi Wallet <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("care")}
          className="text-left rounded-2xl bg-white p-6 border border-slate-200 hover:border-[#22C55E] transition-colors group"
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
            Open {guides.length} Care Guides <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </section>

      {/* SECTION 1: Official Starter Products (Published by EYENEKA Official — Zero Fake User Activity) */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#050507] text-[#FFC800] text-[10px] font-bold tracking-wide">
                OFFICIAL STARTER
              </span>
              <span className="text-xs text-slate-500">Author: EYENEKA Official</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
              Official Starter Products
            </h2>
            <p className="text-xs text-slate-600">
              Operator-published lessons, copyable gig templates, first-aid guides, and circle templates. Separate from live user activity.
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setPError(null);
                setPubOpen(true);
              }}
              className="min-h-[40px] px-4 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Real Product</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onNavigate("learn")}
            className="text-left rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-[#7C3AED] transition-colors space-y-1.5"
          >
            <p className="text-xs font-semibold text-[#7C3AED]">Official Lessons</p>
            <p className="font-mono-tabular text-3xl font-extrabold text-slate-900">
              {officialLessonsCount}
            </p>
            <p className="text-xs text-slate-600">
              Free to learn · Cert 0.30 π · Editable
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("work")}
            className="text-left rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-[#7C3AED] transition-colors space-y-1.5"
          >
            <p className="text-xs font-semibold text-slate-700">Gig Templates</p>
            <p className="font-mono-tabular text-3xl font-extrabold text-slate-900">
              {gigTemplates.length}
            </p>
            <p className="text-xs text-slate-600">
              Templates to copy · Not live gigs
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("care")}
            className="text-left rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-[#16A34A] transition-colors space-y-1.5"
          >
            <p className="text-xs font-semibold text-[#16A34A]">Care Guides</p>
            <p className="font-mono-tabular text-3xl font-extrabold text-slate-900">
              {guides.length}
            </p>
            <p className="text-xs text-slate-600">
              First aid + 3 symptom navigation paths
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("save")}
            className="text-left rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-[#7C3AED] transition-colors space-y-1.5"
          >
            <p className="text-xs font-semibold text-[#7C3AED]">Circle Templates</p>
            <p className="font-mono-tabular text-3xl font-extrabold text-slate-900">
              {circleTemplates.length}
            </p>
            <p className="text-xs text-slate-600">
              Copy to launch your real circle
            </p>
          </button>
        </div>
      </section>

      {/* SECTION 2: Live From Pioneers (Strictly Real User Activity — Starts at 0) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Live From Pioneers
            </h2>
            <p className="text-sm text-slate-400">
              Real live gigs and live savings circles posted by real Pioneers only (never mixed with templates).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white tabular-nums">
              Live Gigs By Real Users: <strong>{gigs.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-white tabular-nums">
              Live Circles By Real Users: <strong>{circles.length}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100">
            <div className="px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-900">
                Live Gigs By Real Users ({gigs.length})
              </h3>
              <button
                type="button"
                onClick={() => onNavigate("work")}
                className="text-xs font-semibold text-[#7C3AED] hover:underline"
              >
                Open Marketplace
              </button>
            </div>
            {liveGigs.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="font-display font-semibold text-base text-slate-900">
                  0 Live Gigs By Real Users yet
                </p>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  No real user has posted a live gig yet. Copy any of the {gigTemplates.length} Official Gig Templates in Work or post your own.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("work")}
                  className="min-h-[42px] px-5 rounded-xl bg-[#FFC800] text-[#050507] text-xs font-bold hover:bg-[#eab800]"
                >
                  Browse {gigTemplates.length} Gig Templates
                </button>
              </div>
            ) : (
              liveGigs.map((gig) => {
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
            {liveCircle ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Live Circle By Real Users</span>
                  <span className="font-semibold text-[#16A34A]">{liveCircle.cycle}</span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  {liveCircle.name}
                </h3>
                <p className="text-xs text-slate-600 tabular-nums">
                  {liveCircle.contributionPi.toFixed(1)} π / cycle · {liveCircle.members.length}/{liveCircle.maxMembers} members
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
                <p className="text-xs font-semibold text-slate-500">
                  Live Circles By Real Users (0)
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  No live circles yet. Use an official template or start your own.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("save")}
                  className="min-h-[40px] w-full rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  View {circleTemplates.length} Circle Templates
                </button>
              </div>
            )}

            {starterLesson && (
              <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-[#7C3AED]">OFFICIAL STARTER LESSON</span>
                  <span>{starterLesson.durationMin} min</span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  {starterLesson.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">{starterLesson.summary}</p>
                <button
                  type="button"
                  onClick={() => {
                    onSelectLesson(starterLesson.id);
                    onNavigate("learn");
                  }}
                  className="min-h-[42px] w-full rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] inline-flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Free Lesson</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pioneer Quick-Start Path */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Pioneer Quick-Start Path
              </h2>
              <p className="text-sm text-slate-600">
                Real milestone progress across Pi connection, learning, skill verification, and escrow work.
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
        </div>

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

      {/* Admin Publisher Modal */}
      {pubOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base">
                  Publish Real Product (Admin Only)
                </h3>
                <p className="text-xs text-[#FFC800]">
                  Publishes as EYENEKA Official · 0 completions · 0 reviews · 0 π earnings
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPubOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Lesson", "Gig Template", "Care Guide", "Circle Template"] as AdminProductType[]).map(
                    (t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleProductTypeChange(t)}
                        className={`min-h-[40px] px-2 rounded-xl text-xs font-semibold border transition-colors ${
                          pType === t
                            ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                            : "bg-slate-50 border-slate-300 text-slate-700"
                        }`}
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    placeholder={`Official ${pType} title`}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  {pType === "Lesson" ? (
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                    >
                      {LESSON_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : pType === "Gig Template" ? (
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                    >
                      {GIG_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : pType === "Care Guide" ? (
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                    >
                      <option value="Urgent Action">Urgent Action</option>
                      <option value="Careful Monitoring">Careful Monitoring</option>
                    </select>
                  ) : (
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                    >
                      <option value="Weekly - Rotation">Weekly · Rotation</option>
                      <option value="Monthly - Vote">Monthly · Vote</option>
                      <option value="Weekly - Food Pool">Weekly · Emergency Food Pool</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  placeholder="Clear description (2–3 sentences, plain language)"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Steps / Checklist (1 per line)
                </label>
                <textarea
                  rows={4}
                  value={pStepsText}
                  onChange={(e) => setPStepsText(e.target.value)}
                  placeholder={
                    pType === "Circle Template"
                      ? "Optional member count on line 1 (default 10)"
                      : "Step or checklist item 1&#10;Step or checklist item 2&#10;Step or checklist item 3"
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {pType === "Lesson"
                    ? "Certificate Price in π (0.1 – 0.5 π, lesson free)"
                    : pType === "Care Guide"
                    ? "Pi Price (Free = 0 π)"
                    : "Pi Price (π)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono-tabular"
                />
              </div>

              {pError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {pError}
                </div>
              )}

              <button
                type="submit"
                className="min-h-[48px] w-full rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9]"
              >
                Publish {pType} as EYENEKA Official
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
