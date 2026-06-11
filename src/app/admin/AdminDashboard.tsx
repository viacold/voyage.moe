"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";

type SummaryItem = {
  label: string;
  value: string;
  detail: string;
  href: string;
};

type QuickLinkItem = {
  label: string;
  detail: string;
  href: string;
};

type ContentItem = {
  title: string;
  description: string;
  date: string;
  href: string;
};

type ReleaseItem = {
  title: string;
  version: string;
  date: string;
  downloads: {
    zip: string;
    tar: string;
  };
};

type AdminDashboardProps = {
  summaries: SummaryItem[];
  recentPosts: ContentItem[];
  recentUpdates: ContentItem[];
  releases: ReleaseItem[];
  quickLinks: QuickLinkItem[];
};

export function AdminDashboard({ summaries, recentPosts, recentUpdates, releases, quickLinks }: Readonly<AdminDashboardProps>) {
  const router = useRouter();
  const { isReady, currentUser: sessionUser, signOut } = useAuth();

  useEffect(() => {
    if (isReady && !sessionUser) {
      router.replace("/login?next=/admin");
    }
  }, [isReady, router, sessionUser]);

  const releaseLinks = useMemo(
    () =>
      releases.map((release) => ({
        ...release,
        zipLabel: `${release.version}.zip`,
        tarLabel: `${release.version}.tar.gz`,
      })),
    [releases],
  );

  if (!isReady) {
    return (
      <section className="loading-shell auth-loading-shell" aria-busy="true" aria-label="加载后台">
        <div className="page-heading">
          <div className="loading-lines">
            <div className="loading-line short" />
            <div className="loading-line medium" />
            <div className="loading-line" />
          </div>
        </div>

        <div className="post-feed">
          <div className="loading-card" />
          <div className="loading-card" />
        </div>
      </section>
    );
  }

  if (!sessionUser) {
    return null;
  }

  return (
    <article className="auth-shell article-shell admin-shell">
      <header className="article-header admin-header">
        <div>
          <p className="eyebrow">后台</p>
          <h1>voyage.moe 管理中心</h1>
          <p>内容、版本、更新和账户状态都在这里汇总。</p>
        </div>
        <div className="admin-user-chip">
          <span>{sessionUser.name}</span>
          <span>{sessionUser.role === "admin" ? "管理员" : "成员"}</span>
          <button
            className="admin-signout"
            type="button"
            onClick={async () => {
              await signOut();
              router.replace("/");
            }}
          >
            退出登录
          </button>
        </div>
      </header>

      <section className="content-card auth-panel admin-featured-panel">
        <div className="section-heading">
          <h2>文章管理</h2>
          <Link href="/admin/posts">打开文章列表</Link>
        </div>
        <p>这里可以新建、编辑和删除文章。点开文章标题进入编辑页，或者直接新建一篇。</p>
        <p className="link-cluster">
          <Link href="/admin/posts">文章列表</Link>
          <Link href="/admin/posts/new">新建文章</Link>
          <Link href="/admin/media">媒体库</Link>
        </p>
      </section>

      <div className="auth-grid admin-grid">
        <section className="content-card auth-panel admin-stats-panel">
          <div className="section-heading">
            <h2>站点概览</h2>
            <Link href="/updates">查看更新</Link>
          </div>
          <div className="admin-stats-grid">
            {summaries.map((item) => (
              <Link className="admin-stat" href={item.href} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="content-card auth-aside admin-links-panel">
          <div className="section-heading">
            <h2>快速入口</h2>
            <Link href="/profile">个人主页</Link>
          </div>
          <div className="auth-link-grid">
            {quickLinks.map((item) => (
              <Link href={item.href} key={item.label}>
                <span>{item.label}</span>
                <small>{item.detail}</small>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="auth-grid admin-grid">
        <section className="content-card auth-panel">
          <div className="section-heading">
            <h2>最近文章</h2>
            <Link href="/admin/posts">文章管理</Link>
          </div>
          <div className="admin-list">
            {recentPosts.map((post) => (
              <article className="admin-row" key={post.href}>
                <div>
                  <h3>
                    <Link href={post.href}>{post.title}</Link>
                  </h3>
                  <p>{post.description}</p>
                </div>
                <span>{post.date}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="content-card auth-panel">
          <div className="section-heading">
            <h2>最近更新</h2>
            <Link href="/versions">版本</Link>
          </div>
          <div className="admin-list">
            {recentUpdates.map((item) => (
              <article className="admin-row" key={`${item.title}-${item.date}`}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <span>{item.date}</span>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="content-card admin-release-panel">
        <div className="section-heading">
          <h2>发布记录</h2>
          <Link href="/versions">所有版本</Link>
        </div>
        <div className="admin-release-grid">
          {releaseLinks.map((release) => (
            <article className="admin-release" key={release.version}>
              <div>
                <h3>{release.title}</h3>
                <p>{release.version}</p>
              </div>
              <span>{release.date}</span>
              <div className="download-links">
                <a href={release.downloads.zip}>{release.zipLabel}</a>
                <a href={release.downloads.tar}>{release.tarLabel}</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
