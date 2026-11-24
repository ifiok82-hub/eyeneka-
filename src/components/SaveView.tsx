import React, { useState } from "react";
import {
  AlertTriangle,
  Award,
  Bell,
  BellOff,
  CheckCircle2,
  Download,
  Landmark,
  Lock,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Utensils,
  X,
} from "lucide-react";
import { SavingsCircle } from "../types";

interface SaveViewProps {
  circles: SavingsCircle[];
  username: string;
  circleLeaderActive: boolean;
  onUpgradeCircleLeader: () => void;
  onCancelCircleLeader: () => void;
  onCreateCircle: (payload: {
    name: string;
    maxMembers: number;
    contributionPi: number;
    cycle: "Weekly" | "Monthly";
    payoutMode: "Rotation" | "Vote";
    hasFoodPool: boolean;
  }) => void;
  onJoinCircle: (circleId: string) => void;
  onContributeCycle: (circleId: string) => void;
  onMarkLateDefault: (circleId: string, handle: string) => void;
  onToggleReminder: (circleId: string) => void;
  onVoteFoodPool: (circleId: string, requestId: string) => void;
  onCreateFoodRequest: (circleId: string, reason: string, amountPi: number) => void;
  onSendCircleMessage: (circleId: string, text: string) => void;
}

export const SaveView: React.FC<SaveViewProps> = ({
  circles,
  username,
  circleLeaderActive,
  onUpgradeCircleLeader,
  onCancelCircleLeader,
  onCreateCircle,
  onJoinCircle,
  onContributeCycle,
  onMarkLateDefault,
  onToggleReminder,
  onVoteFoodPool,
  onCreateFoodRequest,
  onSendCircleMessage,
}) => {
  const [selectedId, setSelectedId] = useState<string>(circles[0]?.id ?? "");
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [cName, setCName] = useState("");
  const [cMembers, setCMembers] = useState("8");
  const [cAmount, setCAmount] = useState("1.5");
  const [cCycle, setCCycle] = useState<"Weekly" | "Monthly">("Weekly");
  const [cMode, setCMode] = useState<"Rotation" | "Vote">("Rotation");
  const [cFoodPool, setCFoodPool] = useState(true);
  const [cError, setCError] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  // Circle interactions
  const [chatInput, setChatInput] = useState("");
  const [foodReason, setFoodReason] = useState("");
  const [foodAmount, setFoodAmount] = useState("0.5");

  const activeCircle = circles.find((c) => c.id === selectedId) ?? circles[0] ?? null;
  const joinedCirclesCount = circles.filter((c) => c.joined).length;
  const maxAllowedCircles = circleLeaderActive ? 3 : 1;

  const handleOpenCreate = () => {
    setLimitNotice(null);
    if (joinedCirclesCount >= maxAllowedCircles) {
      setLimitNotice(
        circleLeaderActive
          ? "You have reached the 3-circle active Circle Leader limit."
          : "Free plan allows 1 active circle. Upgrade to Circle Leader (0.5 π/month) to run up to 3 circles."
      );
      return;
    }
    setCError(null);
    setCreateOpen(true);
  };

  const handleJoinClick = (circleId: string) => {
    setLimitNotice(null);
    if (joinedCirclesCount >= maxAllowedCircles) {
      setLimitNotice(
        circleLeaderActive
          ? "You have reached the 3-circle active Circle Leader limit."
          : "Free plan allows joining 1 circle. Upgrade to Circle Leader (0.5 π/month) to run up to 3 circles."
      );
      return;
    }
    onJoinCircle(circleId);
  };

  const handleExportLedgerCsv = () => {
    if (!activeCircle || !circleLeaderActive) return;
    const rows = [
      ["Order", "Pioneer", "TrustScore", "ContributedThisCycle", "LateFlag"].join(","),
      ...activeCircle.members.map((m) =>
        [
          m.payoutPosition,
          m.handle,
          m.trustScore,
          m.contributedThisCycle ? "Paid" : "Pending",
          m.lateFlag ? "Late" : "OnTime",
        ].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeCircle.name.toLowerCase().replace(/\s+/g, "-")}-ledger.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCError(null);
    const members = Number(cMembers);
    const amount = Number(cAmount);
    if (!cName.trim()) {
      setCError("Enter a circle name.");
      return;
    }
    if (Number.isNaN(members) || members < 5 || members > 20) {
      setCError("Circle size must be between 5 and 20 members.");
      return;
    }
    if (Number.isNaN(amount) || amount < 0.5 || amount > 5) {
      setCError("Contribution must be between 0.5 π and 5.0 π per cycle.");
      return;
    }
    onCreateCircle({
      name: cName.trim(),
      maxMembers: members,
      contributionPi: amount,
      cycle: cCycle,
      payoutMode: cMode,
      hasFoodPool: cFoodPool,
    });
    setCreateOpen(false);
    setCName("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold text-[#7C3AED]">
            Community Savings Circles · Real On-Chain Contributions Only
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Save together when food prices rise. Zero interest, full visibility.
          </h1>
          <p className="text-sm text-slate-600">
            Free plan: Join 1 circle or create 1 circle. Circle Leader (0.5 π/month) unlocks 3 circles, auto-reminders, and ledger export. Real contributions only; zero lending or yield promises.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="min-h-[48px] px-5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Savings Circle</span>
        </button>
      </section>

      {/* Circle Leader Premium Banner (0.5 π / month) */}
      <section className="rounded-2xl bg-[#0D0D14] border border-white/10 p-5 sm:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#FFC800] flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>
              {circleLeaderActive
                ? "Circle Leader Premium Active · Up to 3 Circles + Auto-Reminders + Export Ledger"
                : "Circle Leader - 0.5 π/month - Run 3 circles, Auto-reminders, Export Ledger"}
            </span>
          </p>
          <p className="text-xs text-slate-300">
            Active circles: <strong className="text-white tabular-nums">{joinedCirclesCount}/{maxAllowedCircles}</strong> · Cancel anytime, no refund promise beyond current month. Zero interest, zero lending.
          </p>
        </div>
        {!circleLeaderActive ? (
          <button
            type="button"
            onClick={onUpgradeCircleLeader}
            className="min-h-[44px] px-5 rounded-xl bg-[#FFC800] text-[#050507] text-xs font-bold hover:bg-[#eab800] whitespace-nowrap shrink-0"
          >
            Circle Leader - 0.5 π/month
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancelCircleLeader}
            className="min-h-[40px] px-4 rounded-xl border border-white/20 text-xs font-semibold text-slate-300 hover:bg-white/10 whitespace-nowrap shrink-0"
          >
            Cancel Auto-Renew
          </button>
        )}
      </section>

      {limitNotice && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-900">
          <span className="font-semibold">{limitNotice}</span>
          {!circleLeaderActive && (
            <button
              type="button"
              onClick={onUpgradeCircleLeader}
              className="min-h-[38px] px-4 rounded-lg bg-[#FFC800] text-[#050507] font-bold whitespace-nowrap"
            >
              Upgrade 0.5 π/month
            </button>
          )}
        </div>
      )}

      {/* Empty State or Active Circles */}
      {circles.length === 0 ? (
        <section className="rounded-2xl bg-white border border-slate-200 p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mx-auto">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            No circles yet. Create your first circle.
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Create a transparent 5–20 member rotating savings circle (0.5 – 5.0 π weekly or monthly) with optional member-voted Emergency Food Pool.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="min-h-[48px] px-6 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Circle</span>
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-3">
            {circles.map((circle) => {
              const selected = circle.id === activeCircle?.id;
              return (
                <button
                  key={circle.id}
                  type="button"
                  onClick={() => setSelectedId(circle.id)}
                  className={`w-full text-left rounded-2xl p-5 border transition-colors ${
                    selected
                      ? "bg-white border-[#7C3AED] ring-2 ring-[#7C3AED]/20"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {circle.cycle} · {circle.payoutMode}
                    </span>
                    <span className="font-mono-tabular font-bold text-[#7C3AED]">
                      {circle.contributionPi.toFixed(1)} π / cycle
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-display font-bold text-base text-slate-900">
                    {circle.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 tabular-nums">
                    {circle.members.length}/{circle.maxMembers} members · {circle.nextPayoutDate}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className={circle.joined ? "text-[#16A34A] font-semibold" : "text-slate-500"}>
                      {circle.joined ? "Member Active" : "Open to Join"}
                    </span>
                    {circle.hasFoodPool && (
                      <span className="text-slate-600 tabular-nums">
                        Food Pool: {circle.emergencyFoodPoolPi.toFixed(1)} π
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {activeCircle && (
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-medium text-[#7C3AED]">
                      Cycle {activeCircle.currentCycle} · {activeCircle.cycle} · Payout by{" "}
                      {activeCircle.payoutMode}
                    </p>
                    <h2 className="font-display text-2xl font-bold text-slate-900">
                      {activeCircle.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      Next recipient: <strong className="text-slate-900">{activeCircle.nextRecipient}</strong> · {activeCircle.nextPayoutDate}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleReminder(activeCircle.id)}
                      className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 ${
                        activeCircle.reminderEnabled
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      {activeCircle.reminderEnabled ? (
                        <Bell className="w-4 h-4 text-[#FFC800]" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                      <span>
                        {activeCircle.reminderEnabled
                          ? circleLeaderActive
                            ? "Auto-Reminders On"
                            : "Due Reminder On"
                          : "Enable Reminder"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!circleLeaderActive) {
                          setLimitNotice("Export Ledger requires Circle Leader (0.5 π/month).");
                          return;
                        }
                        handleExportLedgerCsv();
                      }}
                      className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-1.5"
                    >
                      {!circleLeaderActive && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Ledger</span>
                    </button>

                    {!activeCircle.joined ? (
                      <button
                        type="button"
                        onClick={() => handleJoinClick(activeCircle.id)}
                        className="min-h-[44px] px-5 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9]"
                      >
                        Join Circle ({activeCircle.contributionPi.toFixed(1)} π)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onContributeCycle(activeCircle.id)}
                        className="min-h-[44px] px-5 rounded-xl bg-[#FFC800] text-[#050507] text-xs font-semibold hover:bg-[#eab800] inline-flex items-center gap-1.5"
                      >
                        <Landmark className="w-4 h-4" />
                        <span>Contribute {activeCircle.contributionPi.toFixed(1)} π</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Smart Contract Member Ledger */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      On-Chain Member Ledger & Payout Order
                    </span>
                    <span>Only real contributions & real defaults affect Trust Score</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2 pr-3 font-medium">Order</th>
                          <th className="py-2 pr-3 font-medium">Pioneer</th>
                          <th className="py-2 pr-3 font-medium text-right">Trust</th>
                          <th className="py-2 text-right font-medium">Cycle Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeCircle.members
                          .slice()
                          .sort((a, b) => a.payoutPosition - b.payoutPosition)
                          .map((m) => (
                            <tr key={m.handle} className="h-11">
                              <td className="py-2 pr-3 font-mono-tabular text-slate-600">
                                #{m.payoutPosition}
                              </td>
                              <td className="py-2 pr-3 font-semibold text-slate-900">
                                {m.handle}
                              </td>
                              <td className="py-2 pr-3 font-mono-tabular text-right text-slate-700">
                                {m.trustScore}/100
                              </td>
                              <td className="py-2 text-right">
                                {m.contributedThisCycle ? (
                                  <span className="inline-flex items-center gap-1 text-[#16A34A] font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                                  </span>
                                ) : m.lateFlag ? (
                                  <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Late (-5 Trust)
                                  </span>
                                ) : (
                                  <div className="inline-flex items-center gap-2">
                                    <span className="text-slate-500">Pending contribution</span>
                                    <button
                                      type="button"
                                      onClick={() => onMarkLateDefault(activeCircle.id, m.handle)}
                                      className="text-[11px] text-red-600 hover:underline font-medium"
                                    >
                                      Flag Missed
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Emergency Food Pool + Circle Chat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeCircle.hasFoodPool && (
                  <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-[#16A34A]" />
                        <span>Emergency Food Pool</span>
                      </h3>
                      <span className="font-mono-tabular font-bold text-sm text-[#16A34A]">
                        {activeCircle.emergencyFoodPoolPi.toFixed(2)} π
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Member-voted food support pool funded strictly by real contributions.
                    </p>

                    {activeCircle.foodRequests.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">
                        No food support requests yet.
                      </p>
                    ) : (
                      activeCircle.foodRequests.map((req) => (
                        <div key={req.id} className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>{req.requester}</span>
                            <span className="font-mono-tabular">{req.amountPi.toFixed(1)} π</span>
                          </div>
                          <p className="text-slate-700">{req.reason}</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-slate-500 tabular-nums">
                              Votes: {req.votesFor}/{req.votesNeeded}
                            </span>
                            {req.approved ? (
                              <span className="text-[#16A34A] font-semibold inline-flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Approved
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={req.userVoted}
                                onClick={() => onVoteFoodPool(activeCircle.id, req.id)}
                                className="min-h-[36px] px-3 rounded-lg bg-slate-900 text-white font-semibold disabled:opacity-40"
                              >
                                {req.userVoted ? "Voted" : "Vote Approve"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const amt = Number(foodAmount);
                        if (!foodReason.trim() || Number.isNaN(amt) || amt <= 0) return;
                        onCreateFoodRequest(activeCircle.id, foodReason.trim(), amt);
                        setFoodReason("");
                      }}
                      className="space-y-2 pt-2 border-t border-slate-100"
                    >
                      <input
                        type="text"
                        value={foodReason}
                        onChange={(e) => setFoodReason(e.target.value)}
                        placeholder="Request food support (state exact staple need)"
                        className="w-full min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.2"
                          max="3"
                          value={foodAmount}
                          onChange={(e) => setFoodAmount(e.target.value)}
                          className="w-24 min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs font-mono-tabular"
                        />
                        <button
                          type="submit"
                          className="flex-1 min-h-[40px] rounded-xl bg-[#16A34A] text-white text-xs font-semibold"
                        >
                          Submit for Member Vote
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Circle Chat */}
                <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between gap-3">
                  <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                    <span>Circle Chat</span>
                  </h3>
                  <div className="flex-1 min-h-[160px] max-h-56 overflow-y-auto rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                    {activeCircle.messages.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">
                        No circle messages yet.
                      </p>
                    ) : (
                      activeCircle.messages.map((m) => (
                        <div key={m.id} className="rounded-lg bg-white border border-slate-200 p-2.5 text-xs">
                          <div className="flex justify-between text-slate-500 mb-0.5">
                            <span className="font-semibold text-slate-900">{m.sender}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          <p className="text-slate-700">{m.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!chatInput.trim()) return;
                      onSendCircleMessage(activeCircle.id, chatInput.trim());
                      setChatInput("");
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={username ? `Message as @${username}...` : "Message circle..."}
                      className="flex-1 min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs"
                    />
                    <button
                      type="submit"
                      className="min-h-[40px] px-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Circle Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">Create Rotating Savings Circle</h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Circle Name
                </label>
                <input
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="Enter savings circle name"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Members (5 – 20)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="20"
                    value={cMembers}
                    onChange={(e) => setCMembers(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contribution (0.5 – 5 π)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="5"
                    value={cAmount}
                    onChange={(e) => setCAmount(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cycle
                  </label>
                  <select
                    value={cCycle}
                    onChange={(e) => setCCycle(e.target.value as "Weekly" | "Monthly")}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payout Order
                  </label>
                  <select
                    value={cMode}
                    onChange={(e) => setCMode(e.target.value as "Rotation" | "Vote")}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Rotation">Rotation</option>
                    <option value="Vote">Vote</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cFoodPool}
                  onChange={(e) => setCFoodPool(e.target.checked)}
                  className="accent-[#16A34A]"
                />
                <span>Include optional Emergency Food Pool (member-voted)</span>
              </label>

              {cError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {cError}
                </div>
              )}

              <button
                type="submit"
                className="min-h-[48px] w-full rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9]"
              >
                Create Circle (0% Interest)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
