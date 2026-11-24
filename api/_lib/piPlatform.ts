import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { verifySessionFromHeader, type VerifiedPiUser } from "./piAuth.ts";

const PI_PLATFORM_API_BASE = "https://api.minepi.com/v2";
const PAYMENT_ID_PATTERN = /^[A-Za-z0-9_-]{4,128}$/;
const TXID_PATTERN = /^[A-Za-z0-9_-]{4,256}$/;

export type AllowedU2AProductType =
  | "certificate"
  | "gig_escrow"
  | "boost"
  | "circle"
  | "care"
  | "card"
  | "test";

const ALLOWED_PRODUCT_TYPES = new Set<AllowedU2AProductType>([
  "certificate",
  "gig_escrow",
  "boost",
  "circle",
  "care",
  "card",
  "test",
]);

export interface PiOrderRecord {
  intentId: string;
  paymentId?: string;
  txid?: string;
  direction: "user_to_app";
  userUid?: string;
  username?: string;
  productType: AllowedU2AProductType;
  itemId: string;
  expectedAmount: number;
  amount: number | null;
  memo: string;
  metadata: Record<string, string | number | boolean>;
  status: "CREATED" | "APPROVAL_REQUESTED" | "APPROVED" | "PAID" | "CANCELLED";
  granted: boolean;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
}

interface PiPlatformPayment {
  identifier?: string;
  user_uid?: string;
  amount?: number;
  memo?: string;
  metadata?: Record<string, unknown>;
  direction?: string;
  transaction?: { txid?: string; verified?: boolean } | null;
  status?: {
    developer_approved?: boolean;
    transaction_verified?: boolean;
    developer_completed?: boolean;
    cancelled?: boolean;
    user_cancelled?: boolean;
  };
}

function getPiApiKey(): string | null {
  const key =
    process.env.PI_NETWORK_API_KEY?.trim() || process.env.PI_API_KEY?.trim();
  return key ? key : null;
}

export function parseRequestBody(body: unknown): Record<string, unknown> {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (typeof body === "object") {
    return body as Record<string, unknown>;
  }
  return {};
}

export function isValidPaymentId(value: unknown): value is string {
  return typeof value === "string" && PAYMENT_ID_PATTERN.test(value.trim());
}

export function isValidTxid(value: unknown): value is string {
  return typeof value === "string" && TXID_PATTERN.test(value.trim());
}

function getOrdersFilePath(): string {
  const localDir = path.resolve(process.cwd(), "data");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localFile = path.join(localDir, "pi-orders.json");
    fs.accessSync(localDir, fs.constants.W_OK);
    return localFile;
  } catch {
    return path.join(os.tmpdir(), "eyeneka-pi-orders.json");
  }
}

function readOrders(): PiOrderRecord[] {
  const filePath = getOrdersFilePath();
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PiOrderRecord[]) : [];
  } catch {
    return [];
  }
}

function writeOrders(orders: PiOrderRecord[]): void {
  const filePath = getOrdersFilePath();
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");
}

function findOrderByPaymentId(paymentId: string): PiOrderRecord | undefined {
  return readOrders().find((o) => o.paymentId === paymentId);
}

function findOrderByIntentId(intentId: string): PiOrderRecord | undefined {
  return readOrders().find((o) => o.intentId === intentId);
}

function upsertOrder(record: PiOrderRecord): PiOrderRecord {
  const orders = readOrders();
  const idx = orders.findIndex(
    (o) =>
      o.intentId === record.intentId ||
      (record.paymentId && o.paymentId === record.paymentId)
  );
  if (idx >= 0) {
    orders[idx] = record;
  } else {
    orders.unshift(record);
  }
  writeOrders(orders);
  return record;
}

function extractPiErrorMessage(data: Record<string, unknown>, fallback: string): string {
  if (typeof data.error_message === "string" && data.error_message.trim()) {
    return data.error_message.trim();
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }
  return fallback;
}

function roundPi(amount: number): number {
  return Number(amount.toFixed(2));
}

