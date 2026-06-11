import { cookies } from "next/headers";

const COOKIE_NAME = "blog_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET must be set in production to sign session cookies.",
    );
  }
  return "insecure-dev-secret";
}

function base64url(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return base64url(sig);
}

export async function createSessionToken(): Promise<string> {
  const payload = base64url(
    JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 }),
  );
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(payload);
  if (expected !== sig) return false;
  try {
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof decoded.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function setSessionCookie(): Promise<void> {
  const store = await cookies();
  // Use SameSite=None + Secure so the session cookie is stored when the app
  // is rendered inside a cross-site iframe (e.g. the v0 preview). A "lax"
  // cookie is dropped by the browser in that context, which made it look like
  // sign-in did nothing.
  store.set(COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    // Chrome blocks third-party cookies in cross-site iframes (the v0 preview).
    // `partitioned` (CHIPS) lets the session cookie be stored per top-level site
    // so sign-in works inside the embedded preview.
    partitioned: true,
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    const bcrypt = (await import("bcryptjs")).default;
    return bcrypt.compare(password, hash);
  }
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  // constant-time-ish comparison
  if (password.length !== plain.length) return false;
  let mismatch = 0;
  for (let i = 0; i < password.length; i++) {
    mismatch |= password.charCodeAt(i) ^ plain.charCodeAt(i);
  }
  return mismatch === 0;
}

export { COOKIE_NAME };
