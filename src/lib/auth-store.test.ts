import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  clearAuthState,
  getCurrentSessionFromCookieHeader,
  registerAccount,
  setAuthDbPathForTest,
  signInAccount,
} from "./auth-store";
import { signSessionToken, verifySessionToken } from "./session-token";

const tempDbPath = path.join(os.tmpdir(), `voyage-auth-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);

beforeEach(async () => {
  setAuthDbPathForTest(tempDbPath);
  await clearAuthState();
});

afterEach(async () => {
  await clearAuthState();
});

describe("auth store", () => {
  test("creates the first account as admin and persists it on the server store", async () => {
    const result = await registerAccount({
      name: "Voyager",
      email: "admin@voyage.moe",
      password: "password123",
    });

    expect(result.account.role).toBe("admin");
    expect(result.session.role).toBe("admin");
  });

  test("creates later accounts as members and prevents duplicate email", async () => {
    await registerAccount({
      name: "Admin",
      email: "admin@voyage.moe",
      password: "password123",
    });

    const second = await registerAccount({
      name: "Member",
      email: "member@voyage.moe",
      password: "password123",
    });

    expect(second.account.role).toBe("member");

    await expect(
      registerAccount({
        name: "Duplicate",
        email: "member@voyage.moe",
        password: "password123",
      }),
    ).rejects.toThrow("这个邮箱已经注册过了。");
  });

  test("signs in with a valid password and rejects invalid credentials", async () => {
    await registerAccount({
      name: "Voyager",
      email: "reader@voyage.moe",
      password: "password123",
    });

    const signedIn = await signInAccount({
      email: "reader@voyage.moe",
      password: "password123",
    });

    expect(signedIn.session.email).toBe("reader@voyage.moe");

    await expect(
      signInAccount({
        email: "reader@voyage.moe",
        password: "wrong-password",
      }),
    ).rejects.toThrow("邮箱或密码不正确。");
  });

  test("signs and verifies session tokens", async () => {
    const token = await signSessionToken({
      id: "acct_1",
      name: "Voyager",
      email: "reader@voyage.moe",
      role: "member",
    });

    await expect(verifySessionToken(token)).resolves.toMatchObject({
      email: "reader@voyage.moe",
      role: "member",
    });

    await expect(getCurrentSessionFromCookieHeader(`foo=bar; voyage.auth.session.v2=${token}`)).resolves.toMatchObject({
      email: "reader@voyage.moe",
    });
  });
});
