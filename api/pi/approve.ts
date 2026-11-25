export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, piStatus: 405, error: "Method not allowed", details: "Method not allowed" });
  }

  const receivedAt = Date.now();

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const paymentId = typeof body.paymentId === "string" ? body.paymentId.trim() : "";
    const clientApproveStartMs =
      typeof body.clientApproveStartMs === "number" ? body.clientApproveStartMs : null;
    const idPrefix = paymentId ? paymentId.slice(0, 8) : "NONE";

    const rawNetworkKey = process.env.PI_NETWORK_API_KEY?.trim() || "";
    const rawLegacyKey = process.env.PI_API_KEY?.trim() || "";
    const envVarUsed = rawNetworkKey ? "PI_NETWORK_API_KEY" : rawLegacyKey ? "PI_API_KEY" : "NONE";
    const apiKey = rawNetworkKey || rawLegacyKey;
    const keyFingerprint = apiKey
      ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)} (len=${apiKey.length})`
      : "NONE (len=0)";

    console.log("[EYENEKA /api/pi/approve] approve-received", {
      ts: receivedAt,
      clientApproveStartMs,
      networkLagMs: clientApproveStartMs !== null ? receivedAt - clientApproveStartMs : null,
      paymentIdPrefix: idPrefix,
      envVarUsed,
      keyFingerprint,
    });

    if (!paymentId) {
      return res.status(400).json({
        ok: false,
        piStatus: 400,
        error: "Missing paymentId",
        details: { error: "missing_payment_id", error_message: "Missing paymentId" },
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        piStatus: 500,
        error: "PI_NETWORK_API_KEY not set in Vercel",
        details: {
          error: "missing_api_key",
          error_message: "PI_NETWORK_API_KEY or PI_API_KEY is missing in Vercel Environment Variables",
        },
      });
    }

    const piRes = await fetch(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const rawText = await piRes.text();
    let data: unknown = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = rawText;
    }

    console.log("[EYENEKA /api/pi/approve] pi-response", {
      ts: Date.now(),
      elapsedMs: Date.now() - receivedAt,
      paymentIdPrefix: idPrefix,
      piStatus: piRes.status,
      envVarUsed,
      piBody: rawText.slice(0, 500),
    });

    if (!piRes.ok) {
      return res.status(piRes.status).json({
        ok: false,
        piStatus: piRes.status,
        error: `Pi approve failed: ${piRes.status}`,
        details: rawText && (!data || (typeof data === "object" && Object.keys(data as object).length === 0)) ? rawText : data,
      });
    }

    return res.status(200).json({ ok: true, data });
  } catch (e: any) {
    const msg = e?.message || "Approve failed";
    console.error("[EYENEKA /api/pi/approve] exception", { ts: Date.now(), error: msg });
    return res.status(500).json({
      ok: false,
      piStatus: 500,
      error: msg,
      details: msg,
    });
  }
}
