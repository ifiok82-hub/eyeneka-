import React, { useEffect, useState } from "react";
import { AlertCircle, RotateCcw, ShieldCheck, Wallet, X } from "lucide-react";
import {
  PI_SIGNIN_ERROR_MESSAGE,
  authenticateWithPiSdk,
  retryConnectPi,
} from "../lib/piSdk";

interface PiAuthModalProps {
  open: boolean;
  initialError?: string | null;
  onClose: () => void;
  onAuthenticated: (result: {
    username: string;
    kycVerified: boolean;
    inPiBrowser: boolean;
  }) => void;
}

export const PiAuthModal: React.FC<PiAuthModalProps> = ({
  open,
  initialError = null,
  onClose,
  onAuthenticated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    if (open) {
      setError(initialError);
    }
  }, [open, initialError]);

  if (!open) return null;

  const displayError = error ?? initialError;

  const handleSdkLogin = async (useFreshRetry = false) => {
    setLoading(true);
    setError(null);
    try {
      const attempt = useFreshRetry
        ? await retryConnectPi()
        : await authenticateWithPiSdk();
      if (attempt.success && attempt.result) {
        onAuthenticated({
          username: attempt.result.username,
          kycVerified: attempt.result.kycVerified,
          inPiBrowser: true,
        });
        onClose();
        return;
      }
      setError(attempt.error ?? PI_SIGNIN_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
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
              <h3 className="font-display font-bold text-sm">Sign In with Pi Network</h3>
              <p className="text-[11px] text-[#FFC800]">
                Pi SDK v2.0 · Verified Pioneer Sign-In
              </p>
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
          {displayError && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-2.5 text-xs text-red-800"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold break-words">{displayError}</p>
                <p className="text-red-700">
                  Open EYENEKA inside Pi Browser and approve Pi Sign-In to connect your real @username.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Real Pi Pioneer Sign-In Only</span>
            </div>
            <p>
              EYENEKA uses official Pi SDK v2.0 authentication inside Pi Browser and stays inside the app after login. No mock accounts or manual usernames are permitted.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSdkLogin(Boolean(displayError))}
            className="min-h-[48px] w-full rounded-xl bg-[#FFC800] text-[#050507] text-sm font-bold hover:bg-[#eab800] disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Wallet className="w-4 h-4" />
                <span>Connecting...</span>
              </>
            ) : displayError ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Retry Connect Pi</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Sign In with Pi Browser</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
