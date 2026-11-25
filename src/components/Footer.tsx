import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import {
  PI_CANCELLED_MESSAGE,
  PI_SDK_NOT_FOUND_MESSAGE,
  PiPaymentCancelledError,
  PiPaymentReceipt,
  isPiBrowserAvailable,
  payUserToApp,
} from "../lib/piSdk";

interface FooterProps {
  piConnected?: boolean;
  onEnsureConnected?: () => Promise<{ connected: boolean; error?: string }>;
  onTestPaymentComplete?: (receipt: PiPaymentReceipt) => void;
}

export const Footer: React.FC<FooterProps> = ({
  piConnected = false,
  onEnsureConnected,
  onTestPaymentComplete,
}) => {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "waiting" | "success" | "cancelled" | "error"
  >("idle");
  const [helperNotice, setHelperNotice] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PiPaymentReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isBusy = status === "connecting" || status === "waiting";

  const handleTestPayment = async () => {
    setErrorMsg(null);
    setHelperNotice(null);
    setReceipt(null);

    if (!isPiBrowserAvailable()) {
      setErrorMsg(PI_SDK_NOT_FOUND_MESSAGE);
      setStatus("error");
      return;
    }

    if (!piConnected) {
      setStatus("connecting");
      setHelperNotice("Tap Connect Pi first");
      try {
        const authRes = onEnsureConnected
          ? await onEnsureConnected()
          : { connected: false, error: "Tap Connect Pi first" };

        if (authRes.connected) {
          setStatus("idle");
          setHelperNotice("Connected! Tap again to pay 1 Pi in Pi Wallet.");
        } else {
          setErrorMsg(authRes.error || "Tap Connect Pi first");
          setStatus("error");
        }
      } catch (err: unknown) {
        const realError =
          err instanceof Error && err.message ? err.message : "Tap Connect Pi first";
        setErrorMsg(realError);
        setStatus("error");
      }
      return;
    }

    setStatus("waiting");
    try {
      const result = await payUserToApp((sdkStatus) => {
        if (sdkStatus.toLowerCase().includes("connecting")) {
          setStatus("connecting");
        } else {
          setStatus("waiting");
        }
      });
      setReceipt(result);
      setStatus("success");
      if (result.grantIssued) {
        onTestPaymentComplete?.(result);
      }
    } catch (err: unknown) {
      if (err instanceof PiPaymentCancelledError) {
        setStatus("cancelled");
        return;
      }
      const realError =
        err instanceof Error && err.message
          ? err.message
          : typeof err === "string"
          ? err
          : "Unknown Pi SDK error";
      setErrorMsg(realError);
      setStatus("error");
    }
  };

  const formatErrorBanner = (msg: string) => {
    if (
      msg === PI_SDK_NOT_FOUND_MESSAGE ||
      msg.startsWith("Pi login timed out.")
    ) {
      return msg;
    }
    if (msg.startsWith("Pi approve failed") || msg.startsWith("Pi complete failed")) {
      return msg;
    }
    return `Pi payment failed: ${msg} - Tap Connect Pi first`;
  };

  return (
    <footer className="border-t border-white/10 bg-[#050507] text-slate-300 py-8 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-4">
        <div className="space-y-1">
          <p className="font-display text-lg font-extrabold tracking-tight text-white">
            EYENEKA
          </p>
          <p className="text-xs font-medium text-[#FFC800]">
            Learn. Work. Earn. Care. Together.
          </p>
        </div>

        <div className="w-full max-w-md flex flex-col items-center gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleTestPayment}
            className={`min-h-[48px] w-full sm:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-colors inline-flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 ${
              status === "success"
                ? "bg-[#16A34A] text-white"
                : status === "error"
                ? "bg-red-600 text-white hover:bg-red-700"
                : status === "cancelled"
                ? "bg-slate-700 text-white hover:bg-slate-600"
                : "bg-[#FFC800] text-[#050507] hover:bg-[#eab800]"
            }`}
          >
            {status === "connecting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Connecting to Pi...</span>
              </>
            ) : status === "waiting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Waiting for Pi Wallet...</span>
              </>
            ) : status === "success" && receipt ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="break-all">
                  Test Payment Complete - {receipt.paymentId} txid: {receipt.txHash}
                </span>
              </>
            ) : status === "cancelled" ? (
              <>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{PI_CANCELLED_MESSAGE}</span>
              </>
            ) : status === "error" && errorMsg ? (
              <>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="break-words">{formatErrorBanner(errorMsg)}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Pi Testnet Payment - 1 Pi - TEST ONLY</span>
              </>
            )}
          </button>

          {helperNotice && (
            <p className="text-xs font-semibold text-[#FFC800]">
              {helperNotice}
            </p>
          )}

          {status === "success" && receipt?.txHash && (
            <a
              href={`https://blockexplorer.minepi.com/testnet/tx/${receipt.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#FFC800] hover:underline"
            >
              <span>Verify TX on Pi Blockexplorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <p className="text-[11px] text-slate-400">
            Pi Testnet • No real Pi • For testing only
          </p>
        </div>

        <div className="w-full pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <p>Decentralized · Smart Contract Escrow · User Owns Data</p>
          <p>Operator: EYENEKA · Global · Borderless · Pi Coin Only</p>
        </div>
      </div>
    </footer>
  );
};
