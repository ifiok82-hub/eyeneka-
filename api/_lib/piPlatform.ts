import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

const PI_PLATFORM_API_BASE = "https://api.minepi.com/v2";
const PAYMENT_ID_PATTERN = /^[A-Za-z0-9_-]{4,128}$/;
const TXID_PATTERN = /^[A-Za-z0-9_-]{4,256}$/;

export interface PiSessionActor {
  uid: string;
  username: string;
}

export type AllowedU2AProductType =
  | "certificate"
  | "gig_escrow"
  | "boost"
  | "circle"
  | "care"
  | "card"
  | "test"
  | "test_payment";

const ALLOWED_PRODUCT_TYPES = new Set<AllowedU2AProductType>([
  "certificate",
  "gig_escrow",
  "boost",
  "circle",
  "care",
  "card",
  "test",
  "test_payment",
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
  try {
    const filePath = getOrdersFilePath();
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");
  } catch {
    // Non-fatal on ephemeral or read-only serverless filesystems
  }
}

function findOrderByPaymentId(paymentId: string): PiOrderRecord | undefined {
  return readOrders().find((o) => o.paymentId === paymentId);
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
  if (typeof data.raw === "string" && data.raw.trim()) {
    return data.raw.trim().slice(0, 200);
  }
  return fallback;
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
    case "test_payment":
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

export function createPaymentIntent(
  rawBody: Record<string, unknown>,
  verifiedUser: PiSessionActor
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

export async function approvePiPayment(paymentId: unknown): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  if (!isValidPaymentId(paymentId)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid paymentId format.",
        details: "Expected a non-empty alphanumeric Pi paymentId.",
      },
    };
  }

  const apiKey = getPiApiKey();
  if (!apiKey) {
    console.error(
      "[EYENEKA Pi Approve] Missing server Pi API key env var (checked PI_NETWORK_API_KEY and PI_API_KEY)."
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "PI_NETWORK_API_KEY / PI_API_KEY is not configured on the server.",
        details: "Set PI_NETWORK_API_KEY or PI_API_KEY in Vercel Environment Variables.",
      },
    };
  }

  const cleanId = paymentId.trim();
  const idPrefix = cleanId.slice(0, 8);
  console.log(`[EYENEKA Pi Approve] Calling Pi Platform /approve for paymentId=${idPrefix}...`);

  const response = await fetch(
    `${PI_PLATFORM_API_BASE}/payments/${encodeURIComponent(cleanId)}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  const rawText = await response.text();
  let data: Record<string, unknown> = {};
  try {
    data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
  } catch {
    data = { raw: rawText };
  }

  if (!response.ok) {
    const errMsg = extractPiErrorMessage(
      data,
      response.statusText || "Pi Platform API payment approval failed."
    );
    const details = rawText ? rawText.slice(0, 500) : errMsg;
    console.error(
      `[EYENEKA Pi Approve] Failed paymentId=${idPrefix}... piStatus=${response.status} body=${details}`
    );
    return {
      status: response.status >= 400 ? response.status : 502,
      body: {
        ok: false,
        piStatus: response.status,
        error: errMsg,
        details,
      },
    };
  }

  if (typeof data.direction === "string" && data.direction !== "user_to_app") {
    return {
      status: 400,
      body: {
        ok: false,
        error: `Unexpected payment direction (${data.direction}). Expected user_to_app.`,
        details: rawText.slice(0, 500),
      },
    };
  }

  const existing = findOrderByPaymentId(cleanId);
  const rawType =
    typeof (data.metadata as Record<string, unknown> | undefined)?.type === "string"
      ? String((data.metadata as Record<string, unknown>).type).trim()
      : "";
  const productType: AllowedU2AProductType = ALLOWED_PRODUCT_TYPES.has(
    rawType as AllowedU2AProductType
  )
    ? (rawType as AllowedU2AProductType)
    : existing?.productType ?? "test_payment";
  const amount = typeof data.amount === "number" ? data.amount : existing?.amount ?? 1;

  upsertOrder({
    ...(existing ?? {
      intentId: `INT-${cleanId}`,
      direction: "user_to_app",
      productType,
      itemId: productType,
      expectedAmount: amount,
      amount,
      memo: typeof data.memo === "string" ? data.memo : "Eyeneka Pi Payment",
      metadata: sanitizeMetadata(data.metadata),
      granted: false,
      createdAt: new Date().toISOString(),
    }),
    paymentId: cleanId,
    status: existing?.status === "PAID" ? "PAID" : "APPROVED",
    approvedAt: existing?.approvedAt ?? new Date().toISOString(),
  });

  console.log(
    `[EYENEKA Pi Approve] Success paymentId=${idPrefix}... piStatus=${response.status}`
  );

  return {
    status: 200,
    body: {
      ok: true,
      approved: true,
      paymentId: cleanId,
      data,
    },
  };
}

export async function completePiPayment(params: {
  paymentId: unknown;
  txid: unknown;
}): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  if (!isValidPaymentId(params.paymentId)) {
    return {
      status: 400,
      body: {
        ok: false,
        status: "FAILED",
        error: "Invalid paymentId format.",
        details: "Expected a non-empty alphanumeric Pi paymentId.",
      },
    };
  }
  if (!isValidTxid(params.txid)) {
    return {
      status: 400,
      body: {
        ok: false,
        status: "FAILED",
        error: "Invalid txid format.",
        details: "Expected a non-empty blockchain transaction id (txid).",
      },
    };
  }

  const apiKey = getPiApiKey();
  if (!apiKey) {
    console.error(
      "[EYENEKA Pi Complete] Missing server Pi API key env var (checked PI_NETWORK_API_KEY and PI_API_KEY)."
    );
    return {
      status: 500,
      body: {
        ok: false,
        status: "FAILED",
        error: "PI_NETWORK_API_KEY / PI_API_KEY is not configured on the server.",
        details: "Set PI_NETWORK_API_KEY or PI_API_KEY in Vercel Environment Variables.",
      },
    };
  }

  const cleanId = params.paymentId.trim();
  const cleanTxid = params.txid.trim();
  const idPrefix = cleanId.slice(0, 8);

  const existingPaid = findOrderByPaymentId(cleanId);
  if (existingPaid?.status === "PAID" && existingPaid.granted) {
    if (existingPaid.txid && existingPaid.txid !== cleanTxid) {
      return {
        status: 409,
        body: {
          ok: false,
          status: "FAILED",
          error: "Payment was already completed with a different txid.",
          details: `Recorded txid differs from submitted txid for paymentId=${idPrefix}...`,
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
        data: existingPaid,
      },
    };
  }

  console.log(`[EYENEKA Pi Complete] Calling Pi Platform /complete for paymentId=${idPrefix}...`);

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

  const rawText = await response.text();
  let data: Record<string, unknown> = {};
  try {
    data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
  } catch {
    data = { raw: rawText };
  }

  if (!response.ok) {
    const errMsg = extractPiErrorMessage(
      data,
      response.statusText || "Pi Platform API payment completion failed."
    );
    const details = rawText ? rawText.slice(0, 500) : errMsg;
    console.error(
      `[EYENEKA Pi Complete] Failed paymentId=${idPrefix}... piStatus=${response.status} body=${details}`
    );
    return {
      status: response.status >= 400 ? response.status : 502,
      body: {
        ok: false,
        status: "FAILED",
        piStatus: response.status,
        error: errMsg,
        details,
      },
    };
  }

  if (typeof data.direction === "string" && data.direction !== "user_to_app") {
    return {
      status: 400,
      body: {
        ok: false,
        status: "FAILED",
        error: `Invalid payment direction (${data.direction}). Expected user_to_app.`,
        details: rawText.slice(0, 500),
      },
    };
  }

  const txObj = data.transaction as { txid?: unknown } | null | undefined;
  if (typeof txObj?.txid === "string" && txObj.txid.trim() && txObj.txid.trim() !== cleanTxid) {
    return {
      status: 400,
      body: {
        ok: false,
        status: "FAILED",
        error: "Submitted txid does not match Pi Platform transaction txid.",
        details: rawText.slice(0, 500),
      },
    };
  }

  const rawType =
    typeof (data.metadata as Record<string, unknown> | undefined)?.type === "string"
      ? String((data.metadata as Record<string, unknown>).type).trim()
      : "";
  const productType: AllowedU2AProductType = ALLOWED_PRODUCT_TYPES.has(
    rawType as AllowedU2AProductType
  )
    ? (rawType as AllowedU2AProductType)
    : existingPaid?.productType ?? "test_payment";
  const amount = typeof data.amount === "number" ? data.amount : existingPaid?.amount ?? 1;

  upsertOrder({
    ...(existingPaid ?? {
      intentId: `INT-${cleanId}`,
      direction: "user_to_app",
      productType,
      itemId: productType,
      expectedAmount: amount,
      amount,
      memo: typeof data.memo === "string" ? data.memo : "Eyeneka Pi Payment",
      metadata: sanitizeMetadata(data.metadata),
      createdAt: new Date().toISOString(),
    }),
    paymentId: cleanId,
    txid: cleanTxid,
    amount,
    memo: typeof data.memo === "string" ? data.memo : existingPaid?.memo ?? "Eyeneka Pi Payment",
    metadata: sanitizeMetadata(data.metadata ?? existingPaid?.metadata),
    status: "PAID",
    granted: true,
    completedAt: new Date().toISOString(),
  });

  console.log(
    `[EYENEKA Pi Complete] Success paymentId=${idPrefix}... piStatus=${response.status}`
  );

  return {
    status: 200,
    body: {
      ok: true,
      status: "PAID",
      alreadyCompleted: false,
      grantIssued: true,
      paymentId: cleanId,
      txid: cleanTxid,
      data,
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
    console.error(
      "[EYENEKA Pi Cancel] Missing server Pi API key env var (checked PI_NETWORK_API_KEY and PI_API_KEY)."
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "PI_NETWORK_API_KEY / PI_API_KEY is not configured on the server.",
        details: "Set PI_NETWORK_API_KEY or PI_API_KEY in Vercel Environment Variables.",
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
      body: JSON.stringify({}),
    }
  );

  const rawText = await response.text();
  let data: Record<string, unknown> = {};
  try {
    data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
  } catch {
    data = { raw: rawText };
  }

  if (!response.ok) {
    const errMsg = extractPiErrorMessage(data, "Pi Platform API payment cancel failed.");
    return {
      status: response.status >= 400 ? response.status : 502,
      body: {
        ok: false,
        piStatus: response.status,
        error: errMsg,
        details: rawText ? rawText.slice(0, 500) : errMsg,
      },
    };
  }

  const existing = findOrderByPaymentId(cleanId);
  if (existing && existing.status !== "PAID") {
    upsertOrder({ ...existing, status: "CANCELLED" });
  }

  return {
    status: 200,
    body: { ok: true, cancelled: true, paymentId: cleanId, data },
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
        skipped: "PI_NETWORK_API_KEY / PI_API_KEY not configured",
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
