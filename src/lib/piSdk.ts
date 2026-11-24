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
  init: (config: { version: string }) => Promise<void> | void;
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

let piSdkInitialized = false;
let initInFlight: Promise<boolean> | null = null;
let inMemorySessionToken: string | null = null;
let inMemoryUser: { uid: string; username: string } | null = null;
let paymentScopeAuthenticated = false;

export function getSessionToken(): string | null {
  return inMemorySessionToken;
}

export function getVerifiedSessionUser(): { uid: string; username: string } | null {
  return inMemoryUser;
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
      return true;
    } catch (err) {
      console.log("[EYENEKA Pi] Pi.init failed:", err);
      return false;
    } finally {
      initInFlight = null;
    }
  })();
  return await initInFlight;
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

async function exchangeAccessTokenForSession(accessToken: string): Promise<{
  sessionToken: string;
  user: { uid: string; username: string };
}> {
  const res = await postJsonWithDetails("/api/pi/login", { accessToken });
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
  console.log("[EYENEKA Pi] Incomplete payment found:", payment);
  if (!payment?.identifier) return;
  const paymentId = payment.identifier;
  const txid = payment.transaction?.txid;
  const token = inMemorySessionToken;

  try {
    if (txid && !payment.status?.developer_completed) {
      const completeRes = await postJsonWithDetails(
        "/api/pi/complete",
        { paymentId, txid },
        token
      );
      console.log("[EYENEKA Pi] Incomplete /api/pi/complete response:", completeRes);
      return;
    }
    if (!payment.status?.developer_approved) {
      const approveRes = await postJsonWithDetails(
        "/api/pi/approve",
        { paymentId },
        token
      );
      console.log("[EYENEKA Pi] Incomplete /api/pi/approve response:", approveRes);
      return;
    }
    if (payment.status?.developer_approved && !txid && !payment.status?.cancelled) {
      const cancelRes = await postJsonWithDetails(
        "/api/pi/cancel",
        { paymentId },
        token
      );
      console.log("[EYENEKA Pi] Incomplete /api/pi/cancel response:", cancelRes);
    }
  } catch (err) {
    console.log("[EYENEKA Pi] Incomplete payment handler error:", err);
  }
}

export async function resumeIncompletePayments(): Promise<number> {
  let resumed = 0;
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
  const sdkReady = await initPiSdk();
  if (!sdkReady || !window.Pi) {
    return {
      success: false,
      result: null,
      error: PI_SIGNIN_ERROR_MESSAGE,
    };
  }

  try {
    const auth = await window.Pi.authenticate(["username"], (incomplete) => {
      void handleIncompletePayment(incomplete);
    });
    const accessToken = typeof auth?.accessToken === "string" ? auth.accessToken.trim() : "";
    if (!accessToken) {
      return {
        success: false,
        result: null,
        error: PI_SIGNIN_ERROR_MESSAGE,
      };
    }

    // Ignore any uid or username from window.Pi.authenticate; verify via backend only
    const verified = await exchangeAccessTokenForSession(accessToken);
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

const PI_WALLET_TIMEOUT_MS = 60000;

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

async function ensurePiPaymentSession(
  onStatusChange?: (statusText: string) => void
): Promise<string | null> {
  if (!window.Pi) {
    throw new Error(PI_BROWSER_REQUIRED_MESSAGE);
  }
  if (paymentScopeAuthenticated) {
    return inMemorySessionToken;
  }
  onStatusChange?.("Waiting for Pi Wallet...");
  const auth = await withTimeout(
    window.Pi.authenticate(PI_AUTH_SCOPES, (incomplete) => {
      void handleIncompletePayment(incomplete);
    }),
    PI_WALLET_TIMEOUT_MS,
    "Pi Wallet authentication timed out after 15s. Please try again in Pi Browser."
  );
  paymentScopeAuthenticated = true;

  // Never block payment on App Studio login; exchange token asynchronously in background if available
  const accessToken = typeof auth?.accessToken === "string" ? auth.accessToken.trim() : "";
  if (accessToken && !inMemorySessionToken) {
    void exchangeAccessTokenForSession(accessToken).catch(() => {
      // Non-blocking: U2A payments proceed via server /api/pi/approve & /api/pi/complete
    });
  }
  return inMemorySessionToken;
}

export async function executePiPayment(
  payload: PiPaymentPayload,
  onStatusChange?: (statusText: string) => void
): Promise<PiPaymentReceipt> {
  const sdkReady = await initPiSdk();
  if (!sdkReady || typeof window === "undefined" || !window.Pi) {
    throw new Error(PI_BROWSER_REQUIRED_MESSAGE);
  }

  let sessionToken: string | null = null;
  try {
    sessionToken = await ensurePiPaymentSession(onStatusChange);
  } catch (authErr: unknown) {
    const msg = authErr instanceof Error ? authErr.message : String(authErr);
    console.log("[EYENEKA Pi] Session auth before createPayment failed:", authErr);
    throw new Error(msg);
  }

  let serverAmount = payload.amount;
  let serverMemo = payload.memo;
  let serverMetadata: Record<string, string | number | boolean> = payload.metadata;

  // Use server-prepared intent when App Studio session is already ready, otherwise proceed directly
  if (sessionToken) {
    try {
      const intentRes = await postJsonWithDetails(
        "/api/pi/intent",
        {
          type: payload.metadata.type,
          itemId: payload.metadata.itemId,
          amount: payload.amount,
          memo: payload.memo,
        },
        sessionToken
      );
      if (
        intentRes.ok &&
        typeof intentRes.data.amount === "number" &&
        typeof intentRes.data.memo === "string" &&
        intentRes.data.metadata &&
        typeof intentRes.data.metadata === "object"
      ) {
        serverAmount = intentRes.data.amount;
        serverMemo = intentRes.data.memo;
        serverMetadata = intentRes.data.metadata as Record<string, string | number | boolean>;
      }
    } catch {
      // Never block Pi payment if intent pre-registration fails
    }
  }

  return await new Promise<PiPaymentReceipt>((resolve, reject) => {
    let settled = false;
    let walletTimer: number | null = window.setTimeout(() => {
      failOnce(new Error("Waiting for Pi Wallet timed out after 15s."));
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
      onStatusChange?.("Waiting for Pi Wallet...");
      window.Pi!.createPayment(
        {
          amount: serverAmount,
          memo: serverMemo,
          metadata: serverMetadata,
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            clearWalletTimer();
            console.log("[EYENEKA Pi] onReadyForServerApproval paymentId:", paymentId);
            onStatusChange?.("Waiting for Pi Wallet...");
            try {
              const res = await postJsonWithDetails(
                "/api/pi/approve",
                { paymentId },
                inMemorySessionToken
              );
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
            clearWalletTimer();
            console.log("[EYENEKA Pi] onReadyForServerCompletion:", { paymentId, txid });
            onStatusChange?.("Confirming on Pi Testnet...");
            try {
              const res = await postJsonWithDetails(
                "/api/pi/complete",
                { paymentId, txid },
                inMemorySessionToken
              );
              console.log("[EYENEKA Pi] /api/pi/complete response:", res);
              if (!res.ok || res.data.ok === false) {
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
                  amount: serverAmount,
                  memo: serverMemo,
                  mode: "testnet-sdk",
                  status: "Confirmed",
                  grantIssued: res.data.grantIssued !== false,
                });
              }
            } catch (err: unknown) {
              console.log("[EYENEKA Pi] /api/pi/complete network error:", err);
              const msg = err instanceof Error ? err.message : String(err);
              failOnce(new Error(msg));
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
