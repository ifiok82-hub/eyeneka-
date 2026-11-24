export const PI_OAUTH_CLIENT_ID = "xWHNaUUWdRg4mpkSUSlfh0NGvLF1iOrcEDivLTC";
export const PI_APP_REDIRECT_URL = "https://eyeneka.vercel.app/";
export const PI_AUTH_SCOPES: ["username", "payments"] = ["username", "payments"];
export const PI_SIGNIN_ERROR_MESSAGE = "Pi Sign-In failed. Try again in Pi Browser.";
export const PI_BROWSER_REQUIRED_MESSAGE = "Open Eyeneka in Pi Browser to pay with Pi.";

export interface PiAuthResult {
  connected: boolean;
  username: string;
  uid: string;
  accessToken?: string;
  kycVerified: boolean;
  inPiBrowser: boolean;
}

export interface PiAuthAttempt {
  success: boolean;
  result: PiAuthResult | null;
  error?: string;
}

export interface PiPaymentPayload {
  amount: number;
  memo: string;
  metadata: Record<string, string | number | boolean>;
}

export interface PiPaymentReceipt {
  paymentId: string;
  txHash: string;
  amount: number;
  memo: string;
  mode: "testnet-sdk";
  status: "Confirmed";
}

interface IncompletePiPayment {
  identifier?: string;
  amount?: number;
  memo?: string;
  metadata?: Record<string, unknown>;
  transaction?: { txid?: string };
  status?: { developer_approved?: boolean; developer_completed?: boolean };
}

interface WindowPi {
  init: (config: { version: string; sandbox?: boolean; clientId?: string }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound?: (payment: IncompletePiPayment) => void
  ) => Promise<{
    accessToken?: string;
    user: { uid: string; username: string; kyc?: boolean };
  }>;
  getIncompletePayments?: () => Promise<IncompletePiPayment[]>;
  createPayment: (
    paymentData: PiPaymentPayload,
    callbacks: {
      onReadyForServerApproval: (paymentId: string) => void | Promise<void>;
      onReadyForServerCompletion: (paymentId: string, txid: string) => void | Promise<void>;
      onCancel: (paymentId: string) => void;
      onError: (error: Error, payment?: unknown) => void;
    }
  ) => void;
  Ads?: {
    showAd: (adType: "interstitial" | "rewarded") => Promise<{ result: string; adId?: string }>;
  };
}

declare global {
  interface Window {
    Pi?: WindowPi;
  }
}

let piSdkInitialized = false;

export function isPiBrowserAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.Pi !== "undefined";
}

export function initPiSdk(): boolean {
  if (typeof window === "undefined" || !window.Pi) {
    return false;
  }
  try {
    if (!piSdkInitialized) {
      window.Pi.init({
        version: "2.0",
        sandbox: true,
        clientId: PI_OAUTH_CLIENT_ID,
      });
      piSdkInitialized = true;
    }
    return true;
  } catch {
    return false;
  }
}

async function postJson(
  url: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || data.ok === false) {
    const errMsg =
      (typeof data.error === "string" && data.error) ||
      `Pi payment server request failed (${response.status}).`;
    throw new Error(errMsg);
  }
  return data;
}

export async function handleIncompletePayment(payment: IncompletePiPayment): Promise<void> {
  if (!payment?.identifier) return;
  const paymentId = payment.identifier;
  const txid = payment.transaction?.txid;

  try {
    if (txid && !payment.status?.developer_completed) {
      await postJson("/api/pi/complete", {
        paymentId,
        txid,
        amount: payment.amount,
        memo: payment.memo,
        metadata: payment.metadata ?? {},
      });
      return;
    }
    if (!payment.status?.developer_approved) {
      await postJson("/api/pi/approve", { paymentId });
    }
  } catch {
    // Keep silent if backend key isn't configured or payment expired
  }
}

