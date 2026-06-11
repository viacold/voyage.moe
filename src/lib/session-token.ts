import type { AuthSessionUser } from "./auth-types";

export const SESSION_COOKIE_NAME = "voyage.auth.session.v2";
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "voyage-dev-session-secret";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 =
    typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary =
    typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function importSecretKey() {
  return crypto.subtle.importKey("raw", textEncoder.encode(SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function signSessionToken(session: AuthSessionUser) {
  const payload = bytesToBase64Url(textEncoder.encode(JSON.stringify(session)));
  const key = await importSecretKey();
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));

  return `${payload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  try {
    const key = await importSecretKey();
    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      textEncoder.encode(payload),
    );

    if (!verified) {
      return null;
    }

    const decoded = JSON.parse(textDecoder.decode(base64UrlToBytes(payload))) as AuthSessionUser;

    if (!decoded || typeof decoded.email !== "string" || typeof decoded.role !== "string") {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
