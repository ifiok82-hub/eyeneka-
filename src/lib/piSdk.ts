export const PI_OAUTH_CLIENT_ID = "xWHNaUUWdRg4mpkSUSlfh0NGvLF1iOrcEDivLTC";
export const PI_APP_REDIRECT_URL = "https://eyeneka.vercel.app/";
export const PI_AUTH_SCOPES: ["username", "payments"] = ["username", "payments"];
export const PI_SIGNIN_ERROR_MESSAGE = "Pi Sign-In failed. Try again in Pi Browser.";
export const PI_SDK_NOT_FOUND_MESSAGE =
  "Open Eyeneka in Pi Browser to connect Pi. Pi SDK not found.";
export const PI_BROWSER_REQUIRED_MESSAGE = PI_SDK_NOT_FOUND_MESSAGE;
export const PI_CANCELLED_MESSAGE = "Payment cancelled. No Pi was taken.";

export class PiPaymentCancelledError extends Error {
  constructor(message = PI_CANCELLED_MESSAGE) {
    super(message);
    this.name = "PiPaymentCancelledError";
  }
}

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
  grantIssued: boolean;
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
  init: (config: { version: string; sandbox?: boolean }) => Promise<void> | void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound?: (payment: IncompletePiPayment) => void
  ) => Promise<{
    accessToken?: string;
    user?: { uid?: string; username?: string; kyc?: boolean };
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

const PI_WALLET_TIMEOUT_MS = 60000;

let piSdkInitialized = false;
let initInFlight: Promise<boolean> | null = null;
let lastInitError: string | null = null;

let inMemorySessionToken: string | null = null;
let inMemoryUser: { uid: string; username: string } | null = null;
let paymentScopeAuthenticated = false;

let connectAuthInFlight: Promise<PiAuthAttempt> | null = null;
let paymentScopeInFlight: Promise<void> | null = null;

const approvedOrInFlightPaymentIds = new Set<string>();
const completedOrInFlightPaymentIds = new Set<string>();

export function getSessionToken(): string | null {
  return inMemorySessionToken;
}

export function getVerifiedSessionUser(): { uid: string; username: string } | null {
  return inMemoryUser;
}

export function isPiConnectedSession(): boolean {
  return Boolean(inMemorySessionToken && inMemoryUser?.username);
}

export function getLastInitError(): string | null {
  return lastInitError;
}

export async function logoutPiSession(): Promise<void> {
  const token = inMemorySessionToken;
  inMemorySessionToken = null;
  inMemoryUser = null;
  paymentScopeAuthenticated = false;
  if (!token) return;
  try {
    await fetch("/api/pi/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Best-effort server revocation
  }
}

export function isPiBrowserAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.Pi !== "undefined";
}

export function isRealPiBrowserEnvironment(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent || "";
  const ref = typeof document !== "undefined" ? document.referrer || "" : "";
  const isPiContext =
    /PiBrowser|MinePi|PiNetwork|AppStudio/i.test(ua) ||
    /(piappengine\.com|minepi\.com|pinet\.com|pi\.app)/i.test(ref);
  return isPiContext && typeof window.Pi !== "undefined";
}

export async function initPiSdk(): Promise<boolean> {
  if (typeof window === "undefined" || !window.Pi) {
    lastInitError = PI_SDK_NOT_FOUND_MESSAGE;
    console.log("[EYENEKA Pi] Pi.init skipped: window.Pi not found");
    return false;
  }
  if (piSdkInitialized) {
    return true;
  }
  if (initInFlight) {
    return await initInFlight;
  }
  initInFlight = (async () => {
    try {
      await window.Pi!.init({ version: "2.0" });
      piSdkInitialized = true;
      lastInitError = null;
      console.log("[EYENEKA Pi] Pi.init result: success (version 2.0)");
      return true;
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : String(err);
      lastInitError = msg;
      console.error("[EYENEKA Pi] Pi.init result: error", msg);
      return false;
    } finally {
      initInFlight = null;
    }
  })();
  return await initInFlight;
}

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, ms);
    promise.then(
      (val) => {
        window.clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function postJsonWithDetails(
  url: string,
  payload: Record<string, unknown>,
  bearerToken?: string | null
): Promise<{ status: number; ok: boolean; data: Record<string, unknown> }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, ok: response.ok, data };
}

function extractDetailsText(rawDetails: unknown): string {
  if (!rawDetails) return "";
  if (typeof rawDetails === "string") return rawDetails.trim();
  if (typeof rawDetails === "object") {
    const obj = rawDetails as Record<string, unknown>;
    if (typeof obj.error_message === "string" && obj.error_message.trim()) {
      return obj.error_message.trim();
    }
    if (typeof obj.message === "string" && obj.message.trim()) {
      return obj.message.trim();
    }
    if (typeof obj.error === "string" && obj.error.trim()) {
      return obj.error.trim();
    }
    try {
      const serialized = JSON.stringify(obj);
      return serialized === "{}" ? "" : serialized;
    } catch {
      return "";
    }
  }
  return String(rawDetails);
}

