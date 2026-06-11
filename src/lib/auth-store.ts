import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { AuthAccount, AuthRegisterInput, AuthSessionUser, AuthSignInInput } from "./auth-types";
import { SESSION_COOKIE_NAME, signSessionToken, verifySessionToken } from "./session-token";

type AuthDb = {
  accounts: AuthAccount[];
};

const DEFAULT_DB_PATH = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "auth-db.json");
let dbPathOverride: string | null = null;

function getDbPath() {
  return dbPathOverride ?? process.env.VOYAGE_AUTH_DB_PATH ?? DEFAULT_DB_PATH;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

function emptyDb(): AuthDb {
  return { accounts: [] };
}

async function ensureDbFile() {
  const dbPath = getDbPath();
  await mkdir(path.dirname(dbPath), { recursive: true });

  try {
    await readFile(dbPath, "utf8");
  } catch {
    await writeFile(dbPath, `${JSON.stringify(emptyDb(), null, 2)}\n`, "utf8");
  }
}

async function readDb(): Promise<AuthDb> {
  await ensureDbFile();
  const raw = await readFile(getDbPath(), "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<AuthDb>;
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
    };
  } catch {
    return emptyDb();
  }
}

async function writeDb(db: AuthDb) {
  const dbPath = getDbPath();
  await mkdir(path.dirname(dbPath), { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
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

export function setAuthDbPathForTest(nextPath: string | null) {
  dbPathOverride = nextPath;
}

export async function getAccounts() {
  const db = await readDb();
  return db.accounts;
}

export async function clearAuthState() {
  await writeDb(emptyDb());
}

export async function registerAccount(input: AuthRegisterInput) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  if (!name) {
    throw new Error("请输入姓名。");
  }

  if (!email) {
    throw new Error("请输入邮箱。");
  }

  if (password.length < 8) {
    throw new Error("密码至少需要 8 位。");
  }

  const db = await readDb();

  if (db.accounts.some((account) => account.email === email)) {
    throw new Error("这个邮箱已经注册过了。");
  }

  const account: AuthAccount = {
    id: createId("acct"),
    name,
    email,
    passwordHash: hashPassword(password),
    role: db.accounts.length === 0 ? "admin" : "member",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  db.accounts.unshift(account);
  await writeDb(db);

  return { account, session: toSession(account) };
}

export async function signInAccount(input: AuthSignInInput) {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const db = await readDb();
  const account = db.accounts.find((item) => item.email === email);

  if (!account || !verifyPassword(password, account.passwordHash)) {
    throw new Error("邮箱或密码不正确。");
  }

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

export type { AuthAccount, AuthRegisterInput, AuthSessionUser, AuthSignInInput };