function resolveAuthoritativeOffer(params: {
  productType: AllowedU2AProductType;
  itemId: string;
  requestedAmount?: unknown;
  requestedMemo?: unknown;
}): { ok: true; amount: number; memo: string } | { ok: false; error: string } {
  const rawAmt =
    typeof params.requestedAmount === "number"
      ? params.requestedAmount
      : Number(params.requestedAmount);
  const memoClean =
    typeof params.requestedMemo === "string" && params.requestedMemo.trim()
      ? params.requestedMemo.trim().slice(0, 120)
      : "";

  switch (params.productType) {
    case "boost":
      return {
        ok: true,
        amount: 0.2,
        memo: memoClean || "Eyeneka - Featured Boost",
      };
    case "card":
      return {
        ok: true,
        amount: 0.2,
        memo: memoClean || "Eyeneka - Card Renewal",
      };
    case "care":
      return {
        ok: true,
        amount: 0.5,
        memo: memoClean || "Eyeneka - Care Partner",
      };
    case "test":
      return {
        ok: true,
        amount: 1.0,
        memo: memoClean || "Eyeneka - Test Payment",
      };
    case "certificate": {
      const amt = Number.isFinite(rawAmt) ? roundPi(rawAmt) : 0.3;
      if (amt < 0.1 || amt > 0.5) {
        return {
          ok: false,
          error: "Certificate fee must be between 0.10 and 0.50 Pi.",
        };
      }
      return {
        ok: true,
        amount: amt,
        memo: memoClean || "Eyeneka - Verified Certificate",
      };
    }
    case "gig_escrow": {
      if (!Number.isFinite(rawAmt) || rawAmt < 0.2 || rawAmt > 500) {
        return {
          ok: false,
          error: "Gig escrow amount must be between 0.20 and 500.00 Pi.",
        };
      }
      return {
        ok: true,
        amount: roundPi(rawAmt),
        memo: memoClean || `Eyeneka - Gig Escrow (${params.itemId})`,
      };
    }
    case "circle": {
      if (!Number.isFinite(rawAmt) || rawAmt < 0.1 || rawAmt > 500) {
        return {
          ok: false,
          error: "Circle amount must be between 0.10 and 500.00 Pi.",
        };
      }
      return {
        ok: true,
        amount: roundPi(rawAmt),
        memo: memoClean || "Eyeneka - Circle Payment",
      };
    }
  }
}

function validateCatalogAmount(
  productType: AllowedU2AProductType,
  amount: number
): boolean {
  if (!Number.isFinite(amount) || amount <= 0) return false;
  switch (productType) {
    case "boost":
    case "card":
      return Math.abs(amount - 0.2) < 0.0001;
    case "care":
      return Math.abs(amount - 0.5) < 0.0001;
    case "test":
      return Math.abs(amount - 1.0) < 0.0001;
    case "certificate":
      return amount >= 0.0999 && amount <= 0.5001;
    case "gig_escrow":
      return amount >= 0.1999 && amount <= 500.0001;
    case "circle":
      return amount >= 0.0999 && amount <= 500.0001;
  }
}

export function createPaymentIntent(
  rawBody: Record<string, unknown>,
  verifiedUser: VerifiedPiUser
): { status: number; body: Record<string, unknown> } {
  const rawType = typeof rawBody.type === "string" ? rawBody.type.trim() : "";
  if (!ALLOWED_PRODUCT_TYPES.has(rawType as AllowedU2AProductType)) {
    return { status: 400, body: { ok: false, error: "Unsupported U2A product type." } };
  }
  const productType = rawType as AllowedU2AProductType;
  const itemId =
    typeof rawBody.itemId === "string" && rawBody.itemId.trim()
      ? rawBody.itemId.trim().slice(0, 80)
      : productType;

  const resolved = resolveAuthoritativeOffer({
    productType,
    itemId,
    requestedAmount: rawBody.amount,
    requestedMemo: rawBody.memo,
  });
  if (!resolved.ok) {
    return { status: 400, body: { ok: false, error: resolved.error } };
  }

  const intentId = `INT-${crypto.randomBytes(10).toString("hex")}`;
  const metadata: Record<string, string | number | boolean> = {
    intentId,
    type: productType,
    itemId,
    buyer: verifiedUser.username,
  };

  upsertOrder({
    intentId,
    direction: "user_to_app",
    userUid: verifiedUser.uid,
    username: verifiedUser.username,
    productType,
    itemId,
    expectedAmount: resolved.amount,
    amount: resolved.amount,
    memo: resolved.memo,
    metadata,
    status: "CREATED",
    granted: false,
    createdAt: new Date().toISOString(),
  });

  return {
    status: 200,
    body: {
      ok: true,
      intentId,
      direction: "user_to_app",
      amount: resolved.amount,
      memo: resolved.memo,
      metadata,
    },
  };
}

