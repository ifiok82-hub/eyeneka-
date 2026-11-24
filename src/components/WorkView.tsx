import React, { useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Flag,
  Lock,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import { Gig, GigCategory, GigTemplate } from "../types";

interface WorkViewProps {
  gigs: Gig[];
  gigTemplates: GigTemplate[];
  availableSkillOptions: string[];
  selectedGigId: string | null;
  earnedSkills: string[];
  username: string;
  trustScore: number;
  kycVerified: boolean;
  isAdmin: boolean;
  onSelectGig: (gigId: string | null) => void;
  onCreateGig: (
    gig: Omit<Gig, "id" | "status" | "messages">,
    boost24h: boolean
  ) => void;
  onUpdateTemplate: (id: string, updated: Partial<GigTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onLockEscrow: (gigId: string) => void;
  onSubmitProof: (
    gigId: string,
    proofNote: string,
    checkedItems: number[],
    proofFileName?: string,
    proofImageDataUrl?: string
  ) => void;
  onReleaseEscrow: (gigId: string, rating: number, reviewText: string) => void;
  onAdvanceDispute: (gigId: string, reason?: string) => void;
  onSendMessage: (gigId: string, text: string) => void;
  onReportGig: (gigId: string) => void;
  onGoToLearn: () => void;
}

const GIG_FILTERS: ("All" | GigCategory)[] = [
  "All",
  "Remote Digital",
  "Local Help",
  "Community",
];

const SCAM_KEYWORDS = [
  "pay outside",
  "send outside",
  "whatsapp",
  "telegram",
  "bank transfer",
  "western union",
  "passphrase",
  "seed phrase",
  "gift card",
];

function containsScamOrPhone(text: string, isFirstMessage: boolean): string | null {
  const lower = text.toLowerCase();
  for (const kw of SCAM_KEYWORDS) {
    if (lower.includes(kw)) {
      return `Blocked by EYENEKA Anti-Scam Guard: "${kw}" is prohibited. Keep all payments and communication inside Pi Escrow.`;
    }
  }
  if (isFirstMessage && /(\+?\d[\d\s-]{6,}\d)/.test(text)) {
    return "Anti-Scam Rule: Phone numbers are blocked in the first gig message. Agree on deliverables inside EYENEKA chat first.";
  }
  return null;
}

function calcEscrowSplit(pricePi: number) {
  const feePi = Number((pricePi * 0.08).toFixed(2));
  const totalPi = Number((pricePi + feePi).toFixed(2));
  const workerReceivesPi = Number(pricePi.toFixed(2));
  return { feePi, totalPi, workerReceivesPi };
}

export const WorkView: React.FC<WorkViewProps> = ({
  gigs,
  gigTemplates,
  availableSkillOptions,
  selectedGigId,
  earnedSkills,
  username,
  trustScore,
  kycVerified,
  isAdmin,
  onSelectGig,
  onCreateGig,
  onUpdateTemplate,
  onDeleteTemplate,
  onLockEscrow,
  onSubmitProof,
  onReleaseEscrow,
  onAdvanceDispute,
  onSendMessage,
  onReportGig,
  onGoToLearn,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | GigCategory>("All");
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);

  // Detail modal state
  const activeGig = gigs.find((g) => g.id === selectedGigId) ?? null;
  const [proofNote, setProofNote] = useState("");
  const [proofFileName, setProofFileName] = useState("");
  const [proofImageDataUrl, setProofImageDataUrl] = useState<string | undefined>(undefined);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [releaseRating, setReleaseRating] = useState(5);
  const [releaseReview, setReleaseReview] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatWarning, setChatWarning] = useState<string | null>(null);
  const [disputeReason] = useState("");

  // Post a Gig modal state
  const [postOpen, setPostOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<GigCategory>("Remote Digital");
  const [newSkill, setNewSkill] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("48 hours");
  const [newPrice, setNewPrice] = useState("1.0");
  const [boost24h, setBoost24h] = useState(false);
  const [newChecklistText, setNewChecklistText] = useState("");
  const [postError, setPostError] = useState<string | null>(null);

  // Admin Edit Template modal state
  const [editTpl, setEditTpl] = useState<GigTemplate | null>(null);
  const [etTitle, setEtTitle] = useState("");
  const [etCat, setEtCat] = useState<GigCategory>("Remote Digital");
  const [etSkill, setEtSkill] = useState("");
  const [etPrice, setEtPrice] = useState("1.0");
  const [etDeadline, setEtDeadline] = useState("48 hours");
  const [etDesc, setEtDesc] = useState("");
  const [etChecklist, setEtChecklist] = useState("");

  const openPostFromTemplate = (tpl: GigTemplate) => {
    setPostError(null);
    setNewTitle(tpl.title);
    setNewCategory(tpl.category);
    setNewSkill(tpl.requiredSkill);
    setNewDesc(tpl.description);
    setNewDeadline(tpl.deadline);
    setNewPrice(tpl.pricePi.toFixed(1));
    setNewChecklistText(tpl.checklist.join("\n"));
    setBoost24h(false);
    setPostOpen(true);
  };

  const openEditTemplateModal = (tpl: GigTemplate) => {
    setEditTpl(tpl);
    setEtTitle(tpl.title);
    setEtCat(tpl.category);
    setEtSkill(tpl.requiredSkill);
    setEtPrice(tpl.pricePi.toFixed(1));
    setEtDeadline(tpl.deadline);
    setEtDesc(tpl.description);
    setEtChecklist(tpl.checklist.join("\n"));
  };

  const filteredGigs = gigs
    .filter((g) => {
      const matchCat = filter === "All" || g.category === filter;
      const q = search.trim().toLowerCase();
      const matchQuery =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.requiredSkill.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q);
      const matchSkill = !onlyUnlocked || earnedSkills.includes(g.requiredSkill);
      return matchCat && matchQuery && matchSkill;
    })
    .slice()
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  const filteredTemplates = gigTemplates.filter((t) => {
    const matchCat = filter === "All" || t.category === filter;
    const q = search.trim().toLowerCase();
    const matchQuery =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.requiredSkill.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const parsedNewPrice = Number(newPrice) || 0;
  const previewSplit = calcEscrowSplit(parsedNewPrice);
  const totalWithBoost = Number((parsedNewPrice + (boost24h ? 0.2 : 0)).toFixed(2));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);
    const price = Number(newPrice);
    if (!newTitle.trim() || !newDesc.trim() || !newSkill.trim()) {
      setPostError("Provide a clear task title, required skill, and task description.");
      return;
    }
    if (Number.isNaN(price) || price < 0.2 || price > 5) {
      setPostError("Pi price must be between 0.2 π and 5.0 π per micro-gig.");
      return;
    }
    if (price > 1 && !kycVerified) {
      setPostError("Real Pi KYC verification is required to post gigs above 1.0 π.");
      return;
    }
    const scamCheck = containsScamOrPhone(`${newTitle} ${newDesc}`, true);
    if (scamCheck) {
      setPostError(scamCheck);
      return;
    }
    const checklist = newChecklistText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (checklist.length === 0) {
      setPostError("Add at least one deliverable checklist item.");
      return;
    }

    onCreateGig(
      {
        title: newTitle.trim(),
        category: newCategory,
        requiredSkill: newSkill.trim(),
        description: newDesc.trim(),
        deadline: newDeadline.trim() || "48 hours",
        pricePi: price,
        buyerHandle: username ? `@${username}` : "@pioneer",
        buyerKyc: kycVerified,
        buyerTrustScore: trustScore,
        checklist,
        featured: boost24h,
        featuredUntil: boost24h ? "24h Featured" : undefined,
      },
      boost24h
    );
    setPostOpen(false);
    setNewTitle("");
    setNewSkill("");
    setNewDesc("");
    setNewChecklistText("");
    setBoost24h(false);
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGig || !chatInput.trim()) return;
    const isFirst = activeGig.messages.length === 0;
    const warning = containsScamOrPhone(chatInput, isFirst);
    if (warning) {
      setChatWarning(warning);
      return;
    }
    setChatWarning(null);
    onSendMessage(activeGig.id, chatInput.trim());
    setChatInput("");
  };

  const handleSubmitProofClick = () => {
    if (!activeGig) return;
    if (!proofNote.trim() || checkedItems.length === 0) return;
    onSubmitProof(
      activeGig.id,
      proofNote.trim(),
      checkedItems,
      proofFileName || undefined,
      proofImageDataUrl
    );
    setProofNote("");
    setProofFileName("");
    setProofImageDataUrl(undefined);
    setCheckedItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold text-[#7C3AED]">
            Verified Micro-Gig Marketplace · Smart Contract Escrow · 8% Service Fee
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Real work, locked escrow, transparent π payouts.
          </h1>
          <p className="text-sm text-slate-600">
            Buyers lock Pi into Smart Contract Escrow first. Workers submit real proof before funds release (8% fee auto-deducted on completed gigs). Hold a Verified Certificate in the skill to apply.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPostError(null);
            setPostOpen(true);
          }}
          className="min-h-[48px] px-5 rounded-xl bg-[#FFC800] text-[#050507] text-sm font-semibold hover:bg-[#eab800] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Verified Gig</span>
        </button>
      </section>

      {/* Search & Filter */}
      <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gigs or required skills..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {GIG_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  filter === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setOnlyUnlocked((v) => !v)}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                onlyUnlocked
                  ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {onlyUnlocked ? "Showing Certified Only" : "Filter: My Certificates"}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION A: Live Gigs By Real Users (Starts at 0 — Never Mixed With Templates) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h2 className="font-display font-bold text-lg text-white">
            Live Gigs By Real Users ({gigs.length})
          </h2>
          <span className="text-slate-400">
            Real Pioneer escrow postings only
          </span>
        </div>

        {gigs.length === 0 ? (
          <section className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFC800]/20 text-slate-900 flex items-center justify-center mx-auto">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              No gigs yet. Be the first to post a gig.
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Click "Use Template" on any of the {gigTemplates.length} Official Gig Templates below to pre-fill and post your own real gig, or create one from scratch.
            </p>
            <button
              type="button"
              onClick={() => {
                setPostError(null);
                setPostOpen(true);
              }}
              className="min-h-[44px] px-5 rounded-xl bg-[#FFC800] text-[#050507] text-xs font-bold hover:bg-[#eab800] inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post Custom Gig</span>
            </button>
          </section>
        ) : filteredGigs.length === 0 ? (
          <section className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-2">
            <p className="font-display font-bold text-slate-900">No matching live gigs</p>
            <p className="text-sm text-slate-600">
              Adjust your search or skill filter to view live posted gigs.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGigs.map((gig) => {
              const unlocked = earnedSkills.includes(gig.requiredSkill);
              return (
                <div
                  key={gig.id}
                  className={`rounded-2xl bg-white border p-5 flex flex-col justify-between gap-4 transition-colors ${
                    gig.featured
                      ? "border-[#FFC800] ring-1 ring-[#FFC800]/40"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        {gig.featured && (
                          <span className="px-1.5 py-0.5 rounded bg-[#FFC800] text-[#050507] text-[10px] font-extrabold tracking-wide">
                            FEATURED
                          </span>
                        )}
                        <span>
                          {gig.category} · {gig.deadline}
                        </span>
                      </span>
                      <span className="font-mono-tabular font-bold text-sm text-[#7C3AED]">
                        {gig.pricePi.toFixed(2)} π
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-slate-900">
                      {gig.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {gig.description}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-700 font-medium">
                        {gig.buyerHandle} {gig.buyerKyc ? "· Verified Pioneer" : ""}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span
                        className={
                          gig.status === "Funds Locked"
                            ? "text-[#16A34A] font-semibold"
                            : gig.status === "Disputed"
                            ? "text-red-600 font-semibold"
                            : "text-slate-600 font-medium"
                        }
                      >
                        {gig.status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      {unlocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span className="text-[#16A34A]">{gig.requiredSkill}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Cert: {gig.requiredSkill}</span>
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setProofNote("");
                        setProofFileName("");
                        setProofImageDataUrl(undefined);
                        setCheckedItems([]);
                        setChatWarning(null);
                        onSelectGig(gig.id);
                      }}
                      className="min-h-[40px] px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      Open Escrow
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {/* SECTION B: Official Gig Templates — Copy To Post Your Own Gig */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              Gig Templates - Copy To Post Your Own Gig ({filteredTemplates.length})
            </h2>
            <p className="text-xs text-slate-400">
              Published by EYENEKA Official. Templates are NOT live gigs and have no fake assigned users.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-[#050507] text-[#FFC800] text-[10px] font-bold">
                      OFFICIAL STARTER
                    </span>
                    <span className="text-slate-500">{tpl.category}</span>
                  </span>
                  <span className="font-mono-tabular font-bold text-sm text-[#7C3AED] shrink-0">
                    {tpl.pricePi.toFixed(1)} π
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-slate-900">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{tpl.description}</p>

                <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">Checklist:</p>
                  <p>{tpl.checklist.join(" · ")}</p>
                </div>

                <p className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                  Template - Not a live gig. Click Use Template to post your own.
                </p>

                <p className="text-[11px] text-slate-500 tabular-nums">
                  Author: {tpl.author} · {tpl.publishedAt} · Completions: {tpl.completionsCount} · Reviews: {tpl.reviewsCount} · Earnings: {tpl.earningsPi} π
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Requires Cert: {tpl.requiredSkill}
                  </span>
                  <button
                    type="button"
                    onClick={() => openPostFromTemplate(tpl)}
                    className="min-h-[40px] px-4 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-colors whitespace-nowrap"
                  >
                    Use Template
                  </button>
                </div>

                {isAdmin && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openEditTemplateModal(tpl)}
                      className="min-h-[32px] px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="min-h-[32px] px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gig Escrow + Proof + Chat Drawer Modal */}
      {activeGig && (() => {
        const split = calcEscrowSplit(activeGig.pricePi);
        const unlocked = earnedSkills.includes(activeGig.requiredSkill);
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#FFC800] font-medium">
                    {activeGig.featured ? "FEATURED · " : ""}
                    {activeGig.category} · {activeGig.deadline} · Escrow {activeGig.escrowId || activeGig.id} · {activeGig.status}
                  </p>
                  <h3 className="font-display font-bold text-lg">{activeGig.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectGig(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
                  aria-label="Close gig details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Escrow Stepper + 8% Service Fee Breakdown */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Pi Smart Contract Escrow Breakdown
                    </span>
                    <span className="font-mono-tabular text-sm font-bold text-[#7C3AED]">
                      Gig Price {activeGig.pricePi.toFixed(2)} π
                    </span>
                  </div>

                  <div className="rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-800 font-mono-tabular">
                    Gig Price {activeGig.pricePi.toFixed(2)} π + Escrow Fee 8% ({split.feePi.toFixed(2)} π) ={" "}
                    <strong className="text-[#7C3AED]">
                      Total {split.totalPi.toFixed(2)} π in Pi
                    </strong>{" "}
                    · Worker Receives {split.workerReceivesPi.toFixed(2)} π on approval
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { label: "1. Posted", active: true },
                      {
                        label: "2. Funds Locked",
                        active:
                          activeGig.status === "Funds Locked" ||
                          activeGig.status === "Proof Submitted" ||
                          activeGig.status === "Disputed" ||
                          activeGig.status === "Released",
                      },
                      {
                        label: "3. Proof Sent",
                        active:
                          activeGig.status === "Proof Submitted" ||
                          activeGig.status === "Disputed" ||
                          activeGig.status === "Released",
                      },
                      { label: "4. Released", active: activeGig.status === "Released" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className={`py-2 px-1 rounded-lg font-medium ${
                          s.active
                            ? "bg-[#7C3AED] text-white"
                            : "bg-white border border-slate-200 text-slate-400"
                        }`}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Certificate Gate Check */}
                {!unlocked && (
                  <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 text-sm text-slate-900">
                      <Lock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">
                          Verified Certificate Required: {activeGig.requiredSkill}
                        </p>
                        <p className="text-xs text-slate-700">
                          No certificate = no gig. Create or complete a lesson for "{activeGig.requiredSkill}" and mint your Verified Certificate in Learn.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectGig(null);
                        onGoToLearn();
                      }}
                      className="min-h-[40px] px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                    >
                      Open Learn Academy
                    </button>
                  </div>
                )}

                {/* Buyer & Description */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                      {activeGig.buyerKyc && <ShieldCheck className="w-4 h-4 text-[#16A34A]" />}
                      Buyer {activeGig.buyerHandle} · Trust {activeGig.buyerTrustScore}/100
                      {activeGig.buyerKyc ? " · KYC Verified" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => onReportGig(activeGig.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:underline font-medium"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{activeGig.reported ? "Reported for Review" : "Report Gig"}</span>
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{activeGig.description}</p>
                </div>

                {/* Deliverable Checklist */}
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    Mandatory Deliverable Checklist
                  </h4>
                  <div className="space-y-2">
                    {activeGig.checklist.map((item, idx) => {
                      const checked =
                        checkedItems.includes(idx) ||
                        activeGig.proofCheckedItems?.includes(idx) ||
                        activeGig.status === "Released";
                      return (
                        <label
                          key={`${item}-${idx}`}
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-sm text-slate-800 cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={activeGig.status !== "Funds Locked"}
                            onChange={() =>
                              setCheckedItems((prev) =>
                                prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                              )
                            }
                            className="accent-[#7C3AED]"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Escrow Actions */}
                <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                  {activeGig.status === "Open" && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-slate-600">
                        Step 1: Buyer locks {split.totalPi.toFixed(2)} π ({activeGig.pricePi.toFixed(2)} π + 8% Escrow Fee {split.feePi.toFixed(2)} π) into Smart Contract Escrow so status becomes "Funds Locked".
                      </p>
                      <button
                        type="button"
                        onClick={() => onLockEscrow(activeGig.id)}
                        className="min-h-[44px] px-4 rounded-xl bg-[#FFC800] text-[#050507] text-xs font-bold hover:bg-[#eab800] whitespace-nowrap"
                      >
                        Pay with Pi (Testnet) · Lock {split.totalPi.toFixed(2)} π
                      </button>
                    </div>
                  )}

                  {activeGig.status === "Funds Locked" && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-[#16A34A]">
                        Status: Funds Locked ({split.totalPi.toFixed(2)} π in Escrow). Worker receives {split.workerReceivesPi.toFixed(2)} π upon buyer approval.
                      </p>
                      <textarea
                        rows={2}
                        value={proofNote}
                        onChange={(e) => setProofNote(e.target.value)}
                        placeholder="Describe completed deliverables..."
                        className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{proofFileName ? `Attached: ${proofFileName}` : "Attach Photo / Deliverable File"}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf,.csv,.txt,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setProofFileName(file.name);
                              if (file.type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === "string") {
                                    setProofImageDataUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              } else {
                                setProofImageDataUrl(undefined);
                              }
                            }}
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        disabled={!proofNote.trim() || checkedItems.length === 0 || !unlocked}
                        onClick={handleSubmitProofClick}
                        className="min-h-[44px] px-5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40"
                      >
                        {unlocked
                          ? "Submit Deliverable Proof"
                          : `Requires "${activeGig.requiredSkill}" Certificate to Submit Proof`}
                      </button>
                    </div>
                  )}

                  {activeGig.status === "Proof Submitted" && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-800">
                        Proof Submitted: "{activeGig.proofNote}"
                        {activeGig.proofFileName ? ` · File: ${activeGig.proofFileName}` : ""}
                      </p>
                      {activeGig.proofImageDataUrl && (
                        <img
                          src={activeGig.proofImageDataUrl}
                          alt="Submitted proof"
                          className="max-h-40 rounded-xl border border-slate-200 object-contain"
                        />
                      )}
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">Rate Worker Delivery</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReleaseRating(star)}
                                className="p-1"
                                aria-label={`Rate ${star} stars`}
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    star <= releaseRating
                                      ? "text-[#FFC800] fill-[#FFC800]"
                                      : "text-slate-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={releaseReview}
                          onChange={(e) => setReleaseReview(e.target.value)}
                          placeholder="Optional verified review note..."
                          className="w-full min-h-[38px] px-3 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onReleaseEscrow(activeGig.id, releaseRating, releaseReview.trim())
                          }
                          className="min-h-[44px] px-4 rounded-xl bg-[#16A34A] text-white text-xs font-semibold hover:bg-[#15803D]"
                        >
                          Approve & Release {split.workerReceivesPi.toFixed(2)} π
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onAdvanceDispute(
                              activeGig.id,
                              disputeReason || "Deliverable review requested"
                            )
                          }
                          className="min-h-[44px] px-4 rounded-xl border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50"
                        >
                          Dispute (Hold Escrow)
                        </button>
                      </div>
                    </div>
                  )}

                  {activeGig.status === "Disputed" && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-red-700">
                        Status: Disputed — Step {activeGig.disputeStep ?? 1} of 3 (
                        {activeGig.disputeStep === 1
                          ? "Direct Structured Chat"
                          : activeGig.disputeStep === 2
                          ? "Community Mediator Reviewing Proof"
                          : "Final Review — Escrow Held"}
                        ). Funds will NOT auto-release while disputed.
                      </p>
                      {(activeGig.disputeStep ?? 1) < 3 && (
                        <button
                          type="button"
                          onClick={() => onAdvanceDispute(activeGig.id)}
                          className="min-h-[40px] px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                        >
                          Escalate to Next Mediation Step
                        </button>
                      )}
                    </div>
                  )}

                  {activeGig.status === "Released" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#16A34A]">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Escrow Released to Worker · Status: Confirmed</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Amount</span>
                          <span className="font-mono-tabular font-semibold text-slate-900">
                            {split.workerReceivesPi.toFixed(2)} π
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Fee (8%)</span>
                          <span className="font-mono-tabular text-slate-900">
                            {split.feePi.toFixed(2)} π
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Escrow ID</span>
                          <span className="font-mono-tabular text-slate-900">
                            {activeGig.escrowId || activeGig.id}
                          </span>
                        </div>
                        {activeGig.paymentId && (
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500">Payment ID</span>
                            <span className="font-mono-tabular text-slate-900 break-all text-right">
                              {activeGig.paymentId}
                            </span>
                          </div>
                        )}
                        {activeGig.txHash && (
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500">TXID</span>
                            <span className="font-mono-tabular text-slate-900 break-all text-right">
                              {activeGig.txHash}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Date</span>
                          <span className="font-mono-tabular text-slate-900">
                            {activeGig.releasedAt || new Date().toISOString().slice(0, 10)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status</span>
                          <span className="font-bold text-[#16A34A]">Confirmed</span>
                        </div>
                      </div>
                      {activeGig.workerRating && (
                        <p className="text-xs text-slate-600">
                          Rated {activeGig.workerRating}/5{activeGig.buyerReview ? ` · "${activeGig.buyerReview}"` : ""}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Gig Chat */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                      <span>Protected Gig Chat</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Anti-scam guard active · No phone numbers in 1st message · Pi only
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 max-h-44 overflow-y-auto">
                    {activeGig.messages.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">
                        No messages yet. Discuss task deliverables safely here.
                      </p>
                    ) : (
                      activeGig.messages.map((m) => (
                        <div key={m.id} className="rounded-lg bg-white border border-slate-200 p-2.5 text-xs">
                          <div className="flex items-center justify-between text-slate-500 mb-1">
                            <span className="font-semibold text-slate-800">{m.sender}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          <p className="text-slate-700">{m.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {chatWarning && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{chatWarning}</span>
                    </div>
                  )}

                  <form onSubmit={handleChatSend} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Write a message about deliverables or timeline..."
                      className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="min-h-[44px] px-4 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] disabled:opacity-40 inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Post a Verified Gig Modal */}
      {postOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#FFC800]" />
                <h3 className="font-display font-bold text-base">Post a Verified Micro-Gig</h3>
              </div>
              <button
                type="button"
                onClick={() => setPostOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clear Task Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Describe the work task"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gig Type
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GigCategory)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Remote Digital">Remote Digital</option>
                    <option value="Local Help">Local Help</option>
                    <option value="Community">Community</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Certified Skill
                  </label>
                  <input
                    type="text"
                    list="available-skills-list"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. Prompting or Data QA"
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                  <datalist id="available-skills-list">
                    {availableSkillOptions.map((sk) => (
                      <option key={sk} value={sk} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pi Price (0.2 – 5.0 π)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="5"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {parsedNewPrice > 1 && !kycVerified && (
                <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900">
                  Real Pi KYC is required to post gigs over 1.0 π. Connect and confirm Pi KYC in Header or keep price at 1.0 π or below.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Description (Pi work only, no physical goods)
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe exact deliverables and expected format..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deliverable Checklist (1 item per line)
                </label>
                <textarea
                  rows={2}
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Deliverable 1&#10;Deliverable 2"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Optional Featured Gig Boost 0.2 π / 24h */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#FFC800] bg-[#FFC800]/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={boost24h}
                  onChange={(e) => setBoost24h(e.target.checked)}
                  className="mt-0.5 accent-[#7C3AED]"
                />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Boost this gig to top for 24h - 0.2 π</span>
                  </p>
                  <p className="text-slate-600">
                    Optional FEATURED placement for 24h. Unchecked gigs list normally for free.
                  </p>
                </div>
              </label>

              {/* Transparent Pre-Post Fee Breakdown */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Gig Price</span>
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {parsedNewPrice.toFixed(2)} π
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Escrow Fee (8%)</span>
                  <span className="font-mono-tabular text-slate-700">
                    +{previewSplit.feePi.toFixed(2)} π
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Total in Pi (Escrow Lock)</span>
                  <span className="font-mono-tabular text-[#7C3AED]">
                    {previewSplit.totalPi.toFixed(2)} π
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Worker Receives on Approval</span>
                  <span className="font-mono-tabular font-semibold text-[#16A34A]">
                    {previewSplit.workerReceivesPi.toFixed(2)} π
                  </span>
                </div>
                {boost24h && (
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="font-semibold text-[#7C3AED]">Featured 24h Boost (Pay Now with Pi)</span>
                    <span className="font-mono-tabular font-bold text-[#7C3AED]">
                      0.20 π
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Total Escrow + Boost</span>
                  <span className="font-mono-tabular">
                    {Number((previewSplit.totalPi + (boost24h ? 0.2 : 0)).toFixed(2)).toFixed(2)} π
                  </span>
                </div>
              </div>

              {postError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {postError}
                </div>
              )}

              <button
                type="submit"
                className="min-h-[48px] w-full rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9]"
              >
                {boost24h
                  ? "Pay with Pi (Testnet) · 0.20 π Boost & Publish"
                  : "Publish Gig to Escrow Marketplace"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Gig Template Modal */}
      {editTpl && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">Edit Gig Template (Admin)</h3>
              <button
                type="button"
                onClick={() => setEditTpl(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!etTitle.trim() || !etDesc.trim()) return;
                onUpdateTemplate(editTpl.id, {
                  title: etTitle.trim(),
                  category: etCat,
                  requiredSkill: etSkill.trim() || editTpl.requiredSkill,
                  pricePi: Math.min(5, Math.max(0.2, Number(etPrice) || editTpl.pricePi)),
                  deadline: etDeadline.trim() || editTpl.deadline,
                  description: etDesc.trim(),
                  checklist: etChecklist
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                });
                setEditTpl(null);
              }}
              className="p-6 space-y-3.5 overflow-y-auto"
            >
              <input
                type="text"
                value={etTitle}
                onChange={(e) => setEtTitle(e.target.value)}
                placeholder="Template Title"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={etCat}
                  onChange={(e) => setEtCat(e.target.value as GigCategory)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                >
                  <option value="Remote Digital">Remote Digital</option>
                  <option value="Local Help">Local Help</option>
                  <option value="Community">Community</option>
                </select>
                <input
                  type="text"
                  value={etSkill}
                  onChange={(e) => setEtSkill(e.target.value)}
                  placeholder="Required Skill"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="5"
                  value={etPrice}
                  onChange={(e) => setEtPrice(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono-tabular"
                />
                <input
                  type="text"
                  value={etDeadline}
                  onChange={(e) => setEtDeadline(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <textarea
                rows={2}
                value={etDesc}
                onChange={(e) => setEtDesc(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm"
              />
              <textarea
                rows={3}
                value={etChecklist}
                onChange={(e) => setEtChecklist(e.target.value)}
                placeholder="Checklist items (1 per line)"
                className="w-full p-3 rounded-xl border border-slate-300 text-sm"
              />
              <button
                type="submit"
                className="min-h-[48px] w-full rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9]"
              >
                Save Template Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
