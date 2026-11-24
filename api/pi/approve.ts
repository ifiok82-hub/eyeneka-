import { approvePiPayment } from "../_lib/piPlatform.js";

interface ApiReq {
  method?: string;
  body?: { paymentId?: unknown };
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
    const result = await approvePiPayment(String(req.body?.paymentId ?? ""));
    res.status(result.status).json(result.body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Approval request failed.";
    res.status(500).json({ ok: false, error: message });
  }
}