async function fetchPiPaymentFromPlatform(
  paymentId: string,
  apiKey: string
): Promise<
  | { ok: true; payment: PiPlatformPayment }
  | { ok: false; status: number; error: string }
> {
  const res = await fetch(
    `${PI_PLATFORM_API_BASE}/payments/${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Key ${apiKey}`,
      },
    }
  );
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return {
      ok: false,
      status: res.status >= 400 ? res.status : 502,
      error: extractPiErrorMessage(
        data,
        res.statusText || "Failed to retrieve payment from Pi Platform API."
      ),
    };
  }
  return { ok: true, payment: data as unknown as PiPlatformPayment };
}

function validatePlatformPaymentForU2A(params: {
  payment: PiPlatformPayment;
  verifiedUser: VerifiedPiUser | null;
  linkedOrder?: PiOrderRecord;
}): { ok: true; productType: AllowedU2AProductType; itemId: string; amount: number } | { ok: false; status: number; error: string } {
  const { payment, verifiedUser, linkedOrder } = params;

  if (payment.direction && payment.direction !== "user_to_app") {
    return {
      ok: false,
      status: 400,
      error: `Invalid payment direction (${payment.direction}). Expected user_to_app.`,
    };
  }

  if (verifiedUser && payment.user_uid && payment.user_uid !== verifiedUser.uid) {
    return {
      ok: false,
      status: 403,
      error: "Payment user_uid does not match the authenticated Pioneer session.",
    };
  }

  const amount = typeof payment.amount === "number" ? payment.amount : NaN;
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      status: 400,
      error: "Pi Platform payment did not contain a valid positive amount.",
    };
  }

  const rawType =
    typeof payment.metadata?.type === "string" ? payment.metadata.type.trim() : "";
  const productType: AllowedU2AProductType = ALLOWED_PRODUCT_TYPES.has(
    rawType as AllowedU2AProductType
  )
    ? (rawType as AllowedU2AProductType)
    : linkedOrder?.productType ?? "test";

  const itemId =
    typeof payment.metadata?.itemId === "string" && payment.metadata.itemId.trim()
      ? payment.metadata.itemId.trim().slice(0, 80)
      : linkedOrder?.itemId ?? productType;

  if (linkedOrder) {
    if (linkedOrder.userUid && payment.user_uid && linkedOrder.userUid !== payment.user_uid) {
      return {
        ok: false,
        status: 403,
        error: "Payment user_uid does not match server order owner.",
      };
    }
    if (Math.abs(amount - linkedOrder.expectedAmount) > 0.0001) {
      return {
        ok: false,
        status: 400,
        error: `Payment amount (${amount}) does not match server order amount (${linkedOrder.expectedAmount}).`,
      };
    }
    if (linkedOrder.productType !== productType) {
      return {
        ok: false,
        status: 400,
        error: "Payment metadata product type mismatch.",
      };
    }
  } else if (!validateCatalogAmount(productType, amount)) {
    return {
      ok: false,
      status: 400,
      error: `Payment amount (${amount}) failed server catalog validation for ${productType}.`,
    };
  }

  return { ok: true, productType, itemId, amount };
}

