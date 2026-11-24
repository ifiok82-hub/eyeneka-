import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, ShieldCheck, X } from "lucide-react";
import { PendingPiPayment } from "../types";
import {
  PI_BROWSER_REQUIRED_MESSAGE,
  executePiPayment,
  isPiBrowserAvailable,
} from "../lib/piSdk";

interface PiPaymentModalProps {
  payment: PendingPiPayment | null;
  onClose: () => void;
}

export const PiPaymentModal: React.FC<PiPaymentModalProps> = ({ payment, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    paymentId: string;
    txHash: string;
    amountPi: number;
    escrowId: string;
    dateIso: string;
    status: "Confirmed";
  } | null>(null);

  useEffect(() => {
    setProcessing(false);
    setStatusMessage(null);
    setError(null);
    setReceipt(null);
  }, [payment]);

  if (!payment) return null;

  const inPiBrowser = isPiBrowserAvailable();

  const handleConfirm = async () => {
    if (!inPiBrowser) {
      setError(PI_BROWSER_REQUIRED_MESSAGE);
      return;
    }

    setProcessing(true);
    setError(null);
    setStatusMessage("Waiting for approval...");

    try {
      const res = await executePiPayment(
        {
          amount: payment.amountPi,
          memo: payment.memo,
          metadata: payment.metadata,
        },
        (msg) => setStatusMessage(msg)
      );
      const escrowId = payment.escrowId || `ESC-${Date.now().toString().slice(-5)}`;
      const dateIso = new Date().toISOString().slice(0, 10);
      setReceipt({
        paymentId: res.paymentId,
        txHash: res.txHash,
        amountPi: res.amount,
        escrowId,
        dateIso,
        status: "Confirmed",
      });
      payment.onComplete({
        paymentId: res.paymentId,
        txHash: res.txHash,
        escrowId,
      });
    } catch (err: unknown) {
      setStatusMessage(null);
      setError(err instanceof Error ? err.message : `Error: ${String(err)}`);
    } finally {
      setProcessing(false);
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
              <h3 className="font-display font-bold text-sm text-white">
                {receipt ? "Payment Complete" : payment.title}
              </h3>
              <p className="text-[11px] text-[#FFC800]">
                Pi SDK v2.0 · Official Pi Wallet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
            aria-label="Close payment modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!receipt ? (
          <div className="p-6 space-y-5">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center space-y-1">
              <p className="text-xs font-medium text-slate-500">{payment.purpose}</p>
              <p className="font-display text-4xl font-extrabold text-[#7C3AED] tabular-nums">
                {payment.amountPi.toFixed(2)} π
              </p>
              <p className="text-xs text-slate-600">{payment.memo}</p>
            </div>

            {payment.breakdown && payment.breakdown.length > 0 && (
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                {payment.breakdown.map((row) => (
                  <div key={row.label} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-600">{row.label}</span>
                    <span className="font-mono-tabular font-semibold text-slate-900">
                      {row.amountPi.toFixed(2)} π
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!inPiBrowser && (
              <div
                role="alert"
                className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 flex items-start gap-2.5 text-xs text-amber-900"
              >
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="font-semibold">{PI_BROWSER_REQUIRED_MESSAGE}</span>
              </div>
            )}

            <div className="flex items-start gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>
                Processed strictly via Pi.createPayment in Pi Testnet with server approval &amp; completion verification. No mock payments, no fiat, no external links.
              </span>
            </div>

            {statusMessage && !error && (
              <div className="rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 p-3 text-xs font-semibold text-[#7C3AED]">
                {statusMessage}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700"
              >
                {error}
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="min-h-[48px] px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={processing}
                className="flex-1 min-h-[48px] rounded-xl bg-[#FFC800] text-[#050507] text-sm font-bold hover:bg-[#eab800] disabled:opacity-50 transition-colors"
              >
                {processing
                  ? statusMessage || "Waiting for approval..."
                  : `Pay with Pi (Testnet) · ${payment.amountPi.toFixed(2)} π`}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2 py-2">
              <div className="w-14 h-14 rounded-full bg-[#22C55E]/15 text-[#16A34A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="font-display text-3xl font-extrabold text-slate-900 tabular-nums">
                {receipt.amountPi.toFixed(2)} π
              </p>
              <p className="text-xs font-semibold text-[#16A34A]">
                Payment Complete · Pi Testnet
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-[#16A34A]">{receipt.status}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Purpose</span>
                <span className="font-semibold text-slate-900 text-right max-w-[220px] truncate">
                  {payment.purpose}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Payment ID</span>
                <span className="font-mono-tabular text-slate-900 text-right break-all max-w-[210px]">
                  {receipt.paymentId}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">TXID</span>
                <span className="font-mono-tabular text-slate-900 text-right break-all max-w-[210px]">
                  {receipt.txHash}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow / Ref ID</span>
                <span className="font-mono-tabular text-slate-900">{receipt.escrowId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-mono-tabular text-slate-900">{receipt.dateIso}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500">Pi Testnet Explorer</span>
                <a
                  href={`https://blockexplorer.minepi.com/testnet/tx/${receipt.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#7C3AED] hover:underline font-mono-tabular"
                >
                  <span>{receipt.txHash.slice(0, 14)}...</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] w-full rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
