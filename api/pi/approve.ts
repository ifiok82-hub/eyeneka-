export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const paymentId = body.paymentId;
    if (!paymentId) return res.status(400).json({ ok: false, error: "Missing paymentId" });

    const apiKey = process.env.PI_NETWORK_API_KEY || process.env.PI_API_KEY;
    if (!apiKey) return res.status(500).json({ ok: false, error: "PI_NETWORK_API_KEY not set in Vercel" });

    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await piRes.json().catch(() => ({}));
    if (!piRes.ok) return res.status(piRes.status).json({ ok: false, error: "Pi approve failed", details: data });
    return res.status(200).json({ ok: true, data });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message || "Approve failed" });
  }
}