export async function approvePiPayment(
  paymentId: unknown,
  authHeader?: unknown
): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  if (!isValidPaymentId(paymentId)) {
    return { status: 400, body: { ok: false, error: "Invalid paymentId format." } };
  }

  let verifiedUser: VerifiedPiUser | null = null;
  if (typeof authHeader === "string" && authHeader.trim()) {
    verifiedUser = verifySessionFromHeader(authHeader);
    if (!verifiedUser) {
      return { status: 401, body: { ok: false, error: "Unauthorized Pioneer session." } };
    }
  }

  const apiKey = getPiApiKey();
  if (!apiKey) {
    return {
      status: 500,
      body: {
        ok: false,
        error: "PI_NETWORK_API_KEY is not configured on the server.",
      },
    };
  }

  const cleanId = paymentId.trim();
  const lookup = await fetchPiPaymentFromPlatform(cleanId, apiKey);
  if (!lookup.ok) {
    return {
      status: lookup.status,
      body: { ok: false, piStatus: lookup.status, error: lookup.error },
    };
  }

  const platformPayment = lookup.payment;
  const intentId =
    typeof platformPayment.metadata?.intentId === "string"
      ? platformPayment.metadata.intentId.trim()
      : "";
  const linkedOrder =
    findOrderByPaymentId(cleanId) || (intentId ? findOrderByIntentId(intentId) : undefined);

  const check = validatePlatformPaymentForU2A({
    payment: platformPayment,
    verifiedUser,
    linkedOrder,
  });
  if (!check.ok) {
    return { status: check.status, body: { ok: false, error: check.error } };
  }

  const baseRecord: PiOrderRecord = linkedOrder ?? {
    intentId: intentId || `INT-RECOVERY-${cleanId}`,
    direction: "user_to_app",
    userUid: platformPayment.user_uid || verifiedUser?.uid,
    username: verifiedUser?.username,
    productType: check.productType,
    itemId: check.itemId,
    expectedAmount: check.amount,
    amount: check.amount,
    memo:
      typeof platformPayment.memo === "string"
        ? platformPayment.memo
        : "Eyeneka Pi Payment",
    metadata: sanitizeMetadata(platformPayment.metadata),
    status: "CREATED",
    granted: false,
    createdAt: new Date().toISOString(),
  };

  if (platformPayment.status?.developer_approved || baseRecord.status === "APPROVED" || baseRecord.status === "PAID") {
    upsertOrder({
      ...baseRecord,
      paymentId: cleanId,
      status: baseRecord.status === "PAID" ? "PAID" : "APPROVED",
      approvedAt: baseRecord.approvedAt ?? new Date().toISOString(),
    });
    return {
      status: 200,
      body: {
        ok: true,
        approved: true,
        alreadyApproved: true,
        paymentId: cleanId,
        payment: platformPayment,
      },
    };
  }

  // Persist paymentId before calling irreversible approve
  upsertOrder({
    ...baseRecord,
    paymentId: cleanId,
    status: "APPROVAL_REQUESTED",
  });

  const response = await fetch(
    `${PI_PLATFORM_API_BASE}/payments/${encodeURIComponent(cleanId)}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const errMsg = extractPiErrorMessage(
      data,
      response.statusText || "Pi Platform API payment approval failed."
    );
    return {
      status: response.status >= 400 ? response.status : 502,
      body: {
        ok: false,
        piStatus: response.status,
        error: errMsg,
      },
    };
  }

  upsertOrder({
    ...baseRecord,
    paymentId: cleanId,
    status: "APPROVED",
    approvedAt: new Date().toISOString(),
  });

  return {
    status: 200,
    body: {
      ok: true,
      approved: true,
      alreadyApproved: false,
      paymentId: cleanId,
      payment: data,
    },
  };
}

function sanitizeMetadata(raw: unknown): Record<string, string | number | boolean> {
  const safeMetadata: Record<string, string | number | boolean> = {};
  if (!raw || typeof raw !== "object") return safeMetadata;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      safeMetadata[k] = v;
    }
  }
  return safeMetadata;
}

export async function completePiPayment(
  params: {
    paymentId: unknown;
    txid: unknown;
  },
  authHeader?: unknown
): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  if (!isValidPaymentId(params.paymentId)) {
    return { status: 400, body: { ok: false, error: "Invalid paymentId format." } };
  }
  if (!isValidTxid(params.txid)) {
    return { status: 400, body: { ok: false, error: "Invalid txid format." } };
  }

  let verifiedUser: VerifiedPiUser | null = null;
  if (typeof authHeader === "string" && authHeader.trim()) {
    verifiedUser = verifySessionFromHeader(authHeader);
    if (!verifiedUser) {
      return { status: 401, body: { ok: false, error: "Unauthorized Pioneer session." } };
    }
  }

  const apiKey = getPiApiKey();
  if (!apiKey) {
    return {
      status: 500,
      body: {
        ok: false,
        error: "PI_NETWORK_API_KEY is not configured on the server.",
      },
    };
  }

  const cleanId = params.paymentId.trim();
  const cleanTxid = params.txid.trim();

  // Idempotency check: never grant product twice for the same paymentId
  const existingPaid = findOrderByPaymentId(cleanId);
  if (existingPaid?.status === "PAID" && existingPaid.granted) {
    if (existingPaid.txid && existingPaid.txid !== cleanTxid) {
      return {
        status: 409,
        body: {
          ok: false,
          error: "Payment was already completed with a different txid.",
        },
      };
    }
    return {
      status: 200,
      body: {
        ok: true,
        status: "PAID",
        alreadyCompleted: true,
        grantIssued: false,
        paymentId: cleanId,
        txid: cleanTxid,
        order: existingPaid,
      },
    };
  }

  const lookup = await fetchPiPaymentFromPlatform(cleanId, apiKey);
  if (!lookup.ok) {
    return {
      status: lookup.status,
      body: {
        ok: false,
        status: "FAILED",
        piStatus: lookup.status,
        error: lookup.error,
      },
    };
  }

  const platformPayment = lookup.payment;
  if (platformPayment.transaction?.txid && platformPayment.transaction.txid !== cleanTxid) {
    return {
      status: 400,
      body: {
        ok: false,
        status: "FAILED",
        error: "Submitted txid does not match Pi Platform transaction txid.",
      },
    };
  }

  const intentId =
    typeof platformPayment.metadata?.intentId === "string"
      ? platformPayment.metadata.intentId.trim()
      : "";
  const linkedOrder =
    existingPaid || (intentId ? findOrderByIntentId(intentId) : undefined);

  const check = validatePlatformPaymentForU2A({
    payment: platformPayment,
    verifiedUser,
    linkedOrder,
  });
  if (!check.ok) {
    return {
      status: check.status,
      body: { ok: false, status: "FAILED", error: check.error },
    };
  }

  // Persist paymentId before calling Pi Platform /complete
  const pendingRecord: PiOrderRecord = linkedOrder ?? {
    intentId: intentId || `INT-RECOVERY-${cleanId}`,
    direction: "user_to_app",
    userUid: platformPayment.user_uid || verifiedUser?.uid,
    username: verifiedUser?.username,
    productType: check.productType,
    itemId: check.itemId,
    expectedAmount: check.amount,
    amount: check.amount,
    memo:
      typeof platformPayment.memo === "string"
        ? platformPayment.memo
        : "Eyeneka Pi Payment",
    metadata: sanitizeMetadata(platformPayment.metadata),
    status: "APPROVED",
    granted: false,
    createdAt: new Date().toISOString(),
  };

  upsertOrder({
    ...pendingRecord,
    paymentId: cleanId,
    txid: cleanTxid,
  });

  if (platformPayment.status?.developer_completed) {
    const finalized = upsertOrder({
      ...pendingRecord,
      paymentId: cleanId,
      txid: cleanTxid,
      amount: check.amount,
      status: "PAID",
      granted: true,
      completedAt: new Date().toISOString(),
    });
    return {
      status: 200,
      body: {
        ok: true,
        status: "PAID",
        alreadyCompleted: false,
        grantIssued: true,
        paymentId: cleanId,
        txid: cleanTxid,
        order: finalized,
        payment: platformPayment,
      },
    };
  }

  const response = await fetch(
    `${PI_PLATFORM_API_BASE}/payments/${encodeURIComponent(cleanId)}/complete`,
    {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid: cleanTxid }),
    }
  );

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const errMsg = extractPiErrorMessage(
      data,
      response.statusText || "Pi Platform API payment completion failed."
    );
    return {
      status: response.status >= 400 ? response.status : 502,
      body: {
        ok: false,
        status: "FAILED",
        piStatus: response.status,
        error: errMsg,
      },
    };
  }

  // Only grant entitlement AFTER Pi Platform API /complete returns HTTP 2xx
  const completedOrder = upsertOrder({
    ...pendingRecord,
    paymentId: cleanId,
    txid: cleanTxid,
    amount: check.amount,
    memo:
      typeof data.memo === "string"
        ? data.memo
        : pendingRecord.memo,
    metadata: sanitizeMetadata(data.metadata ?? pendingRecord.metadata),
    status: "PAID",
    granted: true,
    completedAt: new Date().toISOString(),
  });

  return {
    status: 200,
    body: {
      ok: true,
      status: "PAID",
      alreadyCompleted: false,
      grantIssued: true,
      paymentId: cleanId,
      txid: cleanTxid,
      order: completedOrder,
      payment: data,
    },
  };
}

export async function cancelPiPayment(paymentId: unknown): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  if (!isValidPaymentId(paymentId)) {
    return { status: 400, body: { ok: false, error: "Invalid paymentId format." } };
  }

  const apiKey = getPiApiKey();
  if (!apiKey) {
    return {
      status: 500,
      body: {
        ok: false,
        error: "PI_NETWORK_API_KEY is not configured on the server.",
      },
    };
  }

  const cleanId = paymentId.trim();
  const response = await fetch(
    `${PI_PLATFORM_API_BASE}/payments/${encodeURIComponent(cleanId)}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    return {
      status: response.status >= 400 ? response.status : 502,
      body: {
        ok: false,
        error: extractPiErrorMessage(data, "Pi Platform API payment cancel failed."),
      },
    };
  }

  const existing = findOrderByPaymentId(cleanId);
  if (existing && existing.status !== "PAID") {
    upsertOrder({ ...existing, status: "CANCELLED" });
  }

  return {
    status: 200,
    body: { ok: true, cancelled: true, paymentId: cleanId, payment: data },
  };
}

