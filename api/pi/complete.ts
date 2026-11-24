import { completePiPayment } from "../_lib/piPlatform.js";

interface ApiReq {
  method?: string;
  body?: {
    paymentId?: unknown;
    txid?: unknown;
    amount?: unknown;
    memo?: unknown;
    metadata?: unknown;
  };
}

interface ApiRes {
  status: (code: number) => { json: (data: unknown) => void };
}

export default async function handler(req: ApiReq, res: ApiRes) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const result = await completePiPayment({
      paymentId: req.body?.paymentId,
      txid: req.body?.txid,
      amount: req.body?.amount,
      memo: req.body?.memo,
      metadata: req.body?.metadata,
    });
    res.status(result.status).json(result.body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Completion request failed.";
    res.status(500).json({ ok: false, error: message });
  }
}
