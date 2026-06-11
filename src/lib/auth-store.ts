import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { AuthAccount, AuthRegisterInput, AuthSessionUser, AuthSignInInput } from "./auth-types";
import { SESSION_COOKIE_NAME, signSessionToken, verifySessionToken } from "./session-token";
import { getMetaValue, getVoyageDatabase, getVoyageDbPath, setMetaValue, setVoyageDbPathForTest } from "./voyage-db";

const LEGACY_AUTH_DB_PATH = path.join(process.cwd(), "data", "auth-db.json");
const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "voyage.db");

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

function hashPassword(password: string, salt = randomUUID()) {
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, expectedHex] = storedHash.split("$");

  if (scheme !== "scrypt" || !salt || !expectedHex) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");

  if (expected.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(expected, derived);
}

function toSession(account: AuthAccount): AuthSessionUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

function accountFromRow(row: Record<string, unknown>): AuthAccount {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.passwordHash),
    role: row.role === "admin" ? "admin" : "member",
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

function ensureAuthSeeded() {
  if (getMetaValue("auth_seeded") === "true") {
    return;
  }

  if (getVoyageDbPath() !== DEFAULT_DB_PATH) {
    setMetaValue("auth_seeded", "true");
    return;
  }

  const db = getVoyageDatabase();
  const count = db.prepare("SELECT COUNT(*) AS count FROM accounts").get() as { count?: number } | undefined;

  if ((count?.count ?? 0) === 0 && existsSync(LEGACY_AUTH_DB_PATH)) {
    try {
      const raw = readFileSync(LEGACY_AUTH_DB_PATH, "utf8");
      const parsed = JSON.parse(raw) as { accounts?: AuthAccount[] };
      const accounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];

      const insert = db.prepare(`
        INSERT OR REPLACE INTO accounts (
          id, name, email, passwordHash, role, createdAt, updatedAt
        ) VALUES (
          @id, @name, @email, @passwordHash, @role, @createdAt, @updatedAt
        )
      `);

      const transaction = db.transaction((seedAccounts: AuthAccount[]) => {
        for (const account of seedAccounts) {
          insert.run(account);
        }
      });

      transaction(accounts);
    } catch {
      // Ignore legacy import failures and continue with an empty store.
    }
  }

  setMetaValue("auth_seeded", "true");
}

export function setAuthDbPathForTest(nextPath: string | null) {
  setVoyageDbPathForTest(nextPath);
}

export async function getAccounts() {
  ensureAuthSeeded();
  const rows = getVoyageDatabase()
    .prepare("SELECT * FROM accounts ORDER BY createdAt DESC, id DESC")
    .all() as Record<string, unknown>[];

  return rows.map(accountFromRow);
}

export async function clearAuthState() {
  getVoyageDatabase().prepare("DELETE FROM accounts").run();
}

export async function registerAccount(input: AuthRegisterInput) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  if (!name) {
    throw new Error("Name is required.");
  }

  if (!email) {
    throw new Error("Email is required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  ensureAuthSeeded();
  const db = getVoyageDatabase();

  if ((db.prepare("SELECT COUNT(*) AS count FROM accounts WHERE email = ?").get(email) as { count?: number } | undefined)?.count) {
    throw new Error("That email is already registered.");
  }

  const account: AuthAccount = {
    id: createId("acct"),
    name,
    email,
    passwordHash: hashPassword(password),
    role: ((db.prepare("SELECT COUNT(*) AS count FROM accounts").get() as { count?: number } | undefined)?.count ?? 0) === 0 ? "admin" : "member",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  db.prepare(`
    INSERT INTO accounts (
      id, name, email, passwordHash, role, createdAt, updatedAt
    ) VALUES (
      @id, @name, @email, @passwordHash, @role, @createdAt, @updatedAt
    )
  `).run(account);

  return { account, session: toSession(account) };
}

export async function signInAccount(input: AuthSignInInput) {
  ensureAuthSeeded();
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const row = getVoyageDatabase()
    .prepare("SELECT * FROM accounts WHERE email = ?")
    .get(email) as Record<string, unknown> | undefined;

  if (!row || !verifyPassword(password, String(row.passwordHash))) {
    throw new Error("Email or password is incorrect.");
  }

  const account = accountFromRow(row);
  return { account, session: toSession(account) };
}

export async function getCurrentSessionFromCookieHeader(cookieHeader?: string | null) {
  const token = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.slice(SESSION_COOKIE_NAME.length + 1);

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function setSessionCookie(response: NextResponse, session: AuthSessionUser) {
  const token = await signSessionToken(session);
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function isAdmin(session: AuthSessionUser | null) {
  return Boolean(session && session.role === "admin");
}

export { getVoyageDbPath };
export type { AuthAccount, AuthRegisterInput, AuthSessionUser, AuthSignInInput };