export async function resumeIncompletePayments(): Promise<number> {
  let resumed = 0;
  const sdkReady = initPiSdk();

  if (sdkReady && window.Pi && typeof window.Pi.getIncompletePayments === "function") {
    try {
      const pending = await window.Pi.getIncompletePayments();
      if (Array.isArray(pending)) {
        for (const p of pending) {
          await handleIncompletePayment(p);
          resumed += 1;
        }
      }
    } catch {
      // Ignore if Pi Browser session is not yet authenticated
    }
  }

  try {
    const res = await fetch("/api/pi/incomplete", { method: "POST" });
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { resumedCount?: number };
      if (typeof data.resumedCount === "number") {
        resumed += data.resumedCount;
      }
    }
  } catch {
    // Ignore network unavailability
  }

  return resumed;
}

export async function authenticateWithPiSdk(): Promise<PiAuthAttempt> {
  const sdkReady = initPiSdk();
  if (!sdkReady || !window.Pi) {
    return {
      success: false,
      result: null,
      error: PI_SIGNIN_ERROR_MESSAGE,
    };
  }

  try {
    const auth = await window.Pi.authenticate(PI_AUTH_SCOPES, (incomplete) => {
      void handleIncompletePayment(incomplete);
    });
    if (auth?.user?.username) {
      return {
        success: true,
        result: {
          connected: true,
          username: auth.user.username.replace(/^@/, ""),
          uid: auth.user.uid,
          accessToken: auth.accessToken,
          kycVerified: Boolean(auth.user.kyc ?? true),
          inPiBrowser: true,
        },
      };
    }
    return {
      success: false,
      result: null,
      error: PI_SIGNIN_ERROR_MESSAGE,
    };
  } catch {
    return {
      success: false,
      result: null,
      error: PI_SIGNIN_ERROR_MESSAGE,
    };
  }
}

export async function executePiPayment(
  payload: PiPaymentPayload,
  onStatusChange?: (statusText: string) => void
): Promise<PiPaymentReceipt> {
  const sdkReady = initPiSdk();
  if (!sdkReady || typeof window === "undefined" || !window.Pi) {
    throw new Error(PI_BROWSER_REQUIRED_MESSAGE);
  }

  return await new Promise<PiPaymentReceipt>((resolve, reject) => {
    let settled = false;
    const failOnce = (err: Error) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    };

    try {
      window.Pi!.createPayment(
        {
          amount: payload.amount,
          memo: payload.memo,
          metadata: payload.metadata,
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            onStatusChange?.("Waiting for approval...");
            try {
              await postJson("/api/pi/approve", { paymentId });
            } catch (err: unknown) {
              failOnce(
                err instanceof Error ? err : new Error("Pi payment failed. Try again.")
              );
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              const completed = await postJson("/api/pi/complete", {
                paymentId,
                txid,
                amount: payload.amount,
                memo: payload.memo,
                metadata: payload.metadata,
              });
              if (completed.status !== "PAID") {
                throw new Error("Pi payment failed. Try again.");
              }
              onStatusChange?.("Payment Complete in Pi Testnet");
              if (!settled) {
                settled = true;
                resolve({
                  paymentId,
                  txHash: txid,
                  amount: payload.amount,
                  memo: payload.memo,
                  mode: "testnet-sdk",
                  status: "Confirmed",
                });
              }
            } catch (err: unknown) {
              failOnce(
                err instanceof Error ? err : new Error("Pi payment failed. Try again.")
              );
            }
          },
          onCancel: () => {
            failOnce(new Error("Payment cancelled. No Pi was taken."));
          },
          onError: () => {
            failOnce(new Error("Pi payment failed. Try again."));
          },
        }
      );
    } catch {
      failOnce(new Error("Pi payment failed. Try again."));
    }
  });
}

export async function triggerPiAd(
  adType: "interstitial" | "rewarded"
): Promise<{ completed: boolean; mode: string }> {
  if (typeof window !== "undefined" && window.Pi?.Ads) {
    try {
      const res = await window.Pi.Ads.showAd(adType);
      return {
        completed: res.result === "AD_REWARDED" || res.result === "AD_CLOSED",
        mode: "pi-ads-sdk",
      };
    } catch {
      // Ad runtime unavailable outside Pi Browser
    }
  }
  return { completed: false, mode: "unavailable" };
}
