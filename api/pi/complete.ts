import { completePiPayment, parseRequestBody } from "../_lib/piPlatform.js";

interface ApiReq {
  method?: string;
  body?: unknown;
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
    const body = parseRequestBody(req.body);
    const result = await completePiPayment({
      paymentId: body.paymentId,
      txid: body.txid,
      amount: body.amount,
      memo: body.memo,
      metadata: body.metadata,
    });
    res.status(result.status).json(result.body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Completion request failed.";
    res.status(500).json({ ok: false, error: message });
  }
}
