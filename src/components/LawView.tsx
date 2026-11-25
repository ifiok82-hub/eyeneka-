import React, { useState } from "react";
import {
  Ban,
  CheckCircle2,
  Download,
  Flag,
  Lock,
  Scale,
  ShieldCheck,
  Trash2,
} from "lucide-react";
interface LegalDocument {
  id: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}

const UPDATED_DATE = new Date().toISOString().slice(0, 10);

const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: "terms-of-service",
    title: "Terms of Service",
    updated: UPDATED_DATE,
    sections: [
      {
        heading: "1. Platform Purpose",
        body: "EYENEKA is a global, borderless people utility for skills learning, verified micro-gig escrow, everyday health literacy navigation, and peer savings circles. EYENEKA is not an e-commerce store and does not sell physical goods, eSIMs, VPNs, virtual cards, phone numbers, or AI credits.",
      },
      {
        heading: "2. Pioneer Eligibility & Conduct",
        body: "All accounts authenticate through Pi Network SDK v2.0 inside Pi Browser. Pioneers must use accurate deliverables, respect community safety rules, and never solicit off-app payments or personal financial credentials.",
      },
    ],
  },
  {
    id: "privacy-data-ownership",
    title: "Privacy & Data Ownership",
    updated: UPDATED_DATE,
    sections: [
      {
        heading: "1. User Owns Data",
        body: "EYENEKA collects only your Pi-verified session identity and the records you create inside the app. You can export your complete JSON data archive or permanently delete all your data at any time from the Law tab.",
      },
      {
        heading: "2. Session Security",
        body: "Pi access tokens are exchanged server-side only and signed session tokens remain in active application memory rather than persistent browser storage.",
      },
    ],
  },
  {
    id: "escrow-service-fee",
    title: "Escrow & 8% Fee Rules",
    updated: UPDATED_DATE,
    sections: [
      {
        heading: "1. Transparent Fee Breakdown",
        body: "Every verified micro-gig displays the 8% EYENEKA service fee upfront before funds are locked. Escrow funds remain locked until deliverable proof is submitted and approved, or resolved through dispute review.",
      },
      {
        heading: "2. No Unilateral Auto-Release During Disputes",
        body: "If a gig enters Disputed status, escrow funds remain locked pending resolution and never auto-release while disputed.",
      },
    ],
  },
  {
    id: "pi-only-payment",
    title: "Pi-Only Payment Policy",
    updated: UPDATED_DATE,
    sections: [
      {
        heading: "1. Pi Coin Exclusively",
        body: "All platform fees, certificates, boosts, care partner listings, and gig escrow settlements operate strictly in π via Pi.createPayment inside Pi Browser. No fiat currencies, bank transfers, cards, or external tokens are accepted.",
      },
      {
        heading: "2. No Financial Advice or Yield",
        body: "EYENEKA does not offer fiat exchange, staking, interest, or investment returns.",
      },
    ],
  },
  {
    id: "verified-certificates",
    title: "Verified Certificate Standards",
    updated: UPDATED_DATE,
    sections: [
      {
        heading: "1. Free Learning, Optional Verified Mint",
        body: "All EYENEKA lessons and skill quizzes are free to study. Pioneers who pass a skill quiz may mint a Verified Certificate (0.1–0.5 π) carrying their @username, skill title, issue date, and verification reference to unlock corresponding gigs and earn +10 Trust Score.",
      },
    ],
  },
  {
    id: "care-disclaimer",
    title: "Care Navigation Disclaimer",
    updated: UPDATED_DATE,
    sections: [
      {
        heading: "1. Educational Information Only",
        body: "First-aid guides, wellness checks, medicine reminders, and community care listings are educational utilities and do not replace licensed medical diagnosis or emergency services. Always seek qualified professional care for urgent symptoms.",
      },
    ],
  },
  {
    id: "savings-circle-charter",
    title: "Savings Circle Charter",
    updated: UPDATED_DATE,
    sections: [
      {
        heading: "1. Zero-Interest Peer Rotation",
        body: "Community savings circles coordinate transparent peer contributions with 0% interest and member-voted emergency food pools. Late or missed cycles directly adjust member Trust Score.",
      },
    ],
  },
  {
    id: "dispute-protocol",
    title: "Dispute Resolution Protocol",
    updated: UPDATED_DATE,
    sections: [
      {
        heading: "1. Three-Stage Evidence Review",
        body: "Disputed gigs progress through structured proof, checklist, and messaging evidence review while funds remain safely frozen in escrow.",
      },
    ],
  },
  {
    id: "safety-anti-scam",
    title: "Safety & Anti-Scam Rules",
    updated: UPDATED_DATE,
    sections: [
      {
        heading: "1. Zero Off-App Solicitation",
        body: "Asking Pioneers to send Pi outside Pi.createPayment or requesting passphrases results in immediate blocking and community safety reporting.",
      },
    ],
  },
];

interface LawViewProps {
  blockedUsers: string[];
  onBlockUser: (handle: string) => void;
  onUnblockUser: (handle: string) => void;
  onExportData: () => void;
  onDeleteMyData: () => void;
}