export async function resumeServerIncompletePayments(): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  const apiKey = getPiApiKey();
  if (!apiKey) {
    return {
      status: 200,
      body: {
        ok: true,
        resumedCount: 0,
        skipped: "PI_NETWORK_API_KEY not configured",
      },
    };
  }

  const listRes = await fetch(
    `${PI_PLATFORM_API_BASE}/payments/incomplete_server_payments`,
    {
      method: "GET",
      headers: {
        Authorization: `Key ${apiKey}`,
      },
    }
  );

  if (!listRes.ok) {
    return {
      status: 200,
      body: {
        ok: false,
        resumedCount: 0,
        error: "Could not inspect incomplete server payments.",
      },
    };
  }

  const listData = (await listRes.json().catch(() => ({}))) as {
    incomplete_server_payments?: Array<{
      identifier?: string;
      direction?: string;
      transaction?: { txid?: string };
      status?: { developer_approved?: boolean; developer_completed?: boolean };
    }>;
  };

  const pending = Array.isArray(listData.incomplete_server_payments)
    ? listData.incomplete_server_payments
    : [];

  const completed: string[] = [];
  for (const payment of pending) {
    if (payment.direction && payment.direction !== "user_to_app") {
      continue;
    }
    const pid = payment.identifier;
    const txid = payment.transaction?.txid;
    if (isValidPaymentId(pid) && isValidTxid(txid) && !payment.status?.developer_completed) {
      const res = await completePiPayment({ paymentId: pid, txid });
      if (res.status === 200) {
        completed.push(pid);
      }
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      resumedCount: completed.length,
      completedPaymentIds: completed,
    },
  };
}
