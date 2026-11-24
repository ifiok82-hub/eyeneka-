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
  status?: {
    developer_approved?: boolean;
    developer_completed?: boolean;
    cancelled?: boolean;
  };
}

interface WindowPi {
  init: (config: { version: string; sandbox: boolean }) => void;
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
let sessionAuthenticated = false;

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
      });
      piSdkInitialized = true;
    }
    return true;
  } catch (err) {
    console.log("[EYENEKA Pi] Pi.init failed:", err);
    return false;
  }
}

async function postJsonWithDetails(
  url: string,
  payload: Record<string, unknown>
): Promise<{ status: number; ok: boolean; data: Record<string, unknown> }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, ok: response.ok, data };
}

export async function handleIncompletePayment(payment: IncompletePiPayment): Promise<void> {
  console.log("[EYENEKA Pi] Incomplete payment found:", payment);
  if (!payment?.identifier) return;
  const paymentId = payment.identifier;
  const txid = payment.transaction?.txid;

  try {
    if (txid && !payment.status?.developer_completed) {
      const completeRes = await postJsonWithDetails("/api/pi/complete", {
        paymentId,
        txid,
        amount: payment.amount,
        memo: payment.memo,
        metadata: payment.metadata ?? {},
      });
      console.log("[EYENEKA Pi] Incomplete /api/pi/complete response:", completeRes);
      return;
    }
    if (!payment.status?.developer_approved) {
      const approveRes = await postJsonWithDetails("/api/pi/approve", { paymentId });
      console.log("[EYENEKA Pi] Incomplete /api/pi/approve response:", approveRes);
      return;
    }
    if (payment.status?.developer_approved && !txid && !payment.status?.cancelled) {
      const cancelRes = await postJsonWithDetails("/api/pi/cancel", { paymentId });
      console.log("[EYENEKA Pi] Incomplete /api/pi/cancel response:", cancelRes);
    }
  } catch (err) {
    console.log("[EYENEKA Pi] Incomplete payment handler error:", err);
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
      sessionAuthenticated = true;
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
  } catch (err) {
    console.log("[EYENEKA Pi] Pi.authenticate error:", err);
    return {
      success: false,
      result: null,
      error:
        err instanceof Error && err.message
          ? `Error: ${err.message}`
          : PI_SIGNIN_ERROR_MESSAGE,
    };
  }
}

async function ensurePiPaymentSession(
  onStatusChange?: (statusText: string) => void
): Promise<void> {
  if (!window.Pi) {
    throw new Error(PI_BROWSER_REQUIRED_MESSAGE);
  }
  if (sessionAuthenticated) {
    return;
  }
  onStatusChange?.("Authenticating Pi Browser session...");
  const auth = await window.Pi.authenticate(PI_AUTH_SCOPES, (incomplete) => {
    void handleIncompletePayment(incomplete);
  });
  if (!auth?.user?.username) {
    throw new Error("Pi authentication did not return a Pioneer session.");
  }
  sessionAuthenticated = true;
}

export async function executePiPayment(
  payload: PiPaymentPayload,
  onStatusChange?: (statusText: string) => void
): Promise<PiPaymentReceipt> {
  const sdkReady = initPiSdk();
  if (!sdkReady || typeof window === "undefined" || !window.Pi) {
    throw new Error(PI_BROWSER_REQUIRED_MESSAGE);
  }

  try {
    await ensurePiPaymentSession(onStatusChange);
  } catch (authErr: unknown) {
    const msg = authErr instanceof Error ? authErr.message : String(authErr);
    console.log("[EYENEKA Pi] Session auth before createPayment failed:", authErr);
    throw new Error(`Error: ${msg}`);
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
      onStatusChange?.("Opening Pi Wallet...");
      window.Pi!.createPayment(
        {
          amount: payload.amount,
          memo: payload.memo,
          metadata: payload.metadata,
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            console.log("[EYENEKA Pi] onReadyForServerApproval paymentId:", paymentId);
            onStatusChange?.("Waiting for approval...");
            try {
              const res = await postJsonWithDetails("/api/pi/approve", { paymentId });
              console.log("[EYENEKA Pi] /api/pi/approve response:", res);
              if (!res.ok || res.data.ok === false) {
                const serverMsg =
                  (typeof res.data.error === "string" && res.data.error) ||
                  "Approval rejected by Pi Platform API";
                failOnce(new Error(`Server approve failed: ${res.status} ${serverMsg}`));
              }
            } catch (err: unknown) {
              console.log("[EYENEKA Pi] /api/pi/approve network error:", err);
              const msg = err instanceof Error ? err.message : String(err);
              failOnce(new Error(`Server approve failed: 500 ${msg}`));
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("[EYENEKA Pi] onReadyForServerCompletion:", { paymentId, txid });
            onStatusChange?.("Confirming on Pi Testnet...");
            try {
              const res = await postJsonWithDetails("/api/pi/complete", {
                paymentId,
                txid,
                amount: payload.amount,
                memo: payload.memo,
                metadata: payload.metadata,
              });
              console.log("[EYENEKA Pi] /api/pi/complete response:", res);
              if (!res.ok || res.data.status !== "PAID") {
                const serverMsg =
                  (typeof res.data.error === "string" && res.data.error) ||
                  "Completion failed";
                failOnce(new Error(`Server complete failed: ${res.status} ${serverMsg}`));
                return;
              }
              onStatusChange?.("Payment Complete");
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
              console.log("[EYENEKA Pi] /api/pi/complete network error:", err);
              const msg = err instanceof Error ? err.message : String(err);
              failOnce(new Error(`Error: ${msg}`));
            }
          },
          onCancel: (paymentId) => {
            console.log("[EYENEKA Pi] onCancel paymentId:", paymentId);
            failOnce(new Error("Payment cancelled. No Pi taken."));
          },
          onError: (error, payment) => {
            console.log("[EYENEKA Pi] onError:", { error, payment });
            const rawMsg =
              error instanceof Error
                ? error.message
                : typeof error === "string"
                ? error
                : JSON.stringify(error ?? "Unknown Pi SDK error");
            failOnce(new Error(`Error: ${rawMsg}`));
          },
        }
      );
    } catch (err: unknown) {
      console.log("[EYENEKA Pi] createPayment threw synchronously:", err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      failOnce(new Error(`Error: ${rawMsg}`));
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
