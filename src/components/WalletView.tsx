import React, { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Lock,
  PlayCircle,
  Receipt,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { TxCategory, WalletTransaction } from "../types";
import { triggerPiAd } from "../lib/piSdk";

interface WalletViewProps {
  piConnected: boolean;
  inPiBrowser: boolean;
  kycVerified: boolean;
  username: string;
  availablePi: number;
  lockedEscrowPi: number;
  earnedMonthPi: number;
  savedCirclesPi: number;
  feesPaidMonthPi: number;
  totalEarnedByPioneersPi: number;
  transactions: WalletTransaction[];
  onConnectPi: () => void;
  onQuickPaymentTest: (amountPi: number, memo: string) => void;
  onRecordAdSupport: () => void;
}

const TX_FILTERS: ("All" | TxCategory)[] = [
  "All",
  "Gigs",
  "Certificates",
  "Boosts",
  "Circles",
  "Care Listing",
  "Ads",
];

export const WalletView: React.FC<WalletViewProps> = ({
  piConnected,
  inPiBrowser,
  kycVerified,
  username,
  availablePi,
  lockedEscrowPi,
  earnedMonthPi,
  savedCirclesPi,
  feesPaidMonthPi,
  totalEarnedByPioneersPi,
  transactions,
  onConnectPi,
  onQuickPaymentTest,
  onRecordAdSupport,
}) => {
  const [adStatus, setAdStatus] = useState<string | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [txFilter, setTxFilter] = useState<"All" | TxCategory>("All");
  const [onlyMyFeesPaid, setOnlyMyFeesPaid] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<WalletTransaction | null>(null);

  const handleWatchPiAd = async () => {
    setAdLoading(true);
    setAdStatus(null);
    try {
      const res = await triggerPiAd("rewarded");
      if (res.completed) {
        onRecordAdSupport();
        setAdStatus("Pi Ad verified via Pi.Ads.showAd — free learning supported.");
      }
    } finally {
      setAdLoading(false);
    }
  };

  const visibleTransactions = transactions.filter((tx) => {
    const matchCategory = txFilter === "All" || tx.category === txFilter;
    const matchFees = !onlyMyFeesPaid || (typeof tx.feePi === "number" && tx.feePi > 0);
    return matchCategory && matchFees;
  });

  return (
    <div className="space-y-6">
      {/* Pi-Native Auth Card with Uploaded Eyeneka Logo */}
      <section className="rounded-2xl bg-[#0D0D14] border border-white/10 p-6 sm:p-8 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4 max-w-2xl">
          <img
            src="/assets/aistudio/eyeneka_logo_cutout_0b9ce129.png"
            alt="EYENEKA Logo"
            className="w-14 h-14 rounded-full bg-white object-contain p-1 shrink-0"
          />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#FFC800]">
              Pi SDK v2.0 · Pi.createPayment Inside Pi App · Pi Coin ONLY
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              {piConnected && username
                ? `Connected as Pioneer @${username}`
                : "Login with Pi Wallet"}
            </h1>
            <p className="text-sm text-slate-300">
              No email required. All payments run in π inside Pi Browser with zero external redirects, zero fiat conversions, zero custom tokens, and zero interest or investment claims.
            </p>
            <p className="text-xs text-slate-400">
              Status:{" "}
              {piConnected
                ? `${inPiBrowser ? "Pi Browser Mainnet SDK v2.0" : "Pi Session Active"}${
                    kycVerified ? " · KYC Verified" : " · KYC Unverified"
                  }`
                : "Wallet not connected"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          {!piConnected ? (
            <button
              type="button"
              onClick={onConnectPi}
              className="min-h-[48px] px-5 rounded-xl bg-[#FFC800] text-[#050507] text-sm font-bold hover:bg-[#eab800] inline-flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Login with Pi</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                onQuickPaymentTest(0.1, "EYENEKA Real Pi SDK Payment Check")
              }
              className="min-h-[48px] px-5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Execute 0.10 π Pi.createPayment</span>
            </button>
          )}
        </div>
      </section>

      {/* 6 Real-Only Pi Balance & Fee Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500">Available Pi</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {availablePi.toFixed(2)} π
          </p>
          <p className="mt-1 text-xs text-slate-600">Net settled payouts in Pi</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Locked in Escrow</span>
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#7C3AED] tabular-nums">
            {lockedEscrowPi.toFixed(2)} π
          </p>
          <p className="mt-1 text-xs text-slate-600">Active gig escrow only</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500">Earned This Month</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#16A34A] tabular-nums">
            {earnedMonthPi.toFixed(2)} π
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {earnedMonthPi === 0 ? "0 π earned yet." : "Net after 8% escrow fee"}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500">Saved in Circles</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {savedCirclesPi.toFixed(2)} π
          </p>
          <p className="mt-1 text-xs text-slate-600">Real circle contributions only</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500">Eyeneka Fees Paid (This Month)</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums">
            {feesPaidMonthPi.toFixed(2)} π
          </p>
          <p className="mt-1 text-xs text-slate-600">Real platform fees only</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500">Total Earned By Pioneers</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#7C3AED] tabular-nums">
            {totalEarnedByPioneersPi.toFixed(2)} π
          </p>
          <p className="mt-1 text-xs text-slate-600">Real completed gig payouts</p>
        </div>
      </section>

      {/* Pi Ads Integration */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-base text-slate-900">
            Pi Network Ads (Ads Support Free Learning)
          </h2>
          <p className="text-xs text-slate-600">
            Official Pi.Ads.showAd integration helps support free Pioneer education.
          </p>
          {adStatus && (
            <p className="text-xs font-semibold text-[#16A34A] inline-flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-4 h-4" /> {adStatus}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={adLoading}
          onClick={handleWatchPiAd}
          className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <PlayCircle className="w-4 h-4 text-[#FFC800]" />
          <span>{adLoading ? "Loading Pi Ad..." : "Watch Pi Ecosystem Ad"}</span>
        </button>
      </section>

      {/* Real Transaction History */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">
              Pi Blockchain Transaction Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Shows real Pi payments only. Select any entry for full receipt & Explorer link.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOnlyMyFeesPaid((v) => !v)}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap self-start ${
              onlyMyFeesPaid
                ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
            }`}
          >
            {onlyMyFeesPaid ? "My Fees Paid: ON" : "My Fees Paid"}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TX_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setTxFilter(cat)}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                txFilter === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs">
                <th className="py-2.5 pr-4 font-medium">Type</th>
                <th className="py-2.5 pr-4 font-medium">Activity</th>
                <th className="py-2.5 pr-4 font-medium">Escrow ID</th>
                <th className="py-2.5 pr-4 font-medium text-right">Amount</th>
                <th className="py-2.5 text-right font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                    {transactions.length === 0
                      ? "No transactions yet."
                      : "No transactions match this filter."}
                  </td>
                </tr>
              ) : (
                visibleTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedReceipt(tx)}
                    className="h-12 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 pr-4 font-semibold text-slate-800 whitespace-nowrap">
                      {tx.type}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">{tx.label}</td>
                    <td className="py-2.5 pr-4 font-mono-tabular text-xs text-slate-500 whitespace-nowrap">
                      {tx.escrowId}
                    </td>
                    <td
                      className={`py-2.5 pr-4 text-right font-mono-tabular font-bold whitespace-nowrap ${
                        tx.direction === "in"
                          ? "text-[#16A34A]"
                          : tx.direction === "locked"
                          ? "text-[#7C3AED]"
                          : "text-slate-900"
                      }`}
                    >
                      {tx.direction === "in" ? "+" : tx.direction === "locked" ? "Locked " : "-"}
                      {tx.amountPi.toFixed(2)} π
                      {typeof tx.feePi === "number" && tx.feePi > 0 && (
                        <span className="block text-[10px] font-normal text-slate-500">
                          Fee: {tx.feePi.toFixed(2)} π
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReceipt(tx);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:underline"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/aistudio/eyeneka_logo_cutout_0b9ce129.png"
                  alt="EYENEKA Logo"
                  className="w-7 h-7 rounded-full bg-white object-contain p-0.5"
                />
                <span className="font-display font-bold text-sm">Pi Payment Receipt</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500">{selectedReceipt.type}</p>
                <p className="font-display text-3xl font-extrabold text-[#7C3AED] tabular-nums">
                  {selectedReceipt.amountPi.toFixed(2)} π
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Purpose</span>
                  <span className="font-semibold text-slate-900 text-right">{selectedReceipt.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-mono-tabular text-slate-900">{selectedReceipt.dateIso}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Escrow / Ref ID</span>
                  <span className="font-mono-tabular text-slate-900">{selectedReceipt.escrowId}</span>
                </div>
                {typeof selectedReceipt.feePi === "number" && selectedReceipt.feePi > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform Fee Paid</span>
                    <span className="font-mono-tabular font-semibold text-slate-900">
                      {selectedReceipt.feePi.toFixed(2)} π
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Pi Explorer</span>
                  <a
                    href={`https://blockexplorer.minepi.com/tx/${selectedReceipt.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#7C3AED] hover:underline font-mono-tabular"
                  >
                    <span>{selectedReceipt.txHash.slice(0, 14)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="min-h-[44px] w-full rounded-xl bg-slate-900 text-white text-sm font-semibold"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
