"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { AuthRegisterInput, AuthSignInInput } from "@/lib/auth-types";
import { useAuth } from "./AuthProvider";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
};

function sanitizeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/admin";
  }

  return nextPath;
}

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const router = useRouter();
  const { currentUser, isReady, register, signIn } = useAuth();
  const destination = useMemo(() => sanitizeNextPath(nextPath), [nextPath]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberAccount, setRememberAccount] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && currentUser) {
      router.replace(destination);
    }
  }, [currentUser, destination, isReady, router]);

  useEffect(() => {
    if (mode !== "login") {
      return;
    }

    try {
      const savedEmail = localStorage.getItem("voyage-login-email");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch {
      // Optional browser storage.
    }
  }, [mode]);

  const heading = mode === "login" ? "登录" : "注册";
  const title = mode === "login" ? "进入后台" : "创建账户";
  const description =
    mode === "login"
      ? "登录你的账户，进入后台管理、版本发布和内容编辑流程。"
      : "创建一个新账户，开始管理你的内容和站点入口。";
  const switchHref =
    mode === "login"
      ? `/register?next=${encodeURIComponent(destination)}`
      : `/login?next=${encodeURIComponent(destination)}`;
  const switchLabel = mode === "login" ? "去注册" : "去登录";
  const submitLabel = mode === "login" ? "登录" : "注册";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("两次输入的密码不一致。");
        }

        const payload: AuthRegisterInput = {
          name,
          email,
          password,
        };

        await register(payload);
      } else {
        const payload: AuthSignInInput = {
          email,
          password,
        };

        await signIn(payload);

        try {
          if (rememberAccount) {
            localStorage.setItem("voyage-login-email", email);
          } else {
            localStorage.removeItem("voyage-login-email");
          }
        } catch {
          // Browser storage is optional.
        }
      }

      router.replace(destination);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "操作失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="auth-shell article-shell">
      <header className="article-header">
        <p className="eyebrow">{heading}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      <div className="auth-grid">
        <section className="content-card auth-panel" aria-label={title}>
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <label className="auth-field">
                <span>姓名</span>
                <input
                  autoComplete="name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="你的名字"
                  required
                  type="text"
                />
              </label>
            ) : null}

            <label className="auth-field">
              <span>邮箱</span>
              <input
                autoComplete="username"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="hello@voyage.moe"
                required
                type="email"
              />
            </label>

            <label className="auth-field">
              <span>密码</span>
              <input
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                name="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "login" ? "请输入密码" : "至少 8 位"}
                required
                type="password"
              />
            </label>

            {mode === "login" ? (
              <label className="admin-toggle auth-remember-toggle">
                <input
                  checked={rememberAccount}
                  onChange={(event) => setRememberAccount(event.target.checked)}
                  type="checkbox"
                />
                <span>记住登录信息</span>
              </label>
            ) : null}

            {mode === "register" ? (
              <label className="auth-field">
                <span>确认密码</span>
                <input
                  autoComplete="new-password"
                  name="confirmPassword"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="再输入一次密码"
                  required
                  type="password"
                />
              </label>
            ) : null}

            {error ? (
              <p className="auth-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="auth-actions">
              <button className="auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "处理中..." : submitLabel}
              </button>
              <Link className="auth-secondary-link" href={switchHref}>
                {switchLabel}
              </Link>
            </div>
          </form>
        </section>

        <section className="content-card auth-aside" aria-label="快速入口">
          <h2>快速入口</h2>
          <div className="auth-link-grid">
            <Link href="/admin">
              <span>后台首页</span>
            </Link>
            <Link href="/profile">
              <span>个人主页</span>
            </Link>
            <Link href="/message">
              <span>留言</span>
            </Link>
            <Link href="/updates">
              <span>更新</span>
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