function formatServerFailure(
  prefix: string,
  res: { status: number; data: Record<string, unknown> },
  fallback: string
): string {
  const piStatus =
    typeof res.data.piStatus === "number" ? res.data.piStatus : res.status;
  const detailsText = extractDetailsText(res.data.details);
  const errMsg =
    (typeof res.data.error === "string" && res.data.error.trim()) || fallback;
  if (detailsText) {
    return `${prefix}: ${piStatus} - ${detailsText}`;
  }
  return `${prefix}: ${piStatus} - ${errMsg}`;
}

async function exchangeAccessTokenForSession(accessToken: string): Promise<{
  sessionToken: string;
  user: { uid: string; username: string };
}> {
  const res = await withTimeout(
    postJsonWithDetails("/api/pi/login", { accessToken }),
    15000,
    "Server /api/pi/login verification timed out after 15s."
  );
  const userObj = res.data.user as { uid?: unknown; username?: unknown } | undefined;
  const sessionToken = typeof res.data.sessionToken === "string" ? res.data.sessionToken : "";
  const uid = typeof userObj?.uid === "string" ? userObj.uid : "";
  const username =
    typeof userObj?.username === "string" ? userObj.username.replace(/^@/, "") : "";

  if (!res.ok || !sessionToken || !uid || !username) {
    const serverErr =
      (typeof res.data.error === "string" && res.data.error) || PI_SIGNIN_ERROR_MESSAGE;
    throw new Error(serverErr);
  }

  inMemorySessionToken = sessionToken;
  inMemoryUser = { uid, username };
  return { sessionToken, user: { uid, username } };
}

export async function handleIncompletePayment(payment: IncompletePiPayment): Promise<void> {
  if (!payment?.identifier) return;
  const paymentId = payment.identifier;
  const idPrefix = paymentId.slice(0, 8);
  const txid = payment.transaction?.txid;
  console.log("[EYENEKA Pi] onIncompletePaymentFound:", {
    paymentIdPrefix: idPrefix,
    hasTxid: Boolean(txid),
    status: payment.status,
  });

  try {
    if (txid && !payment.status?.developer_completed) {
      if (completedOrInFlightPaymentIds.has(paymentId)) {
        return;
      }
      completedOrInFlightPaymentIds.add(paymentId);
      try {
        const completeRes = await postJsonWithDetails("/api/pi/complete", {
          paymentId,
          txid,
        });
        console.log("[EYENEKA Pi] Incomplete /api/pi/complete response:", {
          paymentIdPrefix: idPrefix,
          status: completeRes.status,
          ok: completeRes.ok,
        });
        if (!completeRes.ok || completeRes.data.ok === false) {
          completedOrInFlightPaymentIds.delete(paymentId);
        }
      } catch (err) {
        completedOrInFlightPaymentIds.delete(paymentId);
        throw err;
      }
      return;
    }

    if (!payment.status?.developer_completed && !payment.status?.cancelled) {
      const cancelRes = await postJsonWithDetails("/api/pi/cancel", { paymentId });
      console.log("[EYENEKA Pi] Incomplete /api/pi/cancel response:", {
        paymentIdPrefix: idPrefix,
        status: cancelRes.status,
        ok: cancelRes.ok,
      });
    }
  } catch (err) {
    console.log("[EYENEKA Pi] Incomplete payment handler error:", err);
  }
}

