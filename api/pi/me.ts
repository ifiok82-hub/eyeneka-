import { verifySessionFromHeader } from "../_lib/piAuth.js";

interface ApiReq {
  method?: string;
  headers?: { authorization?: string; Authorization?: string };
}

interface ApiRes {
  status: (code: number) => { json: (data: unknown) => void };
}

export default async function handler(req: ApiReq, res: ApiRes) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const authHeader = req.headers?.authorization ?? req.headers?.Authorization;
  const user = verifySessionFromHeader(authHeader);
  if (!user) {
    res.status(401).json({ ok: false, error: "Not authenticated" });
    return;
  }

  res.status(200).json({
    ok: true,
    user: { uid: user.uid, username: user.username },
  });
}
