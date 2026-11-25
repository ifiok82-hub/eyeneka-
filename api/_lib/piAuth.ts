import crypto from "crypto";

const APP_STUDIO_LOGIN_URL =
  "https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

let fallbackSecret: Buffer | null = null;
const revokedJtis = new Set<string>();

function getSessionSecret(): Buffer {
  const envSecret = process.env.SESSION_SECRET?.trim();
  if (envSecret) {
    return crypto.createHash("sha256").update(envSecret, "utf8").digest();
  }
  if (!fallbackSecret) {
    fallbackSecret = crypto.randomBytes(32);
  }
  return fallbackSecret;
}

export interface VerifiedPiUser {
  uid: string;
  username: string;
}

interface SignedSessionPayload {
  jti: string;
  uid: string;
  username: string;
  iat: number;
  exp: number;
}

function signSessionToken(user: VerifiedPiUser): string {
  const now = Date.now();
  const payload: SignedSessionPayload = {
    jti: crypto.randomBytes(16).toString("hex"),
    uid: user.uid,
    username: user.username,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encoded, "utf8")
    .digest("base64url");
  return `v1.${encoded}.${sig}`;
}

export function verifySessionFromHeader(
  authorizationHeader: unknown
): (VerifiedPiUser & { jti: string }) | null {
  if (typeof authorizationHeader !== "string") return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader.trim());
  if (!match) return null;

  const token = match[1].trim();
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;

  const [, encoded, providedSig] = parts;
  if (!encoded || !providedSig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encoded, "utf8")
    .digest("base64url");

  const providedBuf = Buffer.from(providedSig, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as Partial<SignedSessionPayload>;
    if (
      typeof parsed.jti !== "string" ||
      typeof parsed.uid !== "string" ||
      typeof parsed.username !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }
    if (parsed.exp <= Date.now() || revokedJtis.has(parsed.jti)) {
      return null;
    }
    return {
      jti: parsed.jti,
      uid: parsed.uid,
      username: parsed.username,
    };
  } catch {
    return null;
  }
}

export function revokeSessionFromHeader(authorizationHeader: unknown): void {
  const verified = verifySessionFromHeader(authorizationHeader);
  if (verified) {
    revokedJtis.add(verified.jti);
  }
}

export async function exchangePiAccessToken(rawBody: Record<string, unknown>): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  // Ignore any browser-supplied uid or username; only accept accessToken
  const accessToken =
    typeof rawBody.accessToken === "string" ? rawBody.accessToken.trim() : "";

  if (!accessToken || accessToken.length < 8 || accessToken.length > 4096) {
    return {
      status: 400,
      body: { ok: false, error: "Valid Pi accessToken is required." },
    };
  }

  let verifiedUid = "";
  let verifiedUsername = "";
  let lastStatus = 401;
  let lastError = "Pi Sign-In failed. Try again in Pi Browser.";

  // 1. Primary official verification: GET https://api.minepi.com/v2/me
  try {
    const meRes = await fetch("https://api.minepi.com/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(12000),
    });
    const meData = (await meRes.json().catch(() => ({}))) as {
      uid?: unknown;
      username?: unknown;
      error?: unknown;
      error_message?: unknown;
      message?: unknown;
    };
    if (meRes.ok) {
      verifiedUid = typeof meData.uid === "string" ? meData.uid.trim() : "";
      verifiedUsername =
        typeof meData.username === "string"
          ? meData.username.trim().replace(/^@/, "")
          : "";
    } else {
      lastStatus = meRes.status >= 400 ? meRes.status : 401;
      lastError =
        (typeof meData.error_message === "string" && meData.error_message) ||
        (typeof meData.error === "string" && meData.error) ||
        (typeof meData.message === "string" && meData.message) ||
        lastError;
    }
  } catch (err: unknown) {
    lastError = err instanceof Error && err.message ? err.message : lastError;
  }

  // 2. Fallback: App Studio login verification endpoint if /v2/me did not verify
  if (!verifiedUid || !verifiedUsername) {
    try {
      const response = await fetch(APP_STUDIO_LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken }),
        signal: AbortSignal.timeout(12000),
      });

      const data = (await response.json().catch(() => ({}))) as {
        sessionToken?: unknown;
        user?: { uid?: unknown; username?: unknown };
        error?: unknown;
        message?: unknown;
      };

      if (response.ok) {
        verifiedUid =
          typeof data.user?.uid === "string" ? data.user.uid.trim() : "";
        verifiedUsername =
          typeof data.user?.username === "string"
            ? data.user.username.trim().replace(/^@/, "")
            : "";
      } else {
        lastStatus = response.status >= 400 ? response.status : lastStatus;
        lastError =
          (typeof data.error === "string" && data.error) ||
          (typeof data.message === "string" && data.message) ||
          lastError;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error && err.message ? err.message : lastError;
    }
  }

  if (!verifiedUid || !verifiedUsername) {
    return {
      status: lastStatus,
      body: {
        ok: false,
        error: lastError,
      },
    };
  }

  const sessionToken = signSessionToken({
    uid: verifiedUid,
    username: verifiedUsername,
  });

  return {
    status: 200,
    body: {
      ok: true,
      sessionToken,
      user: {
        uid: verifiedUid,
        username: verifiedUsername,
      },
    },
  };
}