export async function resumeIncompletePayments(): Promise<number> {
  let resumed = 0;
  if (!isPiBrowserAvailable()) {
    return 0;
  }
  const sdkReady = await initPiSdk();

  if (
    sdkReady &&
    isRealPiBrowserEnvironment() &&
    window.Pi &&
    typeof window.Pi.getIncompletePayments === "function"
  ) {
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
  if (typeof window === "undefined" || !window.Pi) {
    return {
      success: false,
      result: null,
      error: PI_SDK_NOT_FOUND_MESSAGE,
    };
  }

  if (inMemorySessionToken && inMemoryUser) {
    return {
      success: true,
      result: {
        connected: true,
        username: inMemoryUser.username,
        uid: inMemoryUser.uid,
        kycVerified: true,
        inPiBrowser: true,
      },
    };
  }

  if (connectAuthInFlight) {
    console.log("[EYENEKA Pi] Reusing in-flight authenticateWithPiSdk promise");
    return await connectAuthInFlight;
  }

  connectAuthInFlight = (async (): Promise<PiAuthAttempt> => {
    const sdkReady = await initPiSdk();
    if (!sdkReady || !window.Pi) {
      return {
        success: false,
        result: null,
        error: lastInitError || PI_SDK_NOT_FOUND_MESSAGE,
      };
    }

    try {
      console.log("[EYENEKA Pi] Calling Pi.authenticate(['username'])...");
      const auth = await withTimeout(
        window.Pi.authenticate(["username"], (incomplete) => {
          void handleIncompletePayment(incomplete);
        }),
        PI_WALLET_TIMEOUT_MS,
        "Pi login timed out. Tap Connect Pi first, allow Username permission, then try again. Error: Pi.authenticate timed out after 60s"
      );

      const accessToken = typeof auth?.accessToken === "string" ? auth.accessToken.trim() : "";
      if (!accessToken) {
        return {
          success: false,
          result: null,
          error: PI_SIGNIN_ERROR_MESSAGE,
        };
      }

      // Verify token with Pi /v2/me (or App Studio login) and save session
      const verified = await exchangeAccessTokenForSession(accessToken);
      console.log("[EYENEKA Pi] Authenticated Pioneer:", verified.user.username);
      return {
        success: true,
        result: {
          connected: true,
          username: verified.user.username,
          uid: verified.user.uid,
          kycVerified: true,
          inPiBrowser: true,
        },
      };
    } catch (err) {
      console.log("[EYENEKA Pi] Pi.authenticate / login error:", err);
      const rawErr =
        err instanceof Error && err.message ? err.message : PI_SIGNIN_ERROR_MESSAGE;
      return {
        success: false,
        result: null,
        error: rawErr,
      };
    } finally {
      connectAuthInFlight = null;
    }
  })();

  return await connectAuthInFlight;
}

async function ensurePiPaymentSession(
  onStatusChange?: (statusText: string) => void
): Promise<void> {
  if (typeof window === "undefined" || !window.Pi) {
    throw new Error(PI_SDK_NOT_FOUND_MESSAGE);
  }
  if (paymentScopeAuthenticated) {
    return;
  }

  // Never start a concurrent Pi.authenticate if Connect Pi is currently in flight
  if (connectAuthInFlight) {
    console.log("[EYENEKA Pi] Waiting for active Connect Pi auth before payment scope");
    onStatusChange?.("Connecting to Pi...");
    const res = await connectAuthInFlight;
    if (!res.success) {
      throw new Error(res.error || PI_SIGNIN_ERROR_MESSAGE);
    }
  }

  if (paymentScopeInFlight) {
    console.log("[EYENEKA Pi] Reusing in-flight payment scope authenticate promise");
    return await paymentScopeInFlight;
  }

  paymentScopeInFlight = (async () => {
    onStatusChange?.("Connecting to Pi...");
    try {
      console.log("[EYENEKA Pi] Calling Pi.authenticate(['username', 'payments'])...");
      const auth = await withTimeout(
        window.Pi!.authenticate(PI_AUTH_SCOPES, (incomplete) => {
          void handleIncompletePayment(incomplete);
        }),
        PI_WALLET_TIMEOUT_MS,
        "Pi login timed out. Tap Connect Pi first, allow Username permission, then try again. Error: Pi.authenticate(['username','payments']) timed out after 60s"
      );
      paymentScopeAuthenticated = true;

      const accessToken = typeof auth?.accessToken === "string" ? auth.accessToken.trim() : "";
      if (accessToken && !inMemorySessionToken) {
        void exchangeAccessTokenForSession(accessToken).catch(() => {
          // Non-blocking: /api/pi/approve & /api/pi/complete verify directly with Pi API key
        });
      }
    } catch (err) {
      paymentScopeAuthenticated = false;
      throw err;
    } finally {
      paymentScopeInFlight = null;
    }
  })();

  return await paymentScopeInFlight;
}

export async function executePiPayment(
  payload: PiPaymentPayload,
  onStatusChange?: (statusText: string) => void
): Promise<PiPaymentReceipt> {
  if (typeof window === "undefined" || !window.Pi) {
    throw new Error(PI_SDK_NOT_FOUND_MESSAGE);
  }

  const sdkReady = await initPiSdk();
  if (!sdkReady || !window.Pi) {
    throw new Error(lastInitError || PI_SDK_NOT_FOUND_MESSAGE);
  }

  await ensurePiPaymentSession(onStatusChange);

  return await new Promise<PiPaymentReceipt>((resolve, reject) => {
    let settled = false;
    let walletTimer: number | null = window.setTimeout(() => {
      failOnce(
        new Error(
          "Pi login timed out. Tap Connect Pi first, allow Username permission, then try again. Error: Waiting for Pi Wallet timed out after 60s"
        )
      );
    }, PI_WALLET_TIMEOUT_MS);

    const clearWalletTimer = () => {
      if (walletTimer !== null) {
        window.clearTimeout(walletTimer);
        walletTimer = null;
      }
    };

    const failOnce = (err: Error) => {
      clearWalletTimer();
      if (!settled) {
        settled = true;
        reject(err);
      }
    };

    try {
      const createPaymentStartMs = Date.now();
      console.log("[EYENEKA Pi] createPayment-start", { ts: createPaymentStartMs });
      onStatusChange?.("Waiting for Pi Wallet...");
      window.Pi!.createPayment(
        {
          amount: payload.amount,
          memo: payload.memo,
          metadata: payload.metadata,
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            const approveStartMs = Date.now();
            const idPrefix = String(paymentId || "").slice(0, 8);
            console.log("[EYENEKA Pi] approve-start", {
              ts: approveStartMs,
              sinceCreateMs: approveStartMs - createPaymentStartMs,
              paymentIdPrefix: idPrefix,
            });
            clearWalletTimer();
            if (approvedOrInFlightPaymentIds.has(paymentId)) {
              console.warn("[EYENEKA Pi] Duplicate approve prevented for prefix:", idPrefix);
              return;
            }
            approvedOrInFlightPaymentIds.add(paymentId);
            onStatusChange?.("Waiting for Pi Wallet...");
            try {
              const res = await postJsonWithDetails("/api/pi/approve", {
                paymentId,
                clientApproveStartMs: approveStartMs,
              });
              console.log("[EYENEKA Pi] /api/pi/approve response:", {
                paymentIdPrefix: idPrefix,
                status: res.status,
                ok: res.ok,
                data: res.data,
              });
              if (!res.ok || res.data.ok === false) {
                approvedOrInFlightPaymentIds.delete(paymentId);
                failOnce(
                  new Error(
                    formatServerFailure(
                      "Pi approve failed",
                      res,
                      "Approval rejected by Pi Platform API"
                    )
                  )
                );
              }
            } catch (err: unknown) {
              approvedOrInFlightPaymentIds.delete(paymentId);
              console.log("[EYENEKA Pi] /api/pi/approve network error:", {
                paymentIdPrefix: idPrefix,
                err,
              });
              const msg = err instanceof Error ? err.message : String(err);
              failOnce(new Error(`Pi approve failed: 500 - ${msg}`));
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            const completeStartMs = Date.now();
            const idPrefix = String(paymentId || "").slice(0, 8);
            clearWalletTimer();
            console.log("[EYENEKA Pi] complete-start", {
              ts: completeStartMs,
              paymentIdPrefix: idPrefix,
              hasTxid: Boolean(txid),
            });
            if (completedOrInFlightPaymentIds.has(paymentId)) {
              console.warn("[EYENEKA Pi] Duplicate complete prevented for prefix:", idPrefix);
              return;
            }
            completedOrInFlightPaymentIds.add(paymentId);
            onStatusChange?.("Confirming on Pi Testnet...");
            try {
              const res = await postJsonWithDetails("/api/pi/complete", {
                paymentId,
                txid,
              });
              console.log("[EYENEKA Pi] /api/pi/complete response:", {
                paymentIdPrefix: idPrefix,
                status: res.status,
                ok: res.ok,
                data: res.data,
              });
              if (!res.ok || res.data.ok === false) {
                completedOrInFlightPaymentIds.delete(paymentId);
                failOnce(
                  new Error(
                    formatServerFailure(
                      "Pi complete failed",
                      res,
                      "Completion rejected by Pi Platform API"
                    )
                  )
                );
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
                  grantIssued: res.data.grantIssued !== false,
                });
              }
            } catch (err: unknown) {
              completedOrInFlightPaymentIds.delete(paymentId);
              console.log("[EYENEKA Pi] /api/pi/complete network error:", {
                paymentIdPrefix: idPrefix,
                err,
              });
              const msg = err instanceof Error ? err.message : String(err);
              failOnce(new Error(`Pi complete failed: 500 - ${msg}`));
            }
          },
          onCancel: (paymentId) => {
            console.log("[EYENEKA Pi] onCancel paymentIdPrefix:", String(paymentId || "").slice(0, 8));
            failOnce(new PiPaymentCancelledError());
          },
          onError: (error, payment) => {
            console.log("[EYENEKA Pi] onError:", { error, payment });
            const rawMsg =
              error instanceof Error
                ? error.message
                : typeof error === "string"
                ? error
                : JSON.stringify(error ?? "Unknown Pi SDK error");
            failOnce(new Error(rawMsg));
          },
        }
      );
    } catch (err: unknown) {
      console.log("[EYENEKA Pi] createPayment threw synchronously:", err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      failOnce(new Error(rawMsg));
    }
  });
}

export async function payUserToApp(
  onStatusChange?: (statusText: string) => void
): Promise<PiPaymentReceipt> {
  return await executePiPayment(
    {
      amount: 1,
      memo: "Eyeneka - Test Payment",
      metadata: { type: "test_payment" },
    },
    onStatusChange
  );
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