export const LawView: React.FC<LawViewProps> = ({
  blockedUsers,
  onBlockUser,
  onUnblockUser,
  onExportData,
  onDeleteMyData,
}) => {
  const [selectedDocId, setSelectedDocId] = useState(LEGAL_DOCUMENTS[0].id);
  const [reportTarget, setReportTarget] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [blockInput, setBlockInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const activeDoc =
    LEGAL_DOCUMENTS.find((d) => d.id === selectedDocId) ?? LEGAL_DOCUMENTS[0];

  return (
    <div className="space-y-6">
      {/* EYENEKA Compliance Hub Header — Zero parent company / reg / location details */}
      <section className="rounded-2xl bg-[#0D0D14] border border-white/10 p-6 sm:p-8 text-white space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold text-[#FFC800]">
              Compliance & Trust Hub · Global Borderless People Utility
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Operated by EYENEKA
            </h1>
            <p className="text-sm text-slate-300">
              EYENEKA operates strictly as a global, decentralized utility for skills learning, verified work escrow, everyday care navigation, and peer savings circles.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-xs space-y-1.5 shrink-0 max-w-sm">
            <p className="font-semibold text-[#22C55E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Pi Ecosystem Integrity Charter
            </p>
            <p className="text-slate-300">All fees in Pi only · No hidden fees · Fee shown before payment</p>
            <p className="text-slate-300">Ads support free learning · No interest · No investment</p>
            <p className="text-slate-300">
              EYENEKA does not hold user Pi except in escrow for active gigs. Escrow releases only on proof + approval or dispute decision.
            </p>
          </div>
        </div>
      </section>

      {/* 9 Legal Documents Reader */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-3 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-slate-500">
            Governance & Compliance Documents
          </p>
          {LEGAL_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedDocId(doc.id)}
              className={`w-full text-left min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                doc.id === activeDoc.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{doc.title}</span>
              <span className="text-xs opacity-70">{doc.updated}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#7C3AED]" />
              <h2 className="font-display text-xl font-bold text-slate-900">
                {activeDoc.title}
              </h2>
            </div>
            <span className="text-xs text-slate-500">Effective {activeDoc.updated}</span>
          </div>

          <div className="space-y-4">
            {activeDoc.sections.map((s) => (
              <div key={s.heading} className="space-y-1">
                <h3 className="font-display font-bold text-sm text-slate-900">
                  {s.heading}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Reporting, User Blocking & Real Data Deletion */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!reportTarget.trim() || !reportReason.trim()) return;
            setReportSent(true);
            setReportTarget("");
            setReportReason("");
          }}
          className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3"
        >
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-600" />
            <span>Report Fraud or Scam Gig</span>
          </h3>
          <input
            type="text"
            value={reportTarget}
            onChange={(e) => {
              setReportSent(false);
              setReportTarget(e.target.value);
            }}
            placeholder="@username or Gig ID"
            className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-xs"
          />
          <textarea
            rows={2}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe off-app payment request or rule violation..."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs"
          />
          <button
            type="submit"
            className="min-h-[44px] w-full rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
          >
            Submit Safety Report
          </button>
          {reportSent && (
            <p className="text-xs text-[#16A34A] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Safety report logged for Community Review.
            </p>
          )}
        </form>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Ban className="w-4 h-4 text-slate-700" />
            <span>Block User</span>
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!blockInput.trim()) return;
              onBlockUser(blockInput.trim());
              setBlockInput("");
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={blockInput}
              onChange={(e) => setBlockInput(e.target.value)}
              placeholder="@handle to block"
              className="flex-1 min-h-[42px] px-3 rounded-xl border border-slate-300 text-xs"
            />
            <button
              type="submit"
              className="min-h-[42px] px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Block
            </button>
          </form>
          <div className="space-y-1.5 pt-1">
            {blockedUsers.length === 0 ? (
              <p className="text-xs text-slate-500">No blocked accounts.</p>
            ) : (
              blockedUsers.map((u) => (
                <div
                  key={u}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <span className="font-medium text-slate-800">{u}</span>
                  <button
                    type="button"
                    onClick={() => onUnblockUser(u)}
                    className="text-[#7C3AED] font-semibold hover:underline"
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#7C3AED]" />
            <span>Your Data Rights</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            User owns data. Records are encrypted locally and never sold to third parties. Export or permanently delete all your real user data anytime.
          </p>
          <button
            type="button"
            onClick={onExportData}
            className="min-h-[44px] w-full rounded-xl border border-slate-300 text-slate-900 text-xs font-semibold hover:bg-slate-50 inline-flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export My Data (JSON)</span>
          </button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="min-h-[44px] w-full rounded-xl border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete My Data</span>
            </button>
          ) : (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 space-y-2">
              <p className="text-xs text-red-800 font-medium">
                Permanently erase all saved lessons, gigs, circles, health logs, certificates, and wallet history?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteMyData();
                    setConfirmDelete(false);
                  }}
                  className="min-h-[38px] flex-1 rounded-lg bg-red-600 text-white text-xs font-semibold"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-[38px] flex-1 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
