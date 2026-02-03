import crypto from "crypto";

const COOKIE_NAME = "session";

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function signSession(email: string, secret: string) {
  const payload = Buffer.from(email, "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(value: string, secret: string) {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
}
