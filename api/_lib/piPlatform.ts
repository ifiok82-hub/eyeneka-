import fs from "fs";
import os from "os";
import path from "path";

const PI_PLATFORM_API_BASE = "https://api.minepi.com/v2";
const PAYMENT_ID_PATTERN = /^[A-Za-z0-9_-]{4,128}$/;
const TXID_PATTERN = /^[A-Za-z0-9_-]{4,256}$/;

export interface PiOrderRecord {
  paymentId: string;
  txid: string;
  amount: number | null;
  memo: string;
  metadata: Record<string, string | number | boolean>;
  status: "PAID";
  completedAt: string;
}

function getPiApiKey(): string | null {
  const key = process.env.PI_API_KEY?.trim();
  return key ? key : null;
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

function savePaidOrder(order: PiOrderRecord): PiOrderRecord {
  const filePath = getOrdersFilePath();
  let orders: PiOrderRecord[] = [];
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        orders = parsed;
      }
    }
  } catch {
    orders = [];
  }

  const existingIndex = orders.findIndex((o) => o.paymentId === order.paymentId);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }

  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");
  return order;
}

export async function approvePiPayment(paymentId: string): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  if (!isValidPaymentId(paymentId)) {
    return { status: 400, body: { ok: false, error: "Invalid paymentId format." } };
  }

  const apiKey = getPiApiKey();
  if (!apiKey) {
    return {
      status: 503,
      body: {
        ok: false,
        error: "Server PI_API_KEY is not configured in environment secrets.",
      },
    };
  }

  const cleanId = paymentId.trim();
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
    return {
      status: response.status >= 400 ? response.status : 502,
      body: {
        ok: false,
        error:
          (typeof data.error_message === "string" && data.error_message) ||
          (typeof data.error === "string" && data.error) ||
          "Pi Platform API payment approval failed.",
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      approved: true,
      paymentId: cleanId,
      payment: data,
    },
  };
}

export async function completePiPayment(params: {
  paymentId: unknown;
  txid: unknown;
  amount?: unknown;
  memo?: unknown;
  metadata?: unknown;
}): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  if (!isValidPaymentId(params.paymentId)) {
    return { status: 400, body: { ok: false, error: "Invalid paymentId format." } };
  }
  if (!isValidTxid(params.txid)) {
    return { status: 400, body: { ok: false, error: "Invalid txid format." } };
  }

  const apiKey = getPiApiKey();
  if (!apiKey) {
    return {
      status: 503,
      body: {
        ok: false,
        error: "Server PI_API_KEY is not configured in environment secrets.",
      },
    };
  }

  const cleanId = params.paymentId.trim();
  const cleanTxid = params.txid.trim();

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
    return {
      status: response.status >= 400 ? response.status : 502,
      body: {
        ok: false,
        status: "FAILED",
        error:
          (typeof data.error_message === "string" && data.error_message) ||
          (typeof data.error === "string" && data.error) ||
          "Pi Platform API payment completion failed.",
      },
    };
  }

  // Only save order as PAID after Pi Platform API /complete returns HTTP 2xx
  const piAmount =
    typeof data.amount === "number"
      ? data.amount
      : typeof params.amount === "number"
      ? params.amount
      : null;

  const piMemo =
    typeof data.memo === "string"
      ? data.memo
      : typeof params.memo === "string"
      ? params.memo
      : "Eyeneka Pi Payment";

  const safeMetadata: Record<string, string | number | boolean> = {};
  const rawMeta =
    data.metadata && typeof data.metadata === "object"
      ? data.metadata
      : params.metadata && typeof params.metadata === "object"
      ? params.metadata
      : {};

  for (const [k, v] of Object.entries(rawMeta as Record<string, unknown>)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      safeMetadata[k] = v;
    }
  }

  const order = savePaidOrder({
    paymentId: cleanId,
    txid: cleanTxid,
    amount: piAmount,
    memo: piMemo,
    metadata: safeMetadata,
    status: "PAID",
    completedAt: new Date().toISOString(),
  });

  return {
    status: 200,
    body: {
      ok: true,
      status: "PAID",
      paymentId: cleanId,
      txid: cleanTxid,
      order,
      payment: data,
    },
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
        skipped: "PI_API_KEY not configured",
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
      amount?: number;
      memo?: string;
      metadata?: Record<string, unknown>;
      transaction?: { txid?: string };
      status?: { developer_approved?: boolean; developer_completed?: boolean };
    }>;
  };

  const pending = Array.isArray(listData.incomplete_server_payments)
    ? listData.incomplete_server_payments
    : [];

  const completed: string[] = [];
  for (const payment of pending) {
    const pid = payment.identifier;
    const txid = payment.transaction?.txid;
    if (isValidPaymentId(pid) && isValidTxid(txid) && !payment.status?.developer_completed) {
      const res = await completePiPayment({
        paymentId: pid,
        txid,
        amount: payment.amount,
        memo: payment.memo,
        metadata: payment.metadata,
      });
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
