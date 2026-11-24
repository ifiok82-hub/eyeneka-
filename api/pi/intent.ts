import { verifySessionFromHeader } from "../_lib/piAuth.js";
import { createPaymentIntent, parseRequestBody } from "../_lib/piPlatform.js";

interface ApiReq {
  method?: string;
  body?: unknown;
  headers?: { authorization?: string; Authorization?: string };
}

interface ApiRes {
  status: (code: number) => { json: (data: unknown) => void };
}

export default async function handler(req: ApiReq, res: ApiRes) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const authHeader = req.headers?.authorization ?? req.headers?.Authorization;
  const user = verifySessionFromHeader(authHeader);
  if (!user) {
    res.status(401).json({ ok: false, error: "Authenticated Pioneer session required." });
    return;
  }

  try {
    const body = parseRequestBody(req.body);
    const result = createPaymentIntent(body, user);
    res.status(result.status).json(result.body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create payment intent.";
    res.status(500).json({ ok: false, error: message });
  }
}
