import React, { useState } from "react";
import { ShieldCheck, Wallet, X } from "lucide-react";
import { authenticateWithPiSdk, isPiBrowserAvailable } from "../lib/piSdk";

interface PiAuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: (result: {
    username: string;
    kycVerified: boolean;
    inPiBrowser: boolean;
  }) => void;
}

export const PiAuthModal: React.FC<PiAuthModalProps> = ({
  open,
  onClose,
  onAuthenticated,
}) => {
  const [handleInput, setHandleInput] = useState("");
  const [kycConfirmed, setKycConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const hasPiBrowser = isPiBrowserAvailable();

  const handleSdkLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const sdkRes = await authenticateWithPiSdk();
      if (sdkRes) {
        onAuthenticated({
          username: sdkRes.username,
          kycVerified: sdkRes.kycVerified,
          inPiBrowser: true,
        });
        onClose();
        return;
      }
      setError("Pi Browser SDK did not return a session. Enter your real Pi @username below.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = handleInput.trim().replace(/^@/, "");
    if (!cleaned || cleaned.length < 3 || /\s/.test(cleaned)) {
      setError("Enter a valid Pi Network @username (at least 3 characters, no spaces).");
      return;
    }
    onAuthenticated({
      username: cleaned,
      kycVerified: kycConfirmed,
      inPiBrowser: hasPiBrowser,
    });
    setHandleInput("");
    setKycConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/eyeneka_logo_cutout_0b9ce129.png"
              alt="EYENEKA Logo"
              className="w-8 h-8 rounded-full bg-white object-contain p-0.5 shrink-0"
            />
            <div>
              <h3 className="font-display font-bold text-sm">Connect Real Pi Wallet</h3>
              <p className="text-[11px] text-[#FFC800]">Pi SDK v2.0 · No Email Required</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
            aria-label="Close Pi login modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {hasPiBrowser && (
            <button
              type="button"
              disabled={loading}
              onClick={handleSdkLogin}
              className="min-h-[48px] w-full rounded-xl bg-[#FFC800] text-[#050507] text-sm font-bold hover:bg-[#eab800] disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{loading ? "Authenticating with Pi Browser..." : "Authenticate with Pi Browser"}</span>
            </button>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Real Pi Network @username
              </label>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="@your_pi_username"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
              <p className="text-[11px] text-slate-500">
                Your real Pi handle is used across certificates, gig escrow, and savings circles.
              </p>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={kycConfirmed}
                onChange={(e) => setKycConfirmed(e.target.checked)}
                className="mt-0.5 accent-[#16A34A]"
              />
              <span>
                <strong className="text-slate-900">My Pi Network KYC is verified</strong> — required to display Verified Pioneer status and post gigs over 1.0 π.
              </span>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="min-h-[48px] w-full rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 inline-flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#FFC800]" />
              <span>Continue with Pi @username</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
